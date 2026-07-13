import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Terminal, ShieldAlert, Cpu, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { user, navigate } = useContext(AuthContext);

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-necyan" />,
      title: "ATS Simulator Matrix",
      desc: "Run your resume against simulated enterprise parsing models to expose keyword density and alignment gaps instantly.",
      color: "bg-[#0c0f1d] border-[#0c3a54]"
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-neopink" />,
      title: "Structural Health Check",
      desc: "Flush out passive voice, weak headers, and non-action summaries that trigger flags in recruiter filters.",
      color: "bg-[#1d0c12] border-[#540c1e]"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-neoyellow" />,
      title: "Multi-Engine Comparison",
      desc: "Simulate evaluations using the latest Gemini Flash or GPT-4o-mini models depending on backend configuration.",
      color: "bg-[#1d1c0c] border-[#544a0c]"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-neogreen" />,
      title: "Recruiter Compatibility",
      desc: "Extract actionable, quantified improvements. Convert generic sentences into bullet points optimized for recruiters.",
      color: "bg-[#0c1d11] border-[#0c541b]"
    }
  ];

  return (
    <div className="min-h-screen bg-neobg text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Decorative Grid Glow Background */}
      <div className="bg-grid-glow"></div>
      
      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none"></div>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28 z-10 flex flex-col items-center">
        {/* Banner Alert badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[11px] font-mono font-medium tracking-wide text-neogreen shadow-sm backdrop-blur-md">
          <Terminal className="w-3.5 h-3.5" />
          SYSTEM STABLE: MULTI-ENGINE RESUME PARSER ACTIVE
        </div>

        {/* Hero Headline */}
        <h1 className="text-center font-extrabold tracking-tight text-4xl sm:text-6xl md:text-7xl max-w-5xl leading-[1.05] text-white">
          Expose your resume to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neogreen via-necyan to-neoyellow">
            enterprise AI
          </span>{' '}
          before human recruiters do.
        </h1>

        {/* Subtitle */}
        <p className="text-center text-zinc-400 text-sm md:text-lg max-w-3xl mt-6 leading-relaxed">
          Do not apply blindly. Upload your resume or paste your portfolio link to run immediate verification passes against next-gen AI screening filters.
        </p>

        {/* Large Elegant CTA */}
        <div className="mt-10 mb-24">
          <button
            onClick={() => navigate(user ? 'dashboard' : 'register')}
            className="group relative inline-flex items-center gap-3 px-8 py-4.5 rounded-xl border border-white/10 text-base md:text-lg font-bold bg-gradient-to-r from-neogreen to-necyan text-black shadow-lg shadow-neogreen/15 hover:shadow-xl hover:shadow-neogreen/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Scan Your Resume Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-white/5 mb-16 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neobg px-6 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            SYSTEM CAPABILITIES
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] shadow-sm flex flex-col sm:flex-row gap-5 items-start"
            >
              <div className={`p-3.5 rounded-xl border ${feat.color} shrink-0 shadow-sm`}>
                {feat.icon}
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-base text-white tracking-wide mb-2">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="w-full border-t border-white/5 bg-zinc-950/20 py-8 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between font-mono text-[9px] text-zinc-500 tracking-wider">
          <span>© 2026 RESUME ANALYZER.AI — ALL SYSTEMS OPERATIONAL</span>
          <span className="text-neogreen mt-2 md:mt-0 uppercase">SECURE CRAWLER PROTOCOL ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
