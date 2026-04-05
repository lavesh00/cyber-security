import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Paperclip } from 'lucide-react';
import { getUserById } from '../data/users';
import { getCiphertextPreview } from '../crypto/rsa';
import { formatDate } from '../utils/helpers';

export default function EmailListItem({ email, currentUserId, type = 'inbox' }) {
  const navigate = useNavigate();

  // Determine who to show (sender for inbox, recipients for sent)
  const displayUser =
    type === 'inbox' ? getUserById(email.from) : null;

  const displayNames =
    type === 'sent'
      ? email.to.map((id) => getUserById(id)?.name || id).join(', ')
      : null;

  const isUnread = type === 'inbox' && email.read && !email.read[currentUserId];

  // Get encrypted preview
  const ciphertextPreview =
    type === 'inbox'
      ? getCiphertextPreview(email.encryptedBodies?.[currentUserId], 50)
      : getCiphertextPreview(email.encryptedBodies?.[email.from], 50);

  return (
    <div
      onClick={() => navigate(`/email/${email.id}`)}
      className={`flex items-center gap-4 px-6 py-3.5 cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/50 group ${
        isUnread ? 'bg-blue-50/30' : 'bg-white'
      }`}
    >
      {/* Avatar */}
      {type === 'inbox' && displayUser && (
        <div
          className={`w-10 h-10 rounded-full ${displayUser.color} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold`}
        >
          {displayUser.avatar}
        </div>
      )}
      {type === 'sent' && (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 text-sm font-bold">
          {email.to.length > 1 ? email.to.length : getUserById(email.to[0])?.avatar || '?'}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
            {type === 'inbox' ? displayUser?.name || email.from : `To: ${displayNames}`}
          </span>
          <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
        </div>
        <p className={`text-sm truncate mt-0.5 ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
          {email.subject}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5 font-mono">
          {ciphertextPreview}
        </p>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-xs ${isUnread ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
          {formatDate(email.timestamp)}
        </p>
        {isUnread && (
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-auto mt-1.5" />
        )}
      </div>
    </div>
  );
}
