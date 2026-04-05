import forge from 'node-forge';
import { USERS } from '../data/users';

const KEYS_STORAGE_KEY = 'securemail_rsa_keys';

/**
 * Initialize RSA key pairs for all 4 users.
 * On first load, generates new key pairs and stores in localStorage.
 * On subsequent loads, retrieves from localStorage.
 *
 * Uses 1024-bit keys for demo speed (~1-2s per pair vs 5-10s for 2048-bit).
 * Production would use 2048+ bits.
 */
export async function initializeKeys(onProgress) {
  const existing = localStorage.getItem(KEYS_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      // Validate all users have keys
      const allPresent = USERS.every((u) => parsed[u.id]?.publicKeyPem && parsed[u.id]?.privateKeyPem);
      if (allPresent) return parsed;
    } catch (e) {
      // Corrupted data, regenerate
      localStorage.removeItem(KEYS_STORAGE_KEY);
    }
  }

  // Generate key pairs for all users
  const keys = {};
  for (let i = 0; i < USERS.length; i++) {
    const user = USERS[i];
    if (onProgress) onProgress(user.name, i + 1, USERS.length);

    // Generate RSA key pair (1024-bit for demo speed)
    const keypair = await new Promise((resolve) => {
      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        const kp = forge.pki.rsa.generateKeyPair({ bits: 1024 });
        resolve(kp);
      }, 50);
    });

    keys[user.id] = {
      publicKeyPem: forge.pki.publicKeyToPem(keypair.publicKey),
      privateKeyPem: forge.pki.privateKeyToPem(keypair.privateKey),
    };
  }

  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
  return keys;
}

/**
 * Get all public keys (safe to expose)
 */
export function getAllPublicKeys(allKeys) {
  const publicKeys = {};
  for (const userId in allKeys) {
    publicKeys[userId] = allKeys[userId].publicKeyPem;
  }
  return publicKeys;
}

/**
 * Get a specific user's key pair
 */
export function getUserKeys(allKeys, userId) {
  return allKeys[userId] || null;
}
