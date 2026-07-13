import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { LogOut, Terminal } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full bg-zinc-950/40 border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between z-20 relative backdrop-blur-md">
      {/* Logo / Branding */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="bg-gradient-to-br from-neogreen to-necyan p-2 rounded-lg border border-white/10 shadow-sm group-hover:scale-105 transition-transform duration-200">
          <Terminal className="w-4.5 h-4.5 text-black" />
        </div>
        <span className="font-mono text-base font-extrabold uppercase tracking-wider text-white">
          RESUME ANALYZER<span className="text-neogreen">.AI</span>
        </span>
      </Link>

      {/* User Navigation Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* User Profile Card */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] font-mono text-xs text-white shadow-sm">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-5.5 h-5.5 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full border border-white/10 bg-neogreen/25 text-neogreen flex items-center justify-center font-bold text-[9px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline font-semibold">{user.name.toUpperCase()}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-1.8 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase transition-all duration-200 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4.5 py-2 rounded-lg border border-white/10 bg-gradient-to-r from-neogreen to-necyan text-black hover:opacity-90 active:scale-95 text-xs font-bold uppercase transition-all duration-150 cursor-pointer shadow-sm shadow-neogreen/5"
            >
              Spin Up Profile
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
