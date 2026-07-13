import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'react-serif'; // Wait, let's keep axios!
import axiosInstance from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Terminal, 
  Clock, 
  ChevronRight, 
  BrainCircuit, 
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { token, getAuthHeaders, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'text', or 'link'
  const [file, setFile] = useState(null);
  const [rawResumeText, setRawResumeText] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [activeEngine, setActiveEngine] = useState({ provider: 'gemini', model: 'gemini-3.5-flash' });

  const fileInputRef = useRef(null);

  // Fetch history and engine info on mount
  useEffect(() => {
    const fetchHistoryAndEngine = async () => {
      try {
        const historyRes = await axiosInstance.get(`${API_URL}/api/resume/history`, getAuthHeaders());
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setFetchingHistory(false);
      }

      try {
        const healthRes = await axiosInstance.get(`${API_URL}/health`);
        setActiveEngine({
          provider: healthRes.data.provider,
          model: healthRes.data.model
        });
      } catch (err) {
        console.error('Failed to load server health/engine info:', err);
      }
    };

    fetchHistoryAndEngine();
  }, [API_URL, token]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    
    // Support PDF and standard image MIME types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('System restricted: Only standard PDF, JPG, JPEG, and PNG images are supported.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('System restricted: File exceeds 10MB memory allocation.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'upload' && !file) {
      setError('Please select or drop a resume PDF/Image file to analyze.');
      return;
    }
    if (activeTab === 'text' && !rawResumeText.trim()) {
      setError('Please paste your resume text in the field below.');
      return;
    }
    if (activeTab === 'link' && !portfolioUrl.trim()) {
      setError('Please enter your portfolio website link to analyze.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (activeTab === 'upload') {
      formData.append('resume', file);
    } else if (activeTab === 'link') {
      formData.append('portfolioUrl', portfolioUrl);
    } else {
      formData.append('rawResumeText', rawResumeText);
    }
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axiosInstance.post(
        `${API_URL}/api/resume/analyze`, 
        formData, 
        {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Navigate to results view
      navigate(`/results/${response.data.id}`);
    } catch (err) {
      console.error('Analysis submission failed:', err);
      setError(
        err.response?.data?.error || 
        'Analysis failed. The server took too long to respond or returned an error.'
      );
      setLoading(false);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg text-zinc-100 p-4 md:p-8 relative overflow-hidden">
      <div className="bg-grid-glow"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Column: Upload / Paste Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md">
            <h2 className="text-lg font-bold tracking-wide text-white mb-1.5 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neogreen" />
              Analysis Initiation Console
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-6 uppercase tracking-wider">
              FEED RESUME BYTES, TEXT OR WEBPAGE VECTORS TO SCANNER
            </p>

            {/* Ingestion Method Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('upload'); setError(''); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-neogreen to-necyan text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF/Image
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('text'); setError(''); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'text'
                    ? 'bg-gradient-to-r from-neogreen to-necyan text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('link'); setError(''); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'link'
                    ? 'bg-gradient-to-r from-neogreen to-necyan text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Portfolio Link
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-400 text-xs font-mono flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <div>
                  <span className="font-bold">SCAN ERROR DETECTED:</span> {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Conditional Ingestion Zone */}
              {activeTab === 'upload' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    1. Resume File (PDF, JPG, PNG - Max 10MB)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border border-dashed p-10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-white/[0.01] ${
                      dragActive 
                        ? 'border-neogreen bg-neogreen/5 shadow-sm shadow-neogreen/10' 
                        : 'border-white/10 hover:border-zinc-500 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf, .jpg, .jpeg, .png"
                      className="hidden"
                    />
                    
                    <Upload className={`w-10 h-10 mb-4 transition-colors ${dragActive ? 'text-neogreen' : 'text-zinc-500'}`} />
                    
                    {file ? (
                      <div className="text-center">
                        <p className="text-neogreen font-semibold text-sm uppercase flex items-center justify-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB — Ready for analysis
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-semibold text-white tracking-wide">
                          Drag & drop file or click to browse
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1.5 uppercase font-mono tracking-wider">
                          Supports text PDFs or clean high-contrast images
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    1. Paste Resume Content
                  </label>
                  <textarea
                    value={rawResumeText}
                    onChange={(e) => setRawResumeText(e.target.value)}
                    placeholder="Copy and paste the raw text from your resume (contact information, experience, education, projects, skills)..."
                    rows={10}
                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-neogreen/50 focus:ring-1 focus:ring-neogreen/25 transition-all resize-y"
                  />
                </div>
              )}

              {activeTab === 'link' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    1. Enter Portfolio Link
                  </label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://your-portfolio-website.com"
                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3.5 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-neogreen/50 focus:ring-1 focus:ring-neogreen/25 transition-all"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2.5 uppercase font-mono tracking-wider">
                    System web crawler will fetch readable text bio, projects, and work info from this link.
                  </p>
                </div>
              )}

              {/* Job Description Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  2. Target Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste destination job criteria, core technical keywords, and requirements to generate comparative alignment score..."
                  rows={6}
                  className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-neogreen/50 focus:ring-1 focus:ring-neogreen/25 transition-all resize-y"
                />
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl border border-white/10 bg-gradient-to-r from-neogreen to-necyan text-black font-extrabold uppercase shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'INGESTING FILES...' : 'EXECUTE AI RESUME VERIFICATION'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Execution History Log */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-neo backdrop-blur-md h-full flex flex-col">
            <h2 className="text-lg font-bold tracking-wide text-white mb-1.5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neocyan" />
              History Log
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-6 uppercase tracking-wider">
              PREVIOUS EVALUATION PASSES RUN BY USER
            </p>

            {fetchingHistory ? (
              <div className="flex-grow flex flex-col items-center justify-center py-10 font-mono text-xs text-zinc-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neocyan border-t-transparent mb-2"></div>
                FETCHING SECURE ARCHIVES...
              </div>
            ) : history.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl bg-white/[0.01] text-center">
                <FileSpreadsheet className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-xs uppercase font-bold text-zinc-500">No previous logs found</p>
                <p className="text-[9px] text-zinc-600 mt-1 uppercase font-mono tracking-wider">Run analysis to build ledger</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                {history.map((item) => (
                  <Link
                    key={item.id}
                    to={`/results/${item.id}`}
                    className="block p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="font-semibold text-xs text-white truncate max-w-[150px]">
                        {item.fileName}
                      </h4>
                      <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold shadow-sm ${getScoreColorClass(item.atsScore)}`}>
                        {item.atsScore}%
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Cyber Fullscreen Processing Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#040407cc]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 max-w-lg w-full p-8 rounded-2xl shadow-lg relative overflow-hidden font-mono">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 animate-pulse pointer-events-none"></div>

            <BrainCircuit className="w-14 h-14 mx-auto mb-6 text-neogreen animate-pulse" />
            
            <h3 className="text-lg font-bold uppercase text-white tracking-wide mb-2">
              Scanning transcript matrix...
            </h3>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[9px] font-bold text-neogreen mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ACTIVE ENGINE: {activeEngine.provider.toUpperCase()} ({activeEngine.model})
            </div>

            <div className="space-y-3.5 text-left bg-black/40 p-5 rounded-xl border border-white/5 text-[10px] leading-relaxed text-zinc-400">
              <p className="flex items-center gap-2 text-neogreen font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-neogreen animate-ping"></span>
                [STATUS] Processing resume input vectors...
              </p>
              <p>[STATUS] Injecting evaluation rules for: <span className="text-white font-semibold">"{user?.targetJobRole || 'Software Engineering'}"</span></p>
              <p className="text-necyan font-semibold">[INFO] Fetching evaluations from AI interface. This can take up to 45 seconds on Render cold starts...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
