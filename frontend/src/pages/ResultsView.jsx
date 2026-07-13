import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  ListChecks, 
  FileText, 
  ShieldAlert,
  Award
} from 'lucide-react';

const ResultsView = () => {
  const { id } = useParams();
  const { getAuthHeaders, API_URL } = useContext(AuthContext);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/api/resume/${id}`, getAuthHeaders());
        setAnalysis(response.data);
      } catch (err) {
        console.error('Failed to load analysis results:', err);
        setError(
          err.response?.data?.error || 
          'Failed to retrieve analysis records. It may have been deleted or access is restricted.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-76px)] items-center justify-center bg-neobg text-white relative">
        <div className="bg-grid-glow"></div>
        <div className="flex flex-col items-center gap-4 relative z-10 font-mono">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-necyan border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">RETRIEVING EVALUATION REPORT...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-neobg flex items-center justify-center p-4 relative">
        <div className="bg-grid-glow"></div>
        <div className="bg-zinc-950 border border-white/5 max-w-md w-full p-8 rounded-2xl shadow-neo text-center relative z-10">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-rose-400" />
          <h3 className="text-base font-bold text-white mb-2 uppercase">System Fault Recovery</h3>
          <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-mono uppercase">
            {error || 'The requested analysis record is inaccessible or does not exist.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-gradient-to-r from-neogreen to-necyan text-black font-semibold text-xs uppercase shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Console
          </Link>
        </div>
      </div>
    );
  }

  const parseJsonArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const strengths = parseJsonArray(analysis.strengths);
  const weaknesses = parseJsonArray(analysis.weaknesses);
  const structuralImprovements = parseJsonArray(analysis.structuralImprovements);
  const missingKeywords = parseJsonArray(analysis.missingKeywords);

  // Score metrics
  const score = analysis.atsScore;
  let scoreColor = '#f43f5e'; // rose-500
  let scoreBg = 'bg-rose-500/5';
  let scoreBorder = 'border-rose-500/20';
  let scoreText = 'text-rose-400';

  if (score >= 80) {
    scoreColor = '#10b981'; // emerald-500
    scoreBg = 'bg-emerald-500/5';
    scoreBorder = 'border-emerald-500/20';
    scoreText = 'text-emerald-400';
  } else if (score >= 50) {
    scoreColor = '#f59e0b'; // amber-500
    scoreBg = 'bg-amber-500/5';
    scoreBorder = 'border-amber-500/20';
    scoreText = 'text-amber-400';
  }

  // Calculate SVG circular arc gauge params
  const radius = 50;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg text-zinc-100 p-4 md:p-8 relative overflow-hidden">
      <div className="bg-grid-glow"></div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-white shadow-sm transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{analysis.fileName}</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-wide uppercase">
                Analysis Report Ledger
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] font-mono text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
              ENGINE: {analysis.providerUsed.toUpperCase()} ({analysis.modelUsed})
            </div>
          </div>
        </div>

        {/* Top Score Matrix Dashboard Card */}
        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-2xl shadow-neo backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Score Circle Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Score Arc */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={scoreColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute text-center">
                <span className={`text-4xl font-extrabold font-mono tracking-tighter ${scoreText}`}>
                  {score}%
                </span>
                <span className="block text-[8px] font-mono text-zinc-500 uppercase font-bold tracking-widest mt-1">
                  ATS MATCH
                </span>
              </div>
            </div>
          </div>

          {/* Probability Indicator / Badge */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="font-mono text-[9px] font-semibold text-zinc-500 uppercase tracking-widest block mb-2">
                ESTIMATED SHORTLIST ODDS
              </span>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${scoreBorder} ${scoreBg} text-white text-sm font-semibold shadow-sm uppercase`}>
                <Award className="w-5 h-5 shrink-0" style={{ color: scoreColor }} />
                <span>{analysis.shortlistProbability}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="font-mono text-[9px] font-semibold text-zinc-500 uppercase tracking-widest block mb-2">
                EVALUATION CLASSIFICATION
              </span>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xl font-light">
                {score >= 80 
                  ? "SYSTEM RECON: Strong ATS alignment. Structure, keywords, and quantifiers exhibit high compatibility with the specified job role matrices."
                  : score >= 50
                  ? "SYSTEM RECON: Moderate ATS alignment. Core keywords are registered, but critical structural improvements are required to pass stricter screening thresholds."
                  : "SYSTEM RECON: Critical alignment gaps detected. System alerts flag multiple missing keywords, weak impact metrics, and structural formats."
                }
              </p>
            </div>
          </div>

        </div>

        {/* Feature Columns: Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Core Strengths */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md border-l-4 border-l-emerald-500">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Core Strengths
            </h3>
            
            {strengths.length === 0 ? (
              <p className="text-zinc-600 font-mono text-xs uppercase">No critical strengths recorded.</p>
            ) : (
              <ul className="space-y-3">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs md:text-sm leading-relaxed text-zinc-300 font-light">
                    <span className="text-emerald-400 font-bold select-none shrink-0 font-mono">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Critical Weaknesses */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md border-l-4 border-l-rose-500">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Critical Weaknesses
            </h3>
            
            {weaknesses.length === 0 ? (
              <p className="text-zinc-600 font-mono text-xs uppercase">No critical flaws detected.</p>
            ) : (
              <ul className="space-y-3">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs md:text-sm leading-relaxed text-zinc-300 font-light">
                    <span className="text-rose-400 font-bold select-none shrink-0 font-mono">✗</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Missing Keywords Module */}
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2 uppercase tracking-wide">
            <HelpCircle className="w-5 h-5 text-necyan" />
            Missing Industry Keywords
          </h3>
          <p className="text-zinc-500 text-xs font-mono mb-6 uppercase tracking-wider">
            KEYWORDS TO INCORPORATE TO EXPEDITE PARSER COMPATIBILITY
          </p>
          
          {missingKeywords.length === 0 ? (
            <div className="p-5 border border-dashed border-white/10 rounded-xl bg-white/[0.01] font-mono text-xs text-center text-zinc-500 uppercase">
              No missing keywords detected. Keyword coverage is optimized.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {missingKeywords.map((word, idx) => (
                <div 
                  key={idx}
                  className="px-3.5 py-1.8 rounded-lg border border-white/5 bg-white/[0.01] hover:border-necyan/30 text-white font-mono text-xs font-semibold shadow-sm transition-all cursor-default"
                >
                  {word.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Structural Improvements Checklist */}
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2 uppercase tracking-wide">
            <ListChecks className="w-5 h-5 text-neoyellow" />
            Structural Improvements Checklist
          </h3>
          <p className="text-zinc-500 text-xs font-mono mb-6 uppercase tracking-wider">
            ACTIONABLE RE-FORMATTING DIRECTIONS TO OPTIMIZE READABILITY
          </p>
          
          {structuralImprovements.length === 0 ? (
            <p className="text-zinc-600 font-mono text-xs uppercase">No structural re-formatting requested.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {structuralImprovements.map((imp, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.01] shadow-sm flex gap-3.5 items-start"
                >
                  <div className="w-6 h-6 rounded-md border border-white/5 bg-amber-500/10 text-amber-400 shrink-0 text-xs font-bold font-mono flex items-center justify-center">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-light">
                    {imp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Description Log (if present) */}
        {analysis.targetJobDescription && (
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md">
            <h3 className="font-mono text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
              RECORDED TARGET JOB DESCRIPTION MATRIX
            </h3>
            <div className="p-4 bg-black/35 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-500 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {analysis.targetJobDescription}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultsView;
