import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { LogOut, Terminal } from 'lucide-react';

const Navbar = () => {
  const { user, logout, navigate } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-neocard border-b-2 border-neoborder px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Branding */}
        <div 
          onClick={() => navigate('landing')} 
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="bg-neogreen p-1.5 border-neo shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
            <Terminal className="w-5 h-5 text-black" />
          </div>
          <span className="font-mono text-lg font-extrabold uppercase tracking-wider text-white">
            RESUME ANALYZER<span className="text-neogreen">.AI</span>
          </span>
        </div>

        {/* User Navigation Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div 
                onClick={() => navigate('dashboard')}
                className="flex items-center gap-2.5 px-3 py-1.5 border-neo bg-neogray font-mono text-xs shadow-[2px_2px_0px_0px_#000] text-white cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-black object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-black bg-neocyan text-black flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-bold">{user.name.toUpperCase()}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5.5 py-2.5 rounded-full border-2 border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-extrabold uppercase transition-all duration-200 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('register')}
                className="px-5 py-2.5 border-neo text-xs font-bold uppercase bg-neogreen text-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              >
                Access System
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
