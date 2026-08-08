/* ═══════════════════════════════════════════════
   CHAT
═══════════════════════════════════════════════ */
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}
function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 90) + 'px'; }

function sendMessage() {
  const inp = document.getElementById('chat-input');
  const text = inp.value.trim();
  if (!text) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'});
  const msg = { id: Date.now(), sender: S.myName, text, time: timeStr, isMe: true, colorIdx: 0 };
  S.messages.push(msg);
  inp.value = ''; inp.style.height = 'auto';
  renderMessages();

  const payload = { type: 'chat', sender: S.myName, text, time: timeStr, peerId: S.myPeerId };

  // Send via Supabase broadcast
  if (S.signalChannel) {
    S.signalChannel.send({ type: 'broadcast', event: 'chat', payload });
  }

  // Also send via PeerJS data connections (fallback)
  Object.values(S.dataConns).forEach(conn => { try { conn.send(payload); } catch(e){} });
}

function receiveChatMsg(payload) {
  const p = S.participants[payload.peerId];
  const colorIdx = p ? p.colorIdx : 1;
  S.messages.push({
    id: Date.now(),
    sender: payload.sender || p?.name || 'مشترك',
    text: payload.text,
    time: payload.time || new Date().toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'}),
    isMe: false,
    colorIdx
  });
  renderMessages();
  if (S.activeTab !== 'chat') { S.unread++; updateBadge(); }
}

function addSysMsg(text) {
  const el = document.getElementById('chat-messages');
  const d = document.createElement('div');
  d.className = 'chat-sys'; d.textContent = text;
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
}

function renderMessages() {
  const el = document.getElementById('chat-messages');
  el.querySelectorAll('.msg').forEach(m => m.remove());
  S.messages.forEach(m => {
    const [bg,fg] = col(m.colorIdx ?? 0);
    const d = document.createElement('div');
    d.className = 'msg' + (m.isMe ? ' self' : '');
    d.innerHTML = `
      <div class="msg-av" style="background:${bg};color:${fg}">${m.sender.charAt(0)}</div>
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-sender">${m.sender}</span>
          <span class="msg-time">${m.time}</span>
        </div>
        <div class="msg-bubble">${esc(m.text)}</div>
      </div>`;
    el.appendChild(d);
  });
  el.scrollTop = el.scrollHeight;
}
