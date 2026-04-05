import forge from 'node-forge';

/**
 * Hybrid RSA+AES Encryption
 *
 * RSA-1024 can only encrypt ~86 bytes directly (with OAEP padding).
 * So we use hybrid encryption:
 *   1. Generate random AES-256 key + IV
 *   2. AES-CBC encrypt the plaintext message
 *   3. RSA-OAEP encrypt the AES key
 *   4. Package everything together as base64
 */

/**
 * Encrypt a message for a recipient using their public key (PEM).
 * Returns a base64-encoded JSON string containing:
 *   { encKey: base64, iv: base64, encBody: base64 }
 */
export function encryptMessage(plaintext, recipientPublicKeyPem) {
  try {
    // Parse the recipient's public key
    const publicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);

    // Generate random AES-256 key (32 bytes) and IV (16 bytes)
    const aesKey = forge.random.getBytesSync(32);
    const iv = forge.random.getBytesSync(16);

    // AES-CBC encrypt the plaintext
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(plaintext)));
    cipher.finish();
    const encryptedBody = cipher.output.getBytes();

    // RSA-OAEP encrypt the AES key with recipient's public key
    const encryptedKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });

    // Package as base64-encoded JSON
    const payload = {
      encKey: forge.util.encode64(encryptedKey),
      iv: forge.util.encode64(iv),
      encBody: forge.util.encode64(encryptedBody),
    };

    return forge.util.encode64(JSON.stringify(payload));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt message: ' + error.message);
  }
}

/**
 * Decrypt a message using the recipient's private key (PEM).
 * Takes the base64-encoded JSON string produced by encryptMessage.
 * Returns the original plaintext.
 */
export function decryptMessage(ciphertextBase64, privateKeyPem) {
  try {
    // Parse the private key
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Decode the payload
    const payloadJson = forge.util.decode64(ciphertextBase64);
    const payload = JSON.parse(payloadJson);

    // RSA-OAEP decrypt the AES key
    const encryptedKey = forge.util.decode64(payload.encKey);
    const aesKey = privateKey.decrypt(encryptedKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });

    // AES-CBC decrypt the message body
    const iv = forge.util.decode64(payload.iv);
    const encryptedBody = forge.util.decode64(payload.encBody);

    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encryptedBody));
    const success = decipher.finish();

    if (!success) {
      throw new Error('AES decryption failed — incorrect key or corrupted data');
    }

    return forge.util.decodeUtf8(decipher.output.getBytes());
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt message: ' + error.message);
  }
}

/**
 * Returns a truncated preview of the ciphertext for display
 */
export function getCiphertextPreview(ciphertextBase64, maxLength = 80) {
  if (!ciphertextBase64) return '';
  if (ciphertextBase64.length <= maxLength) return ciphertextBase64;
  return ciphertextBase64.substring(0, maxLength) + '...';
}
