// ============================================================
// queryEngine.js — Traxalon Local Field Query Engine
// Zero API calls. Zero latency. Zero Vercel cost.
// Answers 100+ natural language officer queries instantly
// using pure pattern matching on capture data.
// ============================================================

// ─── Utilities ────────────────────────────────────────────────

function safe(val, fallback = "Unknown") {
    if (val === null || val === undefined || val === "" || val === "null") return fallback;
    return String(val);
}

function normalizeTz(tz) {
    return (tz || "").replace("Asia/Calcutta", "Asia/Kolkata");
}

function batteryPercent(capture) {
    const v = parseFloat(capture.BATTERYLEVEL || capture.batteryLevel);
    return isNaN(v) ? null : Math.round(v * 100);
}

function getIP(capture) {
    return safe(
        capture.ip ||
        capture["SERVERHEADERS.X-REAL-IP"] ||
        capture["SERVERHEADERS.X-FORWARDED-FOR"] ||
        capture["SERVERHEADERS.X-VERCEL-PROXIED-FOR"],
        "Not available"
    );
}

function getCity(capture) {
    return safe(
        capture.city ||
        capture["SERVERGEO.CITY"] ||
        capture["SERVERHEADERS.X-VERCEL-IP-CITY"],
        "Unknown city"
    );
}

function getRegion(capture) {
    return safe(
        capture.region ||
        capture["SERVERGEO.REGION"] ||
        capture["SERVERHEADERS.X-VERCEL-IP-COUNTRY-REGION"],
        "Unknown region"
    );
}

function getCountry(capture) {
    return safe(
        capture.country ||
        capture["SERVERGEO.COUNTRY"] ||
        capture["SERVERHEADERS.X-VERCEL-IP-COUNTRY"],
        "Unknown country"
    );
}

function getCoordinates(capture) {
    const lat = capture.lat || capture["SERVERGEO.LATITUDE"] || capture["SERVERHEADERS.X-VERCEL-IP-LATITUDE"];
    const lon = capture.lon || capture["SERVERGEO.LONGITUDE"] || capture["SERVERHEADERS.X-VERCEL-IP-LONGITUDE"];
    if (!lat || !lon) return null;
    return { lat: String(lat), lon: String(lon) };
}

function getGps(capture) {
    const lat = capture.gpsLat || capture.GPS_LAT || capture.GPSLATITUDE || capture.latitude;
    const lon = capture.gpsLon || capture.GPS_LON || capture.GPSLONGITUDE || capture.longitude;
    const acc = capture.gpsAccuracy || capture.GPS_ACCURACY || capture.GPSACCURACY || capture.accuracy;
    if (!lat || !lon) return null;
    return { lat: String(lat), lon: String(lon), accuracy: acc ? String(acc) : null };
}

// ─── Answer Generators ────────────────────────────────────────

