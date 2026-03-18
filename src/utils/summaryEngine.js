// ============================================================
// summaryEngine.js — Traxalon Analysis Engine
// Zero external dependencies. Vercel-safe. Pure functions.
// Covers 150+ capture parameters from NetTrackr schema.
// ============================================================

// ─── Phrase Pools (varied so reports don't feel copy-pasted) ──

const LOCATION_PHRASES = [
  (city, region, country, lat, lon) =>
    `IP-based geolocation places the subject in ${city}, ${region}, ${country} (coordinates: ${lat}, ${lon}).`,
  (city, region, country, lat, lon) =>
    `Network trace resolved to ${city}, ${region}, ${country} at approximately ${lat}°N, ${lon}°E.`,
  (city, region, country, lat, lon) =>
    `Server-side IP resolution confirmed location as ${city}, ${region}, ${country}. Coordinates: ${lat}, ${lon}.`,
];

const DEVICE_PHRASES = [
  (device, os, osVersion, browser, browserVersion) =>
    `Subject accessed the link via a ${device} running ${os} ${osVersion}, using ${browser} ${browserVersion}.`,
  (device, os, osVersion, browser, browserVersion) =>
    `Session initiated from a ${device} (${os} ${osVersion}) via ${browser} version ${browserVersion}.`,
  (device, os, osVersion, browser, browserVersion) =>
    `Hardware profile: ${device}-class endpoint on ${os} ${osVersion}. Browser: ${browser} ${browserVersion}.`,
];

const NETWORK_PHRASES = [
  (ip, type, dl, rtt) =>
    `Connection from IP ${ip} over ${(type || "unknown").toUpperCase()} (downlink: ${dl ?? "N/A"} Mbps, RTT: ${rtt ?? "N/A"} ms).`,
  (ip, type, dl, rtt) =>
    `Traffic originated from ${ip} via ${(type || "undetermined").toUpperCase()} link. Latency: ${rtt ?? "N/A"} ms, throughput: ${dl ?? "N/A"} Mbps.`,
  (ip, type, dl, rtt) =>
    `Network: IP ${ip}, type ${(type || "unknown").toUpperCase()}, RTT ${rtt ?? "N/A"} ms, downlink ${dl ?? "N/A"} Mbps.`,
];

// ─── Utilities ────────────────────────────────────────────────

function safe(val, fallback = "N/A") {
  if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") return fallback;
  return String(val);
}

function pick(pool, seed) {
  return pool[seed % pool.length];
}

function normalizeTz(tz) {
  return (tz || "").replace("Asia/Calcutta", "Asia/Kolkata").toLowerCase().trim();
}

// ─── Risk Flag Engine ─────────────────────────────────────────
// Each flag: { level: 'CRITICAL'|'HIGH'|'MEDIUM'|'INFO', code: string, message: string }

