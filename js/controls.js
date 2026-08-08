/* ═══════════════════════════════════════════════
   MIC / CAMERA CONTROLS
═══════════════════════════════════════════════ */
function toggleMic() {
  S.micOn = !S.micOn;
  if (S.localStream) S.localStream.getAudioTracks().forEach(t => t.enabled = S.micOn);
  const btn = document.getElementById('mic-btn');
  btn.className = 'ctrl-btn ' + (S.micOn ? 'on' : 'off');
  btn.querySelector('i').setAttribute('data-lucide', S.micOn ? 'mic' : 'mic-off');
  renderMyTile();
  lucide.createIcons();
  broadcastMediaState();
  toast(S.micOn ? 'الميكروفون مفعّل' : 'الميكروفون مكتوم', 'info');
}

function toggleCam() {
  S.camOn = !S.camOn;
  if (S.localStream) S.localStream.getVideoTracks().forEach(t => t.enabled = S.camOn);
  const btn = document.getElementById('cam-btn');
  btn.className = 'ctrl-btn ' + (S.camOn ? 'on' : 'off');
  btn.querySelector('i').setAttribute('data-lucide', S.camOn ? 'video' : 'video-off');
  renderMyTile();
  lucide.createIcons();
  broadcastMediaState();
  toast(S.camOn ? 'الكاميرا مفعّلة' : 'الكاميرا معطّلة', 'info');
}

/* ═══════════════════════════════════════════════
   SCREEN SHARE
   إصلاح: التحقق من وجود video sender فعلي قبل استدعاء replaceTrack،
   لأن المتصل الذي انضم بدون كاميرا لا يملك video sender أصلاً فكانت العملية تفشل بصمت.
═══════════════════════════════════════════════ */
async function toggleScreen() {
  if (!S.screenOn) {
    try {
      S.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      S.screenOn = true;
      document.getElementById('screen-btn').className = 'ctrl-btn screen-on';
      S.screenStream.getVideoTracks()[0].onended = stopScreen;

      replaceOutgoingVideoTrack(S.screenStream.getVideoTracks()[0]);

      addScreenTile();
      toast('مشاركة الشاشة بدأت', 'ok');
    } catch(e) { toast('تم إلغاء مشاركة الشاشة', 'warn'); }
  } else { stopScreen(); }
}

function stopScreen() {
  if (S.screenStream) S.screenStream.getTracks().forEach(t => t.stop());
  S.screenStream = null; S.screenOn = false;
  document.getElementById('screen-btn').className = 'ctrl-btn';

  // restore camera track (if we have one)
  const camTrack = S.localStream ? S.localStream.getVideoTracks()[0] : null;
  if (camTrack) replaceOutgoingVideoTrack(camTrack);

  removeScreenTile();
  toast('تم إيقاف مشاركة الشاشة', 'info');
}

// helper: يستبدل مسار الفيديو الصادر في كل الاتصالات النشطة،
// ويتجاهل بأمان أي اتصال ليس له video sender بعد (بدل الفشل الصامت السابق)
function replaceOutgoingVideoTrack(newTrack) {
  Object.values(S.calls).forEach(call => {
    const pc = call.peerConnection;
    if (!pc) return;
    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
    if (sender) {
      sender.replaceTrack(newTrack).catch(err => console.warn('replaceTrack failed:', err));
    }
  });
}

function addScreenTile() {
  const grid = document.getElementById('v-grid');
  let tile = document.getElementById('tile-screen');
  if (!tile) { tile = document.createElement('div'); tile.id = 'tile-screen'; grid.prepend(tile); }
  tile.className = 'video-tile screen-tile';
  tile.innerHTML = '';
  const vid = document.createElement('video');
  vid.autoplay = true; vid.muted = true; vid.playsInline = true;
  vid.srcObject = S.screenStream;
  tile.appendChild(vid);
  const badge = document.createElement('div');
  badge.className = 'screen-badge';
  badge.textContent = 'مشاركة الشاشة';
  tile.appendChild(badge);
}

function removeScreenTile() {
  const t = document.getElementById('tile-screen');
  if (t) t.remove();
}

/* ═══════════════════════════════════════════════
   SIDEBAR / TABS
═══════════════════════════════════════════════ */
function toggleSidebar() {
  S.sidebarOpen = !S.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !S.sidebarOpen);
  document.getElementById('sidebar-btn').className = 'ctrl-btn ' + (S.sidebarOpen ? 'on' : '');
}

function togglePeople() { switchTab('people'); if (!S.sidebarOpen) toggleSidebar(); }

function switchTab(tab) {
  S.activeTab = tab;
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.stab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-'+tab+'-btn').classList.add('active');
  document.getElementById('panel-'+tab).classList.add('active');
  if (tab === 'chat') { S.unread = 0; updateBadge(); }
}

function updateBadge() {
  const b = document.getElementById('chat-badge');
  b.textContent = S.unread;
  b.className = 'tab-badge' + (S.unread > 0 ? ' show' : '');
}
