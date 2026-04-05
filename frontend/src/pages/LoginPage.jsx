import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USERS } from '../data/users';

export default function LoginPage() {
  const { keysReady, keyProgress, login, currentUser } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  React.useEffect(() => {
    if (currentUser) navigate('/inbox');
  }, [currentUser, navigate]);

  const handleLogin = (userId) => {
    login(userId);
    navigate('/inbox');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SecureMail</h1>
          <p className="text-slate-400 text-sm">
            RSA-Encrypted Email System
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">
              End-to-End Encrypted with RSA + AES-256
            </span>
          </div>
        </div>

        {/* Loading State */}
        {!keysReady && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 text-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300 text-sm">{keyProgress || 'Initializing encryption...'}</p>
            <p className="text-slate-500 text-xs mt-2">
              Generating RSA key pairs for all users (first time only)
            </p>
          </div>
        )}

        {/* User Selection */}
        {keysReady && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <h2 className="text-slate-300 text-sm font-medium mb-4 text-center">
              Select your account to continue
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.id)}
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div
                    className={`w-14 h-14 rounded-full ${user.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                  >
                    {user.avatar}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          All messages are encrypted with RSA-1024 + AES-256-CBC hybrid encryption.
          <br />
          Private keys never leave your browser.
        </p>
      </div>
    </div>
  );
}
