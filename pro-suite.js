/* CryptoLab Pro Professional Workspace Suite — browser-only educational tools. */
(function () {
 "use strict";
 const $ = id => document.getElementById(id), enc = new TextEncoder(), dec = new TextDecoder();
 const state = { rsa: null };
 const hex = b => Array.from(b, x => x.toString(16).padStart(2,"0")).join("");
 const toB64 = b => { let s=""; for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768)); return btoa(s); };
 const fromB64 = s => Uint8Array.from(atob(s.replace(/\s+/g,"")), c=>c.charCodeAt(0));
 function fromHex(s){s=s.replace(/\s+/g,"");if(!s||s.length%2||!/^[0-9a-f]+$/i.test(s))throw Error("Invalid Hex");return Uint8Array.from(s.match(/.{2}/g),x=>parseInt(x,16));}
 function status(id,msg,type){const e=$(id);if(e){e.textContent=msg;e.dataset.state=type||"info";}}
 window.cryptoLabCopy=async id=>{const e=$(id),v=e?(("value" in e)?e.value:e.textContent):"";if(!v||v==="—")return;try{await navigator.clipboard.writeText(v);const b=document.activeElement;if(b&&b.classList.contains("copy-btn")){const old=b.textContent;b.textContent="تم النسخ ✓";setTimeout(()=>b.textContent=old,1300);}}catch(_){window.prompt("انسخ النص:",v);}};
 window.cryptoLabToggleTheme=()=>{const on=document.body.classList.toggle("light-theme");try{localStorage.setItem("cryptolab-theme",on?"light":"dark");}catch(_){}};
 try{if(localStorage.getItem("cryptolab-theme")==="light")document.body.classList.add("light-theme");}catch(_){}
 window.cryptoLabGeneratePassword=()=>{
  const n=Math.max(12,Math.min(64,Number($("clp-password-length").value)||24)),sym=$("clp-password-symbols").checked;
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"+(sym?"!@#$%^&*()-_=+[]{}:,.?":"");
  const max=Math.floor(256/chars.length)*chars.length;let out="";
  while(out.length<n){const a=crypto.getRandomValues(new Uint8Array(n*2));for(const x of a)if(x<max&&out.length<n)out+=chars[x%chars.length];}
  $("clp-generated-password").textContent=out;$("clp-password-check").value="";window.cryptoLabCheckPassword();
 };
 window.cryptoLabCheckPassword=()=>{
  const v=$("clp-password-check").value,f=$("clp-strength-fill"),l=$("clp-strength-label");
  if(!v){f.style.width="0%";l.textContent="لا يتم إرسال كلمة المرور أو حفظها.";return;}
  let pool=0;if(/[a-z]/.test(v))pool+=26;if(/[A-Z]/.test(v))pool+=26;if(/[0-9]/.test(v))pool+=10;if(/[^A-Za-z0-9]/.test(v))pool+=32;
  const entropy=v.length*Math.log2(Math.max(pool,1));let score=entropy<35?1:entropy<60?2:entropy<85?3:4;if(v.length<10)score=Math.min(score,1);
  f.style.width=(score*25)+"%";l.textContent=["ضعيفة جدًا","ضعيفة","متوسطة","قوية"][score-1]+" · تقدير تقريبي "+Math.round(entropy)+" bits. لا يفحص كلمات المرور المسرّبة.";
 };
 window.cryptoLabRandomBytes=()=>{const n=Math.max(1,Math.min(64,Number($("clp-random-size").value)||32)),b=crypto.getRandomValues(new Uint8Array(n));$("clp-random-hex").textContent=hex(b);$("clp-random-b64").textContent=toB64(b);};
 window.cryptoLabCreateHmac=async()=>{
  const m=$("clp-hmac-message").value,k=$("clp-hmac-key").value;if(!m||!k){status("clp-hmac-status","أدخل الرسالة والمفتاح السري أولًا.","error");return;}
  try{const key=await crypto.subtle.importKey("raw",enc.encode(k),{name:"HMAC",hash:"SHA-256"},false,["sign"]),tag=await crypto.subtle.sign("HMAC",key,enc.encode(m));$("clp-hmac-tag").value=hex(new Uint8Array(tag));status("clp-hmac-status","تم إنشاء HMAC-SHA-256 محليًا. احتفظ بالمفتاح سرًا.","success");}catch(_){status("clp-hmac-status","تعذر إنشاء HMAC. استخدم HTTPS أو localhost.","error");}
 };
 window.cryptoLabVerifyHmac=async()=>{
  const m=$("clp-hmac-message").value,k=$("clp-hmac-key").value,t=$("clp-hmac-tag").value;if(!m||!k||!t){status("clp-hmac-status","أدخل الرسالة والمفتاح ورمز HMAC.","error");return;}
  try{const key=await crypto.subtle.importKey("raw",enc.encode(k),{name:"HMAC",hash:"SHA-256"},false,["verify"]),ok=await crypto.subtle.verify("HMAC",key,fromHex(t),enc.encode(m));status("clp-hmac-status",ok?"صحيح: الرسالة تطابق رمز HMAC.":"فشل التحقق: الرسالة أو المفتاح أو الرمز غير مطابق.",ok?"success":"error");}catch(_){status("clp-hmac-status","صيغة HMAC غير صحيحة أو تعذر التحقق.","error");}
 };
 window.cryptoLabGenerateRSA=async()=>{
  status("clp-rsa-status","جارٍ توليد زوج مفاتيح RSA-2048...","info");
  try{state.rsa=await crypto.subtle.generateKey({name:"RSA-OAEP",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},false,["encrypt","decrypt"]);$("clp-rsa-indicator").classList.add("ready-dot");$("clp-rsa-state").textContent="زوج مفاتيح مؤقت جاهز في ذاكرة الجلسة";status("clp-rsa-status","تم إنشاء زوج المفاتيح. يمكنك تشفير رسالة قصيرة.","success");}
  catch(_){state.rsa=null;$("clp-rsa-indicator").classList.remove("ready-dot");$("clp-rsa-state").textContent="تعذر إنشاء المفاتيح";status("clp-rsa-status","تعذر استخدام Web Crypto. افتح المختبر عبر HTTPS أو localhost.","error");}
 };
 window.cryptoLabRSAEncrypt=async()=>{
  if(!state.rsa){status("clp-rsa-status","أنشئ زوج المفاتيح أولًا.","error");return;}const b=enc.encode($("clp-rsa-plaintext").value);if(!b.length){status("clp-rsa-status","اكتب رسالة قصيرة للتشفير.","error");return;}if(b.length>190){status("clp-rsa-status","الرسالة طويلة. الحد التقريبي 190 بايت مع RSA-2048 وOAEP-SHA-256.","error");return;}
  try{const c=await crypto.subtle.encrypt({name:"RSA-OAEP"},state.rsa.publicKey,b);$("clp-rsa-cipher").value=toB64(new Uint8Array(c));status("clp-rsa-status","تم التشفير بالمفتاح العام.","success");}catch(_){status("clp-rsa-status","فشل التشفير. تحقق من حالة المفاتيح.","error");}
 };
 window.cryptoLabRSADecrypt=async()=>{
  if(!state.rsa){status("clp-rsa-status","زوج المفاتيح غير موجود. أنشئه مجددًا.","error");return;}
  try{const p=await crypto.subtle.decrypt({name:"RSA-OAEP"},state.rsa.privateKey,fromB64($("clp-rsa-cipher").value));$("clp-rsa-plaintext").value=dec.decode(p);status("clp-rsa-status","نجاح: تم فك التشفير بالمفتاح الخاص داخل الجلسة.","success");}catch(_){status("clp-rsa-status","تعذر فك التشفير. تحقق من النص المشفر وأن الزوج هو نفسه.","error");}
 };
 window.cryptoLabEncode=()=>{
  const v=$("clp-encoding-input").value,m=$("clp-encoding-mode").value;try{$("clp-encoding-output").value=m==="base64"?toB64(enc.encode(v)):m==="hex"?hex(enc.encode(v)):encodeURIComponent(v);status("clp-encoding-status","اكتمل الترميز. الترميز لا يوفّر السرية.","success");}catch(_){status("clp-encoding-status","تعذر ترميز النص.","error");}
 };
 window.cryptoLabDecode=()=>{
  const v=$("clp-encoding-input").value,m=$("clp-encoding-mode").value;try{$("clp-encoding-output").value=m==="base64"?dec.decode(fromB64(v)):m==="hex"?dec.decode(fromHex(v)):decodeURIComponent(v);status("clp-encoding-status","اكتمل فك الترميز.","success");}catch(_){status("clp-encoding-status","تعذر فك الترميز. تحقق من المدخلات ونوع الترميز.","error");}
 };
 window.cryptoLabSwapEncoding=()=>{$("clp-encoding-input").value=$("clp-encoding-output").value;$("clp-encoding-output").value="";status("clp-encoding-status","تم نقل الناتج إلى حقل الإدخال.","info");};
 function installFileHash(){
  const panel=$("files");if(!panel||$("clp-file-integrity"))return;
  const box=document.createElement("div");box.id="clp-file-integrity";box.className="analysis-card pro-integrity";
  box.innerHTML='<div class="analysis-heading"><strong>بصمة الملف والتحقق من سلامته</strong><span>SHA-256 FILE CHECKSUM</span></div><p>احسب بصمة SHA-256 للملف محليًا، ثم قارنها بقيمة موثوقة من مصدر مستقل.</p><div class="integrity-actions"><button class="btn btn-alt" type="button" id="clp-file-hash">حساب بصمة الملف</button><input id="clp-file-expected" type="text" placeholder="ألصق بصمة SHA-256 المتوقعة للتحقق"></div><div class="secure-output"><code id="clp-file-digest">لم تُحسب البصمة بعد</code><button class="copy-btn" type="button" id="clp-file-copy">نسخ</button></div><div id="clp-file-status" class="result-banner" aria-live="polite">اختر ملفًا أولًا من أداة تشفير الملفات أعلاه.</div>';
  panel.appendChild(box);$("clp-file-copy").addEventListener("click",()=>window.cryptoLabCopy("clp-file-digest"));
  $("clp-file-hash").addEventListener("click",async()=>{
   const f=$("file-input").files&&$("file-input").files[0];if(!f){status("clp-file-status","اختر ملفًا من الحقل أعلاه أولًا.","error");return;}
   try{status("clp-file-status","جارٍ حساب البصمة محليًا...","info");const d=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",await f.arrayBuffer())));$("clp-file-digest").textContent=d;const expected=$("clp-file-expected").value.trim().toLowerCase().replace(/\s+/g,"");if(expected)status("clp-file-status",expected===d?"مطابقة: الملف يطابق البصمة المتوقعة.":"غير مطابق: بصمة الملف تختلف عن القيمة المدخلة.",expected===d?"success":"error");else status("clp-file-status","تم حساب البصمة. أدخل بصمة موثوقة للمقارنة.","success");}
   catch(_){status("clp-file-status","تعذر حساب البصمة لهذا الملف.","error");}
  });
  $("clp-file-expected").addEventListener("input",()=>{const d=$("clp-file-digest").textContent,e=$("clp-file-expected").value.trim().toLowerCase().replace(/\s+/g,"");if(/^[0-9a-f]{64}$/.test(d)&&e.length===64)status("clp-file-status",d===e?"مطابقة: الملف يطابق البصمة المتوقعة.":"غير مطابق: بصمة الملف تختلف عن القيمة المدخلة.",d===e?"success":"error");});
 }
 document.addEventListener("DOMContentLoaded",installFileHash);if(document.readyState!=="loading")installFileHash();
})();