export function evaluateRiskFlags(capture) {
  const flags = [];
  const c = capture;

  // --- Battery ---
  const batteryRaw = parseFloat(c.BATTERYLEVEL);
  if (!isNaN(batteryRaw)) {
    const pct = Math.round(batteryRaw * 100);
    if (pct < 10)
      flags.push({ level: "CRITICAL", code: "BATTERY_CRITICAL", message: `Battery critically low at ${pct}% — device may go offline imminently.` });
    else if (pct < 20)
      flags.push({ level: "HIGH", code: "BATTERY_LOW", message: `Battery at ${pct}% — approaching shutdown threshold.` });
  }

  const isCharging = c.BATTERYCHARGING === true || c.BATTERYCHARGING === "true";
  if (!isCharging) {
    const ds = parseInt(c.BATTERYDISCHARGINGTIME);
    if (!isNaN(ds) && ds > 0 && ds < 1800)
      flags.push({ level: "HIGH", code: "DISCHARGE_IMMINENT", message: `~${Math.round(ds / 60)} minutes of battery remaining. Device is not connected to power.` });
  }

  // --- Virtual Machine / RDP ---
  const wr = (c.WEBGLRENDERER || "").toLowerCase();
  if (wr.includes("basic render driver") || wr.includes("llvmpipe") || wr.includes("swiftshader"))
    flags.push({ level: "HIGH", code: "VM_SUSPECTED", message: "GPU renderer suggests a virtual machine or remote desktop session. Physical location may differ from IP." });

  // --- Timezone mismatch (spoofing indicator) ---
  const sysTz = normalizeTz(c.SYSTEMTIMEZONE || c.TIMEZONE);
  const srvTz = normalizeTz(c["SERVERGEO.TIMEZONE"]);
  if (sysTz && srvTz && sysTz !== srvTz)
    flags.push({ level: "HIGH", code: "TIMEZONE_MISMATCH", message: `Timezone mismatch: device reports ${c.SYSTEMTIMEZONE || c.TIMEZONE} but IP resolves to ${c["SERVERGEO.TIMEZONE"]}. Possible VPN or location spoofing.` });

  // --- No GPS ---
  const hasGps = c.GPS_LAT || c.GPSLATITUDE || c.latitude || c.GPS_LATITUDE;
  if (!hasGps)
    flags.push({ level: "MEDIUM", code: "NO_GPS", message: "No GPS coordinates obtained. Location accuracy is limited to IP geolocation (±5 km)." });

  // --- Fingerprinting resistance ---
  if (c.FINGERPRINTINGRESISTANCE === true || c.FINGERPRINTINGRESISTANCE === "true")
    flags.push({ level: "HIGH", code: "FINGERPRINT_RESISTANCE", message: "Browser fingerprinting resistance active — subject is employing tracking countermeasures." });

  // --- Canvas spoofed ---
  if (c.CANVASSPOOFED === true || c.CANVASSPOOFED === "true")
    flags.push({ level: "HIGH", code: "CANVAS_SPOOFED", message: "Canvas fingerprint is being spoofed — active privacy/anti-forensic tool detected." });

  // --- Do Not Track ---
  if (c.DONOTTRACK === "1" || c.DONOTTRACK === true)
    flags.push({ level: "MEDIUM", code: "DNT_ACTIVE", message: "Do Not Track header is enabled — subject is privacy-aware." });

  // --- Ad Blocker ---
  if (c.ADBLOCKER === true || c.ADBLOCKER === "true")
    flags.push({ level: "INFO", code: "ADBLOCKER", message: "Ad blocker detected — indicates technical awareness." });

  // --- Notifications denied ---
  if (c.NOTIFICATIONPERMISSION === "denied")
    flags.push({ level: "INFO", code: "NOTIFICATIONS_DENIED", message: "Browser notifications denied — possibly a hardened or privacy-configured profile." });

  // --- Unauthenticated session ---
  if (c["SERVERHEADERS.X-CLERK-AUTH-STATUS"] === "signed-out")
    flags.push({ level: "INFO", code: "UNAUTHENTICATED", message: "Link accessed without an authenticated session." });

  // --- Data saver ---
  if (c.SAVEDATA === true || c.SAVEDATA === "true")
    flags.push({ level: "INFO", code: "DATA_SAVER", message: "Data saver mode active — device may be on a metered or restricted connection." });

  // --- Low-end device ---
  const cores = parseInt(c.HARDWARECONCURRENCY);
  if (!isNaN(cores) && cores <= 2)
    flags.push({ level: "INFO", code: "LOW_END_DEVICE", message: `Only ${cores} CPU core(s) detected — low-end or older device.` });

  // --- Reduced motion (accessibility / unusual config) ---
  if (c.PREFERSREDUCEDMOTION === true || c.PREFERSREDUCEDMOTION === "true")
    flags.push({ level: "INFO", code: "REDUCED_MOTION", message: "Reduced motion preference enabled — unusual system configuration." });

  // --- Inverted colors ---
  if (c.INVERTEDCOLORS === true || c.INVERTEDCOLORS === "true")
    flags.push({ level: "INFO", code: "INVERTED_COLORS", message: "Inverted colors active — accessibility mode or screen configuration anomaly." });

  // --- Forced colors ---
  if (c.FORCEDCOLORS === true || c.FORCEDCOLORS === "true")
    flags.push({ level: "INFO", code: "FORCED_COLORS", message: "Forced colors mode active — high-contrast OS accessibility setting." });

  return flags;
}

