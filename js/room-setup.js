/* ═══════════════════════════════════════════════
   ROOM CODE & LINK
═══════════════════════════════════════════════ */
function genCode() { return Math.random().toString(36).slice(2,10); }

// إصلاح: الاعتماد أولاً على استخراج معامل ?r= عبر URL API الحقيقي
// (أكثر موثوقية من القص اليدوي بالسلاسل النصية)، مع دعم صيغة /r/ ونسخ الكود المجرد كحل احتياطي فقط.
function extractCode(str) {
  str = str.trim();
  try {
    const url = new URL(str);
    const r = url.searchParams.get('r');
    if (r) return r;
    const parts = url.pathname.split('/').filter(Boolean);
    const rIdx = parts.indexOf('r');
    if (rIdx !== -1 && parts[rIdx + 1]) return parts[rIdx + 1];
  } catch (e) {
    // ليس رابطاً كاملاً (URL) صالحاً — على الأرجح كود مجرد أُدخل يدوياً
  }
  // كحل أخير: افترض أن المستخدم لصق الكود مباشرة (بدون رابط)
  return str.replace(/[^a-z0-9]/gi, '').slice(-8);
}

/* ═══════════════════════════════════════════════
   CREATE ROOM
═══════════════════════════════════════════════ */
async function createRoom() {
  const name = document.getElementById('c-name').value.trim();
  const roomLabel = document.getElementById('c-room').value.trim() || 'غرفة Econovo';
  if (!name) { showStatus('create','أدخل اسمك أولاً','err'); return; }

  const btn = document.getElementById('create-btn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle"></span> جارٍ الإنشاء…';

  S.myName = name;
  S.roomName = roomLabel;
  S.roomCode = genCode();

  const link = `${location.origin}${location.pathname}?r=${S.roomCode}`;
  document.getElementById('link-text').textContent = link;
  document.getElementById('room-link-box').style.display = 'block';
  showStatus('create','✓ الغرفة جاهزة — شارك الرابط أدناه','ok');

  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="check" width="16" height="16"></i> جاهز';
  lucide.createIcons();

  setTimeout(() => { closeModal('create'); enterRoom(); }, 1500);
}

/* ═══════════════════════════════════════════════
   JOIN ROOM
═══════════════════════════════════════════════ */
async function joinRoom() {
  const name = document.getElementById('j-name').value.trim();
  const link = document.getElementById('j-link').value.trim();
  if (!name) { showStatus('join','أدخل اسمك','err'); return; }
  if (!link) { showStatus('join','أدخل رابط الغرفة','err'); return; }

  const code = extractCode(link);
  if (!code) { showStatus('join','تعذّر قراءة رابط الغرفة، تأكد من صحته','err'); return; }

  S.myName = name;
  S.roomCode = code;
  S.roomName = 'غرفة مشتركة';

  closeModal('join');
  enterRoom();
}

/* ═══════════════════════════════════════════════
   ENTER ROOM — the main setup
═══════════════════════════════════════════════ */
async function enterRoom() {
  document.getElementById('landing').classList.remove('active');
  document.getElementById('room').classList.add('active');
  document.getElementById('rh-name').textContent = S.roomName;

  // add self to participants
  S.participants = {};
  S.messages = [];

  // Try to get media if not yet acquired
  if (!S.localStream) {
    try {
      S.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch(e) {
      try { S.localStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch(e2) { /* no media available at all — proceed audio/video-less */ }
    }
  }

  renderMyTile();
  addSysMsg(`أهلاً ${S.myName}! انضممت إلى الغرفة`);

  // إصلاح "التحديث يخرجك من الغرفة": نحفظ الحد الأدنى من بيانات الجلسة
  // كي تُستأنف تلقائياً عند إعادة تحميل الصفحة (راجع main.js → resumeRoomIfNeeded)
  saveRoomSession();

  // init Supabase for signaling & chat
  initSignaling();

  lucide.createIcons();
}

/* إعادة الدخول التلقائي بعد تحديث الصفحة — نفس enterRoom لكن دون التنقل من
   شاشة landing (لأننا أصلاً لم نمر بها) ومع رسالة توضيحية للمستخدم. */
async function resumeRoom(session) {
  S.roomCode = session.roomCode;
  S.roomName = session.roomName;
  S.myName = session.myName;

  document.getElementById('auth').classList.remove('active');
  document.getElementById('landing').classList.remove('active');
  document.getElementById('room').classList.add('active');
  document.getElementById('rh-name').textContent = S.roomName;

  S.participants = {};
  S.messages = [];

  try {
    S.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch(e) {
    try { S.localStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch(e2) { /* لا وسائط متاحة — نتابع بدونها */ }
  }

  renderMyTile();
  addSysMsg(`تم تحديث الصفحة — أعدنا انضمامك تلقائياً إلى "${S.roomName}"`);
  toast('تمت استعادة الغرفة بعد التحديث ✓', 'ok');

  initSignaling();
  lucide.createIcons();
}

/* ═══════════════════════════════════════════════
   SHARE / LEAVE
═══════════════════════════════════════════════ */
function shareRoomLink() {
  const link = `${location.origin}${location.pathname}?r=${S.roomCode}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => toast('تم نسخ الرابط! 🔗', 'ok'));
  } else {
    prompt('انسخ رابط الغرفة:', link);
  }
}

function copyLink() {
  const t = document.getElementById('link-text').textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('تم النسخ', 'ok'));
}

async function leaveRoom() {
  // notify others
  if (S.signalChannel && S.myPeerId) {
    try {
      await S.signalChannel.send({
        type: 'broadcast',
        event: 'user-left',
        payload: { peerId: S.myPeerId, name: S.myName }
      });
    } catch(e) { /* channel may already be closing — safe to ignore */ }
    S.sb.removeChannel(S.signalChannel);
    S.signalChannel = null;
  }

  // close all calls / data connections
  Object.values(S.calls).forEach(c => { try { c.close(); } catch(e){} });
  Object.values(S.dataConns).forEach(c => { try { c.close(); } catch(e){} });
  if (S.peer) { S.peer.destroy(); S.peer = null; }
  if (S.localStream) { S.localStream.getTracks().forEach(t => t.stop()); S.localStream = null; }
  if (S.screenStream) { S.screenStream.getTracks().forEach(t => t.stop()); S.screenStream = null; }

  // reset state
  Object.assign(S, {
    participants: {}, messages: [], calls: {}, dataConns: {},
    micOn: true, camOn: true, screenOn: false, myPeerId: null,
    unread: 0, colorCounter: 1, reconnectAttempts: 0
  });

  // reset UI
  document.getElementById('v-grid').innerHTML = '';
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('ppl-list').innerHTML = '';
  document.getElementById('mic-btn').className = 'ctrl-btn on';
  document.getElementById('cam-btn').className = 'ctrl-btn on';
  document.getElementById('screen-btn').className = 'ctrl-btn';
  hideBanner();

  clearRoomSession();

  document.getElementById('room').classList.remove('active');
  document.getElementById('landing').classList.add('active');
  toast('غادرت المساحة', 'info');
}

/* ═══════════════════════════════════════════════
   AUTO JOIN FROM URL
═══════════════════════════════════════════════ */
function checkUrlParams() {
  const params = new URLSearchParams(location.search);
  const code = params.get('r');
  if (code) {
    document.getElementById('j-link').value = `${location.origin}${location.pathname}?r=${code}`;
    setTimeout(() => openModal('join'), 600);
  }
}
