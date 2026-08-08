/* ═══════════════════════════════════════════════
   CONFIG
   ─ يستخدم PeerJS للـ WebRTC (الفيديو/الصوت)
   ─ يستخدم Supabase Broadcast للـ Signaling والدردشة
═══════════════════════════════════════════════ */
const SUPA_URL = 'https://fjiyckxmtksmqhyllirt.supabase.co';
const SUPA_KEY = 'sb_publishable_j2r_CQ1zaGOj2geMRctGeA_VHczbw0l';

// PeerJS يستخدم خادم PeerJS العام المجاني للـ ICE/STUN
// لزيادة الموثوقية نضيف STUN servers من Google + Twilio
// ملاحظة: STUN فقط لا يكفي خلف بعض أنواع NAT/الجدران النارية المتماثلة (symmetric NAT)؛
// للحصول على موثوقية أعلى في الشبكات المؤسسية يفضّل إضافة خادم TURN (راجع ملاحظات README)
const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

const COLORS = [
  ['#0E2A24','#8FB8A6'],['#8FB8A6','#0E2A24'],
  ['#2d6a4f','#fff'],  ['#1b4332','#8FB8A6'],
  ['#40916c','#fff'],  ['#52b788','#0E2A24'],
];
function col(i) { return COLORS[i % COLORS.length]; }
