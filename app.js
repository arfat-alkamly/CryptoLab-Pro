// التحكم في تبديل الصفحات
function openTab(tabId, trigger) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (trigger) trigger.classList.add('active');
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
        const keyLabel = document.createElement('span');
        keyLabel.textContent = `[Key Shift = ${k}]`;
        const candidateLabel = document.createElement('strong');
        candidateLabel.textContent = candidate;
        div.append(keyLabel, document.createTextNode(' '), candidateLabel);
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

// CryptoLab Pro enhancements: statistical analysis, avalanche metrics and binary files.
function analyzeCaesarFrequency() {
 const input=document.getElementById('caesar-text').value;
 const output=document.getElementById('caesar-frequency-results');
 const letters=input.toUpperCase().replace(/[^A-Z]/g,'');
 if(letters.length<8){output.textContent='أدخل 8 أحرف إنجليزية على الأقل للحصول على تقدير ذي معنى.';return;}
 const expected=[8.167,1.492,2.782,4.253,12.702,2.228,2.015,6.094,6.966,.153,.772,4.025,2.406,6.749,7.507,1.929,.095,5.987,6.327,9.056,2.758,.978,2.360,.150,1.974,.074];
 const ranked=[];
 for(let shift=0;shift<26;shift++){
  const counts=Array(26).fill(0);
  for(const ch of letters) counts[(ch.charCodeAt(0)-65-shift+26)%26]++;
  const score=counts.reduce((sum,n,i)=>{const e=expected[i]*letters.length/100;return sum+(n-e)**2/Math.max(e,.0001);},0);
  ranked.push({shift,score,text:Array.from(letters,c=>String.fromCharCode((c.charCodeAt(0)-65-shift+26)%26+65)).join('')});
 }
 ranked.sort((a,b)=>a.score-b.score);output.replaceChildren();
 const note=document.createElement('p');note.className='analysis-note';note.textContent='أفضل الاحتمالات وفق Chi-Square (الأقل أفضل):';output.appendChild(note);
 ranked.slice(0,5).forEach((item,i)=>{const row=document.createElement('div');row.className='analysis-row';const label=document.createElement('span');label.textContent='#'+(i+1)+' · Shift '+item.shift+' · Score '+item.score.toFixed(2);const value=document.createElement('strong');value.textContent=item.text;row.append(label,value);output.appendChild(row);});
}
function updateAvalancheMetric(a,b){
 const target=document.getElementById('hash-avalanche');if(!target)return;
 if(!a||!b){target.textContent='أدخل نصين للمقارنة.';return;}
 let changed=0;
 for(let i=0;i<Math.min(a.length,b.length);i++){let n=parseInt(a[i],16)^parseInt(b[i],16);while(n){changed+=n&1;n>>=1;}}
 const pct=(changed/256*100).toFixed(2);target.replaceChildren();
 const metric=document.createElement('div');metric.className='avalanche-metric';metric.textContent=changed+' / 256 bits changed';
 const track=document.createElement('div');track.className='avalanche-track';const fill=document.createElement('span');fill.style.width=pct+'%';track.appendChild(fill);
 const caption=document.createElement('p');caption.textContent='نسبة الاختلاف: '+pct+'% — القيمة القريبة من 50% شائعة في المقارنات العشوائية وليست شرطًا لكل زوج.';
 target.append(metric,track,caption);
}
const computeNativeHashesBase=computeNativeHashes;
async function computeNativeHashes(){await computeNativeHashesBase();const a=document.getElementById('hash-out1').innerText;const b=document.getElementById('hash-out2').innerText;updateAvalancheMetric(a==='-'?'':a,b==='-'?'':b);}
function deriveFileV2Key(passphrase,salt){
 return crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),{name:'PBKDF2'},false,['deriveKey']).then(k=>crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']));
}
function downloadBinary(bytes,name,mime){
 const url=URL.createObjectURL(new Blob([bytes],{type:mime||'application/octet-stream'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function processNativeFile(isEncrypt){
 const input=document.getElementById('file-input'),pass=document.getElementById('file-key').value,status=document.getElementById('file-status'),file=input.files&&input.files[0];
 if(!file||!pass){status.textContent='يرجى اختيار ملف وإدخال عبارة مرور.';return;}
 if(isEncrypt&&pass.length<10){status.textContent='استخدم عبارة مرور من 10 أحرف على الأقل عند التشفير الجديد.';return;}
 status.textContent='جارٍ تجهيز الملف محليًا...';
 try{
  const data=new Uint8Array(await file.arrayBuffer());
  if(isEncrypt){
   const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
   const meta=new TextEncoder().encode(JSON.stringify({name:file.name,type:file.type||'application/octet-stream'}));
   const header=new Uint8Array(34+meta.length);header.set([67,76,80,50]);header.set(salt,4);header.set(iv,20);new DataView(header.buffer).setUint16(32,meta.length,false);header.set(meta,34);
   const key=await deriveFileV2Key(pass,salt),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:header,tagLength:128},key,data);
   const packed=new Uint8Array(header.length+cipher.byteLength);packed.set(header);packed.set(new Uint8Array(cipher),header.length);
   downloadBinary(packed,file.name+'.clp.enc','application/octet-stream');status.textContent='تم تشفير الملف محليًا. حاوية CLP2 تحفظ الاسم والنوع الأصليين وتدعم الملفات الثنائية.';return;
  }
  const v2=data.length>=34&&data[0]===67&&data[1]===76&&data[2]===80&&data[3]===50;
  if(v2){
   const metaLen=new DataView(data.buffer,data.byteOffset,data.byteLength).getUint16(32,false),headerLen=34+metaLen;
   if(data.length<=headerLen+16)throw Error('Invalid CLP2');
   const meta=JSON.parse(new TextDecoder().decode(data.slice(34,headerLen))),salt=data.slice(4,20),iv=data.slice(20,32),header=data.slice(0,headerLen);
   const key=await deriveFileV2Key(pass,salt),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:header,tagLength:128},key,data.slice(headerLen));
   downloadBinary(new Uint8Array(plain),meta.name||'restored-file',meta.type||'application/octet-stream');status.textContent='تم فك التشفير والتحقق من سلامة الملف واستعادة اسمه ونوعه.';return;
  }
  // Legacy CLP1 compatibility: old text-only files used 100,000 PBKDF2 iterations.
  const raw=atob(new TextDecoder().decode(data).trim()),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  if(bytes.length<29)throw Error('Invalid legacy file');
  const salt=bytes.slice(0,16),iv=bytes.slice(16,28),key=await deriveNativeKey(pass,salt);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,bytes.slice(28));
  downloadBinary(new Uint8Array(plain),file.name.replace(/\.enc$/i,'')||'restored_file.txt','text/plain;charset=utf-8');status.textContent='تم فك تشفير ملف CLP1 النصي القديم بنجاح.';
 }catch(e){status.textContent='تعذرت المعالجة: تحقق من كلمة المرور وصحة الملف. الملف لا يُرفع إلى خادم.';}
}
