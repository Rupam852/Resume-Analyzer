import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ResultsView from './pages/ResultsView.jsx';

function MainLayout() {
  const { screen } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-neobg">
      <Navbar />
      <div className="flex-grow">
        {screen === 'landing' && <LandingPage />}
        {screen === 'login' && <Login />}
        {screen === 'register' && <Register />}
        {screen === 'dashboard' && (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
        {screen === 'results' && (
          <ProtectedRoute>
            <ResultsView />
          </ProtectedRoute>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
