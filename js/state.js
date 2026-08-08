/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
const S = {
  myName: '',
  roomName: '',
  roomCode: '',
  myPeerId: null,        // PeerJS peer ID
  micOn: true,
  camOn: true,
  screenOn: false,
  sidebarOpen: true,
  activeTab: 'chat',
  localStream: null,
  screenStream: null,
  peer: null,            // PeerJS Peer instance
  calls: {},             // peerId -> MediaConnection
  dataConns: {},         // peerId -> DataConnection (for chat + signaling)
  participants: {},      // peerId -> { name, micOn, camOn, colorIdx }
  messages: [],
  unread: 0,
  permGranted: false,
  sb: null,
  signalChannel: null,   // Supabase Broadcast channel
  colorCounter: 1,
  reconnectAttempts: 0,  // track failed reconnects to avoid infinite loop
  currentUser: null,     // Supabase auth user object, if logged in
  isGuest: false,        // true if continuing without an account
};

/* مفتاح sessionStorage المستخدم لاستعادة الجلسة داخل الغرفة بعد تحديث الصفحة.
   يُخزَّن هنا فقط الحد الأدنى (اسم + كود الغرفة)، وليس أي معرّفات اتصال حية،
   لأن اتصالات WebRTC/PeerJS نفسها لا يمكن أن تنجو من إعادة تحميل الصفحة —
   ما يمكن فعله هو إعادة الانضمام التلقائي والفوري لنفس الغرفة دون تدخل المستخدم. */
const ROOM_SESSION_KEY = 'eco_room_session';

function saveRoomSession() {
  sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify({
    roomCode: S.roomCode,
    roomName: S.roomName,
    myName: S.myName,
  }));
}

function clearRoomSession() {
  sessionStorage.removeItem(ROOM_SESSION_KEY);
}

function getRoomSession() {
  try {
    const raw = sessionStorage.getItem(ROOM_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
