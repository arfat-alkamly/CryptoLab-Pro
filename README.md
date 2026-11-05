# CryptoLab Pro — Professional Cryptography Workspace

CryptoLab Pro is a browser-based educational cryptography workspace combining classical cipher demonstrations, modern Web Crypto API experiments, key utilities, message authentication, file integrity checks, encoding tools, and concise learning notes.

**Project owner:** Arfat Alkamali  
**Type:** Individual academic engineering project  
**Runtime:** Modern browser with Web Crypto API; use HTTPS or localhost for cryptographic operations.  
**Privacy:** Operations run locally. The application does not upload inputs or persist passphrases, plaintext, ciphertext, or private RSA keys.

## Product modules

| Module | Capabilities |
|---|---|
| Workspace dashboard | Module overview, quick actions, local-processing notice, responsive navigation |
| Caesar | Encrypt/decrypt, brute-force candidates, Chi-Square frequency ranking |
| Playfair | 5×5 key matrix and digraph substitution demonstration |
| AES-GCM | Existing PBKDF2-derived AES-256-GCM text encryption/decryption |
| File Vault | CLP2 authenticated binary/text file encryption and legacy CLP1 text decryption |
| File integrity | SHA-256 file fingerprint and expected-digest comparison |
| SHA-256 | Text digest comparison and avalanche bit-difference visualization |
| HMAC-SHA-256 | Create and verify keyed message authentication codes |
| RSA-OAEP | Ephemeral RSA-2048/SHA-256 keypair generation and short-message encryption/decryption |
| Key Lab | Cryptographically secure random password and byte generation; local strength estimate |
| Encoding Toolkit | UTF-8 Base64, hexadecimal, and URL component encode/decode |
| Learning Academy | Explanations of AES-GCM, RSA-OAEP, SHA-256, HMAC, PBKDF2, and encoding |

## Architecture

- `index.html`: Arabic RTL application shell and module controls.
- `style.css`: responsive visual system, workspace components, light/dark presentation, and reduced-motion support.
- `app.js`: original classical cipher, AES, file encryption, and hash modules retained.
- `pro-suite.js`: workspace utilities, HMAC, RSA-OAEP, encoding, password generation, and file integrity workflow.

The new suite is isolated from the original application logic to reduce regressions in existing modules.

## Cryptographic implementation notes

- Random values use `crypto.getRandomValues`; cryptographic operations use `crypto.subtle`.
- HMAC uses HMAC-SHA-256 with a caller-supplied shared secret.
- RSA uses RSA-OAEP with a 2048-bit modulus and SHA-256. The keypair is non-extractable and memory-only. The demo limits plaintext to approximately 190 bytes because RSA-OAEP is not designed for large payloads.
- Password generation uses rejection sampling over random bytes. Strength scoring is a local heuristic, not a breach database check or a formal password audit.
- File integrity compares SHA-256 digests. A digest proves equality only against a trusted expected digest; it does not authenticate the source by itself.
- Base64, Hex, and URL encoding are representation formats, not encryption.
- Existing CLP2 file encryption uses AES-256-GCM with PBKDF2-HMAC-SHA-256 and authenticated header metadata. Existing CLP1 text-file decryption remains supported.

## Security boundaries

This is an educational project, not a certified secure file vault or production cryptographic product. It has not undergone independent security review or penetration testing. Do not use it as the sole protection for sensitive production information.

- Never reuse an AES-GCM IV/nonce with the same key.
- Use unique, strong passphrases and keep them separate from encrypted files.
- RSA-OAEP should be used for small messages or key wrapping, not bulk file encryption.
- HMAC authenticates but does not encrypt.
- SHA-256 is a hash function, not encryption or password storage.
- Classic ciphers and the XOR demonstration are educational only.
- A client-side application cannot protect secrets from a compromised browser or device.

## Run locally

```bash
git clone https://github.com/arfat-alkamly/CryptoLab-Pro.git
cd CryptoLab-Pro
python -m http.server 8000
```

Open `http://localhost:8000` in a modern browser.

## Project links

- Repository: https://github.com/arfat-alkamly/CryptoLab-Pro
- Live application: https://crypto-lab-pro-xi.vercel.app
- Portfolio case study: https://arfat-phi.vercel.app/projects/cryptolab-pro