// ─── Section Builders ─────────────────────────────────────────

function buildLocationSection(c) {
  const city = safe(c["SERVERGEO.CITY"] || c["SERVERHEADERS.X-VERCEL-IP-CITY"]);
  const region = safe(c["SERVERGEO.REGION"] || c["SERVERHEADERS.X-VERCEL-IP-COUNTRY-REGION"]);
  const country = safe(c["SERVERGEO.COUNTRY"] || c["SERVERHEADERS.X-VERCEL-IP-COUNTRY"]);
  const lat = safe(c["SERVERGEO.LATITUDE"] || c["SERVERHEADERS.X-VERCEL-IP-LATITUDE"]);
  const lon = safe(c["SERVERGEO.LONGITUDE"] || c["SERVERHEADERS.X-VERCEL-IP-LONGITUDE"]);
  const postal = safe(c["SERVERHEADERS.X-VERCEL-IP-POSTAL-CODE"]);
  const continent = safe(c["SERVERHEADERS.X-VERCEL-IP-CONTINENT"]);
  const asn = safe(c["SERVERHEADERS.X-VERCEL-IP-AS-NUMBER"]);

  const seed = (city + region).length;
  const base = pick(LOCATION_PHRASES, seed)(city, region, country, lat, lon);
  const extras = [
    postal !== "N/A" ? `Postal code: ${postal}.` : null,
    continent !== "N/A" ? `Continent: ${continent}.` : null,
    asn !== "N/A" ? `Network ASN: ${asn}.` : null,
  ].filter(Boolean).join(" ");

  return base + (extras ? " " + extras : "");
}

function buildGpsSection(c) {
  const lat = c.GPS_LAT || c.GPSLATITUDE || c.latitude || c.GPS_LATITUDE;
  const lon = c.GPS_LON || c.GPSLONGITUDE || c.longitude || c.GPS_LONGITUDE;
  const acc = c.GPS_ACCURACY || c.GPSACCURACY || c.accuracy;
  if (!lat || !lon) return null;
  const accStr = acc ? ` (accuracy: ${acc}m)` : "";
  return `High-precision GPS fix obtained: ${lat}, ${lon}${accStr}. This supersedes IP-based location.`;
}

function buildDeviceSection(c) {
  const device = safe(c.DEVICE || c.DEVICEMODEL, "Unknown device");
  const vendor = safe(c.DEVICEVENDOR || c.VENDOR, "");
  const os = safe(c.OS);
  const osVer = safe(c.OSVERSION || c.PLATFORMVERSION);
  const browser = safe(c.BROWSER);
  const bVer = safe(c.BROWSERVERSION || c.UAFULLVERSION);
  const engine = safe(c.ENGINE, "");
  const memory = c.DEVICEMEMORY ? `${c.DEVICEMEMORY} GB RAM` : null;
  const cores = c.HARDWARECONCURRENCY ? `${c.HARDWARECONCURRENCY}-core CPU` : null;
  const arch = (c.ARCHITECTURE || c.BITNESS) ? `${safe(c.ARCHITECTURE, "")} ${safe(c.BITNESS, "")}-bit`.trim() : null;
  const platform = safe(c.PLATFORM, "");
  const touch = (c.TOUCHEVENT === true || c.TOUCHEVENT === "true")
    ? `Touch-enabled (${c.MAXTOUCHPOINTS || "?"} touch points)`
    : "Non-touch display";
  const dpr = c.DEVICEPIXELRATIO ? `${c.DEVICEPIXELRATIO}x DPR` : null;
  const screen = (c.SCREENWIDTH && c.SCREENHEIGHT) ? `${c.SCREENWIDTH}×${c.SCREENHEIGHT}px` : null;
  const colorDepth = c.COLORDEPTH ? `${c.COLORDEPTH}-bit colour` : null;
  const gamut = c.COLORGAMUT ? `${c.COLORGAMUT} gamut` : null;
  const colorScheme = c.PREFERSCOLORSCHEME ? `prefers ${c.PREFERSCOLORSCHEME} mode` : null;

  const seed = (device + os).length;
  const base = pick(DEVICE_PHRASES, seed)(device, os, osVer, browser, bVer);

  const hwParts = [memory, cores, arch, platform ? `Platform: ${platform}` : null].filter(Boolean).join(", ");
  const displayParts = [screen, dpr, colorDepth, gamut, colorScheme].filter(Boolean).join(", ");
  const vendorStr = vendor && !device.includes(vendor) ? ` Vendor: ${vendor}.` : "";
  const engineStr = engine ? ` Rendering engine: ${engine}.` : "";

  return [
    base,
    hwParts ? `Hardware: ${hwParts}.` : "",
    displayParts ? `Display: ${displayParts}. ${touch}.` : `${touch}.`,
    vendorStr + engineStr,
  ].filter(s => s.trim()).join(" ");
}

