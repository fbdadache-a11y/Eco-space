/* ═══════════════════════════════════════════════
   PEERJS SETUP
═══════════════════════════════════════════════ */
function initPeer() {
  showBanner('connecting', 'جارٍ الاتصال بالشبكة…');

  // generate a unique peer ID based on room + random
  const peerId = `eco-${S.roomCode}-${Math.random().toString(36).slice(2,8)}`;
  S.myPeerId = peerId;

  S.peer = new Peer(peerId, PEER_CONFIG);

  S.peer.on('open', (id) => {
    S.myPeerId = id;
    S.reconnectAttempts = 0;
    showBanner('connected', 'متصل — بانتظار الآخرين');
    setTimeout(() => hideBanner(), 3000);

    // announce presence via Supabase
    announcePresence();

    toast(`متصل! معرّفك: ${id.slice(0,16)}…`, 'ok');
  });

  // incoming CALL (video/audio)
  S.peer.on('call', (call) => {
    call.answer(S.localStream || undefined);
    handleIncomingCall(call);
  });

  // incoming DATA connection (signaling from another peer)
  S.peer.on('connection', (conn) => {
    handleDataConnection(conn);
  });

  S.peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    if (err.type === 'peer-unavailable') {
      toast('المستخدم غير متاح حالياً', 'warn');
    } else if (err.type === 'network' || err.type === 'server-error') {
      showBanner('error', 'خطأ في الاتصال — يرجى التحقق من الإنترنت');
    }
  });

  S.peer.on('disconnected', () => {
    // إصلاح: تفادي حلقة إعادة اتصال لا نهائية إذا فشل السيرفر بشكل متكرر
    S.reconnectAttempts++;
    if (S.reconnectAttempts > 5) {
      showBanner('error', 'تعذّر إعادة الاتصال — أعد تحميل الصفحة');
      return;
    }
    showBanner('error', 'انقطع الاتصال — جارٍ إعادة المحاولة…');
    if (S.peer && !S.peer.destroyed) S.peer.reconnect();
  });
}

/* ═══════════════════════════════════════════════
   HANDLE USER JOINED (from Supabase broadcast)
═══════════════════════════════════════════════ */
function handleUserJoined(payload) {
  const { peerId, name, micOn, camOn } = payload;
  if (S.participants[peerId]) return; // already known

  S.participants[peerId] = {
    name, peerId,
    micOn: micOn !== false,
    camOn: camOn !== false,
    colorIdx: S.colorCounter++,
    stream: null
  };

  addSysMsg(`${name} انضم إلى الغرفة`);
  renderPeople();
  updateCount();

  // إصلاح: تجنّب الاتصال المزدوج — كلا الطرفين يستقبلان "user-joined" من بعضهما
  // فقد يتصل كل واحد بالآخر بنفس الوقت وينتج قناتان متوازيتان لنفس الشخص.
  // نحسم الأمر بمقارنة نصية بسيطة للمعرّفات (تعمل بنفس الطريقة على الطرفين):
  // فقط صاحب المعرّف "الأكبر" أبجدياً هو من يبادر بالاتصال.
  if (S.peer && S.myPeerId && S.myPeerId > peerId) {
    setTimeout(() => callPeer(peerId), 400);
  }

  // Also announce ourselves to them so they know we exist
  announcePresence();
}

/* ═══════════════════════════════════════════════
   CALL A PEER
═══════════════════════════════════════════════ */
function callPeer(peerId) {
  if (S.calls[peerId]) return; // already calling
  if (!S.peer) return;

  const call = S.peer.call(peerId, S.localStream || undefined);
  if (!call) return; // e.g. peer not open yet
  S.calls[peerId] = call;
  handleIncomingCall(call);
  toast(`جارٍ الاتصال بـ ${S.participants[peerId]?.name || 'مشترك'}…`, 'info');
}

/* ═══════════════════════════════════════════════
   HANDLE INCOMING CALL
═══════════════════════════════════════════════ */
function handleIncomingCall(call) {
  S.calls[call.peer] = call;

  call.on('stream', (remoteStream) => {
    const peerId = call.peer;
    if (!S.participants[peerId]) {
      // unknown peer — create entry
      S.participants[peerId] = {
        name: 'مشترك',
        peerId,
        micOn: true,
        camOn: true,
        colorIdx: S.colorCounter++,
        stream: remoteStream
      };
    } else {
      S.participants[peerId].stream = remoteStream;
    }
    renderPeerTile(peerId);
    renderPeople();
    updateCount();
    toast(`${S.participants[peerId].name} متصل بالفيديو ✓`, 'ok');
  });

  call.on('close', () => {
    delete S.calls[call.peer];
    if (S.participants[call.peer]) {
      S.participants[call.peer].stream = null;
      renderPeerTile(call.peer);
    }
  });

  call.on('error', (err) => {
    console.error('Call error:', err);
  });
}

/* ═══════════════════════════════════════════════
   HANDLE DATA CONNECTION
═══════════════════════════════════════════════ */
function handleDataConnection(conn) {
  S.dataConns[conn.peer] = conn;
  conn.on('data', (data) => {
    if (data.type === 'chat') receiveChatMsg({ ...data, peerId: conn.peer });
    if (data.type === 'media-state') {
      if (S.participants[conn.peer]) {
        S.participants[conn.peer].micOn = data.micOn;
        S.participants[conn.peer].camOn = data.camOn;
        renderPeople();
      }
    }
  });
}

/* ═══════════════════════════════════════════════
   HANDLE USER LEFT
═══════════════════════════════════════════════ */
function handleUserLeft(peerId) {
  const p = S.participants[peerId];
  if (p) {
    addSysMsg(`${p.name} غادر الغرفة`);
    delete S.participants[peerId];
  }
  if (S.calls[peerId]) { S.calls[peerId].close(); delete S.calls[peerId]; }
  if (S.dataConns[peerId]) { S.dataConns[peerId].close(); delete S.dataConns[peerId]; }
  removePeerTile(peerId);
  renderPeople();
  updateCount();
}
