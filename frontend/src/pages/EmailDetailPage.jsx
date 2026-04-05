import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Shield, ShieldCheck, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getEmailById, markAsRead, deleteEmail } from '../data/store';
import { decryptMessage } from '../crypto/rsa';
import { getUserById } from '../data/users';
import { formatFullDate } from '../utils/helpers';
import Header from '../components/Header';

export default function EmailDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userKeys } = useAuth();

  const [email, setEmail] = useState(null);
  const [decryptedBody, setDecryptedBody] = useState(null);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');

  useEffect(() => {
    const found = getEmailById(id);
    if (found) {
      setEmail(found);
    } else {
      navigate('/inbox');
    }
  }, [id, navigate]);

  if (!email) return null;

  const sender = getUserById(email.from);
  const recipientNames = email.to.map((id) => getUserById(id)?.name || id).join(', ');
  const isSender = email.from === currentUser.id;
  const isRecipient = email.to.includes(currentUser.id);

  // Get the encrypted body for the current user
  const userCiphertext = email.encryptedBodies?.[currentUser.id] || null;

  const handleDecrypt = () => {
    if (!userCiphertext || !userKeys) return;
    setDecrypting(true);
    setDecryptError('');

    // Small delay to show the decryption animation
    setTimeout(() => {
      try {
        const plaintext = decryptMessage(userCiphertext, userKeys.privateKeyPem);
        setDecryptedBody(plaintext);
        setIsDecrypted(true);
        // Mark as read
        if (isRecipient) {
          markAsRead(email.id, currentUser.id);
        }
      } catch (err) {
        console.error('Decryption failed:', err);
        setDecryptError('Failed to decrypt. The message may be corrupted or your key is invalid.');
      } finally {
        setDecrypting(false);
      }
    }, 800);
  };

  const toggleView = () => {
    setIsDecrypted(!isDecrypted);
  };

  const handleDelete = () => {
    deleteEmail(email.id);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Email"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Email Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Subject */}
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{email.subject}</h2>
              <p className="text-sm text-gray-400 mt-1">{formatFullDate(email.timestamp)}</p>
            </div>

            {/* Sender / Recipients */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-4">
              {sender && (
                <div
                  className={`w-11 h-11 rounded-full ${sender.color} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5`}
                >
                  {sender.avatar}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {sender?.name || email.from}
                  </span>
                  <span className="text-xs text-gray-400">
                    &lt;{sender?.email || email.from}&gt;
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  To: {recipientNames}
                </p>
              </div>
            </div>

            {/* Encryption Status Bar */}
            <div
              className={`px-6 py-3 flex items-center gap-2 ${
                isDecrypted ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-amber-50 border-b border-amber-100'
              }`}
            >
              {isDecrypted ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Message decrypted with your private key
                  </span>
                  <button
                    onClick={toggleView}
                    className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Show Encrypted
                  </button>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    This message is end-to-end encrypted
                  </span>
                  {decryptedBody && (
                    <button
                      onClick={toggleView}
                      className="ml-auto flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Show Decrypted
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Message Body */}
            <div className="px-6 py-5">
              {!userCiphertext ? (
                <div className="text-center py-8 text-gray-500">
                  <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No encrypted copy available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You don't have an encrypted copy of this message.
                  </p>
                </div>
              ) : isDecrypted && decryptedBody ? (
                /* Decrypted plaintext view */
                <div className="email-body text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {decryptedBody}
                </div>
              ) : (
                /* Encrypted ciphertext view */
                <div>
                  <div className="encrypted-text">
                    {userCiphertext}
                  </div>

                  {/* Decrypt button */}
                  {!decryptedBody && (
                    <div className="mt-5 text-center">
                      {decryptError && (
                        <p className="text-red-500 text-sm mb-3">{decryptError}</p>
                      )}
                      <button
                        onClick={handleDecrypt}
                        disabled={decrypting}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {decrypting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Decrypting with RSA...
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            Decrypt Message
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-400 mt-2">
                        Uses your private RSA key to decrypt the AES session key
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Technical Info Card */}
          <div className="mt-4 bg-slate-800 rounded-xl p-5 text-sm">
            <h3 className="text-slate-300 font-semibold text-xs uppercase tracking-wider mb-3">
              Encryption Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Algorithm:</span>
                <span className="text-slate-300 ml-2">RSA-1024 + AES-256-CBC</span>
              </div>
              <div>
                <span className="text-slate-500">Key Exchange:</span>
                <span className="text-slate-300 ml-2">RSA-OAEP (SHA-256)</span>
              </div>
              <div>
                <span className="text-slate-500">Recipients:</span>
                <span className="text-slate-300 ml-2">{email.to.length} encrypted copies</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <span className={`ml-2 ${isDecrypted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isDecrypted ? 'Decrypted (local only)' : 'Encrypted in storage'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
