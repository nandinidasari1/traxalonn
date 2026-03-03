// import React from "react";
// import { Shield, Target, Lock, Users } from "lucide-react";

// export default function About() {
//   return (
//     <div className="min-h-screen bg-surface text-text-primary pt-16">
//       <div className="max-w-5xl mx-auto px-6 py-16">

//         {/* Header */}
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 border border-primary/30 rounded-3xl mb-6">
//             <Shield className="w-10 h-10 text-primary" />
//           </div>
//           <h1 className="font-display text-6xl tracking-wider text-text-primary mb-4">
//             ABOUT <span className="text-primary">US</span>
//           </h1>
//           <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
//             Traxelon is a specialized intelligence platform built for law enforcement agencies
//             to conduct covert digital surveillance operations with precision and legality.
//           </p>
//         </div>

//         {/* Mission Cards */}
//         <div className="grid md:grid-cols-3 gap-6 mb-16">
//           {[
//             { icon: <Target className="w-6 h-6" />, title: "Our Mission", desc: "Empower law enforcement with cutting-edge tracking technology to reduce investigation time and improve case closure rates across India." },
//             { icon: <Lock className="w-6 h-6" />, title: "Our Commitment", desc: "Every tool we build adheres to the IT Act 2000 and CrPC guidelines. Access is strictly limited to verified government officers with valid badge IDs." },
//             { icon: <Users className="w-6 h-6" />, title: "Our Users", desc: "We serve over 2,400 verified police officers across 18 states, from cyber crime cells to organized crime units." },
//           ].map((item, i) => (
//             <div key={i} className="bg-surface-elevated border border-surface-border rounded-2xl p-6">
//               <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
//                 {item.icon}
//               </div>
//               <h3 className="font-display text-xl text-text-primary tracking-wide mb-2">{item.title}</h3>
//               <p className="font-body text-sm text-text-secondary leading-relaxed">{item.desc}</p>
//             </div>
//           ))}
//         </div>

//         {/* Legal Notice */}
//         <div className="bg-surface-elevated border border-accent/20 rounded-2xl p-6 mb-16">
//           <h3 className="font-display text-xl text-accent tracking-wide mb-3">⚠️ Legal Notice</h3>
//           <p className="font-body text-sm text-text-secondary leading-relaxed">
//             Traxelon is intended solely for use by authorized law enforcement personnel in the
//             performance of official duties. Unauthorized use of this tool to track individuals
//             without proper legal authorization constitutes a violation of the IT Act 2000,
//             Section 66 (Computer Related Offences) and may result in criminal prosecution.
//             All activity on this platform is logged and auditable by senior officials.
//           </p>
//         </div>

//         {/* Curator / Sir Section */}
//         <div className="text-center mb-10">
//           <h2 className="font-display text-4xl tracking-wider text-text-primary">
//             OUR <span className="text-primary">CURATOR</span>
//           </h2>
//           <p className="font-body text-sm text-text-muted mt-2">The vision behind Traxelon</p>
//         </div>

//         <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
//           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

//             {/* Photo */}
//             <div className="flex-shrink-0">
//               <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-glow">
//                 <img
//                   src="/sir.jpg"
//                   alt="Dr. Ananth Prabhu G"
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.style.display = "none";
//                     e.target.parentElement.classList.add("flex", "items-center", "justify-center", "bg-primary/10");
//                     e.target.parentElement.innerHTML = `<span class="font-display text-4xl text-primary">A</span>`;
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Info */}
//             <div className="flex-1 text-center sm:text-left">
//               <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary font-mono mb-3">
//                 🎓 Resource Person & Curator
//               </div>
//               <h3 className="font-display text-2xl text-text-primary tracking-wide">
//                 Dr. Ananth Prabhu G
//               </h3>
//               <p className="font-body text-sm text-primary mt-1 font-semibold">PhD, PDF</p>
//               <p className="font-body text-sm text-text-muted mt-1">Cyber Security & Cyber Crime Expert</p>

//               <div className="mt-4 h-px bg-surface-border" />

