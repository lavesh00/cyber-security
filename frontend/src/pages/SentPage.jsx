import React, { useState, useEffect } from 'react';
import { Send, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSentEmails } from '../data/store';
import Header from '../components/Header';
import EmailListItem from '../components/EmailListItem';

export default function SentPage() {
  const { currentUser } = useAuth();
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setEmails(getSentEmails(currentUser.id));
    }
  }, [currentUser]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sent"
        subtitle={`${emails.length} message${emails.length !== 1 ? 's' : ''}`}
      />

      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No sent emails</p>
            <p className="text-sm text-gray-400 mt-1">
              Emails you send will appear here
            </p>
          </div>
        ) : (
          <div>
            {emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                currentUserId={currentUser.id}
                type="sent"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
