import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Inbox, Send, PenSquare, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../data/store';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (currentUser) {
      setUnreadCount(getUnreadCount(currentUser.id));
    }
    // Refresh unread count periodically
    const interval = setInterval(() => {
      if (currentUser) {
        setUnreadCount(getUnreadCount(currentUser.id));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
    }`;

  return (
    <div className="w-60 bg-slate-900 h-screen flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">SecureMail</span>
        </div>
      </div>

      {/* Compose Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => navigate('/compose')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 transition-colors active:scale-[0.97]"
        >
          <PenSquare className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <NavLink to="/inbox" className={navLinkClass}>
          <Inbox className="w-4.5 h-4.5" />
          <span className="flex-1">Inbox</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/sent" className={navLinkClass}>
          <Send className="w-4.5 h-4.5" />
          <span>Sent</span>
        </NavLink>
      </nav>

      {/* User Info & Logout */}
      {currentUser && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-full ${currentUser.color} flex items-center justify-center text-white text-sm font-bold`}
            >
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-slate-500 text-xs truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
