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
    <nav className="sticky top-0 z-50 w-full bg-neocard border-b-2 border-neoborder px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Branding */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-neogreen p-1.5 border-neo shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
            <Terminal className="w-5 h-5 text-black" />
          </div>
          <span className="font-mono text-xl font-extrabold uppercase tracking-wider text-white">
            ANTIVIRAL<span className="text-neogreen">.AI</span>
          </span>
        </Link>

        {/* User Navigation Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>

              <div className="hidden md:flex flex-col text-right font-mono text-[10px] leading-tight">
                <span className="text-zinc-400 font-bold">AGENT: {user.name.toUpperCase()}</span>
                <span className="text-neogreen tracking-wider">{user.targetJobRole.toUpperCase()}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border-neo text-xs font-bold uppercase bg-neopink text-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 border-neo text-xs font-bold uppercase bg-neogreen text-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Access System
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
