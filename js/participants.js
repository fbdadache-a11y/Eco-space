/* ═══════════════════════════════════════════════
   PARTICIPANTS PANEL
═══════════════════════════════════════════════ */
function renderPeople() {
  const el = document.getElementById('ppl-list');
  el.innerHTML = '';

  // self
  const [bg0,fg0] = col(0);
  el.innerHTML += `
    <div class="p-row">
      <div class="p-av" style="background:${bg0};color:${fg0}">${S.myName.charAt(0)}</div>
      <div class="p-info">
        <div class="p-name">${S.myName} <span style="color:rgba(143,184,166,.6);font-size:.65rem">(أنت)</span></div>
        <div class="p-role">المضيف</div>
      </div>
      <div class="p-icons">
        <span class="${S.micOn?'icon-on':'icon-off'}"><i data-lucide="${S.micOn?'mic':'mic-off'}" width="13" height="13"></i></span>
        <span class="${S.camOn?'icon-on':'icon-off'}"><i data-lucide="${S.camOn?'video':'video-off'}" width="13" height="13"></i></span>
      </div>
    </div>`;

  Object.values(S.participants).forEach(p => {
    const [bg,fg] = col(p.colorIdx);
    el.innerHTML += `
      <div class="p-row">
        <div class="p-av" style="background:${bg};color:${fg}">${p.name.charAt(0)}</div>
        <div class="p-info">
          <div class="p-name">${p.name}</div>
          <div class="p-role">${p.stream ? '🟢 متصل' : 'منتظر الاتصال…'}</div>
        </div>
        <div class="p-icons">
          <span class="${p.micOn?'icon-on':'icon-off'}"><i data-lucide="${p.micOn?'mic':'mic-off'}" width="13" height="13"></i></span>
          <span class="${p.camOn?'icon-on':'icon-off'}"><i data-lucide="${p.camOn?'video':'video-off'}" width="13" height="13"></i></span>
        </div>
      </div>`;
  });
  lucide.createIcons();
}

function updateCount() {
  const total = 1 + Object.keys(S.participants).length;
  document.getElementById('rh-count').textContent = `${total} مشترك`;
}
