/* ═══════════════════════════════════════════════
   PERMISSIONS
═══════════════════════════════════════════════ */
async function requestPermissions() {
  try {
    S.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    S.permGranted = true;
    toast('الكاميرا والميكروفون جاهزان ✓', 'ok');
  } catch(e) {
    S.permGranted = false;
    // try audio only
    try {
      S.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast('تم تفعيل الميكروفون فقط (لا كاميرا)', 'warn');
    } catch(e2) {
      toast('تعذّر الوصول للأجهزة — سيتم الانضمام بدونها', 'warn');
    }
  }
  document.getElementById('permissions-overlay').classList.add('hidden');
}

function skipPermissions() {
  S.permGranted = false;
  document.getElementById('permissions-overlay').classList.add('hidden');
  toast('انضممت بدون كاميرا', 'info');
}