function buildNetworkSection(c) {
  const ip = safe(c["SERVERHEADERS.X-REAL-IP"] || c["SERVERHEADERS.X-FORWARDED-FOR"]);
  const type = safe(c.EFFECTIVETYPE, "unknown");
  const dl = c.DOWNLINK ?? "N/A";
  const rtt = c.RTT ?? "N/A";
  const asn = safe(c["SERVERHEADERS.X-VERCEL-IP-AS-NUMBER"], null);
  const online = (c.ONLINE === true || c.ONLINE === "true") ? "Online at time of capture." : "Device reported offline.";
  const connType = safe(c.CONNECTIONTYPE, null);

  const seed = ip.length;
  const base = pick(NETWORK_PHRASES, seed)(ip, type, dl, rtt);
  const extras = [
    asn ? `ASN: ${asn}.` : null,
    connType && connType !== "unknown" ? `Connection type: ${connType}.` : null,
    online,
  ].filter(Boolean).join(" ");

  return `${base} ${extras}`.trim();
}

function buildBatterySection(c) {
  const level = parseFloat(c.BATTERYLEVEL);
  if (isNaN(level)) return null;

  const pct = Math.round(level * 100);
  const charging = c.BATTERYCHARGING === true || c.BATTERYCHARGING === "true";
  const chargingTime = parseInt(c.BATTERYCHARGINGTIME);
  const dischargeTime = parseInt(c.BATTERYDISCHARGINGTIME);

  let timeStr = "";
  if (charging && !isNaN(chargingTime) && chargingTime > 0 && chargingTime < 86400) {
    const h = Math.floor(chargingTime / 3600), m = Math.round((chargingTime % 3600) / 60);
    timeStr = ` Full charge in ~${h > 0 ? `${h}h ${m}m` : `${m}m`}.`;
  } else if (!charging && !isNaN(dischargeTime) && dischargeTime > 0 && dischargeTime < 86400) {
    const h = Math.floor(dischargeTime / 3600), m = Math.round((dischargeTime % 3600) / 60);
    timeStr = ` Estimated autonomy: ${h > 0 ? `${h}h ${m}m` : `${m}m`}.`;
  }

  return `Battery: ${pct}% — ${charging ? "currently charging" : "not charging, running on battery"}.${timeStr}`;
}

function buildFingerprintSection(c) {
  const canvas = c.CANVASFINGERPRINT ? `Canvas: ${String(c.CANVASFINGERPRINT).substring(0, 20)}…` : null;
  const audio = c.AUDIOFINGERPRINT ? `Audio: ${String(c.AUDIOFINGERPRINT).substring(0, 20)}…` : null;
  const webgl = c.WEBGLRENDERER ? `GPU: ${c.WEBGLRENDERER}` : null;
  const vendor = c.WEBGLVENDOR ? `(vendor: ${c.WEBGLVENDOR})` : null;
  const webglVer = safe(c.WEBGLVERSION, null);
  const glsl = safe(c.WEBGLSHADINGLANGUAGEVERSION, null);

  const fingerprints = [canvas, audio].filter(Boolean);
  if (!fingerprints.length && !webgl) return null;

  const gpuStr = [webgl, vendor, webglVer ? `WebGL: ${webglVer}` : null].filter(Boolean).join(" ");
  return [
    fingerprints.length ? `Device fingerprints: ${fingerprints.join(" | ")}.` : null,
    gpuStr ? `${gpuStr}.` : null,
    glsl ? `GLSL: ${glsl}.` : null,
  ].filter(Boolean).join(" ");
}

