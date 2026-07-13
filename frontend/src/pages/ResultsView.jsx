import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  ListChecks, 
  FileText, 
  PlusCircle, 
  ShieldAlert,
  Download,
  Award
} from 'lucide-react';

const ResultsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, API_URL } = useContext(AuthContext);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/resume/${id}`, getAuthHeaders());
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
      <div className="flex h-[calc(100vh-76px)] items-center justify-center bg-neobg text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neocyan border-t-transparent border-neo"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-neocyan">FETCHING SCANNED CHRONICLES...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-neobg flex items-center justify-center p-4">
        <div className="bg-neocard border-2 border-black max-w-md w-full p-8 shadow-neo font-mono text-center">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-neopink" />
          <h3 className="text-lg font-black uppercase text-white mb-2">SYSTEM FAULT RECOVERY</h3>
          <p className="text-zinc-500 text-xs uppercase leading-relaxed mb-6">
            {error || 'The requested analysis record is inaccessible or does not exist.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 border-neo bg-neocyan text-black font-bold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO CONSOLE
          </Link>
        </div>
      </div>
    );
  }

  // Parse arrays stored as JSON in DB (Prisma returns parsed JSON, but let's handle case where it's parsed or a string)
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
  let scoreColor = '#ff007f'; // neopink
  let scoreBg = 'bg-neopink/10';
  let scoreBorder = 'border-neopink';
  let scoreText = 'text-neopink';

  if (score >= 80) {
    scoreColor = '#00ff66'; // neogreen
    scoreBg = 'bg-neogreen/10';
    scoreBorder = 'border-neogreen';
    scoreText = 'text-neogreen';
  } else if (score >= 50) {
    scoreColor = '#ffe600'; // neoyellow
    scoreBg = 'bg-neoyellow/10';
    scoreBorder = 'border-neoyellow';
    scoreText = 'text-neoyellow';
  }

  // Calculate SVG circular arc gauge params
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-3 border-neo bg-neogray text-white shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">{analysis.fileName}</span>
              </div>
              <h1 className="font-mono text-xl sm:text-2xl font-black uppercase tracking-tight">
                ANALYSIS METADATA LEDGER
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 border-neo bg-neogray font-mono text-[10px] font-bold shadow-[2px_2px_0px_0px_#000] uppercase text-zinc-400">
              ENGINE: {analysis.providerUsed.toUpperCase()} ({analysis.modelUsed})
            </div>
          </div>
        </div>

        {/* Top Score Matrix Dashboard Card */}
        <div className="bg-neocard border-2 border-black p-6 md:p-8 shadow-neo grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Score Circle Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#1c1c24"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="stroke-current text-zinc-800"
                />
                {/* Score Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={scoreColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="square"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute text-center">
                <span className={`text-4xl md:text-5xl font-black font-mono tracking-tighter ${scoreText}`}>
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
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                ESTIMATED SHORTLIST ODDS
              </span>
              <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 ${scoreBorder} ${scoreBg} text-white font-mono text-sm md:text-base font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase`}>
                <Award className="w-5 h-5 shrink-0" style={{ color: scoreColor }} />
                <span>{analysis.shortlistProbability}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                EVALUATION CLASSIFICATION
              </span>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xl font-sans">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Core Strengths */}
          <div className="bg-neocard border-2 border-black p-6 shadow-neo border-l-8 border-l-neogreen">
            <h3 className="font-mono text-lg font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neogreen" />
              CORE STRENGTHS
            </h3>
            
            {strengths.length === 0 ? (
              <p className="text-zinc-500 font-mono text-xs uppercase">No critical strengths recorded.</p>
            ) : (
              <ul className="space-y-3">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2 text-xs md:text-sm font-sans leading-relaxed text-zinc-300">
                    <span className="text-neogreen font-bold select-none font-mono shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Critical Weaknesses */}
          <div className="bg-neocard border-2 border-black p-6 shadow-neo border-l-8 border-l-neopink">
            <h3 className="font-mono text-lg font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neopink" />
              CRITICAL WEAKNESSES
            </h3>
            
            {weaknesses.length === 0 ? (
              <p className="text-zinc-500 font-mono text-xs uppercase">No critical flaws detected.</p>
            ) : (
              <ul className="space-y-3">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex gap-2 text-xs md:text-sm font-sans leading-relaxed text-zinc-300">
                    <span className="text-neopink font-bold select-none font-mono shrink-0">✗</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Missing Keywords Module */}
        <div className="bg-neocard border-2 border-black p-6 shadow-neo">
          <h3 className="font-mono text-lg font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neocyan" />
            MISSING INDUSTRY KEYWORDS
          </h3>
          <p className="text-zinc-400 text-xs font-mono mb-6 uppercase">
            KEYWORDS TO INCORPORATE TO EXPEDITE PARSER COMPATIBILITY
          </p>
          
          {missingKeywords.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-zinc-800 bg-neogray font-mono text-xs text-center text-zinc-500 uppercase">
              No missing keywords detected. Keyword coverage is optimized.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {missingKeywords.map((word, idx) => (
                <div 
                  key={idx}
                  className="px-4 py-2 border-neo bg-neogray text-white font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#00f0ff] hover:translate-y-[-1px] transition-all cursor-default"
                >
                  {word.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Structural Improvements Checklist */}
        <div className="bg-neocard border-2 border-black p-6 shadow-neo">
          <h3 className="font-mono text-lg font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-neoyellow" />
            STRUCTURAL IMPROVEMENTS CHECKLIST
          </h3>
          <p className="text-zinc-400 text-xs font-mono mb-6 uppercase">
            ACTIONABLE RE-FORMATTING DIRECTIONS TO OPTIMIZE READABILITY
          </p>
          
          {structuralImprovements.length === 0 ? (
            <p className="text-zinc-500 font-mono text-xs uppercase">No structural re-formatting requested.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {structuralImprovements.map((imp, idx) => (
                <div 
                  key={idx}
                  className="p-4 border-neo bg-neogray shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-3 items-start"
                >
                  <div className="p-1 border border-black bg-neoyellow text-black shrink-0 text-xs font-bold font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <p className="text-zinc-300 text-xs md:text-sm font-sans leading-relaxed">
                    {imp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Description Log (if present) */}
        {analysis.targetJobDescription && (
          <div className="bg-neocard border-2 border-black p-6 shadow-neo">
            <h3 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              RECORDED TARGET JOB DESCRIPTION MATRIX
            </h3>
            <div className="p-4 bg-neogray border border-zinc-800 font-mono text-[10px] text-zinc-400 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {analysis.targetJobDescription}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultsView;
