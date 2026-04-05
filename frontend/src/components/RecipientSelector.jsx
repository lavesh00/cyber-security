import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { USERS } from '../data/users';

export default function RecipientSelector({ selectedIds, onChange, currentUserId }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Available users (exclude current user)
  const availableUsers = USERS.filter((u) => u.id !== currentUserId);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (userId) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  const selectedUsers = availableUsers.filter((u) => selectedIds.includes(u.id));
  const unselectedUsers = availableUsers.filter((u) => !selectedIds.includes(u.id));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected chips + input area */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        {selectedUsers.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
          >
            <span
              className={`w-5 h-5 rounded-full ${user.color} flex items-center justify-center text-white text-[10px] font-bold`}
            >
              {user.avatar}
            </span>
            {user.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeUser(user.id);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selectedUsers.length === 0 && (
          <span className="text-gray-400 text-sm">Select recipients...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {availableUsers.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
          {unselectedUsers.length === 0 && selectedUsers.length === availableUsers.length && (
            <p className="px-4 py-3 text-sm text-gray-500 text-center">All users selected</p>
          )}
        </div>
      )}
    </div>
  );
}