function buildPerformanceSection(c) {
  const load = c["PERFORMANCE.PAGELOADTIME"];
  const server = c["PERFORMANCE.SERVERRESPONSETIME"];
  const network = c["PERFORMANCE.NETWORKTIME"];
  const browser = c["PERFORMANCE.BROWSERTIME"];
  const dns = c["PERFORMANCE.DNSLOOKUPTIME"];
  const tcp = c["PERFORMANCE.TCPCONNECTIONTIME"];
  const download = c["PERFORMANCE.PAGEDOWNLOADTIME"];

  if (!load) return null;

  const parts = [
    `total: ${load}ms`,
    server != null ? `server: ${server}ms` : null,
    network != null ? `network: ${network}ms` : null,
    browser != null ? `browser: ${browser}ms` : null,
    dns != null ? `DNS: ${dns}ms` : null,
    tcp != null ? `TCP: ${tcp}ms` : null,
    download != null ? `download: ${download}ms` : null,
  ].filter(Boolean).join(", ");

  return `Page load performance — ${parts}.`;
}

function buildHardwareSection(c) {
  const bluetooth = c.BLUETOOTHSUPPORT === true || c.BLUETOOTHSUPPORT === "true";
  const usb = c.USBSUPPORT === true || c.USBSUPPORT === "true";
  const webrtc = c.WEBRTCSUPPORT === true || c.WEBRTCSUPPORT === "true";
  const motion = c.HASDEVICEMOTION === true || c.HASDEVICEMOTION === "true";
  const orientation = c.HASDEVICEORIENTATION === true || c.HASDEVICEORIENTATION === "true";
  const speech = c.SPEECHSYNTHESIS === true || c.SPEECHSYNTHESIS === "true";
  const indexedDb = c.INDEXEDDB === true || c.INDEXEDDB === "true";
  const localStorage = c.LOCALSTORAGE === true || c.LOCALSTORAGE === "true";
  const sessionStorage = c.SESSIONSTORAGE === true || c.SESSIONSTORAGE === "true";
  const cookiesEnabled = c.COOKIESENABLED === true || c.COOKIESENABLED === "true";

  const capabilities = [
    bluetooth ? "Bluetooth" : null,
    usb ? "USB" : null,
    webrtc ? "WebRTC" : null,
    motion ? "Motion sensor" : null,
    orientation ? "Orientation sensor" : null,
    speech ? "Speech synthesis" : null,
  ].filter(Boolean);

  const storage = [
    localStorage ? "LocalStorage" : null,
    sessionStorage ? "SessionStorage" : null,
    indexedDb ? "IndexedDB" : null,
    cookiesEnabled ? "Cookies" : null,
  ].filter(Boolean);

  const parts = [];
  if (capabilities.length) parts.push(`Capabilities: ${capabilities.join(", ")}.`);
  if (storage.length) parts.push(`Storage APIs: ${storage.join(", ")}.`);
  if (c.INSTALLEDFONTS) parts.push(`Installed fonts detected: ${String(c.INSTALLEDFONTS).split(",").length} fonts.`);
  if (c.MEDIADEVICES) parts.push(`Media devices: ${c.MEDIADEVICES}.`);

  return parts.length ? parts.join(" ") : null;
}

