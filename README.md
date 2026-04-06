# Secure Email RSA

A simple, conceptual web application demonstrating End-to-End Encryption (E2EE) for email communications using Hybrid RSA and AES encryption algorithms.

## Overview

**Secure Email RSA** showcases how a modern frontend application might implement secure client-side encryption. Because RSA alone is inefficient for encrypting large amounts of data, this project uses a hybrid approach:
1. Messages are encrypted using a randomly generated AES-256 symmetric key.
2. The AES key is then encrypted using the recipient's RSA public key.
3. The encrypted message and encrypted AES key are securely packaged and sent.

This ensures that only the recipient (who holds the corresponding RSA private key) can decrypt the AES key, and subsequently, decrypt and read the message body. 

## Features

- **End-to-End Encryption:** Messages are encrypted directly on the client side using secure hybrid RSA+AES algorithms.
- **Key Generation:** Automatic generation of RSA public/private key pairs.
- **Authentication Simulation:** A simulated authentication flow and mock user store to demonstrate how public keys map to user identities.
- **Interactive UI:** Built with React, Tailwind CSS, and Lucide React icons, offering an elegant interface supporting Inbox, Sent, Compose, and Email Reading views.

## Technologies Used

- [React](https://reactjs.org/) (v18)
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [React Router](https://reactrouter.com/) - Application navigation
- [Node Forge](https://github.com/digitalbazaar/forge) - Native JavaScript implementation of TLS and various cryptographic tools
- [Lucide React](https://lucide.dev/) - Beautiful vector icons

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate to the `frontend` folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173` (or the port specified by Vite).

### Simulated Users

To log in and interact with the application, you can use any of the mock users generated in the system. The mock authentication typically uses simplified mock credentials—check the `frontend/src/data/users.js` file for standard test login details.

## How The Encryption Works

When a user composes a message, the following cryptographic flow takes place behind the scenes (see `frontend/src/crypto/rsa.js`):

1. **Obtain Public Key:** The sender requests the recipient's RSA public key (PEM format).
2. **Generate AES Key:** The sender generates a random 32-byte AES key and a 16-byte initialization vector (IV).
3. **AES Encryption:** The email contents (plaintext) are encrypted via AES-CBC using the AES key.
4. **RSA Encryption:** The AES key is itself encrypted via RSA-OAEP using the recipient's public key.
5. **Packaging:** The encrypted AES key, IV, and encrypted email body are packaged into a base64-encoded JSON payload and dispatched.

Upon receiving the payload, the recipient decrypts the AES key using their RSA private key and then uses the decrypted AES key to read the email context.

## License
MIT
