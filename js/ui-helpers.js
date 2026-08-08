/* ═══════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════ */
function openModal(id) { document.getElementById('modal-'+id).classList.add('open'); }
function closeModal(id) { document.getElementById('modal-'+id).classList.remove('open'); }

/* ═══════════════════════════════════════════════
   BANNER
═══════════════════════════════════════════════ */
function showBanner(type, text) {
  const b = document.getElementById('conn-banner');
  b.className = 'conn-banner show ' + type;
  b.textContent = text;
}
function hideBanner() {
  document.getElementById('conn-banner').classList.remove('show');
}

/* ═══════════════════════════════════════════════
   STATUS MSG (inside modals)
═══════════════════════════════════════════════ */
function showStatus(modal, text, type) {
  const el = document.getElementById(modal+'-status');
  el.textContent = text;
  el.className = 'status-msg ' + type + ' show';
  setTimeout(() => el.classList.remove('show'), 4000);
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function toast(text, type='info') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.borderColor = type==='ok' ? 'rgba(143,184,166,.5)'
                        : type==='warn' ? 'rgba(210,152,0,.4)'
                        : type==='err' ? 'rgba(192,57,43,.4)'
                        : 'rgba(143,184,166,.2)';
  el.textContent = text;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ═══════════════════════════════════════════════
   MISC
═══════════════════════════════════════════════ */
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
