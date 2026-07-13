import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
  FileSpreadsheet
} from 'lucide-react';

const Dashboard = () => {
  const { token, getAuthHeaders, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [activeEngine, setActiveEngine] = useState({ provider: 'gemini', model: 'gemini-2.5-flash' });

  const fileInputRef = useRef(null);

  // Fetch history and engine info on mount
  useEffect(() => {
    const fetchHistoryAndEngine = async () => {
      try {
        const historyRes = await axios.get(`${API_URL}/api/resume/history`, getAuthHeaders());
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setFetchingHistory(false);
      }

      try {
        const healthRes = await axios.get(`${API_URL}/health`);
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
    if (selectedFile.type !== 'application/pdf') {
      setError('System restricted: Only standard PDF files are supported.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('System restricted: PDF exceeds 10MB memory allocation.');
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
    
    if (!file) {
      setError('Please select or drop a resume PDF file to analyze.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post(
        `${API_URL}/api/resume/analyze`, 
        formData, 
        {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Successfully analyzed! Navigate to results view
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
    if (score >= 80) return 'text-neogreen border-neogreen bg-neogreen/10';
    if (score >= 50) return 'text-neoyellow border-neoyellow bg-neoyellow/10';
    return 'text-neopink border-neopink bg-neopink/10';
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neocard border-2 border-black p-6 shadow-neo">
            <h2 className="font-mono text-xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neogreen" />
              ANALYSIS INITIATION CONSOLE
            </h2>
            <p className="text-zinc-400 text-xs font-mono mb-6 uppercase">
              FEED RESUME BYTESTREAM AND JOB DESCRIPTORS TO SCANNER
            </p>

            {error && (
              <div className="mb-6 p-4 border-neo bg-neopink/10 border-neopink text-neopink text-xs font-mono flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">SCAN ERROR DETECTED:</span> {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-2">
                  1. RESUME FILE (PDF FORMAT - MAX 10MB)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative ${
                    dragActive 
                      ? 'border-neogreen bg-neogreen/5 shadow-[4px_4px_0px_0px_#00ff66]' 
                      : 'border-zinc-800 bg-neogray shadow-none hover:border-zinc-600'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  
                  <Upload className={`w-12 h-12 mb-4 transition-transform ${dragActive ? 'scale-110 text-neogreen' : 'text-zinc-500'}`} />
                  
                  {file ? (
                    <div className="text-center font-mono">
                      <p className="text-neogreen font-bold text-sm uppercase flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB - READY FOR INGESTION
                      </p>
                    </div>
                  ) : (
                    <div className="text-center font-mono">
                      <p className="text-xs font-bold uppercase tracking-wider text-white">
                        Drag & Drop PDF or Click to Select File
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-2 uppercase">
                        Supports only raw vector or parsed PDF byte matrices
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-2">
                  2. TARGET JOB DESCRIPTION (OPTIONAL TEXT MATRICES)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste destination job criteria, core technical keywords, and requirements to generate comparative alignment score..."
                  rows={6}
                  className="w-full bg-neogray border-neo p-4 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-neogreen focus:shadow-[2px_2px_0px_0px_#00ff66] transition-all resize-y"
                />
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 border-neo bg-neoyellow text-black font-extrabold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'INGESTING FILES...' : 'EXECUTE AI RESUME VERIFICATION'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Execution History Log */}
        <div className="space-y-6">
          <div className="bg-neocard border-2 border-black p-6 shadow-neo h-full flex flex-col">
            <h2 className="font-mono text-xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neocyan" />
              HISTORY LOG
            </h2>
            <p className="text-zinc-400 text-xs font-mono mb-6 uppercase">
              PREVIOUS EVALUATION PASSES RUN BY USER
            </p>

            {fetchingHistory ? (
              <div className="flex-grow flex flex-col items-center justify-center py-10 font-mono text-xs text-zinc-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neocyan border-t-transparent mb-2"></div>
                FETCHING SECURE ARCHIVES...
              </div>
            ) : history.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 bg-neogray font-mono text-center">
                <FileSpreadsheet className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-xs uppercase font-bold text-zinc-500">No previous logs found</p>
                <p className="text-[9px] text-zinc-600 mt-1 uppercase">Run analysis to build ledger</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                {history.map((item) => (
                  <Link
                    key={item.id}
                    to={`/results/${item.id}`}
                    className="block p-4 border-neo bg-neogray shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="font-bold text-xs uppercase text-white truncate font-mono">
                        {item.fileName}
                      </h4>
                      <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`px-2.5 py-1 border text-xs font-mono font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getScoreColorClass(item.atsScore)}`}>
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
        <div className="fixed inset-0 z-50 bg-[#07070acc]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neocard border-2 border-black max-w-lg w-full p-8 shadow-neo-green font-mono text-center relative overflow-hidden">
            {/* Pulsing Grid Lines inside Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-10 animate-pulse pointer-events-none"></div>

            <BrainCircuit className="w-16 h-16 mx-auto mb-6 text-neogreen animate-bounce" />
            
            <h3 className="text-xl font-black uppercase text-white tracking-tighter mb-2">
              SCANNING TRANSCRIPT MATRIX...
            </h3>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 border-neo text-[10px] font-bold bg-neogray border-neogreen text-neogreen mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ACTIVE ENGINE: {activeEngine.provider.toUpperCase()} ({activeEngine.model})
            </div>

            <div className="space-y-3 text-left bg-neogray p-4 border border-zinc-800 text-[11px] leading-relaxed text-zinc-400">
              <p className="flex items-center gap-2 text-neogreen font-bold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-neogreen animate-ping"></span>
                [STATUS] Extracting text vectors via PDF binary stream...
              </p>
              <p>[STATUS] Injecting evaluation rules for: <span className="text-white font-semibold">"{user?.targetJobRole || 'Software Engineering'}"</span></p>
              <p className="text-neocyan font-semibold animate-pulse">[INFO] Fetching evaluations from AI interface. This can take up to 45 seconds on Render cold starts...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
