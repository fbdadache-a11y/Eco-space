/* ═══════════════════════════════════════════════
   INIT
   تسلسل الإقلاع:
   1. تحقق من جلسة غرفة محفوظة (سبق ودخل المستخدم غرفة، ثم حدّث الصفحة)
      → إن وُجدت: أعد الانضمام تلقائياً وفوراً، متجاوزين auth/landing بالكامل.
   2. وإلا: تحقق من جلسة حساب Supabase أو اسم ضيف محفوظ → اذهب لـ landing.
   3. وإلا: اعرض شاشة auth.
═══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const roomSession = getRoomSession();
  if (roomSession && roomSession.roomCode) {
    await resumeRoom(roomSession);
    lucide.createIcons();
    return;
  }

  const destination = await bootstrapAuth();
  document.getElementById(destination).classList.add('active');
  lucide.createIcons();

  // إن كان هناك رابط دعوة في العنوان (?r=CODE) نعرض مودال الانضمام
  // بعد التأكد من وجهة الإقلاع الصحيحة (auth أو landing)
  if (destination === 'landing') checkUrlParams();
});

/* عند مغادرة الصفحة (تحديث، إغلاق تبويب، إلخ) نُعلم بقية المشاركين فوراً
   عبر Supabase Broadcast أن هذا الـ peerId القديم انتهى، حتى لا يبقى ظاهراً
   لديهم كـ"متصل" إلى أن ينتهي مهلة اتصال WebRTC تلقائياً. هذا لا يمنع
   إعادة الانضمام (roomSession تبقى محفوظة في sessionStorage وتُقرأ فوراً
   عند إعادة تحميل نفس التبويب)، فقط يُسرّع تنظيف العرض لدى الآخرين. */
window.addEventListener('beforeunload', () => {
  if (S.signalChannel && S.myPeerId) {
    try {
      S.signalChannel.send({
        type: 'broadcast',
        event: 'user-left',
        payload: { peerId: S.myPeerId, name: S.myName }
      });
    } catch (e) { /* المتصفح قد يقطع الطلب أثناء الإغلاق — لا بأس بتجاهله */ }
  }
});