//               <p className="font-body text-sm text-text-secondary leading-relaxed mt-4">
//                 A group of young professionals with in-depth knowledge into Cyber Security and
//                 Cyber Crimes. It all started with the penchant desire of Dr. Ananth Prabhu G
//                 to help young girls and women engage with responsible browsing on the internet.
//                 The idea was given shape by building InfoToons to help students and women easily
//                 understand various cyber crimes committed on a daily basis.
//               </p>

//               <div className="flex flex-wrap gap-2 mt-4">
//                 {["Cyber Security", "Digital Forensics", "Cyber Law", "InfoToons"].map((tag) => (
//                   <span key={tag} className="bg-surface border border-surface-border text-text-muted font-mono text-xs px-3 py-1 rounded-full">
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Built by section */}
//         <div className="text-center mt-16">
//           <p className="font-body text-xs text-text-muted">
//             Built with ❤️ by the Traxelon team under the guidance of{" "}
//             <span className="text-primary">Dr. Ananth Prabhu G</span>
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { Shield, Target, Lock, Users, BookOpen, Award, Mic, Globe, ChevronDown, ChevronUp } from "lucide-react";

export default function About() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-text-primary pt-16">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-surface-elevated border-b border-surface-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-mono mb-6">
            🛡️ INTELLIGENCE PLATFORM · EST. 2024
          </div>
          <h1 className="font-display text-7xl tracking-wider text-text-primary mb-4">
            ABOUT <span className="text-primary">US</span>
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Traxelon is a specialized intelligence platform built for law enforcement agencies
            to conduct covert digital surveillance operations with precision and legality.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "2,400+", label: "Verified Officers" },
            { value: "18", label: "States Covered" },
            { value: "100%", label: "Legal Compliant" },
            { value: "24/7", label: "Surveillance Ready" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-elevated border border-surface-border rounded-2xl p-5 text-center">
              <div className="font-display text-3xl text-primary mb-1">{s.value}</div>
              <div className="font-body text-xs text-text-muted uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Mission Cards ── */}
        <div>
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl tracking-wider">OUR <span className="text-primary">PURPOSE</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Target className="w-6 h-6" />, title: "Our Mission", desc: "Empower law enforcement with cutting-edge tracking technology to reduce investigation time and improve case closure rates across India." },
              { icon: <Lock className="w-6 h-6" />, title: "Our Commitment", desc: "Every tool we build adheres to the IT Act 2000 and CrPC guidelines. Access is strictly limited to verified government officers with valid badge IDs." },
              { icon: <Users className="w-6 h-6" />, title: "Our Users", desc: "We serve over 2,400 verified police officers across 18 states, from cyber crime cells to organized crime units." },
            ].map((item, i) => (
              <div key={i} className="bg-surface-elevated border border-surface-border rounded-2xl p-6 hover:border-primary/40 transition-all group">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-all">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-text-primary tracking-wide mb-2">{item.title}</h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Curator Section ── */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-mono mb-4">
              🎓 VISION & LEADERSHIP
            </div>
            <h2 className="font-display text-4xl tracking-wider">MEET THE <span className="text-primary">CURATOR</span></h2>
            <p className="font-body text-sm text-text-muted mt-2">The visionary behind Traxelon's mission</p>
          </div>

          {/* Profile Card */}
          <div className="bg-surface-elevated border border-primary/20 rounded-3xl overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />

            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                {/* Photo */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-glow">
                    <img src="/sir.jpg" alt="Dr. Ananth Prabhu G"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.parentElement.innerHTML = `<div class="w-full h-full bg-primary/10 flex items-center justify-center"><span style="font-size:56px;color:var(--color-primary,#00d4ff)">A</span></div>`;
                      }} />
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                      Curator & Resource Person
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-3xl text-text-primary tracking-wide">Dr. Ananth Prabhu G</h3>
                  <p className="font-body text-primary text-sm font-semibold mt-1">PhD · PDF (Leicester, UK · Houston, TX)</p>
                  <p className="font-body text-text-muted text-sm mt-0.5">Professor, CSE · Principal Investigator — Digital Forensics & Cyber Security CoE</p>
                  <p className="font-body text-text-muted text-xs mt-0.5">Sahyadri College of Engineering and Management</p>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    {["Cyber Security", "Digital Forensics", "Cyber Law", "AI & Ethics", "InfoToons"].map((tag) => (
                      <span key={tag} className="bg-surface border border-surface-border text-text-muted font-mono text-xs px-3 py-1 rounded-full hover:border-primary/40 hover:text-primary transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-surface-border my-8" />

              {/* Achievement Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <BookOpen className="w-4 h-4" />, value: "17", label: "Books Authored" },
                  { icon: <Globe className="w-4 h-4" />, value: "32", label: "Int'l Journals" },
                  { icon: <Award className="w-4 h-4" />, value: "3", label: "Patents Held" },
                  { icon: <Mic className="w-4 h-4" />, value: "3,000+", label: "Lectures Delivered" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface border border-surface-border rounded-xl p-4 text-center hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-center text-primary mb-2">{stat.icon}</div>
                    <div className="font-display text-2xl text-primary">{stat.value}</div>
                    <div className="font-body text-xs text-text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div className="bg-surface border border-surface-border rounded-2xl p-6">
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  Dr. Ananth Prabhu G is a renowned Professor in the Department of Computer Science
                  and Engineering and serves as the Principal Investigator at the Digital Forensics
                  and Cyber Security Centre of Excellence at Sahyadri College of Engineering and Management.
                  He holds a B.E., MTech, and MBA from Manipal University, a PhD from VTU, and two
                  Post-Doctoral Research Fellowships from the University of Leicester, UK and the
                  University of Houston Downtown, Texas.
                </p>

                {expanded && (
                  <div className="mt-4 space-y-3 text-sm text-text-secondary font-body leading-relaxed">
                    <p>
                      He also holds a Diploma in Cyber Law from Government Law College, Mumbai.
                      Under his guidance, four research scholars have completed their PhDs, and
                      five are currently pursuing their doctoral studies.
                    </p>
                    <p>
                      Dr. Prabhu is the Director of <span className="text-primary font-semibold">TorSecure Cyber LLP</span> and{" "}
                      <span className="text-primary font-semibold">SurePass Academy</span>. A dynamic speaker, he has delivered
                      over 3,000 lectures, becoming a leading voice in cyber law and forensics.
                    </p>
                    <p>
                      His acclaimed book <span className="text-primary font-semibold">Cyber Safe Girl v6.1</span> has been
                      downloaded <span className="text-primary font-semibold">4.5 crore times</span>. A free online certification
                      course developed in partnership with <span className="text-primary font-semibold">ISEA</span> and the{" "}
                      <span className="text-primary font-semibold">Ministry of Electronics and IT</span> has empowered citizens
                      across India — especially in rural areas — with cyber literacy. The book has been
                      translated into multiple regional languages, furthering its reach and impact.
                    </p>
                  </div>
                )}

                <button onClick={() => setExpanded(!expanded)}
                  className="mt-4 inline-flex items-center gap-1.5 text-primary font-body text-xs hover:underline transition-all">
                  {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
                </button>
              </div>

              {/* Highlight Banner */}
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-4xl">📘</div>
                <div>
                  <p className="font-display text-lg text-text-primary tracking-wide">Cyber Safe Girl v6.1</p>
                  <p className="font-body text-sm text-text-secondary mt-0.5">
                    Downloaded <span className="text-primary font-semibold">4.5 crore times</span> · Available in multiple regional languages ·
                    Certified course in partnership with <span className="text-primary font-semibold">MeitY & ISEA</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Legal Notice ── */}
        <div className="bg-surface-elevated border border-accent/20 rounded-2xl p-6">
          <h3 className="font-display text-xl text-accent tracking-wide mb-3">⚠️ Legal Notice</h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            Traxelon is intended solely for use by authorized law enforcement personnel in the
            performance of official duties. Unauthorized use of this tool to track individuals
            without proper legal authorization constitutes a violation of the IT Act 2000,
            Section 66 (Computer Related Offences) and may result in criminal prosecution.
            All activity on this platform is logged and auditable by senior officials.
          </p>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="font-body text-xs text-text-muted">
            Built with ❤️ by the Traxelon team under the guidance of{" "}
            <span className="text-primary">Dr. Ananth Prabhu G</span>
          </p>
        </div>

      </div>
    </div>
  );
}
