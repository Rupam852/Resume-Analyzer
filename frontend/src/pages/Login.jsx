import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ShieldAlert, LogIn, Mail, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, loginWithToken, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Detect Google OAuth Redirect Parameters
  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (token) {
      loginWithToken(token);
      navigate('/dashboard');
    } else if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams, loginWithToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all security fields.');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-grid-glow"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none"></div>

      <div className="bg-white/[0.02] border border-white/5 max-w-md w-full p-8 rounded-2xl shadow-neo backdrop-blur-md relative z-10">
        {/* Card Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-gradient-to-br from-neogreen to-necyan p-3 rounded-xl border border-white/10 shadow-sm mb-3">
            <LogIn className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-sans text-xl font-bold text-white tracking-wide">Operator Sign-In</h2>
          <p className="text-zinc-500 text-xs font-mono uppercase mt-1.5 tracking-wider">Authenticate console credentials</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-400 text-xs font-mono flex items-start gap-3 shadow-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold">AUTHENTICATION STATE FAILED:</span> {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-2 tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neogreen" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@system.io"
              disabled={loading}
              className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-neogreen/50 focus:ring-1 focus:ring-neogreen/25 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-2 tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neogreen" />
              PASSWORD KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-neogreen/50 focus:ring-1 focus:ring-neogreen/25 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neogreen to-necyan text-black font-extrabold uppercase shadow-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'SYNCING MATRIX DATA...' : 'INITIALIZE SYSTEM ACCESS'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#0b0b11] px-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">OR VIA SECURE FEDERATION</span>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-white font-medium text-xs font-mono uppercase shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          AUTHENTICATE WITH GOOGLE
        </button>

        {/* Switch Link */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs font-mono">
          <span className="text-zinc-500">NEW SYSTEM OPERATOR? </span>
          <Link to="/register" className="text-neogreen font-bold hover:underline uppercase tracking-wide">
            REGISTRATION STAGE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
