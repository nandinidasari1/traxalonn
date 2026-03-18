// import React, { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { db } from "../firebase/config";
// import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
// import { createTrackingLink } from "../utils/linkService";
// import {
//   Link2, Zap, Copy, Shield, Activity,
//   ChevronRight, AlertCircle, Clock, Smartphone,
//   Globe, Eye, CreditCard, X
// } from "lucide-react";

// export default function Dashboard() {
//   const { currentUser, userProfile, fetchUserProfile } = useAuth();
//   const [links, setLinks] = useState([]);
//   const [label, setLabel] = useState("");
//   const [destinationUrl, setDestinationUrl] = useState("");
//   const [generating, setGenerating] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [credits, setCredits] = useState(userProfile?.credits ?? 0);
//   const [selectedLink, setSelectedLink] = useState(null);
//   const [showPayment, setShowPayment] = useState(false);

//   useEffect(() => {
//     if (!currentUser) return;
//     const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
//       if (snap.exists()) setCredits(snap.data().credits ?? 0);
//     });
//     return unsub;
//   }, [currentUser]);

//   useEffect(() => {
//     if (!currentUser) return;
//     const q = query(collection(db, "trackingLinks"), where("uid", "==", currentUser.uid));
//     const unsub = onSnapshot(q, (snap) => {
//       const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       data.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
//       setLinks(data);
//     });
//     return unsub;
//   }, [currentUser]);

//   async function handleGenerate(e) {
//     e.preventDefault();
//     if (credits < 1) { setShowPayment(true); return; }
//     if (!destinationUrl) { setError("Destination URL is required"); return; }
//     setGenerating(true);
//     setError("");
//     setSuccess("");
//     try {
//       const { trackingUrl } = await createTrackingLink(currentUser.uid, label || "Tracking Link", destinationUrl);
//       setSuccess(trackingUrl);
//       setLabel("");
//       setDestinationUrl("");
//       await fetchUserProfile(currentUser.uid);
//     } catch (err) {
//       setError(err.message);
//     }
//     setGenerating(false);
//   }

//   function copyToClipboard(text) { navigator.clipboard.writeText(text); }

//   return (
//     <div className="min-h-screen bg-surface pt-16 text-text-primary">
//       <div className="max-w-7xl mx-auto px-4 py-8">

