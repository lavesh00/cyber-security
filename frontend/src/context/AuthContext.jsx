import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeKeys, getAllPublicKeys, getUserKeys } from '../crypto/keys';
import { getUserById } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allKeys, setAllKeys] = useState(null);
  const [keysReady, setKeysReady] = useState(false);
  const [keyProgress, setKeyProgress] = useState('');

  // Initialize RSA keys on app load
  useEffect(() => {
    async function init() {
      try {
        const keys = await initializeKeys((userName, current, total) => {
          setKeyProgress(`Generating RSA keys for ${userName}... (${current}/${total})`);
        });
        setAllKeys(keys);
        setKeysReady(true);
      } catch (error) {
        console.error('Failed to initialize RSA keys:', error);
        setKeyProgress('Failed to generate keys. Please refresh.');
      }
    }
    init();
  }, []);

  const login = useCallback(
    (userId) => {
      const user = getUserById(userId);
      if (user && allKeys) {
        setCurrentUser(user);
      }
    },
    [allKeys]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Get current user's private/public keys
  const userKeys = currentUser && allKeys ? getUserKeys(allKeys, currentUser.id) : null;

  // Get all public keys (for encryption)
  const allPublicKeys = allKeys ? getAllPublicKeys(allKeys) : {};

  const value = {
    currentUser,
    userKeys,
    allPublicKeys,
    keysReady,
    keyProgress,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
