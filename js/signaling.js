/* ═══════════════════════════════════════════════
   SUPABASE BROADCAST SIGNALING + CHAT
   ─ نستخدم Broadcast (لا يحتاج جداول) للإشارات
═══════════════════════════════════════════════ */
function initSignaling() {
  try {
    // إصلاح: إعادة استخدام عميل Supabase الموجود أصلاً من auth.js
    // (تم إنشاؤه بالفعل عند تسجيل الدخول/الإقلاع) بدل إنشاء عميل مكرر بلا داعٍ.
    S.sb = getAuthClient();
  } catch(e) {
    toast('Supabase غير متاح — وضع محلي', 'warn');
    initPeer(); // use PeerJS alone
    return;
  }

  const channelName = `ecospace:${S.roomCode}`;
  S.signalChannel = S.sb.channel(channelName, {
    config: { broadcast: { self: false } }
  });

  S.signalChannel
    // someone joined → they announce themselves
    .on('broadcast', { event: 'user-joined' }, ({ payload }) => {
      if (payload.peerId === S.myPeerId) return;
      handleUserJoined(payload);
    })
    // someone left
    .on('broadcast', { event: 'user-left' }, ({ payload }) => {
      handleUserLeft(payload.peerId);
    })
    // chat message
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      if (payload.peerId === S.myPeerId) return;
      receiveChatMsg(payload);
    })
    // mic/cam state update
    .on('broadcast', { event: 'media-state' }, ({ payload }) => {
      if (payload.peerId === S.myPeerId) return;
      if (S.participants[payload.peerId]) {
        S.participants[payload.peerId].micOn = payload.micOn;
        S.participants[payload.peerId].camOn = payload.camOn;
        renderPeople();
        updateVideoTagForPeer(payload.peerId);
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        initPeer();
      } else if (status === 'CHANNEL_ERROR') {
        toast('خطأ في Supabase — وضع محلي', 'warn');
        initPeer();
      }
    });
}

function announcePresence() {
  if (!S.signalChannel) return;
  S.signalChannel.send({
    type: 'broadcast',
    event: 'user-joined',
    payload: {
      peerId: S.myPeerId,
      name: S.myName,
      micOn: S.micOn,
      camOn: !!(S.localStream && S.localStream.getVideoTracks().length > 0),
      colorIdx: 0
    }
  });
}

/* ═══════════════════════════════════════════════
   BROADCAST MEDIA STATE TO PEERS
═══════════════════════════════════════════════ */
function broadcastMediaState() {
  const payload = { type: 'media-state', micOn: S.micOn, camOn: S.camOn, peerId: S.myPeerId };
  if (S.signalChannel) {
    S.signalChannel.send({ type: 'broadcast', event: 'media-state', payload });
  }
  Object.values(S.dataConns).forEach(conn => { try { conn.send(payload); } catch(e){} });
}