function buildPermissionsSection(c) {
  const perms = [
    c.CAMERAPERMISSION ? `Camera: ${c.CAMERAPERMISSION}` : null,
    c.MICROPHONEPERMISSION ? `Microphone: ${c.MICROPHONEPERMISSION}` : null,
    c.GEOPERMISSION ? `Geolocation: ${c.GEOPERMISSION}` : null,
    c.NOTIFICATIONPERMISSION ? `Notifications: ${c.NOTIFICATIONPERMISSION}` : null,
  ].filter(Boolean);

  if (!perms.length) return null;
  return `Browser permissions — ${perms.join(", ")}.`;
}

function buildSystemSection(c) {
  const date = safe(c.SYSTEMDATE, null);
  const tz = safe(c.SYSTEMTIMEZONE || c.TIMEZONE, null);
  const tzOffset = c.TIMEZONEOFFSET != null ? `UTC${c.TIMEZONEOFFSET > 0 ? "-" : "+"}${Math.abs(c.TIMEZONEOFFSET / 60)}` : null;
  const locale = safe(c.LOCALE || c.LANGUAGE, null);
  const region = safe(c.LOCALEREGION, null);
  const langs = safe(c.LANGUAGES, null);
  const visibility = safe(c.VISIBILITYSTATE, null);
  const histLen = c.HISTORYLENGTH != null ? `History length: ${c.HISTORYLENGTH}` : null;
  const orientation = safe(c.SCREENORIENTATIONTYPE, null);
  const orientAngle = c.SCREENORIENTATIONANGLE != null ? `${c.SCREENORIENTATIONANGLE}°` : null;

  const parts = [
    date ? `System time: ${date}` : null,
    tz ? `Timezone: ${tz}${tzOffset ? ` (${tzOffset})` : ""}` : null,
    locale ? `Locale: ${locale}${region ? `-${region}` : ""}` : null,
    langs ? `Languages: ${langs}` : null,
    visibility ? `Page visibility: ${visibility}` : null,
    histLen,
    orientation ? `Orientation: ${orientation}${orientAngle ? ` @ ${orientAngle}` : ""}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(". ") + "." : null;
}

// ─── Main Export ──────────────────────────────────────────────

/**
 * generateAnalysis(capture)
 * Pure function. Zero dependencies. Vercel-safe.
 * Returns: { text, riskFlags, riskScore, riskLevel, sections }
 */
export function generateAnalysis(capture) {
  if (!capture || typeof capture !== "object")
    return { text: "No capture data available.", riskFlags: [], riskScore: 0, riskLevel: "UNKNOWN", sections: {} };

  const riskFlags = evaluateRiskFlags(capture);
  const scoreMap = { CRITICAL: 40, HIGH: 20, MEDIUM: 10, INFO: 2 };
  const riskScore = Math.min(riskFlags.reduce((a, f) => a + (scoreMap[f.level] || 0), 0), 100);
  const riskLevel = riskScore >= 60 ? "CRITICAL" : riskScore >= 35 ? "HIGH" : riskScore >= 15 ? "MEDIUM" : "LOW";

  const sections = {
    gps: buildGpsSection(capture),
    location: buildLocationSection(capture),
    device: buildDeviceSection(capture),
    network: buildNetworkSection(capture),
    battery: buildBatterySection(capture),
    hardware: buildHardwareSection(capture),
    permissions: buildPermissionsSection(capture),
    system: buildSystemSection(capture),
    fingerprint: buildFingerprintSection(capture),
    performance: buildPerformanceSection(capture),
  };

  const flagsText = riskFlags.length > 0
    ? riskFlags.map(f => `  [${f.level}] ${f.message}`).join("\n")
    : "  No anomalies detected.";

  const sectionLines = Object.entries(sections)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join("\n\n");

  const text = [
    "--- Automated Analysis Report ---",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    sectionLines,
    "",
    `RISK ASSESSMENT: ${riskLevel} (Score: ${riskScore}/100)`,
    "RISK FLAGS:",
    flagsText,
  ].join("\n");

  return { text, riskFlags, riskScore, riskLevel, sections };
}

// Backward compatibility alias
export function generateSummary(capture) {
  return generateAnalysis(capture).text;
}

export function generateAnalysisPlainText(capture) {
  return generateAnalysis(capture).text;
}
