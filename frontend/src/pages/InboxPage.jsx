import React, { useState, useEffect } from 'react';
import { Inbox, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInboxEmails } from '../data/store';
import Header from '../components/Header';
import EmailListItem from '../components/EmailListItem';

export default function InboxPage() {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEmails = () => {
    if (currentUser) {
      setEmails(getInboxEmails(currentUser.id));
    }
  };

  useEffect(() => {
    loadEmails();
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadEmails, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmails();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Inbox"
        subtitle={`${emails.length} message${emails.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No emails yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your encrypted inbox is empty
            </p>
          </div>
        ) : (
          <div>
            {emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                currentUserId={currentUser.id}
                type="inbox"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
