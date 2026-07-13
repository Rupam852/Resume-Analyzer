import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Terminal, ShieldAlert, Cpu, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  const features = [
    {
      icon: <Cpu className="w-8 h-8 text-neocyan" />,
      title: "MATRIX ATS SIMULATOR",
      desc: "Run your resume against simulated enterprise parsing models to expose keyword density and alignment gaps instantly.",
      color: "bg-neogray",
      border: "border-neocyan"
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-neopink" />,
      title: "STRUCTURAL FLUSH",
      desc: "Flush out passive voice, weak headers, and non-action summaries that trigger flags in recruiter filters.",
      color: "bg-neogray",
      border: "border-neopink"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-neoyellow" />,
      title: "DYNAMIC DUAL ENGINE",
      desc: "Simulate evaluations using Gemini Pro or GPT-4o models depending on backend configuration.",
      color: "bg-neogray",
      border: "border-neoyellow"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-neogreen" />,
      title: "IMPACT COMPATIBILITY",
      desc: "Extract actionable, quantified improvements. Convert generic sentences into bullet points optimized for recruiters.",
      color: "bg-neogray",
      border: "border-neogreen"
    }
  ];

  return (
    <div className="min-h-screen bg-neobg text-white flex flex-col">
      {/* Decorative Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 z-10 flex flex-col items-center">
        {/* Banner Alert badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 border-neo text-xs font-mono font-bold bg-neogray border-neogreen text-neogreen shadow-[2px_2px_0px_0px_#000] uppercase">
          <Terminal className="w-3.5 h-3.5" />
          SYSTEM LIVE: MULTI-PROVIDER RESUME PARSER
        </div>

        {/* Hero Headline */}
        <h1 className="text-center font-extrabold tracking-tighter uppercase text-4xl sm:text-6xl md:text-8xl max-w-5xl leading-none text-white select-none">
          EXPOSE YOUR RESUME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neogreen via-neocyan to-neoyellow">ENTERPRISE AI</span> BEFORE RECRUITERS DO.
        </h1>

        {/* Subtitle */}
        <p className="text-center font-mono text-zinc-400 text-sm md:text-lg max-w-3xl mt-6">
          Do not apply blindly. Upload your resume and job criteria to run immediate verification passes against next-gen AI screening filters.
        </p>

        {/* Large Aggressive CTA */}
        <div className="mt-10 mb-20">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="group relative inline-flex items-center gap-3 px-8 py-5 border-2 border-black text-lg md:text-2xl font-black uppercase bg-neoyellow text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-100 cursor-pointer"
          >
            SCAN YOUR RESUME NOW
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-zinc-800 mb-16 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neobg px-4 font-mono text-xs text-zinc-500 uppercase">
            SYSTEM CAPABILITIES
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`p-6 border-neo bg-neocard rounded-none transition-all duration-200 shadow-neo hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-5 items-start`}
            >
              <div className={`p-3 border-neo ${feat.color} shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                {feat.icon}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg tracking-wide text-white font-mono uppercase mb-2">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="w-full bg-neocard border-t-2 border-neoborder py-6 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-zinc-500">
          <span className="uppercase">© 2026 RESUME ANALYZER.AI - ALL SYSTEMS OPERATIONAL</span>
          <span className="uppercase tracking-widest text-neogreen mt-2 md:mt-0">SECURE SHELL PROTOCOL ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