//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="font-display text-4xl tracking-wider">COMMAND <span className="text-primary">CENTER</span></h1>
//             <p className="font-body text-sm text-text-secondary mt-1">
//               Welcome back, <span className="text-primary">{userProfile?.displayName || "Officer"}</span>
//               {userProfile?.badgeId && <span className="text-text-muted"> · Badge #{userProfile.badgeId}</span>}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="bg-surface-card border border-surface-border rounded-xl px-5 py-3 flex items-center gap-3">
//               <Zap className="w-5 h-5 text-primary" />
//               <div>
//                 <div className="font-mono text-2xl text-primary leading-none">{credits}</div>
//                 <div className="font-body text-xs text-text-muted">Credits</div>
//               </div>
//             </div>
//             <button onClick={() => setShowPayment(true)} className="px-4 py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl font-body text-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
//               <CreditCard className="w-4 h-4" /> Buy Credits
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           {[
//             { label: "Total Links", value: links.length, icon: <Link2 className="w-4 h-4" /> },
//             { label: "Total Captures", value: links.reduce((a, l) => a + (l.captures?.length || 0), 0), icon: <Eye className="w-4 h-4" /> },
//             { label: "Active Links", value: links.filter((l) => l.active).length, icon: <Activity className="w-4 h-4" /> },
//             { label: "Total Clicks", value: links.reduce((a, l) => a + (l.clicks || 0), 0), icon: <Globe className="w-4 h-4" /> },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-surface-card border border-surface-border rounded-xl p-4">
//               <div className="flex items-center gap-2 text-text-muted mb-2">
//                 {stat.icon}
//                 <span className="font-body text-xs uppercase tracking-wider">{stat.label}</span>
//               </div>
//               <div className="font-display text-3xl text-text-primary">{stat.value}</div>
//             </div>
//           ))}
//         </div>

//         <div className="grid lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-1">
//             <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6">
//               <h2 className="font-display text-xl tracking-wider mb-1">GENERATE <span className="text-primary">LINK</span></h2>
//               <p className="font-body text-xs text-text-muted mb-6">Paste any URL — a Traxelon link is generated that captures device & location data before redirecting.</p>

//               {error && (
//                 <div className="flex items-start gap-2 bg-accent/10 border border-accent/30 text-accent rounded-lg px-3 py-2.5 font-body text-sm mb-4">
//                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
//                 </div>
//               )}

//               {success && (
//                 <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
//                   <p className="font-body text-xs text-primary mb-2 font-semibold">Link Generated!</p>
//                   <div className="flex items-center gap-2">
//                     <span className="font-mono text-xs text-text-secondary truncate flex-1">{success}</span>
//                     <button onClick={() => copyToClipboard(success)} className="text-primary hover:text-primary-dark flex-shrink-0">
//                       <Copy className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               <form onSubmit={handleGenerate} className="space-y-4">
//                 <div>
//                   <label className="block font-body text-xs text-text-secondary uppercase tracking-wider mb-1.5">Destination URL (Required)</label>
//                   <input type="url" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://example.com" required
//                     className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" />
//                 </div>
//                 <div>
//                   <label className="block font-body text-xs text-text-secondary uppercase tracking-wider mb-1.5">Case / Label (optional)</label>
//                   <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Case #2024-078"
//                     className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" />
//                 </div>
//                 <button type="submit" disabled={generating}
//                   className="w-full px-4 py-3 bg-primary text-surface font-body font-bold rounded-lg hover:bg-primary-dark transition-all shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
//                   <Link2 className="w-4 h-4" />
//                   {generating ? "Generating..." : credits > 0 ? "Generate Link (1 credit)" : "No Credits - Buy Now"}
//                 </button>
//               </form>

//               <div className="mt-4 p-3 bg-surface border border-surface-border rounded-lg">
//                 <p className="font-body text-xs text-text-muted">
//                   <span className="text-primary font-semibold">How it works: </span>
//                   How it works: When the target opens the Traxelon link, the browser requests location permission, captures GPS + device info, then silently redirects to your pasted URL.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-2">
//             <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6">
//               <h2 className="font-display text-xl tracking-wider mb-6">TRACKING <span className="text-primary">LINKS</span></h2>

//               {links.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
//                   <p className="font-body text-text-muted">No links generated yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
//                   {links.map((link) => (
//                     <div key={link.id}
//                       className="bg-surface border border-surface-border rounded-xl p-4 hover:border-primary/40 transition-all cursor-pointer"
//                       onClick={() => setSelectedLink(selectedLink?.id === link.id ? null : link)}>

//                       <div className="flex items-start justify-between gap-3">
//                         <div className="flex-1 min-w-0">
//                           <span className="font-body text-sm font-semibold text-text-primary truncate block mb-1">{link.label}</span>
//                           <div className="font-mono text-xs text-text-muted truncate">{link.trackingUrl}</div>
//                         </div>
//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           <button onClick={(e) => { e.stopPropagation(); copyToClipboard(link.trackingUrl); }} className="p-1.5 text-text-muted hover:text-primary transition-colors">
//                             <Copy className="w-4 h-4" />
//                           </button>
//                           <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${selectedLink?.id === link.id ? "rotate-90" : ""}`} />
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-body">
//                         <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{link.clicks || 0} clicks</span>
//                         <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />{link.captures?.length || 0} captures</span>
//                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{link.createdAt ? new Date(link.createdAt.toMillis()).toLocaleDateString() : "-"}</span>
//                       </div>

//                       {selectedLink?.id === link.id && link.captures?.length > 0 && (
//                         <div className="mt-4 border-t border-surface-border pt-4 space-y-4">
//                           <h4 className="font-body text-xs text-text-secondary uppercase tracking-wider">Captured Device Data</h4>
//                           {link.captures.map((capture, i) => (
//                             <CaptureCard key={i} capture={capture} index={i} />
//                           ))}
//                         </div>
//                       )}

//                       {selectedLink?.id === link.id && (!link.captures || link.captures.length === 0) && (
//                         <div className="mt-4 border-t border-surface-border pt-4">
//                           <p className="font-body text-xs text-text-muted text-center">No captures yet. Link clicked {link.clicks || 0} time(s).</p>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showPayment && <PaymentModal onClose={() => setShowPayment(false)} uid={currentUser?.uid} fetchUserProfile={fetchUserProfile} />}
//     </div>
//   );
// }

// function CaptureCard({ capture, index }) {
//   const hasGPS = capture.gpsLat && capture.gpsLon;
//   const hasIPLocation = capture.lat && capture.lon;

//   return (
//     <div className="bg-surface-elevated border border-surface-border rounded-lg p-4">
//       <div className="flex items-center justify-between mb-4">
//         <div className="font-mono text-xs text-text-muted">{capture.capturedAt}</div>
//         <div className={`text-xs px-2 py-0.5 rounded-full font-mono border ${hasGPS ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
//           {hasGPS ? "📍 GPS" : "🌐 IP"}
//         </div>
//       </div>

//       <Section title="🌐 Network & IP">
//         <DataRow label="IP Address" value={capture.ip} />
//         <DataRow label="ISP" value={capture.isp} />
//         <DataRow label="Organisation" value={capture.org} />
//         <DataRow label="ASN" value={capture.asn} />
//         <DataRow label="Hostname" value={capture.hostname} />
//         <DataRow label="Timezone" value={capture.timezone} />
//         <DataRow label="Connection" value={capture.connectionType} />
//         <DataRow label="Downlink" value={capture.connectionDownlink ? capture.connectionDownlink + " Mbps" : null} />
//         <DataRow label="RTT" value={capture.connectionRtt ? capture.connectionRtt + " ms" : null} />
//         <DataRow label="Save Data" value={capture.connectionSaveData != null ? String(capture.connectionSaveData) : null} />
//       </Section>

//       <Section title="📡 IP Location (Approximate)">
//         <DataRow label="City" value={capture.city} />
//         <DataRow label="Region" value={capture.region} />
//         <DataRow label="Country" value={capture.country} />
//         <DataRow label="ZIP" value={capture.zip} />
//         <DataRow label="Coordinates" value={capture.lat ? capture.lat + ", " + capture.lon : null} />
//       </Section>

//       {hasGPS && (
//         <Section title="🛰️ GPS Location (Exact)">
//           <DataRow label="GPS Coords" value={capture.gpsLat + ", " + capture.gpsLon} />
//           <DataRow label="Accuracy" value={capture.gpsAccuracy ? capture.gpsAccuracy + " metres" : null} />
//           <DataRow label="Address" value={capture.gpsAddress} />
//           <DataRow label="City" value={capture.gpsCity} />
//           <DataRow label="State" value={capture.gpsState} />
//           <DataRow label="Pincode" value={capture.gpsPincode} />
//           <DataRow label="Country" value={capture.gpsCountry} />
//           <div className="col-span-2 mt-2">
//             <div className="rounded-xl overflow-hidden border border-surface-border mb-3" style={{ height: 180 }}>
//               <iframe title={"map-" + index} width="100%" height="100%" frameBorder="0"
//                 src={"https://maps.google.com/maps?q=" + capture.gpsLat + "," + capture.gpsLon + "&z=16&output=embed"} allowFullScreen />
//             </div>
//             <a href={"https://www.google.com/maps?q=" + capture.gpsLat + "," + capture.gpsLon}
//               target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-surface rounded-lg font-body text-xs font-bold hover:bg-primary-dark transition-colors">
//               📍 View on Google Maps
//             </a>
//           </div>
//         </Section>
//       )}

//       {!hasGPS && hasIPLocation && (
//         <Section title="🗺️ Approximate Map">
//           <div className="col-span-2">
//             <div className="rounded-xl overflow-hidden border border-surface-border mb-3" style={{ height: 180 }}>
//               <iframe title={"map-ip-" + index} width="100%" height="100%" frameBorder="0"
//                 src={"https://maps.google.com/maps?q=" + capture.lat + "," + capture.lon + "&z=12&output=embed"} allowFullScreen />
//             </div>
//             <a href={"https://www.google.com/maps?q=" + capture.lat + "," + capture.lon}
//               target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg font-body text-xs hover:bg-primary/20 transition-colors">
//               🌐 View Approximate Location
//             </a>
//           </div>
//         </Section>
//       )}

//       <Section title="📱 Device">
//         <DataRow label="Device Type" value={capture.device} />
//         <DataRow label="OS" value={capture.os} />
//         <DataRow label="Browser" value={capture.browser} />
//         <DataRow label="Platform" value={capture.platform} />
//         <DataRow label="CPU Cores" value={capture.cpuCores} />
//         <DataRow label="RAM" value={capture.ram ? capture.ram + " GB" : null} />
//         <DataRow label="GPU" value={capture.gpu} />
//         <DataRow label="GPU Vendor" value={capture.gpuVendor} />
//         <DataRow label="Touch Points" value={capture.maxTouchPoints} />
//         <DataRow label="Canvas Hash" value={capture.canvasHash} />
//       </Section>

//       <Section title="🖥️ Screen">
//         <DataRow label="Resolution" value={capture.screenWidth ? capture.screenWidth + "x" + capture.screenHeight : null} />
//         <DataRow label="Available" value={capture.screenAvailWidth ? capture.screenAvailWidth + "x" + capture.screenAvailHeight : null} />
//         <DataRow label="Window" value={capture.windowWidth ? capture.windowWidth + "x" + capture.windowHeight : null} />
//         <DataRow label="Color Depth" value={capture.colorDepth ? capture.colorDepth + " bit" : null} />
//         <DataRow label="Pixel Ratio" value={capture.pixelRatio} />
//       </Section>

//       {capture.batteryLevel != null && (
//         <Section title="🔋 Battery">
//           <DataRow label="Battery Level" value={capture.batteryLevel + "%"} />
//           <DataRow label="Charging" value={capture.batteryCharging != null ? (capture.batteryCharging ? "Yes ⚡" : "No") : null} />
//         </Section>
//       )}

//       <Section title="🔍 Browser Details">
//         <DataRow label="Language" value={capture.language} />
//         <DataRow label="Languages" value={capture.languages} />
//         <DataRow label="Cookies" value={capture.cookiesEnabled != null ? (capture.cookiesEnabled ? "Enabled" : "Disabled") : null} />
//         <DataRow label="Do Not Track" value={capture.doNotTrack} />
//         <DataRow label="History Length" value={capture.historyLength} />
//         <DataRow label="Referrer" value={capture.referrer} />
//         <DataRow label="Incognito" value={capture.incognito != null ? (capture.incognito ? "Yes 🕵️" : "No") : null} />
//         <DataRow label="User Agent" value={capture.userAgent} />
//       </Section>
//     </div>
//   );
// }

// function Section({ title, children }) {
//   return (
//     <div className="mb-4">
//       <div className="font-body text-xs text-primary uppercase tracking-wider mb-2 pb-1 border-b border-surface-border">{title}</div>
//       <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
//     </div>
//   );
// }

// function DataRow({ label, value }) {
//   if (value == null || value === "" || value === "null") return null;
//   return (
//     <div>
//       <div className="font-body text-xs text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
//       <div className="font-mono text-xs text-text-primary break-all">{String(value)}</div>
//     </div>
//   );
// }

// function PaymentModal({ onClose, uid, fetchUserProfile }) {
//   const plans = [
//     { credits: 5, price: 99, label: "Starter Pack" },
//     { credits: 15, price: 249, label: "Investigation Pack", popular: true },
//     { credits: 50, price: 699, label: "Department Pack" },
//   ];
//   const [selected, setSelected] = useState(1);
//   const [processing, setProcessing] = useState(false);
//   const [done, setDone] = useState(false);

//   async function handlePurchase() {
//     setProcessing(true);
//     await new Promise((r) => setTimeout(r, 2000));
//     const { addCredits } = await import("../utils/linkService");
//     await addCredits(uid, plans[selected].credits);
//     await fetchUserProfile(uid);
//     setDone(true);
//     setProcessing(false);
//   }

//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
//       <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-card">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="font-display text-2xl tracking-wider text-text-primary">BUY <span className="text-primary">CREDITS</span></h2>
//           <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
//         </div>

//         {done ? (
//           <div className="text-center py-8">
//             <div className="text-5xl mb-4">✅</div>
//             <h3 className="font-display text-2xl text-primary mb-2">Credits Added!</h3>
//             <p className="font-body text-text-secondary text-sm">{plans[selected].credits} credits added to your account.</p>
//             <button onClick={onClose} className="mt-6 px-6 py-3 bg-primary text-surface font-body font-bold rounded-lg">Back to Dashboard</button>
//           </div>
//         ) : (
//           <>
//             <div className="space-y-3 mb-6">
//               {plans.map((plan, i) => (
//                 <button key={i} onClick={() => setSelected(i)}
//                   className={`w-full text-left p-4 rounded-xl border transition-all ${selected === i ? "border-primary bg-primary/10 shadow-glow" : "border-surface-border bg-surface hover:border-primary/40"}`}>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="font-display text-lg text-text-primary">{plan.label}</span>
//                         {plan.popular && <span className="bg-primary text-surface text-xs px-2 py-0.5 rounded-full font-body font-bold">POPULAR</span>}
//                       </div>
//                       <div className="font-body text-sm text-text-secondary mt-0.5">{plan.credits} tracking links</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-display text-2xl text-primary">Rs.{plan.price}</div>
//                       <div className="font-body text-xs text-text-muted">Rs.{(plan.price / plan.credits).toFixed(0)}/link</div>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//             <div className="bg-surface border border-surface-border rounded-xl p-3 mb-4 text-xs font-body text-text-muted">
//               Demo Mode: Integrate Razorpay for real payments in production.
//             </div>
//             <button onClick={handlePurchase} disabled={processing}
//               className="w-full px-6 py-3.5 bg-primary text-surface font-body font-bold rounded-lg hover:bg-primary-dark transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
//               <CreditCard className="w-4 h-4" />
//               {processing ? "Processing..." : "Pay Rs." + plans[selected].price}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { createTrackingLink } from "../utils/linkService";
import {
  Link2, Zap, Copy, Shield, Activity,
  ChevronRight, AlertCircle, Clock, Smartphone,
  Globe, Eye, CreditCard, X, Bot, FileText, MessageSquare, Download, Check
} from "lucide-react";

import { generateSummary, generateAnalysis } from "../utils/summaryEngine";
import CaptureAnalysisChatbot from "../components/CaptureAnalysisChatbot";

export default function Dashboard() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const [links, setLinks] = useState([]);
  const [label, setLabel] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credits, setCredits] = useState(userProfile?.credits ?? 0);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) setCredits(snap.data().credits ?? 0);
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "trackingLinks"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setLinks(data);
    });
    return unsub;
  }, [currentUser]);

  async function handleGenerate(e) {
    e.preventDefault();
    if (credits < 1) { setShowPayment(true); return; }
    if (!destinationUrl) { setError("Destination URL is required"); return; }
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const { trackingUrl } = await createTrackingLink(currentUser.uid, label || "Tracking Link", destinationUrl);
      setSuccess(trackingUrl);
      setLabel("");
      setDestinationUrl("");
      await fetchUserProfile(currentUser.uid);
    } catch (err) {
      setError(err.message);
    }
    setGenerating(false);
  }

  function copyToClipboard(text) { navigator.clipboard.writeText(text); }

  return (
    <div className="min-h-screen bg-surface pt-16 text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-wider">COMMAND <span className="text-primary">CENTER</span></h1>
            <p className="font-body text-sm text-text-secondary mt-1">
              Welcome back, <span className="text-primary">{userProfile?.displayName || "Officer"}</span>
              {userProfile?.badgeId && <span className="text-text-muted"> · Badge #{userProfile.badgeId}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-card border border-surface-border rounded-xl px-5 py-3 flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <div className="font-mono text-2xl text-primary leading-none">{credits}</div>
                <div className="font-body text-xs text-text-muted">Credits</div>
              </div>
            </div>
            <button onClick={async () => {
              try {
                const { generateGlobalPDF } = await import("../utils/pdfGenerator");
                await generateGlobalPDF(links);
              } catch (e) {
                alert("Failed to generate global PDF: " + e.message);
              }
            }} className="px-4 py-3 bg-accent/10 border border-accent/30 text-accent rounded-xl font-body text-sm hover:bg-accent/20 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Global PDF
            </button>
            <button onClick={() => setShowPayment(true)} className="px-4 py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl font-body text-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Buy Credits
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Links", value: links.length, icon: <Link2 className="w-4 h-4" /> },
            { label: "Total Captures", value: links.reduce((a, l) => a + (l.captures?.length || 0), 0), icon: <Eye className="w-4 h-4" /> },
            { label: "Active Links", value: links.filter((l) => l.active).length, icon: <Activity className="w-4 h-4" /> },
            {
              label: "AI Analysis",
              value: "Report",
              icon: <Bot className="w-4 h-4 text-primary" />,
              action: () => setShowAISummary(true),
              highlight: true
            },
          ].map((stat) => (
            <div key={stat.label}
              onClick={stat.action}
              className={`bg-surface-card border rounded-xl p-4 transition-all ${stat.action ? "cursor-pointer hover:border-primary border-primary/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]" : "border-surface-border"}`}>
              <div className="flex items-center gap-2 text-text-muted mb-2">
                {stat.icon}
                <span className={`font-body text-xs uppercase tracking-wider ${stat.highlight ? "text-primary font-bold" : ""}`}>{stat.label}</span>
              </div>
              <div className={`font-display text-3xl ${stat.highlight ? "text-primary" : "text-text-primary"}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6">
              <h2 className="font-display text-xl tracking-wider mb-1">GENERATE <span className="text-primary">LINK</span></h2>
              <p className="font-body text-xs text-text-muted mb-6">Paste any URL — a Traxelon link is generated that captures device & location data before redirecting.</p>

              {error && (
                <div className="flex items-start gap-2 bg-accent/10 border border-accent/30 text-accent rounded-lg px-3 py-2.5 font-body text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              {success && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
                  <p className="font-body text-xs text-primary mb-2 font-semibold">Link Generated!</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-secondary truncate flex-1">{success}</span>
                    <button onClick={() => copyToClipboard(success)} className="text-primary hover:text-primary-dark flex-shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block font-body text-xs text-text-secondary uppercase tracking-wider mb-1.5">Destination URL (Required)</label>
                  <input type="url" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://example.com" required
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block font-body text-xs text-text-secondary uppercase tracking-wider mb-1.5">Case / Label (optional)</label>
                  <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Case #2024-078"
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" />
                </div>
                <button type="submit" disabled={generating}
                  className="w-full px-4 py-3 bg-primary text-surface font-body font-bold rounded-lg hover:bg-primary-dark transition-all shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" />
                  {generating ? "Generating..." : credits > 0 ? "Generate Link (1 credit)" : "No Credits - Buy Now"}
                </button>
              </form>

              <div className="mt-4 p-3 bg-surface border border-surface-border rounded-lg">
                <p className="font-body text-xs text-text-muted">
                  <span className="text-primary font-semibold">How it works: </span>
                  When the target opens the Traxelon link, the browser requests location permission, captures GPS + device info, then silently redirects to your pasted URL.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6">
              <h2 className="font-display text-xl tracking-wider mb-6">TRACKING <span className="text-primary">LINKS</span></h2>

              {links.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="font-body text-text-muted">No links generated yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                  {links.map((link) => (
                    <div key={link.id}
                      className="bg-surface border border-surface-border rounded-xl p-4 hover:border-primary/40 transition-all cursor-pointer"
                      onClick={() => setSelectedLink(selectedLink?.id === link.id ? null : link)}>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-sm font-semibold text-text-primary truncate block mb-1">{link.label}</span>
                          <div className="font-mono text-xs text-text-muted truncate">{link.trackingUrl}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(link.trackingUrl); }} className="p-1.5 text-text-muted hover:text-primary transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${selectedLink?.id === link.id ? "rotate-90" : ""}`} />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-body">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{link.clicks || 0} clicks</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />{link.captures?.length || 0} captures</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{link.createdAt ? new Date(link.createdAt.toMillis()).toLocaleDateString() : "-"}</span>
                      </div>

                      {selectedLink?.id === link.id && link.captures?.length > 0 && (
                        <div className="mt-4 border-t border-surface-border pt-4 space-y-4">
                          <h4 className="font-body text-xs text-text-secondary uppercase tracking-wider">
                            Captured Device Data — {link.captures.length} capture{link.captures.length !== 1 ? "s" : ""}
                          </h4>
                          {[...link.captures]
                            .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))
                            .map((capture, i) => (
                              <CaptureCard key={i} capture={capture} index={i} total={link.captures.length} />
                            ))}
                        </div>
                      )}

                      {selectedLink?.id === link.id && (!link.captures || link.captures.length === 0) && (
                        <div className="mt-4 border-t border-surface-border pt-4">
                          <p className="font-body text-xs text-text-muted text-center">No captures yet. Link clicked {link.clicks || 0} time(s).</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} uid={currentUser?.uid} fetchUserProfile={fetchUserProfile} />}
      {showAISummary && <AISummaryModal onClose={() => setShowAISummary(false)} links={links} />}
    </div>
  );
}

