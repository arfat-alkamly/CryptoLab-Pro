// التحكم في تبديل الصفحات
function openTab(tabId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// دالة نسخ النصوص للحافظة
function copyResult(elemId) {
    const text = document.getElementById(elemId).innerText;
    if (!text || text === 'في انتظار المدخلات...' || text === '-') return;
    navigator.clipboard.writeText(text).then(() => {
        alert("تم نسخ البيانات المحددة بنجاح.");
    });
}

// ==========================================
// 1. خوارزمية قيصر والكسر (Caesar Cipher Engine)
// ==========================================
function handleCaesar(isEncrypt) {
    const text = document.getElementById('caesar-text').value;
    let shift = parseInt(document.getElementById('caesar-shift').value) || 0;
    const resElem = document.getElementById('caesar-res');
    const mathElem = document.getElementById('caesar-math');
    document.getElementById('caesar-crack-box').style.display = 'none';

    if (!text) {
        resElem.innerText = "يرجى إدخال النص المطلوب معالجته.";
        mathElem.innerHTML = "";
        return;
    }

    if (!isEncrypt) shift = (26 - (shift % 26)) % 26;

    let result = '';
    let steps = [];

    for (let char of text) {
        if (char >= 'A' && char <= 'Z') {
            let p = char.charCodeAt(0) - 65;
            let c = (p + shift) % 26;
            result += String.fromCharCode(c + 65);
            steps.push(`${char}(${p}) -> ${String.fromCharCode(c + 65)}(${c})`);
        } else if (char >= 'a' && char <= 'z') {
            let p = char.charCodeAt(0) - 97;
            let c = (p + shift) % 26;
            result += String.fromCharCode(c + 97);
            steps.push(`${char}(${p}) -> ${String.fromCharCode(c + 97)}(${c})`);
        } else {
            result += char;
        }
    }

    resElem.innerText = result;
    mathElem.innerHTML = `<strong>الخطوات الرياضية:</strong> ` + steps.slice(0, 5).join(' | ') + (steps.length > 5 ? ' ...' : '');
}

function bruteForceCaesar() {
    const text = document.getElementById('caesar-text').value;
    const crackBox = document.getElementById('caesar-crack-box');
    const crackList = document.getElementById('caesar-all-keys');

    if (!text) {
        alert("يرجى إدخال نص مشفر للتحليل.");
        return;
    }

    crackList.innerHTML = '';
    crackBox.style.display = 'block';

    for (let k = 1; k <= 25; k++) {
        let candidate = '';
        let shift = (26 - k) % 26;
        for (let char of text) {
            if (char >= 'A' && char <= 'Z') {
                candidate += String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
            } else if (char >= 'a' && char <= 'z') {
                candidate += String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
            } else {
                candidate += char;
            }
        }
        let div = document.createElement('div');
        div.className = 'crack-item';
        div.innerHTML = `<span>[Key Shift = ${k}]</span> <strong>${candidate}</strong>`;
        crackList.appendChild(div);
    }
}

// ==========================================
// 2. خوارزمية بلايفير (Playfair Cipher Engine)
// ==========================================
function generatePlayfairMatrix(key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    let cleanKey = "";
    for (let char of key + alphabet) {
        if (!cleanKey.includes(char)) cleanKey += char;
    }
    let matrix = [];
    for (let r = 0; r < 5; r++) matrix.push(cleanKey.slice(r * 5, (r + 1) * 5).split(''));
    return matrix;
}

function displayMatrix(matrix) {
    const container = document.getElementById('matrix-display');
    container.innerHTML = '';
    for (let row of matrix) {
        for (let cell of row) {
            let div = document.createElement('div');
            div.className = 'matrix-cell';
            div.innerText = cell;
            container.appendChild(div);
        }
    }
}

function findPosition(matrix, char) {
    if (char === 'J') char = 'I';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (matrix[r][c] === char) return { r, c };
        }
    }
    return null;
}

function handlePlayfair(isEncrypt) {
    let text = document.getElementById('playfair-text').value.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let key = document.getElementById('playfair-key').value;
    const resElem = document.getElementById('playfair-res');

    if (!text || !key) {
        resElem.innerText = "يرجى توفير النص والمفتاح.";
        return;
    }

    let matrix = generatePlayfairMatrix(key);
    displayMatrix(matrix);

    let pairs = [];
    for (let i = 0; i < text.length; i += 2) {
        let first = text[i];
        let second = text[i + 1] || 'X';
        if (first === second) {
            second = 'X';
            i--;
        }
        pairs.push([first, second]);
    }

    let result = '';
    let shift = isEncrypt ? 1 : 4;

    for (let [a, b] of pairs) {
        let posA = findPosition(matrix, a);
        let posB = findPosition(matrix, b);
        if (posA.r === posB.r) {
            result += matrix[posA.r][(posA.c + shift) % 5] + matrix[posB.r][(posB.c + shift) % 5];
        } else if (posA.c === posB.c) {
            result += matrix[(posA.r + shift) % 5][posA.c] + matrix[(posB.r + shift) % 5][posB.c];
        } else {
            result += matrix[posA.r][posB.c] + matrix[posB.r][posA.c];
        }
    }
    resElem.innerText = result;
}

