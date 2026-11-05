# CryptoLab-Pro — Cryptography Learning Lab

CryptoLab-Pro is an Arabic, browser-based educational cryptography lab. It focuses on a small set of working experiments rather than a crowded dashboard. Cryptographic operations run locally in the browser through the Web Crypto API.

**Owner:** Arfat Alkamali  
**Runtime:** Modern browser over HTTPS or localhost  
**Privacy:** Files and text are processed locally; inputs are not uploaded to an application server.

## Current modules

| Module | What it does |
|---|---|
| Caesar | Encrypt/decrypt, brute-force candidates, Chi-Square frequency ranking |
| Vigenère | Repeating-key polyalphabetic substitution |
| Affine | Modular substitution cipher with validated invertible key |
| Rail Fence | Transposition cipher with configurable rails |
| Playfair | 5×5 digraph substitution matrix |
| AES-256-GCM | Text encryption/decryption using PBKDF2-HMAC-SHA-256 derived keys |
| File Vault (CLP2) | Authenticated encryption for arbitrary binary files, including PDF, DOCX, images and archives |
| Legacy CLP1 | Backward-compatible decryption for older text-file containers |
| SHA-256 | Text hashes, avalanche comparison, and file fingerprint |
| HMAC-SHA-256 | Create and verify message authentication codes |

## File encryption format

New files use the **CLP2** binary container:
- 16-byte random salt and 12-byte random AES-GCM nonce.
- PBKDF2-HMAC-SHA-256 with 310,000 iterations to derive an AES-256 key.
- Authenticated metadata stores the original filename and MIME type.
- AES-GCM authentication protects both the encrypted payload and header.
- Decryption validates the authentication tag before a file is restored.
- The interface currently limits individual files to 100 MB to avoid excessive browser memory use.

PDF, DOCX, images and other binary formats are read with `File.arrayBuffer()`; they are not converted to text before encryption.

## Architecture

- `index.html`: Arabic RTL interface and module controls.
- `style.css`: responsive layout for desktop and mobile.
- `app.js`: classical ciphers, AES text workflow, CLP2 file vault, legacy file decryption, and SHA-256.
- `pro-suite.js`: HMAC-SHA-256 and file fingerprint workflow.

## Security notes

This is an educational project, not a certified production vault. It has not undergone independent security review or penetration testing. Do not rely on it as the sole protection for sensitive production data.

- Never reuse an AES-GCM nonce with the same key.
- Use a unique, strong passphrase and keep it separate from the encrypted file.
- HMAC authenticates; it does not encrypt.
- SHA-256 hashes; it does not encrypt or authenticate by itself.
- Caesar, Vigenère, Affine, Rail Fence and Playfair are historical learning ciphers, not modern security.
- A compromised browser or device can expose data before encryption or after decryption.

## Run locally

```bash
git clone https://github.com/arfat-alkamly/CryptoLab-Pro.git
cd CryptoLab-Pro
python -m http.server 8000
```

Open `http://localhost:8000`.

## Links

- Repository: https://github.com/arfat-alkamly/CryptoLab-Pro
- Live application: https://crypto-lab-pro-xi.vercel.app
- Portfolio case study: https://arfat-phi.vercel.app/projects/cryptolab-pro