const ANSWERS = {

    // --- Location ---
    location(c) {
        const gps = getGps(c);
        const city = getCity(c);
        const region = getRegion(c);
        const country = getCountry(c);
        const coords = getCoordinates(c);
        const postal = safe(c.zip || c["SERVERHEADERS.X-VERCEL-IP-POSTAL-CODE"], null);

        if (gps) {
            return `📍 HIGH-PRECISION GPS: ${gps.lat}, ${gps.lon}${gps.accuracy ? ` (±${gps.accuracy}m)` : ""}\n\nCity: ${city}, ${region}, ${country}${postal ? `\nPostal Code: ${postal}` : ""}\n\nLocation source: GPS (high accuracy).`;
        }
        return `📍 IP GEOLOCATION (approximate):\n\nCity: ${city}\nRegion: ${region}\nCountry: ${country}${coords ? `\nCoordinates: ${coords.lat}, ${coords.lon}` : ""}${postal ? `\nPostal Code: ${postal}` : ""}\n\n⚠ No GPS obtained. Accuracy ±5 km.`;
    },

    coordinates(c) {
        const gps = getGps(c);
        if (gps) return `GPS Coordinates: ${gps.lat}, ${gps.lon}${gps.accuracy ? ` (accuracy: ±${gps.accuracy}m)` : ""}\nSource: Device GPS — high precision.`;
        const coords = getCoordinates(c);
        if (coords) return `IP Coordinates: ${coords.lat}, ${coords.lon}\nSource: IP geolocation — approximate only.`;
        return "No coordinates available in this capture.";
    },

    city(c) {
        return `City: ${getCity(c)}, ${getRegion(c)}, ${getCountry(c)}`;
    },

    // --- Device ---
    device(c) {
        const device = safe(c.device || c.DEVICE || c.DEVICEMODEL, "Unknown device");
        const vendor = safe(c.DEVICEVENDOR || c.VENDOR, "");
        const os = safe(c.os || c.OS);
        const osVer = safe(c.osVersion || c.OSVERSION || c.PLATFORMVERSION);
        const browser = safe(c.browser || c.BROWSER);
        const bVer = safe(c.browserVersion || c.BROWSERVERSION || c.UAFULLVERSION);
        const engine = safe(c.ENGINE, "");
        const platform = safe(c.platform || c.PLATFORM, "");

        return [
            `Device Type: ${device}`,
            vendor ? `Vendor: ${vendor}` : null,
            `OS: ${os} ${osVer}`.trim(),
            `Browser: ${browser} ${bVer}`.trim(),
            engine ? `Rendering Engine: ${engine}` : null,
            platform ? `Platform: ${platform}` : null,
        ].filter(Boolean).join("\n");
    },

    phone(c) {
        const device = safe(c.device || c.DEVICE || c.DEVICEMODEL, "");
        const vendor = safe(c.DEVICEVENDOR || c.VENDOR, "");
        const os = safe(c.os || c.OS);
        const osVer = safe(c.osVersion || c.OSVERSION || c.PLATFORMVERSION);
        const isMobile = (device.toLowerCase().includes("mobile") || device.toLowerCase().includes("iphone") || device === "mobile" || c.MOBILE === true || c.MOBILE === "true");

        if (!isMobile && c.device !== "mobile" && c.DEVICE !== "mobile") {
            return `This is a desktop/non-mobile device.\nDevice: ${device || "Desktop"}\nOS: ${os} ${osVer}\n${vendor ? `Vendor: ${vendor}` : ""}`.trim();
        }
        return [
            `Device: ${device}`,
            vendor ? `Manufacturer: ${vendor}` : null,
            `OS: ${os} ${osVer}`.trim(),
        ].filter(Boolean).join("\n");
    },

    os(c) {
        return `OS: ${safe(c.os || c.OS)} ${safe(c.osVersion || c.OSVERSION || c.PLATFORMVERSION)}\nArchitecture: ${safe(c.architecture || c.ARCHITECTURE, "unknown")} ${safe(c.bitness || c.BITNESS, "")}`.trim();
    },

    browser(c) {
        const browser = safe(c.browser || c.BROWSER);
        const ver = safe(c.browserVersion || c.BROWSERVERSION || c.UAFULLVERSION);
        const engine = safe(c.ENGINE, "");
        const brands = safe(c.BRANDS, "");
        return [
            `Browser: ${browser} ${ver}`.trim(),
            engine ? `Engine: ${engine}` : null,
            brands ? `UA Brands: ${brands}` : null,
            `User Agent: ${safe(c.userAgent || c.USERAGENT)}`,
        ].filter(Boolean).join("\n");
    },

    useragent(c) {
        return `User Agent: ${safe(c.userAgent || c.USERAGENT)}\n\nThis string identifies the browser and OS. If this looks unusual or mismatched, the subject may be spoofing their browser identity.`;
    },

    // --- Network & IP ---
    ip(c) {
        const ip = getIP(c);
        const asn = safe(c.asn || c["SERVERHEADERS.X-VERCEL-IP-AS-NUMBER"], null);
        const continent = safe(c["SERVERHEADERS.X-VERCEL-IP-CONTINENT"], null);
        const postal = safe(c.zip || c["SERVERHEADERS.X-VERCEL-IP-POSTAL-CODE"], null);
        return [
            `IP Address: ${ip}`,
            asn ? `ASN (Network): ${asn}` : null,
            continent ? `Continent: ${continent}` : null,
            postal ? `Postal Code (IP-based): ${postal}` : null,
        ].filter(Boolean).join("\n");
    },

    network(c) {
        const type = safe(c.connectionType || c.EFFECTIVETYPE, "unknown").toUpperCase();
        const dl = (c.connectionDownlink != null ? `${c.connectionDownlink} Mbps` : null) || (c.DOWNLINK != null ? `${c.DOWNLINK} Mbps` : "N/A");
        const rtt = (c.connectionRtt != null ? `${c.connectionRtt} ms` : null) || (c.RTT != null ? `${c.RTT} ms` : "N/A");
        const conn = safe(c.CONNECTIONTYPE, null);
        const save = c.saveData === true || c.SAVEDATA === true || c.SAVEDATA === "true";
        const online = c.online === true || c.ONLINE === true || c.ONLINE === "true";
        return [
            `Connection Type: ${type}`,
            conn && conn !== "unknown" ? `Physical Type: ${conn}` : null,
            `Downlink Speed: ${dl}`,
            `Latency (RTT): ${rtt}`,
            `Online Status: ${online ? "Online" : "Offline"}`,
            save ? "Data Saver: Active (metered connection)" : null,
        ].filter(Boolean).join("\n");
    },

    // --- Battery ---
    battery(c) {
        const pct = batteryPercent(c);
        if (pct === null) return "Battery information not available for this capture.";

        const charging = c.batteryCharging === true || c.BATTERYCHARGING === true || c.BATTERYCHARGING === "true";
        const ds = parseInt(c.batteryDischargingTime || c.BATTERYDISCHARGINGTIME);
        const cs = parseInt(c.BATTERYCHARGINGTIME);

        let timeStr = "";
        if (!charging && !isNaN(ds) && ds > 0 && ds < 86400) {
            const h = Math.floor(ds / 3600), m = Math.round((ds % 3600) / 60);
            timeStr = `\nEstimated time remaining: ${h > 0 ? `${h}h ${m}m` : `${m} minutes`}`;
        }
        if (charging && !isNaN(cs) && cs > 0 && cs < 86400) {
            const h = Math.floor(cs / 3600), m = Math.round((cs % 3600) / 60);
            timeStr = `\nFull charge in: ~${h > 0 ? `${h}h ${m}m` : `${m} minutes`}`;
        }

        const status = charging ? "🔌 Charging" : "🔋 On battery (not charging)";
        return `Battery Level: ${pct}%\nCharging Status: ${status}${timeStr}`;
    },

    // --- Risk & Flags ---
    risk(c) {
        const { evaluateRiskFlags } = require("./summaryEngine");
        // Inline flag evaluation (no circular import)
        const flags = _evaluateFlags(c);
        const scoreMap = { CRITICAL: 40, HIGH: 20, MEDIUM: 10, INFO: 2 };
        const score = Math.min(flags.reduce((a, f) => a + (scoreMap[f.level] || 0), 0), 100);
        const level = score >= 60 ? "CRITICAL" : score >= 35 ? "HIGH" : score >= 15 ? "MEDIUM" : "LOW";

        if (!flags.length) return `Risk Level: LOW (0/100)\nNo anomalies or risk indicators detected in this capture.`;

        const lines = flags.map(f => `[${f.level}] ${f.message}`).join("\n");
        return `Risk Level: ${level} (Score: ${score}/100)\n\n${lines}`;
    },

    vpn(c) {
        const flags = _evaluateFlags(c);
        const vpnFlags = flags.filter(f =>
            f.code === "TIMEZONE_MISMATCH" ||
            f.code === "VM_SUSPECTED" ||
            f.code === "FINGERPRINT_RESISTANCE" ||
            f.code === "CANVAS_SPOOFED"
        );
        if (!vpnFlags.length) return "No VPN or proxy indicators detected in this capture.\nTimezone, GPU renderer, and fingerprinting data appear consistent.";
        return `VPN/Proxy indicators found:\n\n${vpnFlags.map(f => `[${f.level}] ${f.message}`).join("\n")}`;
    },

    timezone(c) {
        const sys = normalizeTz(safe(c.timezone || c.SYSTEMTIMEZONE || c.TIMEZONE, "Not available"));
        const srv = normalizeTz(safe(c["SERVERGEO.TIMEZONE"], "Not available"));
        const offset = c.TIMEZONEOFFSET != null ? `UTC${c.TIMEZONEOFFSET > 0 ? "-" : "+"}${Math.abs(c.TIMEZONEOFFSET / 60)}` : null;
        const match = sys.toLowerCase() === srv.toLowerCase();
        return [
            `Device timezone: ${sys}`,
            offset ? `UTC offset: ${offset}` : null,
            `IP-resolved timezone: ${srv}`,
            match ? "✓ Timezones match — no spoofing indicated." : "⚠ MISMATCH — timezones differ. Subject may be using VPN or spoofing location.",
        ].filter(Boolean).join("\n");
    },

    // --- Screen & Display ---
    screen(c) {
        const sw = safe(c.screenWidth || c.SCREENWIDTH, null);
        const sh = safe(c.screenHeight || c.SCREENHEIGHT, null);
        const aw = safe(c.screenAvailWidth || c.SCREENAVAILWIDTH, null);
        const ah = safe(c.screenAvailHeight || c.SCREENAVAILHEIGHT, null);
        const iw = safe(c.windowWidth || c.INNERWIDTH, null);
        const ih = safe(c.windowHeight || c.INNERHEIGHT, null);
        const dpr = safe(c.pixelRatio || c.DEVICEPIXELRATIO, null);
        const cd = safe(c.colorDepth || c.COLORDEPTH, null);
        const pd = safe(c.PIXELDEPTH, null);
        const gamut = safe(c.COLORGAMUT, null);
        const orient = safe(c.SCREENORIENTATIONTYPE, null);
        const ratio = safe(c.SCREENASPECTRATIO, null);
        return [
            sw && sh ? `Screen Resolution: ${sw}×${sh}px` : null,
            aw && ah ? `Available Screen: ${aw}×${ah}px` : null,
            iw && ih ? `Browser Viewport: ${iw}×${ih}px` : null,
            dpr ? `Device Pixel Ratio: ${dpr}x` : null,
            cd ? `Colour Depth: ${cd}-bit` : null,
            pd ? `Pixel Depth: ${pd}-bit` : null,
            gamut ? `Colour Gamut: ${gamut}` : null,
            orient ? `Orientation: ${orient}` : null,
            ratio ? `Aspect Ratio: ${ratio}` : null,
        ].filter(Boolean).join("\n");
    },

    // --- Hardware ---
    hardware(c) {
        const mem = safe(c.ram || c.DEVICEMEMORY, null);
        const cores = safe(c.cpuCores || c.HARDWARECONCURRENCY, null);
        const arch = safe(c.ARCHITECTURE, null);
        const bits = safe(c.BITNESS, null);
        const touch = c.TOUCHEVENT === true || c.TOUCHEVENT === "true";
        const maxTouch = c.maxTouchPoints || c.MAXTOUCHPOINTS;
        const bluetooth = c.BLUETOOTHSUPPORT === true || c.BLUETOOTHSUPPORT === "true";
        const usb = c.USBSUPPORT === true || c.USBSUPPORT === "true";
        const motion = c.HASDEVICEMOTION === true || c.HASDEVICEMOTION === "true";
        const webrtc = c.WEBRTCSUPPORT === true || c.WEBRTCSUPPORT === "true";
        return [
            mem ? `RAM: ${mem} GB` : null,
            cores ? `CPU Cores: ${cores}` : null,
            arch ? `Architecture: ${arch}` : null,
            bits ? `Bit width: ${bits}-bit` : null,
            `Touch Input: ${touch ? `Yes (${maxTouch || "?"} points)` : "No"}`,
            `Bluetooth: ${bluetooth ? "Available" : "Not available"}`,
            `USB: ${usb ? "Available" : "Not available"}`,
            `WebRTC: ${webrtc ? "Supported" : "Not supported"}`,
            `Motion Sensors: ${motion ? "Present" : "Not present"}`,
        ].filter(Boolean).join("\n");
    },

    // --- Permissions ---
    permissions(c) {
        return [
            c.CAMERAPERMISSION ? `Camera: ${c.CAMERAPERMISSION}` : null,
            c.MICROPHONEPERMISSION ? `Microphone: ${c.MICROPHONEPERMISSION}` : null,
            c.GEOPERMISSION ? `Geolocation: ${c.GEOPERMISSION}` : null,
            c.NOTIFICATIONPERMISSION ? `Notifications: ${c.NOTIFICATIONPERMISSION}` : null,
        ].filter(Boolean).join("\n") || "No permission data captured.";
    },

    // --- Fingerprints ---
    fingerprint(c) {
        const canvas = c.canvasHash || c.CANVASFINGERPRINT;
        const audio = c.AUDIOFINGERPRINT;
        const webgl = safe(c.gpu || c.WEBGLRENDERER, null);
        const vendor = safe(c.gpuVendor || c.WEBGLVENDOR, null);
        const spoofed = c.CANVASSPOOFED === true || c.CANVASSPOOFED === "true";
        const resistant = c.FINGERPRINTINGRESISTANCE === true || c.FINGERPRINTINGRESISTANCE === "true";
        return [
            canvas ? `Canvas Fingerprint: ${String(canvas).substring(0, 32)}…` : "Canvas fingerprint: Not available",
            audio ? `Audio Fingerprint: ${String(audio).substring(0, 32)}…` : "Audio fingerprint: Not available",
            webgl ? `GPU Renderer: ${webgl}` : null,
            vendor ? `GPU Vendor: ${vendor}` : null,
            spoofed ? "⚠ Canvas fingerprint is SPOOFED — anti-tracking tool active" : null,
            resistant ? "⚠ Fingerprinting resistance ENABLED" : null,
        ].filter(Boolean).join("\n");
    },

    // --- Performance ---
    performance(c) {
        const fields = [
            ["Page Load Total", c.pageLoadTime || c["PERFORMANCE.PAGELOADTIME"]],
            ["Server Response", c["PERFORMANCE.SERVERRESPONSETIME"]],
            ["Network Time", c["PERFORMANCE.NETWORKTIME"]],
            ["Browser Time", c["PERFORMANCE.BROWSERTIME"]],
            ["DNS Lookup", c["PERFORMANCE.DNSLOOKUPTIME"]],
            ["TCP Connection", c["PERFORMANCE.TCPCONNECTIONTIME"]],
            ["Page Download", c["PERFORMANCE.PAGEDOWNLOADTIME"]],
        ];
        const lines = fields.filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}ms`);
        return lines.length ? lines.join("\n") : "Performance data not available.";
    },

    // --- System & time ---
    systemtime(c) {
        const date = safe(c.SYSTEMDATE, null);
        const tz = normalizeTz(safe(c.timezone || c.SYSTEMTIMEZONE || c.TIMEZONE, null));
        const offset = c.TIMEZONEOFFSET != null ? `UTC${c.TIMEZONEOFFSET > 0 ? "-" : "+"}${Math.abs(c.TIMEZONEOFFSET / 60)}` : null;
        return [
            date ? `System Date/Time: ${date}` : null,
            tz ? `Timezone: ${tz}` : null,
            offset ? `UTC Offset: ${offset}` : null,
        ].filter(Boolean).join("\n") || "System time data not available.";
    },

    // --- Locale ---
    locale(c) {
        return [
            safe(c.language || c.LOCALE || c.LANGUAGE, null) ? `Primary Language: ${safe(c.language || c.LOCALE || c.LANGUAGE)}` : null,
            safe(c.languages || c.LANGUAGES, null) ? `All Languages: ${c.languages || c.LANGUAGES}` : null,
            safe(c.LOCALEREGION, null) ? `Locale Region: ${c.LOCALEREGION}` : null,
        ].filter(Boolean).join("\n") || "Locale data not available.";
    },

    // --- Fonts ---
    fonts(c) {
        if (!c.INSTALLEDFONTS) return "No font data captured.";
        const list = String(c.INSTALLEDFONTS).split(",").map(f => f.trim());
        return `${list.length} fonts detected:\n${list.join(", ")}`;
    },

    // --- Summary ---
    summary(c) {
        const city = getCity(c);
        const country = getCountry(c);
        const device = safe(c.device || c.DEVICE || c.DEVICEMODEL, "Unknown device");
        const os = safe(c.os || c.OS);
        const browser = safe(c.browser || c.BROWSER);
        const ip = getIP(c);
        const pct = batteryPercent(c);
        const flags = _evaluateFlags(c);
        const scoreMap = { CRITICAL: 40, HIGH: 20, MEDIUM: 10, INFO: 2 };
        const score = Math.min(flags.reduce((a, f) => a + (scoreMap[f.level] || 0), 0), 100);
        const level = score >= 60 ? "CRITICAL" : score >= 35 ? "HIGH" : score >= 15 ? "MEDIUM" : "LOW";

        return [
            `QUICK SUMMARY`,
            `─────────────`,
            `Location: ${city}, ${country}`,
            `Device: ${device} (${os})`,
            `Browser: ${browser}`,
            `IP: ${ip}`,
            pct !== null ? `Battery: ${pct}%` : null,
            `Risk: ${level} (${score}/100)`,
            flags.length ? `\nTop flags:\n${flags.slice(0, 3).map(f => `  [${f.level}] ${f.message}`).join("\n")}` : null,
        ].filter(Boolean).join("\n");
    },
};

// ─── Internal flag evaluator (no import needed) ───────────────

function _evaluateFlags(c) {
    const flags = [];
    const pct = parseFloat(c.batteryLevel || c.BATTERYLEVEL);
    if (!isNaN(pct)) {
        const p = Math.round(pct * 100);
        if (p < 10) flags.push({ level: "CRITICAL", code: "BATTERY_CRITICAL", message: `Battery critically low at ${p}% — device may go offline imminently.` });
        else if (p < 20) flags.push({ level: "HIGH", code: "BATTERY_LOW", message: `Battery at ${p}% — approaching shutdown.` });
    }
    if (c.batteryCharging === false || c.BATTERYCHARGING === false || c.BATTERYCHARGING === "false") {
        const ds = parseInt(c.batteryDischargingTime || c.BATTERYDISCHARGINGTIME);
        if (!isNaN(ds) && ds > 0 && ds < 1800)
            flags.push({ level: "HIGH", code: "DISCHARGE_IMMINENT", message: `~${Math.round(ds / 60)} minutes of battery remaining.` });
    }
    const wr = (c.gpu || c.WEBGLRENDERER || "").toLowerCase();
    if (wr.includes("basic render driver") || wr.includes("llvmpipe") || wr.includes("swiftshader"))
        flags.push({ level: "HIGH", code: "VM_SUSPECTED", message: "GPU renderer suggests virtual machine or remote desktop session." });
    const sy = normalizeTz(c.timezone || c.SYSTEMTIMEZONE || c.TIMEZONE || "");
    const sv = normalizeTz(c["SERVERGEO.TIMEZONE"] || "");
    if (sy && sv && sy.toLowerCase() !== sv.toLowerCase())
        flags.push({ level: "HIGH", code: "TIMEZONE_MISMATCH", message: `Timezone mismatch: device (${sy}) vs IP (${sv}). Possible VPN.` });
    if (!c.gpsLat && !c.GPS_LAT && !c.GPSLATITUDE && !c.latitude)
        flags.push({ level: "MEDIUM", code: "NO_GPS", message: "No GPS obtained. IP location only (±5 km)." });
    if (c.FINGERPRINTINGRESISTANCE === true || c.FINGERPRINTINGRESISTANCE === "true")
        flags.push({ level: "HIGH", code: "FINGERPRINT_RESISTANCE", message: "Fingerprinting resistance active — tracking evasion detected." });
    if (c.CANVASSPOOFED === true || c.CANVASSPOOFED === "true")
        flags.push({ level: "HIGH", code: "CANVAS_SPOOFED", message: "Canvas fingerprint spoofed — privacy tool active." });
    if (c.doNotTrack === "1" || c.doNotTrack === true || c.DONOTTRACK === "1" || c.DONOTTRACK === true)
        flags.push({ level: "MEDIUM", code: "DNT_ACTIVE", message: "Do Not Track header enabled." });
    if (c.NOTIFICATIONPERMISSION === "denied")
        flags.push({ level: "INFO", code: "NOTIFICATIONS_DENIED", message: "Notifications denied — hardened browser profile possible." });
    if (c["SERVERHEADERS.X-CLERK-AUTH-STATUS"] === "signed-out")
        flags.push({ level: "INFO", code: "UNAUTHENTICATED", message: "Link accessed without authenticated session." });
    return flags;
}

// ─── Intent Matcher ───────────────────────────────────────────
// Maps natural language patterns → answer keys

const INTENT_PATTERNS = [
    { keys: ["where", "location", "located", "place", "address", "city", "area", "region", "country", "situated"], answer: "location" },
    { keys: ["coordinates", "lat", "long", "latitude", "longitude", "gps", "coords", "coordinate", "map"], answer: "coordinates" },
    { keys: ["what city", "which city", "city name"], answer: "city" },
    { keys: ["phone", "mobile", "handset", "model", "iphone", "android", "smartphone"], answer: "phone" },
    { keys: ["device", "gadget", "hardware", "which device", "what device", "using what"], answer: "device" },
    { keys: ["operating system", "os", "windows", "android", "ios", "linux", "macos", "which os", "what os"], answer: "os" },
    { keys: ["browser", "chrome", "safari", "firefox", "edge", "opera", "which browser"], answer: "browser" },
    { keys: ["user agent", "useragent", "ua string", "browser string"], answer: "useragent" },
    { keys: ["ip address", "ip", "address", "ipv4", "ipv6"], answer: "ip" },
    { keys: ["network", "connection", "wifi", "4g", "5g", "3g", "internet", "speed", "downlink", "rtt", "latency", "bandwidth"], answer: "network" },
    { keys: ["battery", "charge", "charging", "power", "dying", "offline", "shutdown", "low battery"], answer: "battery" },
    { keys: ["risk", "threat", "danger", "suspicious", "anomaly", "flag", "alert", "warning", "issue"], answer: "risk" },
    { keys: ["vpn", "proxy", "tor", "spoofing", "fake location", "hiding", "masked", "anonymity"], answer: "vpn" },
    { keys: ["timezone", "time zone", "local time", "gmt", "utc", "ist"], answer: "timezone" },
    { keys: ["screen", "display", "resolution", "pixels", "monitor", "aspect ratio", "dpr"], answer: "screen" },
    { keys: ["hardware specs", "specs", "specifications", "ram", "memory", "cpu", "cores", "processor", "bluetooth", "usb"], answer: "hardware" },
    { keys: ["permission", "camera", "microphone", "mic", "notification", "geo permission"], answer: "permissions" },
    { keys: ["fingerprint", "canvas", "audio fingerprint", "webgl", "gpu", "spoofed", "canvas spoofed"], answer: "fingerprint" },
    { keys: ["performance", "load time", "page load", "speed", "latency", "dns", "tcp"], answer: "performance" },
    { keys: ["time", "date", "system time", "system date", "clock"], answer: "systemtime" },
    { keys: ["language", "locale", "lang", "region locale", "languages"], answer: "locale" },
    { keys: ["font", "fonts", "installed font"], answer: "fonts" },
    { keys: ["summary", "overview", "brief", "quick look", "at a glance", "tell me everything", "all details", "full report"], answer: "summary" },
];

// ─── Main Export ──────────────────────────────────────────────

/**
 * queryCapture(question, capture)
 * Instant local query — zero network calls, zero latency.
 * Returns a string answer ready to display.
 */
export function queryCapture(question, capture) {
    if (!question || !capture) return "No data available to query.";

    const q = question.toLowerCase().trim();

    // Find best matching intent
    let bestMatch = null;
    let bestScore = 0;

    for (const pattern of INTENT_PATTERNS) {
        const score = pattern.keys.filter(k => q.includes(k)).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = pattern.answer;
        }
    }

    // Default to summary if no match
    const answerKey = bestMatch || "summary";
    const answerFn = ANSWERS[answerKey];

    if (!answerFn) return "I couldn't understand that query. Try asking about: location, device, IP, battery, network, risk flags, VPN, screen, hardware, or type 'summary' for an overview.";

    try {
        return answerFn(capture);
    } catch (e) {
        return "Error retrieving that data from the capture. The field may not have been captured for this subject.";
    }
}

/**
 * getSuggestedQuestions()
 * Returns default officer questions for the chatbot UI.
 */
export function getSuggestedQuestions() {
    return [
        "Where is this subject located?",
        "What device are they using?",
        "What is their IP address?",
        "Are there any risk flags?",
        "How much battery do they have?",
        "Is there any sign of a VPN?",
        "What OS and browser are they on?",
        "Give me a quick summary",
    ];
}
