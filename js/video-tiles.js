/* ═══════════════════════════════════════════════
   VIDEO TILES
═══════════════════════════════════════════════ */
function renderMyTile() {
  const grid = document.getElementById('v-grid');
  let tile = document.getElementById('tile-me');
  if (!tile) {
    tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.id = 'tile-me';
    grid.appendChild(tile);
  }
  tile.innerHTML = '';

  const [bg, fg] = col(0);

  if (S.localStream && S.localStream.getVideoTracks().some(t => t.enabled)) {
    const vid = document.createElement('video');
    vid.autoplay = true; vid.muted = true; vid.playsInline = true;
    vid.srcObject = S.localStream;
    tile.appendChild(vid);
  } else {
    const ph = document.createElement('div');
    ph.className = 'video-placeholder';
    ph.innerHTML = `
      <div class="v-avatar" style="background:${bg};color:${fg}">${S.myName.charAt(0)}</div>
      <span style="font-size:.74rem;color:rgba(255,255,255,.4)">${S.myName}</span>`;
    tile.appendChild(ph);
  }

  const tag = document.createElement('div');
  tag.className = 'v-name-tag';
  tag.innerHTML = `${S.myName} <span style="color:var(--sage);font-size:.65rem">(أنت)</span>
    ${!S.micOn ? '<i data-lucide="mic-off" width="11" height="11" style="color:#e74c3c"></i>' : ''}`;
  tile.appendChild(tag);
  lucide.createIcons();
}

function renderPeerTile(peerId) {
  const p = S.participants[peerId];
  if (!p) return;

  const grid = document.getElementById('v-grid');
  let tile = document.getElementById('tile-' + peerId);
  if (!tile) {
    tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.id = 'tile-' + peerId;
    grid.appendChild(tile);
  }
  tile.innerHTML = '';

  const [bg, fg] = col(p.colorIdx);

  if (p.stream && p.stream.getVideoTracks().length > 0) {
    const vid = document.createElement('video');
    vid.autoplay = true; vid.playsInline = true;
    vid.srcObject = p.stream;
    // make sure audio plays
    vid.onloadedmetadata = () => vid.play().catch(() => {});
    tile.appendChild(vid);
  } else {
    const ph = document.createElement('div');
    ph.className = 'video-placeholder';
    ph.innerHTML = `
      <div class="v-avatar" style="background:${bg};color:${fg}">${p.name.charAt(0)}</div>
      <span style="font-size:.74rem;color:rgba(255,255,255,.4)">${p.name}</span>`;
    tile.appendChild(ph);
  }

  const tag = document.createElement('div');
  tag.className = 'v-name-tag';
  tag.innerHTML = `${p.name}
    ${!p.micOn ? '<i data-lucide="mic-off" width="11" height="11" style="color:#e74c3c"></i>' : ''}`;
  tile.appendChild(tag);
  lucide.createIcons();
}

function removePeerTile(peerId) {
  const tile = document.getElementById('tile-' + peerId);
  if (tile) tile.remove();
}

function updateVideoTagForPeer(peerId) {
  renderPeerTile(peerId);
}