// ==========================================
// 3. المحرك المدمج الأصلي (Native Offline WebCrypto: AES & SHA)
// ==========================================
async function deriveNativeKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function handleNativeAES(isEncrypt) {
    const text = document.getElementById('modern-text').value;
    const key = document.getElementById('modern-key').value;
    const resElem = document.getElementById('modern-res');

    if (!text || !key) {
        resElem.innerText = "يرجى كتابة النص والمفتاح السري.";
        return;
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    try {
        if (isEncrypt) {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const derivedKey = await deriveNativeKey(key, salt);
            const cipherBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                derivedKey,
                enc.encode(text)
            );

            const combined = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

            // تحويل إلى Base64
            let binary = '';
            for (let i = 0; i < combined.byteLength; i++) binary += String.fromCharCode(combined[i]);
            resElem.innerText = btoa(binary);
        } else {
            const rawData = atob(text);
            const bytes = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i);

            const salt = bytes.slice(0, 16);
            const iv = bytes.slice(16, 28);
            const ciphertext = bytes.slice(28);

            const derivedKey = await deriveNativeKey(key, salt);
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                derivedKey,
                ciphertext
            );

            resElem.innerText = dec.decode(decryptedBuffer);
        }
    } catch (e) {
        resElem.innerText = "تعذر تنفيذ العملية: المفتاح غير صحيح أو التنسيق تالف.";
    }
}

// محاكي التشفير المتماثل للكتل الخفيفة معيار (DES Simulation Engine)
function handleNativeDES(isEncrypt) {
    const text = document.getElementById('modern-text').value;
    const key = document.getElementById('modern-key').value;
    const resElem = document.getElementById('modern-res');

    if (!text || !key) {
        resElem.innerText = "يرجى كتابة النص والمفتاح السري.";
        return;
    }

    try {
        if (isEncrypt) {
            let keyHash = 0;
            for (let i = 0; i < key.length; i++) keyHash = (keyHash + key.charCodeAt(i) * 31) & 0xFF;
            let out = [];
            for (let i = 0; i < text.length; i++) {
                out.push((text.charCodeAt(i) ^ keyHash).toString(16).padStart(2, '0'));
            }
            resElem.innerText = "DES_" + out.join('').toUpperCase();
        } else {
            if (!text.startsWith("DES_")) {
                resElem.innerText = "تنسيق مشفر غير معتمد.";
                return;
            }
            let clean = text.replace("DES_", "");
            let keyHash = 0;
            for (let i = 0; i < key.length; i++) keyHash = (keyHash + key.charCodeAt(i) * 31) & 0xFF;
            let res = '';
            for (let i = 0; i < clean.length; i += 2) {
                let code = parseInt(clean.substr(i, 2), 16) ^ keyHash;
                res += String.fromCharCode(code);
            }
            resElem.innerText = res;
        }
    } catch (e) {
        resElem.innerText = "حدث خطأ أثناء معالجة الخوارزمية.";
    }
}

// ==========================================
// 4. تشفير ومعالجة الملفات (Offline File Encryption)
// ==========================================
async function processNativeFile(isEncrypt) {
    const fileInput = document.getElementById('file-input');
    const key = document.getElementById('file-key').value;
    const status = document.getElementById('file-status');

    if (fileInput.files.length === 0 || !key) {
        status.innerText = "يرجى اختيار ملف وإدخال المفتاح.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const enc = new TextEncoder();
        const dec = new TextDecoder();
        try {
            if (isEncrypt) {
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const derivedKey = await deriveNativeKey(key, salt);
                const cipherBuffer = await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv },
                    derivedKey,
                    enc.encode(e.target.result)
                );

                const combined = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
                combined.set(salt, 0);
                combined.set(iv, salt.length);
                combined.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

                let binary = '';
                for (let i = 0; i < combined.byteLength; i++) binary += String.fromCharCode(combined[i]);
                downloadBlob(btoa(binary), file.name + ".enc", "text/plain");
                status.innerText = `تم التشفير بنجاح وتوليد: ${file.name}.enc`;
            } else {
                const rawData = atob(e.target.result);
                const bytes = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i);

                const salt = bytes.slice(0, 16);
                const iv = bytes.slice(16, 28);
                const ciphertext = bytes.slice(28);

                const derivedKey = await deriveNativeKey(key, salt);
                const decryptedBuffer = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    derivedKey,
                    ciphertext
                );

                const originalName = file.name.replace(".enc", "") || "restored_file.txt";
                downloadBlob(dec.decode(decryptedBuffer), originalName, "text/plain");
                status.innerText = `تم فك تشفير الملف بنجاح واسترجاعه: ${originalName}`;
            }
        } catch (err) {
            status.innerText = "تعذر المعالجة: المفتاح غير مطابق لمفتاح التشفير الأصلي.";
        }
    };

    reader.readAsText(file);
}

function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// 5. دوال التجزئة المحلية (Native SHA-256)
// ==========================================
async function computeNativeHashes() {
    const val1 = document.getElementById('hash-val1').value;
    const val2 = document.getElementById('hash-val2').value;
    const out1 = document.getElementById('hash-out1');
    const out2 = document.getElementById('hash-out2');

    out1.innerText = val1 ? await sha256(val1) : '-';
    out2.innerText = val2 ? await sha256(val2) : '-';
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}