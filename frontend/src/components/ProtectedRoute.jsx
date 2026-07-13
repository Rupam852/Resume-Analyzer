import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading, navigate } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate('login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neobg text-zinc-100 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neogreen border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">SYNCING DATA MATRICES...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
