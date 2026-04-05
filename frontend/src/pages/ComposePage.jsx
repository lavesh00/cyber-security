import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { encryptMessage } from '../crypto/rsa';
import { saveEmail, generateId } from '../data/store';
import Header from '../components/Header';
import RecipientSelector from '../components/RecipientSelector';

export default function ComposePage() {
  const { currentUser, allPublicKeys } = useAuth();
  const navigate = useNavigate();

  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSend = recipients.length > 0 && subject.trim() && body.trim();

  const handleSend = async () => {
    if (!canSend) return;
    setError('');
    setSending(true);

    try {
      // Encrypt the body for each recipient + sender (sender copy)
      const encryptionTargets = [...new Set([...recipients, currentUser.id])];
      const encryptedBodies = {};

      for (const userId of encryptionTargets) {
        const publicKey = allPublicKeys[userId];
        if (!publicKey) {
          throw new Error(`No public key found for user: ${userId}`);
        }
        encryptedBodies[userId] = encryptMessage(body, publicKey);
      }

      // Build the email object
      const email = {
        id: generateId(),
        from: currentUser.id,
        to: recipients,
        subject: subject.trim(),
        encryptedBodies,
        timestamp: new Date().toISOString(),
        read: recipients.reduce((acc, id) => {
          acc[id] = false;
          return acc;
        }, {}),
      };

      // Save to localStorage
      saveEmail(email);

      // Show success state
      setSent(true);
      setTimeout(() => {
        navigate('/sent');
      }, 1500);
    } catch (err) {
      console.error('Failed to send:', err);
      setError(err.message || 'Failed to encrypt and send message');
      setSending(false);
    }
  };

  // Success state
  if (sent) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Compose" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-500 text-sm">
              Your message has been encrypted with RSA and delivered securely.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Compose"
        subtitle="New encrypted message"
        actions={
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* To Field */}
          <div className="px-5 py-3 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">To</label>
            <RecipientSelector
              selectedIds={recipients}
              onChange={setRecipients}
              currentUserId={currentUser.id}
            />
          </div>

          {/* Subject Field */}
          <div className="px-5 py-3 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="w-full text-gray-900 text-sm bg-transparent outline-none placeholder:text-gray-400 py-1"
            />
          </div>

          {/* Body Field */}
          <div className="px-5 py-3">
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={14}
              className="w-full text-gray-900 text-sm bg-transparent outline-none placeholder:text-gray-400 resize-none py-1"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-5 py-3 bg-red-50 border-t border-red-100">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">
                Encrypted with RSA + AES-256 for {recipients.length || 0} recipient
                {recipients.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend || sending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                canSend && !sending
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Encrypted
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
