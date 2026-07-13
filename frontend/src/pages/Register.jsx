import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ShieldAlert, UserPlus, User, Mail, Key, Briefcase } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetJobRole, setTargetJobRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !targetJobRole) {
      setError('All core operator modules are required.');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, targetJobRole);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-neobg flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-15 pointer-events-none"></div>

      <div className="bg-neocard border-2 border-black max-w-md w-full p-6 md:p-8 shadow-neo relative z-10">
        {/* Card Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-neogreen p-3 border-neo shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
            <UserPlus className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-mono text-2xl font-black text-white uppercase tracking-tight">OPERATOR REGISTRATION</h2>
          <p className="text-zinc-500 text-xs font-mono uppercase mt-1">Spin up new operator profile</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 border-neo bg-neopink/10 border-neopink text-neopink text-xs font-mono flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">REGISTRATION INTERRUPTED:</span> {error}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neogreen" />
              FULL OPERATOR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Mercer"
              disabled={loading}
              className="w-full bg-neogray border-neo px-4 py-2.5 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-neogreen focus:shadow-[2px_2px_0px_0px_#00ff66] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neogreen" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@mercer.io"
              disabled={loading}
              className="w-full bg-neogray border-neo px-4 py-2.5 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-neogreen focus:shadow-[2px_2px_0px_0px_#00ff66] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-neogreen" />
              TARGET JOB ROLE
            </label>
            <input
              type="text"
              value={targetJobRole}
              onChange={(e) => setTargetJobRole(e.target.value)}
              placeholder="Full-Stack Engineer"
              disabled={loading}
              className="w-full bg-neogray border-neo px-4 py-2.5 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-neogreen focus:shadow-[2px_2px_0px_0px_#00ff66] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neogreen" />
              SECURE PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full bg-neogray border-neo px-4 py-2.5 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-neogreen focus:shadow-[2px_2px_0px_0px_#00ff66] transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 border-neo bg-neogreen text-black font-extrabold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'INITIALIZING MATRIX WRITER...' : 'SPIN UP SECURITY CREDENTIALS'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
          <span className="relative bg-neocard px-3 font-mono text-[10px] text-zinc-500 uppercase">OR VIA SECURE FEDERATION</span>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-3.5 border-neo bg-neogray text-white font-mono text-xs font-bold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="mt-6 pt-6 border-t border-zinc-800 text-center font-mono text-xs">
          <span className="text-zinc-500">ALREADY HAVE OPERATOR DATA? </span>
          <Link to="/login" className="text-neogreen font-bold hover:underline uppercase">
            SIGN-IN CORE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