function AISummaryModal({ onClose, links }) {
  const allCaptures = links.flatMap(l => l.captures || []);
  const sortedCaptures = allCaptures.sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 w-full max-w-2xl shadow-card max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl tracking-wider text-text-primary">AI <span className="text-primary">ANALYSIS</span></h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4">
          {sortedCaptures.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="font-body text-text-muted">No data available for AI analysis yet.</p>
            </div>
          ) : (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="font-body text-sm text-text-primary leading-relaxed">
                  Based on **{sortedCaptures.length}** total captures across your links, here is the automated intelligence report for each event.
                </p>
              </div>

              {sortedCaptures.map((capture, idx) => (
                <div key={idx} className="bg-surface border border-surface-border rounded-xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Capture #{sortedCaptures.length - idx}
                    </span>
                    <span className="font-mono text-xs text-text-muted">{new Date(capture.capturedAt).toLocaleString()}</span>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mt-3">
                    {generateSummary(capture)}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-surface-border flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-surface border border-surface-border text-text-primary font-body font-bold rounded-lg hover:border-text-muted transition-all">Close Report</button>
        </div>
      </div>
    </div>
  );
}

function CaptureCard({ capture, index, total }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [copyingReport, setCopyingReport] = useState(false);

  const rawParams = Object.keys(capture).filter(k => k !== 'id' && k !== 'capturedAt').sort();

  const hasGPS = capture.gpsLat && capture.gpsLon;
  const hasIPLocation = capture.lat && capture.lon;
  const captureNumber = total - index;

  const handleCopyReport = async () => {
    try {
      setCopyingReport(true);
      const { generateAnalysisPlainText } = await import("../utils/summaryEngine");
      const report = generateAnalysisPlainText(capture);
      await navigator.clipboard.writeText(report);
      setTimeout(() => setCopyingReport(false), 2000);
    } catch (err) {
      console.error("Failed to copy report", err);
      setCopyingReport(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const { generatePDF } = await import("../utils/pdfGenerator");
      const analysisData = generateAnalysis(capture);
      await generatePDF(capture, analysisData);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: "rgba(10, 22, 40, 0.85)",
        border: "1.5px solid rgba(0, 212, 255, 0.25)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,212,255,0.05)",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.012)";
        e.currentTarget.style.border = "1.5px solid rgba(0, 212, 255, 0.55)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,212,255,0.12), inset 0 0 0 1px rgba(0,212,255,0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.border = "1.5px solid rgba(0, 212, 255, 0.25)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,212,255,0.05)";
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,212,255,0.12)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            #{captureNumber}
          </span>
          <div className="font-mono text-xs text-text-muted">{capture.capturedAt}</div>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full font-mono border ${hasGPS ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
          {hasGPS ? "📍 GPS" : "🌐 IP"}
        </div>
      </div>

      <Section title="🌐 Network & IP">
        <DataRow label="IP Address" value={capture.ip} />
        <DataRow label="ISP" value={capture.isp} />
        <DataRow label="Organisation" value={capture.org} />
        <DataRow label="ASN" value={capture.asn} />
        <DataRow label="Hostname" value={capture.hostname} />
        <DataRow label="Timezone" value={capture.timezone} />
        <DataRow label="Connection" value={capture.connectionType} />
        <DataRow label="Downlink" value={capture.connectionDownlink ? capture.connectionDownlink + " Mbps" : null} />
        <DataRow label="RTT" value={capture.connectionRtt ? capture.connectionRtt + " ms" : null} />
        <DataRow label="Save Data" value={capture.connectionSaveData != null ? String(capture.connectionSaveData) : null} />
      </Section>

      <Section title="📡 IP Location (Approximate)">
        <DataRow label="City" value={capture.city} />
        <DataRow label="Region" value={capture.region} />
        <DataRow label="Country" value={capture.country} />
        <DataRow label="ZIP" value={capture.zip} />
        <DataRow label="Coordinates" value={capture.lat ? capture.lat + ", " + capture.lon : null} />
      </Section>

      {hasGPS && (
        <Section title="🛰️ GPS Location (Exact)">
          <DataRow label="GPS Coords" value={capture.gpsLat + ", " + capture.gpsLon} />
          <DataRow label="Accuracy" value={capture.gpsAccuracy ? capture.gpsAccuracy + " metres" : null} />
          <DataRow label="Address" value={capture.gpsAddress} />
          <DataRow label="City" value={capture.gpsCity} />
          <DataRow label="State" value={capture.gpsState} />
          <DataRow label="Pincode" value={capture.gpsPincode} />
          <DataRow label="Country" value={capture.gpsCountry} />
          <div className="col-span-2 mt-2">
            <div className="rounded-xl overflow-hidden border border-surface-border mb-3" style={{ height: 180 }}>
              <iframe title={"map-" + index} width="100%" height="100%" frameBorder="0"
                src={"https://maps.google.com/maps?q=" + capture.gpsLat + "," + capture.gpsLon + "&z=16&output=embed"} allowFullScreen />
            </div>
            <a href={"https://www.google.com/maps?q=" + capture.gpsLat + "," + capture.gpsLon}
              target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-surface rounded-lg font-body text-xs font-bold hover:bg-primary-dark transition-colors">
              📍 View on Google Maps
            </a>
          </div>
        </Section>
      )}

      {!hasGPS && hasIPLocation && (
        <Section title="🗺️ Approximate Map">
          <div className="col-span-2">
            <div className="rounded-xl overflow-hidden border border-surface-border mb-3" style={{ height: 180 }}>
              <iframe title={"map-ip-" + index} width="100%" height="100%" frameBorder="0"
                src={"https://maps.google.com/maps?q=" + capture.lat + "," + capture.lon + "&z=12&output=embed"} allowFullScreen />
            </div>
            <a href={"https://www.google.com/maps?q=" + capture.lat + "," + capture.lon}
              target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg font-body text-xs hover:bg-primary/20 transition-colors">
              🌐 View Approximate Location
            </a>
          </div>
        </Section>
      )}

      <Section title="📱 Device">
        <DataRow label="Device Type" value={capture.device} />
        <DataRow label="OS" value={capture.os} />
        <DataRow label="Browser" value={capture.browser} />
        <DataRow label="Platform" value={capture.platform} />
        <DataRow label="CPU Cores" value={capture.cpuCores} />
        <DataRow label="RAM" value={capture.ram ? capture.ram + " GB" : null} />
        <DataRow label="GPU" value={capture.gpu} />
        <DataRow label="GPU Vendor" value={capture.gpuVendor} />
        <DataRow label="Touch Points" value={capture.maxTouchPoints} />
        <DataRow label="Canvas Hash" value={capture.canvasHash} />
      </Section>

      <Section title="🖥️ Screen">
        <DataRow label="Resolution" value={capture.screenWidth ? capture.screenWidth + "x" + capture.screenHeight : null} />
        <DataRow label="Available" value={capture.screenAvailWidth ? capture.screenAvailWidth + "x" + capture.screenAvailHeight : null} />
        <DataRow label="Window" value={capture.windowWidth ? capture.windowWidth + "x" + capture.windowHeight : null} />
        <DataRow label="Color Depth" value={capture.colorDepth ? capture.colorDepth + " bit" : null} />
        <DataRow label="Pixel Ratio" value={capture.pixelRatio} />
      </Section>

      {capture.batteryLevel != null && (
        <Section title="🔋 Battery">
          <DataRow label="Battery Level" value={capture.batteryLevel + "%"} />
          <DataRow label="Charging" value={capture.batteryCharging != null ? (capture.batteryCharging ? "Yes ⚡" : "No") : null} />
        </Section>
      )}

      <Section title="🔍 Browser Details">
        <DataRow label="Language" value={capture.language} />
        <DataRow label="Languages" value={capture.languages} />
        <DataRow label="Cookies" value={capture.cookiesEnabled != null ? (capture.cookiesEnabled ? "Enabled" : "Disabled") : null} />
        <DataRow label="Do Not Track" value={capture.doNotTrack} />
        <DataRow label="History Length" value={capture.historyLength} />
        <DataRow label="Referrer" value={capture.referrer} />
        <DataRow label="Incognito" value={capture.incognito != null ? (capture.incognito ? "Yes 🕵️" : "No") : null} />
        <DataRow label="User Agent" value={capture.userAgent} />
      </Section>

      <div className="mt-6 pt-4 border-t border-surface-border flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setShowDetails(!showDetails); setShowAnalysis(false); setShowChatbot(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-xs font-bold transition-all ${showDetails ? "bg-accent text-surface shadow-glow" : "bg-surface-elevated text-text-primary border border-surface-border hover:border-accent/50"
            }`}
        >
          <Activity className="w-4 h-4" />
          {showDetails ? "Hide Details" : "Capture Details"}
        </button>
        <button
          onClick={() => { setShowAnalysis(!showAnalysis); setShowChatbot(false); setShowDetails(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-xs font-bold transition-all ${showAnalysis ? "bg-primary text-surface shadow-glow" : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
            }`}
        >
          <FileText className="w-4 h-4" />
          {showAnalysis ? "Hide Analysis" : "Show Analysis"}
        </button>
        <button
          onClick={() => { setShowChatbot(!showChatbot); setShowAnalysis(false); setShowDetails(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-xs font-bold transition-all ${showChatbot ? "bg-accent text-surface shadow-glow" : "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          {showChatbot ? "Close Chatbot" : "Field Intel Chatbot"}
        </button>
        <div className="flex-1"></div>
        <button
          onClick={handleCopyReport}
          disabled={copyingReport}
          className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary border border-surface-border rounded-lg font-body text-xs hover:border-text-primary transition-all disabled:opacity-50"
        >
          {copyingReport ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copyingReport ? "Copied!" : "Copy Text"}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-body text-xs font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exportingPDF ? "Generating PDF..." : "Export PDF"}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 bg-surface rounded-xl border border-surface-border overflow-hidden">
          <div className="p-4 bg-surface-elevated flex items-center justify-between border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <h4 className="font-display text-lg text-text-primary tracking-wider">CAPTURE DETAILS</h4>
            </div>
            <span className="font-mono text-[10px] text-accent/70 px-2 py-0.5 rounded border border-accent/20 bg-accent/5">
              {rawParams.length} PARAMETERS FOUND
            </span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-elevated z-10 border-b border-surface-border shadow-sm">
                <tr>
                  <th className="py-3 px-4 font-body text-[10px] uppercase tracking-wider text-text-muted font-bold w-1/3">Parameter Name</th>
                  <th className="py-3 px-4 font-body text-[10px] uppercase tracking-wider text-text-muted font-bold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rawParams.map((key) => {
                  let val = capture[key];
                  if (val === null || val === undefined || val === "null" || val === "") val = "null";
                  else if (typeof val === "object") val = "[object Object]";
                  else val = String(val);

                  return (
                    <tr key={key} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-xs text-primary/80 truncate break-all">{key}</td>
                      <td className="py-2.5 px-4 font-body text-xs text-text-primary break-all">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAnalysis && (
        <div className="mt-4">
          <AnalysisPanel capture={capture} />
        </div>
      )}

      {showChatbot && (
        <div className="mt-4">
          <CaptureAnalysisChatbot capture={capture} analysis={generateAnalysis(capture)} />
        </div>
      )}
    </div>
  );
}

function AnalysisPanel({ capture }) {
  const analysisReport = generateAnalysis(capture);
  return (
    <div className="p-4 bg-surface rounded-xl border border-primary/20">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border">
        <Shield className="w-5 h-5 text-primary" />
        <h4 className="font-display text-lg text-primary tracking-wider">THREAT ANALYSIS</h4>
        <div className="ml-auto font-mono text-xs px-2 py-1 rounded bg-surface-elevated border border-surface-border">
          Score: <span className={analysisReport.riskScore > 70 ? "text-red-400" : analysisReport.riskScore > 40 ? "text-yellow-400" : "text-green-400"}>{analysisReport.riskScore}/100</span>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(analysisReport.sections).map(([key, value]) => {
          if (!value) return null;
          return (
            <div key={key}>
              <h5 className="font-body text-xs text-text-muted uppercase tracking-wider mb-1">{key}</h5>
              <ul className="space-y-1">
                <li className="font-body text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">▹</span>
                  <span>{value}</span>
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <div className="font-body text-xs text-primary uppercase tracking-wider mb-2 pb-1 border-b border-surface-border">{title}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  if (value == null || value === "" || value === "null") return null;
  return (
    <div>
      <div className="font-body text-xs text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className="font-mono text-xs text-text-primary break-all">{String(value)}</div>
    </div>
  );
}

function PaymentModal({ onClose, uid, fetchUserProfile }) {
  const plans = [
    { credits: 5, price: 99, label: "Starter Pack" },
    { credits: 15, price: 249, label: "Investigation Pack", popular: true },
    { credits: 50, price: 699, label: "Department Pack" },
  ];
  const [selected, setSelected] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePurchase() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const { addCredits } = await import("../utils/linkService");
    await addCredits(uid, plans[selected].credits);
    await fetchUserProfile(uid);
    setDone(true);
    setProcessing(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wider text-text-primary">BUY <span className="text-primary">CREDITS</span></h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display text-2xl text-primary mb-2">Credits Added!</h3>
            <p className="font-body text-text-secondary text-sm">{plans[selected].credits} credits added to your account.</p>
            <button onClick={onClose} className="mt-6 px-6 py-3 bg-primary text-surface font-body font-bold rounded-lg">Back to Dashboard</button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {plans.map((plan, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected === i ? "border-primary bg-primary/10 shadow-glow" : "border-surface-border bg-surface hover:border-primary/40"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg text-text-primary">{plan.label}</span>
                        {plan.popular && <span className="bg-primary text-surface text-xs px-2 py-0.5 rounded-full font-body font-bold">POPULAR</span>}
                      </div>
                      <div className="font-body text-sm text-text-secondary mt-0.5">{plan.credits} tracking links</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl text-primary">Rs.{plan.price}</div>
                      <div className="font-body text-xs text-text-muted">Rs.{(plan.price / plan.credits).toFixed(0)}/link</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-surface border border-surface-border rounded-xl p-3 mb-4 text-xs font-body text-text-muted">
              Demo Mode: Integrate Razorpay for real payments in production.
            </div>
            <button onClick={handlePurchase} disabled={processing}
              className="w-full px-6 py-3.5 bg-primary text-surface font-body font-bold rounded-lg hover:bg-primary-dark transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              {processing ? "Processing..." : "Pay Rs." + plans[selected].price}
            </button>
          </>
        )}
      </div>
    </div>
  );
}