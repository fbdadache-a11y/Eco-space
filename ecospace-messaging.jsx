import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   ECONOVO CLUB — ECO SPACE MESSAGING
   Brand: #0E2A24 (Obsidian), #8FB8A6 (Silver Sage), #F4F7F2 (Chalk)
   Fonts: Host Grotesk / IBM Plex Sans Arabic
   Features: Real-time msgs, voice notes, files, markdown, emoji,
             personal notes, dark/light/themes, groups, media preview,
             online status, typing indicators, profile photos
═══════════════════════════════════════════════════════════════ */

/* ── Global Styles ── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --obs: #0E2A24; --obs-mid: #1a3d2e; --obs-light: #2a5540;
  --sage: #8FB8A6; --sage-light: #b8d4c8; --sage-pale: #d4e8e0;
  --chalk: #F4F7F2; --chalk-2: #F6F4F0; --chalk-3: #eef2ee;
  --ink: #1a1a1a; --slate: #4a5568; --muted: #9aa5b4;
  --white: #ffffff; --err: #e53e3e; --ok: #38a169; --warn: #d97706;
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 20px; --r-full: 9999px;
  --shadow-1: 0 1px 3px rgba(14,42,36,.08);
  --shadow-2: 0 4px 16px rgba(14,42,36,.12);
  --shadow-3: 0 12px 40px rgba(14,42,36,.18);
  --transition: .18s cubic-bezier(.4,0,.2,1);
  --sidebar-w: 300px;
  /* Light theme defaults */
  --bg: var(--chalk);
  --bg2: var(--white);
  --bg3: var(--chalk-3);
  --border: rgba(14,42,36,.1);
  --text: var(--ink);
  --text-2: var(--slate);
  --text-3: var(--muted);
  --bubble-me: var(--obs);
  --bubble-me-text: var(--white);
  --bubble-other: var(--white);
  --bubble-other-text: var(--ink);
  --input-bg: var(--white);
  --hover: rgba(14,42,36,.05);
  --active: rgba(14,42,36,.1);
  --glass-bg: rgba(244,247,242,.72);
  --glass-blur: 20px;
}
[data-theme="dark"] {
  --bg: #0d1a16; --bg2: #142119; --bg3: #1c2e25;
  --border: rgba(143,184,166,.12);
  --text: #e8f0ec; --text-2: #8fb8a6; --text-3: #547a68;
  --bubble-me: #1a4535; --bubble-me-text: #c8e8d8;
  --bubble-other: #1c2e25; --bubble-other-text: #e8f0ec;
  --input-bg: #1c2e25; --hover: rgba(143,184,166,.06); --active: rgba(143,184,166,.12);
  --glass-bg: rgba(13,26,22,.75); --shadow-2: 0 4px 16px rgba(0,0,0,.4);
  --shadow-3: 0 12px 40px rgba(0,0,0,.5);
}
[data-theme="sage"] {
  --bg: #e8f2ed; --bg2: #f0f7f3; --bg3: #d8ebdf;
  --border: rgba(14,42,36,.12); --text: #0d2a1e; --text-2: #2a5540; --text-3: #5c8c76;
  --bubble-me: #2a5540; --bubble-me-text: #fff;
  --bubble-other: #fff; --bubble-other-text: #0d2a1e;
  --hover: rgba(14,42,36,.06); --active: rgba(14,42,36,.12);
  --glass-bg: rgba(232,242,237,.78);
}
[data-theme="midnight"] {
  --bg: #060b14; --bg2: #0a1220; --bg3: #0f1a2c;
  --border: rgba(100,140,200,.12); --text: #c8d8f0; --text-2: #7090b8; --text-3: #3d5a80;
  --bubble-me: #1a3a6c; --bubble-me-text: #d4e8ff;
  --bubble-other: #0f1a2c; --bubble-other-text: #c8d8f0;
  --input-bg: #0f1a2c; --hover: rgba(100,140,200,.06); --active: rgba(100,140,200,.12);
  --glass-bg: rgba(6,11,20,.78); --obs: #1a3a6c; --sage: #4a90c8;
}

body, #root { width: 100%; height: 100%; font-family: 'IBM Plex Sans Arabic', 'Host Grotesk', sans-serif; }
html, body { height: 100%; overflow: hidden; background: var(--bg); color: var(--text); }
* { transition: background-color var(--transition), border-color var(--transition), color var(--transition); }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* App Shell */
.app { display: flex; height: 100vh; width: 100%; overflow: hidden; background: var(--bg); position: relative; }

/* ── LEFT RAIL (icon nav) ── */
.rail { width: 64px; min-width: 64px; background: var(--obs); display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 4px; z-index: 10; }
.rail-logo { width: 38px; height: 38px; border-radius: var(--r-md); background: var(--sage); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; cursor: pointer; }
.rail-logo svg { color: var(--obs); }
.rail-btn { width: 40px; height: 40px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--sage-pale); transition: all var(--transition); border: none; background: transparent; position: relative; }
.rail-btn:hover { background: rgba(143,184,166,.15); color: #fff; }
.rail-btn.active { background: rgba(143,184,166,.22); color: var(--sage-light); }
.rail-btn .badge { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--err); border: 2px solid var(--obs); }
.rail-spacer { flex: 1; }
.rail-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--sage); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; color: var(--obs); font-weight: 700; font-size: 14px; border: 2px solid rgba(143,184,166,.4); }
.rail-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* ── SIDEBAR ── */
.sidebar { width: var(--sidebar-w); min-width: var(--sidebar-w); background: var(--bg2); border-left: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
.sidebar-header { padding: 16px 14px 12px; }
.sidebar-title { font-family: 'Host Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.search-box { display: flex; align-items: center; gap: 8px; background: var(--bg3); border-radius: var(--r-lg); padding: 8px 12px; }
.search-box input { flex: 1; background: none; border: none; outline: none; font-size: 13px; color: var(--text); font-family: inherit; }
.search-box input::placeholder { color: var(--text-3); }
.conv-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; transition: background var(--transition); border-radius: 0; }
.conv-item:hover { background: var(--hover); }
.conv-item.active { background: var(--active); }
.conv-avatar { position: relative; flex-shrink: 0; }
.conv-avatar-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; color: var(--obs); overflow: hidden; }
.conv-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
.online-dot { position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg2); }
.online-dot.online { background: var(--ok); }
.online-dot.offline { background: var(--muted); }
.conv-info { flex: 1; min-width: 0; }
.conv-name { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-preview { font-size: 12px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.conv-preview.typing { color: var(--sage); font-style: italic; }
.conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.conv-time { font-size: 11px; color: var(--text-3); }
.conv-badge { min-width: 18px; height: 18px; border-radius: 9px; background: var(--obs); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
.new-conv-btn { margin: 8px 14px 12px; padding: 10px; background: var(--obs); color: #fff; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600; border: none; font-family: inherit; transition: opacity var(--transition); }
.new-conv-btn:hover { opacity: .88; }

/* ── CHAT AREA ── */
.chat-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: var(--bg2); border-bottom: 1px solid var(--border); min-height: 64px; }
.chat-header-avatar { position: relative; }
.chat-header-avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; color: var(--obs); overflow: hidden; }
.chat-header-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
.chat-header-info { flex: 1; }
.chat-header-name { font-weight: 700; font-size: 16px; font-family: 'Host Grotesk', sans-serif; }
.chat-header-status { font-size: 12px; margin-top: 1px; display: flex; align-items: center; gap: 5px; }
.status-online { color: var(--ok); }
.status-offline { color: var(--text-3); }
.status-typing { color: var(--sage); font-style: italic; }
.chat-header-actions { display: flex; gap: 4px; }
.icon-btn { width: 36px; height: 36px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-2); border: none; background: transparent; transition: all var(--transition); }
.icon-btn:hover { background: var(--hover); color: var(--text); }

/* ── MESSAGES ── */
.messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.msg-row { display: flex; gap: 10px; align-items: flex-end; }
.msg-row.self { flex-direction: row-reverse; }
.msg-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: var(--obs); }
.msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
.msg-content { max-width: 72%; display: flex; flex-direction: column; gap: 2px; }
.msg-row.self .msg-content { align-items: flex-end; }
.msg-sender-name { font-size: 11px; color: var(--text-3); margin-bottom: 2px; font-weight: 500; }
.msg-bubble { padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; position: relative; }
.msg-row:not(.self) .msg-bubble { background: var(--bubble-other); color: var(--bubble-other-text); border-bottom-right-radius: 4px; box-shadow: var(--shadow-1); }
.msg-row.self .msg-bubble { background: var(--bubble-me); color: var(--bubble-me-text); border-bottom-left-radius: 4px; }
.msg-time { font-size: 10px; color: var(--text-3); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.msg-row.self .msg-time { justify-content: flex-end; }
.msg-status { display: flex; align-items: center; }

/* Voice Message */
.voice-bubble { display: flex; align-items: center; gap: 10px; padding: 8px 14px; min-width: 200px; }
.voice-play-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border: none; transition: opacity var(--transition); }
.msg-row:not(.self) .voice-play-btn { background: var(--obs); color: #fff; }
.msg-row.self .voice-play-btn { background: rgba(255,255,255,.2); color: #fff; }
.voice-play-btn:hover { opacity: .8; }
.voice-waveform { flex: 1; height: 28px; display: flex; align-items: center; gap: 2px; }
.voice-bar { flex: 1; border-radius: 2px; transition: height .1s; }
.msg-row:not(.self) .voice-bar { background: var(--sage); }
.msg-row.self .voice-bar { background: rgba(255,255,255,.5); }
.voice-bar.played { }
.msg-row:not(.self) .voice-bar.played { background: var(--obs); }
.msg-row.self .voice-bar.played { background: rgba(255,255,255,.9); }
.voice-dur { font-size: 11px; color: var(--text-3); min-width: 28px; }
.msg-row.self .voice-dur { color: rgba(255,255,255,.7); }

/* File Message */
.file-bubble { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; }
.file-icon { width: 40px; height: 40px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.msg-row:not(.self) .file-icon { background: var(--sage-pale); color: var(--obs); }
.msg-row.self .file-icon { background: rgba(255,255,255,.2); color: #fff; }
.file-info { flex: 1; min-width: 0; }
.file-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-size { font-size: 11px; opacity: .7; margin-top: 2px; }

/* Image grid in messages */
.img-grid { display: grid; gap: 3px; border-radius: var(--r-md); overflow: hidden; cursor: pointer; }
.img-grid.single { grid-template-columns: 1fr; max-width: 280px; }
.img-grid.two { grid-template-columns: 1fr 1fr; }
.img-grid.three { grid-template-columns: 1fr 1fr; }
.img-grid.three .img-grid-item:first-child { grid-row: span 2; }
.img-grid.many { grid-template-columns: 1fr 1fr; }
.img-grid-item { position: relative; overflow: hidden; aspect-ratio: 1; }
.img-grid-item img { width: 100%; height: 100%; object-fit: cover; }
.img-grid-more { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: #fff; }

/* Markdown in bubbles */
.md-bubble strong { font-weight: 700; }
.md-bubble em { font-style: italic; }
.md-bubble code { font-family: 'Courier New', monospace; font-size: 12px; padding: 2px 5px; border-radius: 4px; background: rgba(0,0,0,.12); }
.msg-row.self .md-bubble code { background: rgba(255,255,255,.15); }
.md-bubble pre { margin: 6px 0; padding: 8px; border-radius: var(--r-sm); background: rgba(0,0,0,.15); overflow-x: auto; font-size: 12px; }
.md-bubble h1,.md-bubble h2,.md-bubble h3 { font-weight: 700; margin: 4px 0 2px; }
.md-bubble ul,.md-bubble ol { padding-right: 16px; }
.md-bubble blockquote { border-right: 3px solid var(--sage); padding-right: 8px; opacity: .8; margin: 4px 0; }

/* Reactions */
.msg-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.msg-row.self .msg-reactions { justify-content: flex-end; }
.reaction-chip { display: flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: var(--r-full); background: var(--bg3); border: 1px solid var(--border); font-size: 13px; cursor: pointer; transition: all var(--transition); }
.reaction-chip:hover { border-color: var(--sage); }
.reaction-count { font-size: 11px; color: var(--text-2); font-weight: 600; }
.msg-bubble-wrap { position: relative; }
.msg-bubble-wrap:hover .msg-actions { opacity: 1; pointer-events: all; }
.msg-actions { position: absolute; top: -32px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-full); padding: 4px 8px; display: flex; gap: 2px; opacity: 0; pointer-events: none; transition: opacity var(--transition); box-shadow: var(--shadow-2); white-space: nowrap; z-index: 5; }
.msg-row:not(.self) .msg-actions { left: 0; }
.msg-row.self .msg-actions { right: 0; }
.msg-action-btn { padding: 4px 6px; cursor: pointer; border-radius: var(--r-sm); font-size: 14px; border: none; background: none; transition: background var(--transition); color: var(--text); }
.msg-action-btn:hover { background: var(--hover); }

/* Date separator */
.date-sep { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.date-sep-line { flex: 1; height: 1px; background: var(--border); }
.date-sep-text { font-size: 11px; color: var(--text-3); background: var(--bg); padding: 0 8px; white-space: nowrap; }

/* System message */
.sys-msg { text-align: center; font-size: 12px; color: var(--text-3); padding: 4px 12px; background: var(--bg3); border-radius: var(--r-full); align-self: center; }

/* ── INPUT AREA ── */
.input-area { padding: 12px 16px; background: var(--bg2); border-top: 1px solid var(--border); }
.input-toolbar { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
.toolbar-btn { padding: 4px 8px; border-radius: var(--r-sm); font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--bg3); color: var(--text-2); transition: all var(--transition); font-family: monospace; }
.toolbar-btn:hover { border-color: var(--sage); color: var(--obs); background: var(--sage-pale); }
.input-row { display: flex; align-items: flex-end; gap: 8px; }
.input-box { flex: 1; background: var(--input-bg); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 10px 16px; display: flex; flex-direction: column; gap: 4px; transition: border-color var(--transition); }
.input-box:focus-within { border-color: var(--sage); }
.input-box textarea { background: none; border: none; outline: none; font-size: 14px; font-family: inherit; color: var(--text); resize: none; min-height: 22px; max-height: 120px; line-height: 1.5; width: 100%; }
.input-box textarea::placeholder { color: var(--text-3); }
.input-attachments { display: flex; gap: 6px; flex-wrap: wrap; }
.attachment-chip { display: flex; align-items: center; gap: 5px; padding: 3px 8px; background: var(--sage-pale); border-radius: var(--r-full); font-size: 11px; color: var(--obs); border: 1px solid var(--sage-light); }
.attachment-chip-remove { cursor: pointer; opacity: .6; line-height: 1; border: none; background: none; color: inherit; font-size: 14px; padding: 0 1px; }
.attachment-chip-remove:hover { opacity: 1; }
.input-icon-btn { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all var(--transition); flex-shrink: 0; }
.attach-btn { background: var(--bg3); color: var(--text-2); }
.attach-btn:hover { background: var(--sage-pale); color: var(--obs); }
.emoji-btn { background: var(--bg3); color: var(--text-2); font-size: 18px; }
.emoji-btn:hover { background: var(--sage-pale); }
.voice-btn { background: var(--bg3); color: var(--text-2); }
.voice-btn:hover { background: rgba(229,62,62,.1); color: var(--err); }
.voice-btn.recording { background: var(--err); color: #fff; animation: pulse 1s infinite; }
.send-btn { background: var(--obs); color: #fff; }
.send-btn:hover { background: var(--obs-mid); }
.send-btn:disabled { opacity: .4; cursor: default; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.7} }

/* Emoji Picker */
.emoji-picker { position: absolute; bottom: 80px; right: 16px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-xl); box-shadow: var(--shadow-3); padding: 12px; z-index: 100; width: 320px; }
.emoji-cats { display: flex; gap: 4px; margin-bottom: 10px; overflow-x: auto; }
.emoji-cat-btn { padding: 4px 8px; border-radius: var(--r-sm); font-size: 16px; cursor: pointer; border: none; background: none; transition: background var(--transition); }
.emoji-cat-btn:hover,.emoji-cat-btn.active { background: var(--hover); }
.emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; max-height: 200px; overflow-y: auto; }
.emoji-item { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; border-radius: var(--r-sm); transition: background var(--transition); border: none; background: none; }
.emoji-item:hover { background: var(--hover); }

/* ── PANELS (Notes, Profile, Groups etc) ── */
.panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; }
.panel { background: var(--bg2); border-radius: var(--r-xl); box-shadow: var(--shadow-3); width: 480px; max-width: 95vw; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp .22s ease; }
.panel.wide { width: 640px; }
@keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
.panel-header { display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.panel-title { font-family: 'Host Grotesk', sans-serif; font-size: 18px; font-weight: 700; flex: 1; }
.panel-close { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-2); border: none; background: var(--hover); transition: all var(--transition); }
.panel-close:hover { background: var(--active); }
.panel-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.panel-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-shrink: 0; }
.btn { padding: 9px 18px; border-radius: var(--r-md); font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all var(--transition); }
.btn-primary { background: var(--obs); color: #fff; }
.btn-primary:hover { background: var(--obs-mid); }
.btn-secondary { background: var(--bg3); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--hover); }
.btn-danger { background: rgba(229,62,62,.1); color: var(--err); border: 1px solid rgba(229,62,62,.2); }
.btn-danger:hover { background: var(--err); color: #fff; }

/* Form inputs */
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .5px; }
.field input, .field textarea, .field select { width: 100%; padding: 10px 13px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r-md); font-size: 14px; color: var(--text); font-family: inherit; outline: none; transition: border-color var(--transition); }
.field input:focus, .field textarea:focus { border-color: var(--sage); }
.field textarea { resize: vertical; min-height: 100px; }
.field select { cursor: pointer; }

/* Notes */
.notes-list { display: flex; flex-direction: column; gap: 8px; }
.note-card { padding: 12px 14px; background: var(--bg3); border-radius: var(--r-md); border: 1px solid var(--border); cursor: pointer; transition: all var(--transition); }
.note-card:hover { border-color: var(--sage); background: var(--sage-pale); }
.note-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.note-preview { font-size: 12px; color: var(--text-3); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.note-meta { font-size: 11px; color: var(--text-3); margin-top: 6px; }

/* Groups */
.group-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg3); border-radius: var(--r-md); border: 1px solid var(--border); margin-bottom: 8px; }
.group-cover { width: 48px; height: 48px; border-radius: var(--r-md); object-fit: cover; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-size: 22px; overflow: hidden; }
.group-cover img { width: 100%; height: 100%; object-fit: cover; }

/* Profile */
.profile-avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 20px; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: var(--obs); cursor: pointer; position: relative; border: 3px solid var(--sage); }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.profile-avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity var(--transition); }
.profile-avatar:hover .profile-avatar-overlay { opacity: 1; }
.theme-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.theme-swatch { padding: 10px; border-radius: var(--r-md); cursor: pointer; border: 2px solid transparent; transition: all var(--transition); text-align: center; font-size: 12px; font-weight: 600; }
.theme-swatch.active { border-color: var(--sage); }
.theme-swatch:hover { transform: translateY(-2px); }

/* ── MEDIA PREVIEW (Lightbox) ── */
.media-preview { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.media-preview-bg { position: absolute; inset: 0; background: rgba(0,0,0,.85); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4); cursor: pointer; }
.media-preview-glass { position: relative; z-index: 1; max-width: 90vw; max-height: 90vh; border-radius: var(--r-xl); overflow: hidden; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 32px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; user-select: none; }
.media-preview-glass img, .media-preview-glass video { max-width: 88vw; max-height: 85vh; object-fit: contain; display: block; border-radius: var(--r-xl); }
.media-preview-close { position: fixed; top: 20px; right: 20px; z-index: 1001; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.15); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; border: 1px solid rgba(255,255,255,.2); transition: all var(--transition); }
.media-preview-close:hover { background: rgba(255,255,255,.25); }
.media-preview-nav { position: fixed; top: 50%; transform: translateY(-50%); z-index: 1001; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.12); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; border: 1px solid rgba(255,255,255,.15); transition: all var(--transition); }
.media-preview-nav:hover { background: rgba(255,255,255,.22); }
.media-preview-nav.prev { right: 20px; }
.media-preview-nav.next { left: 20px; }
.media-preview-counter { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,.7); font-size: 13px; background: rgba(0,0,0,.4); padding: 4px 12px; border-radius: var(--r-full); backdrop-filter: blur(8px); z-index: 1001; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

/* ── MOBILE RESPONSIVE ── */
@media (max-width: 768px) {
  .rail { width: 56px; min-width: 56px; }
  .sidebar { position: fixed; right: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(0); transition: transform var(--transition); }
  .sidebar.mobile-hidden { transform: translateX(100%); }
  .sidebar { width: 85vw; min-width: unset; }
  .chat-area { width: 100%; }
  .emoji-picker { right: 8px; left: 8px; width: auto; }
  .panel { max-height: 92vh; }
}
@media (max-width: 480px) {
  .rail { display: none; }
  .messages-area { padding: 12px; }
  .input-area { padding: 8px 10px; }
}

/* Toast */
.toast-container { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 8px; align-items: center; pointer-events: none; }
.toast { padding: 10px 18px; background: var(--obs); color: #fff; border-radius: var(--r-full); font-size: 13px; font-weight: 500; box-shadow: var(--shadow-3); animation: toastIn .22s ease; white-space: nowrap; }
.toast.error { background: var(--err); }
.toast.ok { background: var(--ok); }
@keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

/* Recording indicator */
.recording-bar { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(229,62,62,.08); border-radius: var(--r-md); border: 1px solid rgba(229,62,62,.2); margin-bottom: 8px; }
.rec-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--err); animation: pulse 1s infinite; }
.rec-timer { font-size: 13px; color: var(--err); font-weight: 600; font-variant-numeric: tabular-nums; }
.rec-cancel { margin-right: auto; font-size: 12px; color: var(--text-3); cursor: pointer; border: none; background: none; font-family: inherit; }
.rec-cancel:hover { color: var(--err); }

/* Segment tabs */
.seg-tabs { display: flex; background: var(--bg3); border-radius: var(--r-md); padding: 3px; gap: 2px; }
.seg-tab { flex: 1; padding: 7px 10px; border-radius: var(--r-sm); font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: none; color: var(--text-3); transition: all var(--transition); text-align: center; font-family: inherit; }
.seg-tab.active { background: var(--bg2); color: var(--obs); box-shadow: var(--shadow-1); }

/* Empty state */
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-3); padding: 40px; text-align: center; }
.empty-state-icon { font-size: 48px; opacity: .4; }
.empty-state-title { font-size: 16px; font-weight: 600; color: var(--text-2); }
.empty-state-sub { font-size: 13px; }
`;

/* ══════════════════════════════════════════════════════════
   EMOJI DATA
══════════════════════════════════════════════════════════ */
const EMOJI_CATS = [
  { label: "😊", name: "وجوه", emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","😎","🤓","🧐","😏","😒","😞","😔","😟","😕","🙁","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","😱","😨","😰","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤧","😷","🤒","🤕","🥳","🥸","🤠","🥹"] },
  { label: "👋", name: "أيادي", emojis: ["👍","👎","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👋","🤚","🖐","✋","🖖","🤜","🤛","✊","👊","🤝","👐","🙌","👏","🤲","🙏","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁","👅","👄","💋","💔","❤","🧡","💛","💚","💙","💜","🤎","🖤","🤍"] },
  { label: "🎉", name: "احتفال", emojis: ["🎉","🎊","🥳","🎈","🎁","🎀","🎂","🍰","🧁","🥂","🍾","🎆","🎇","✨","⭐","🌟","💫","🌈","🎯","🏆","🥇","🎖","🏅","🎗","🎟","🎫","🎪","🎠","🎡","🎢","🎭","🎨","🎬","🎤","🎵","🎶","🎸","🥁","🎹","🎺","🎻","🥳","🪅","🪆","🎭","🃏","🎰","🎲","♟","🧩","🧸","🪀","🪁","🎮","🕹"] },
  { label: "💼", name: "عمل", emojis: ["💼","📁","📂","📋","📊","📈","📉","📅","📆","📇","📌","📍","📎","✂️","🖇","📏","📐","✒️","🖊","🖋","📝","📓","📔","📒","📕","📗","📘","📙","📚","📖","🔖","🗒","🗓","📰","🗞","💰","💳","💵","💴","💶","💷","🏦","🏧","💹","📡","💻","🖥","🖨","⌨️","🖱","🗜","💾","💿","📀","📱","☎️","📞","📟","📠","🔋","🔌","💡","🔦","🕯","🪔"] },
  { label: "🌿", name: "طبيعة", emojis: ["🌱","🌲","🌳","🌴","🌵","🌾","🌿","☘","🍀","🍁","🍂","🍃","🍄","🌰","🦔","🐾","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌟","⭐","🌠","⛅","🌤","🌥","🌦","🌧","⛈","🌩","🌨","❄️","🌬","💨","🌊","💧","💦","☔","⚡","🔥","🌍","🌎","🌏","🌐","🗺"] },
];

/* ══════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════ */
const AVATARS = {
  me: null,
  alex: null, travis: null, kate: null, robert: null, emily: null, sophia: null,
};

const THEMES = [
  { id: "light", label: "فاتح", bg: "#F4F7F2", accent: "#0E2A24" },
  { id: "dark", label: "داكن", bg: "#0d1a16", accent: "#8FB8A6" },
  { id: "sage", label: "سيج", bg: "#e8f2ed", accent: "#2a5540" },
  { id: "midnight", label: "منتصف الليل", bg: "#060b14", accent: "#4a90c8" },
];

const initConversations = [
  { id: "c1", type: "dm", name: "Alexander Jameson", avatar: null, initials: "AJ", online: true, typing: false, unread: 2, lastMsg: "What day works best for you?", lastTime: "12:57 م", color: "#0E2A24" },
  { id: "c2", type: "dm", name: "Travis Barker", avatar: null, initials: "TB", online: true, typing: true, unread: 0, lastMsg: "... يكتب", lastTime: "5:38 م", color: "#2a5540" },
  { id: "c3", type: "dm", name: "Kate Rose", avatar: null, initials: "KR", online: false, typing: false, unread: 0, lastMsg: "Looking forward to discussing real estate...", lastTime: "5:04 م", color: "#3d7a5a" },
  { id: "c4", type: "group", name: "فريق العقارات 🏠", avatar: null, initials: "فع", online: false, typing: false, unread: 5, lastMsg: "Robert: That's fantastic news!", lastTime: "4:22 م", color: "#8FB8A6", coverEmoji: "🏡", theme: "sage" },
  { id: "c5", type: "dm", name: "Emily Johnson", avatar: null, initials: "EJ", online: true, typing: false, unread: 0, lastMsg: "Take a look at my recent real estate post...", lastTime: "3:59 م", color: "#0E2A24" },
  { id: "c6", type: "dm", name: "Sophia Brown", avatar: null, initials: "SB", online: false, typing: false, unread: 0, lastMsg: "Discover amazing properties on my page!", lastTime: "3:24 م", color: "#5c8c76" },
  { id: "c7", type: "group", name: "نادي Econovo Club 🎓", avatar: null, initials: "نا", online: false, typing: false, unread: 1, lastMsg: "Workshop next Thursday at 6PM", lastTime: "1:06 م", color: "#0E2A24", coverEmoji: "🎓", theme: "midnight" },
  { id: "c8", type: "dm", name: "Tom Hardy", avatar: null, initials: "TH", online: true, typing: false, unread: 0, lastMsg: "This property has such a unique design vi...", lastTime: "12:43 م", color: "#1a4535" },
];

const initMessages = {
  c1: [
    { id: 1, sender: "AJ", senderName: "Alexander Jameson", isMe: false, type: "text", text: "I'm a manager that's here to help.", time: "10:37 ص", reactions: [] },
    { id: 2, sender: "AJ", senderName: "Alexander Jameson", isMe: false, type: "voice", duration: 139, time: "10:41 ص", reactions: [] },
    { id: 3, sender: "AJ", senderName: "Alexander Jameson", isMe: false, type: "property", text: "هذه شقة عصرية في حي هادئ. 3 غرف، 2 حمام، مطبخ فسيح وصالة 🏠", stats: [{icon:"Eye",label:"الزوار",val:"2,429"},{icon:"Calendar",label:"عمر البناء",val:"3 سنوات"},{icon:"Thermometer",label:"الحرارة",val:"28°F"}], images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"], time: "11:19 ص", reactions: [] },
    { id: 4, sender: "me", senderName: "أنا", isMe: true, type: "text", text: "Looks good 👍. I want to sign up for a viewing", time: "12:25 م", reactions: [{emoji:"👍",count:1}] },
    { id: 5, sender: "AJ", senderName: "Alexander Jameson", isMe: false, type: "text", text: "What day and time works best for you to come by for the viewing? Let me know, and I'll confirm the appointment right away.", time: "12:57 م", reactions: [] },
  ],
  c2: [
    { id: 1, sender: "TB", senderName: "Travis Barker", isMe: false, type: "text", text: "Hey! How's your property search going?", time: "5:30 م", reactions: [] },
    { id: 2, sender: "me", senderName: "أنا", isMe: true, type: "text", text: "Great actually! Found a few options I like 🏡", time: "5:33 م", reactions: [{emoji:"❤",count:1}] },
    { id: 3, sender: "TB", senderName: "Travis Barker", isMe: false, type: "text", text: "Let me send you some docs I prepared", time: "5:35 م", reactions: [] },
    { id: 4, sender: "TB", senderName: "Travis Barker", isMe: false, type: "file", fileName: "Property_Analysis_2024.pdf", fileSize: "2.4 MB", fileType: "pdf", time: "5:36 م", reactions: [] },
    { id: 5, sender: "TB", senderName: "Travis Barker", isMe: false, type: "file", fileName: "Market_Report_Q4.xlsx", fileSize: "1.1 MB", fileType: "xlsx", time: "5:37 م", reactions: [] },
  ],
  c4: [
    { id: 1, sender: "RP", senderName: "Robert Parker", isMe: false, type: "text", text: "That's **fantastic** news about the new listing! 🎉", time: "4:15 م", reactions: [{emoji:"🎉",count:3}] },
    { id: 2, sender: "me", senderName: "أنا", isMe: true, type: "text", text: "نعم! الموقع ممتاز وبسعر معقول جداً\n\n```\nالسعر: 850,000 ريال\nالمساحة: 320 م²\n```", time: "4:18 م", reactions: [] },
    { id: 3, sender: "EJ", senderName: "Emily Johnson", isMe: false, type: "text", text: "ما شاء الله، هل يوجد صور للمطبخ؟", time: "4:20 م", reactions: [] },
    { id: 4, sender: "RP", senderName: "Robert Parker", isMe: false, type: "images", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400","https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400"], time: "4:22 م", reactions: [] },
  ],
  c7: [
    { id: 1, sender: "admin", senderName: "Econovo Club", isMe: false, type: "system", text: "مرحباً بكم في قناة Econovo Club 🎓" },
    { id: 2, sender: "fk", senderName: "Frederick K.", isMe: false, type: "text", text: "Workshop next Thursday at 6PM — topic: **Behavioral Economics** 📊", time: "1:00 م", reactions: [{emoji:"👍",count:5},{emoji:"🎉",count:2}] },
    { id: 3, sender: "me", senderName: "أنا", isMe: true, type: "text", text: "سأكون حاضراً! هل ستكون هناك مواد للقراءة المسبقة؟", time: "1:05 م", reactions: [] },
    { id: 4, sender: "fk", senderName: "Frederick K.", isMe: false, type: "file", fileName: "BehEcon_Reading_List.pdf", fileSize: "560 KB", fileType: "pdf", time: "1:06 م", reactions: [] },
  ],
};

const initNotes = [
  { id: "n1", title: "قائمة العقارات المفضلة", content: "1. شقة الحي الغربي - 3 غرف\n2. فيلا النخيل - 5 غرف\n3. استوديو وسط المدينة", updatedAt: "اليوم 10:30 ص" },
  { id: "n2", title: "ملاحظات اجتماع Econovo", content: "**أفكار Workshop:**\n- Behavioral Economics\n- مخطط المقارنة بين الأسواق\n- دراسة حالة: سوق الإسكان", updatedAt: "أمس 4:00 م" },
  { id: "n3", title: "أسئلة للوكيل العقاري", content: "- هل يوجد موقف سيارات؟\n- متى آخر تجديد؟\n- ما نسبة الضريبة السنوية؟", updatedAt: "12 يناير" },
];

/* ══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════════════════════════ */
function parseMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n/g, "<br>");
}

function fmtDuration(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fileIcon(type) {
  const t = (type || "").toLowerCase();
  if (t === "pdf") return "📄";
  if (["xlsx","xls","csv"].includes(t)) return "📊";
  if (["doc","docx"].includes(t)) return "📝";
  if (["mp4","mov","avi"].includes(t)) return "🎬";
  if (["mp3","wav","ogg"].includes(t)) return "🎵";
  if (["zip","rar","7z"].includes(t)) return "🗜";
  if (["jpg","jpeg","png","gif","webp"].includes(t)) return "🖼";
  return "📎";
}

/* ══════════════════════════════════════════════════════════
   CHILD COMPONENTS
══════════════════════════════════════════════════════════ */

/* Voice waveform bars */
function VoiceBars({ count = 30, progress = 0 }) {
  const heights = useMemo(() => Array.from({length: count}, () => Math.random() * 60 + 20), [count]);
  return (
    <div className="voice-waveform">
      {heights.map((h, i) => (
        <div key={i} className={`voice-bar${i / count <= progress ? " played" : ""}`} style={{height: `${h}%`}} />
      ))}
    </div>
  );
}

/* Media Preview / Lightbox */
function MediaPreview({ images, startIdx = 0, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const touchStart = useRef(null);
  const current = images[idx];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") setIdx(i => {
        if (e.key === "ArrowRight") return (i + 1) % images.length;
        return (i - 1 + images.length) % images.length;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length, onClose]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setIdx(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
    touchStart.current = null;
  };

  const isVideo = current && /\.(mp4|mov|webm|ogg)$/i.test(current);

  return (
    <div className="media-preview" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="media-preview-bg" onClick={onClose} />
      <div className="media-preview-glass">
        {isVideo
          ? <video src={current} controls autoPlay />
          : <img src={current} alt={`media-${idx}`} draggable={false} />
        }
      </div>
      <button className="media-preview-close" onClick={onClose}>✕</button>
      {images.length > 1 && <>
        <button className="media-preview-nav prev" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>‹</button>
        <button className="media-preview-nav next" onClick={() => setIdx(i => (i + 1) % images.length)}>›</button>
        <div className="media-preview-counter">{idx + 1} / {images.length}</div>
      </>}
    </div>
  );
}

/* Image grid in message */
function ImageGrid({ images, onOpen }) {
  const count = images.length;
  const gridClass = count === 1 ? "single" : count === 2 ? "two" : count === 3 ? "three" : "many";
  const shown = count > 4 ? images.slice(0, 4) : images;
  return (
    <div className={`img-grid ${gridClass}`} onClick={() => onOpen(images, 0)}>
      {shown.map((src, i) => (
        <div key={i} className="img-grid-item">
          <img src={src} alt="" loading="lazy" />
          {count > 4 && i === 3 && <div className="img-grid-more">+{count - 4}</div>}
        </div>
      ))}
    </div>
  );
}

/* Property card message */
function PropertyCard({ msg, onOpen }) {
  return (
    <div style={{background:"var(--obs)",borderRadius:16,padding:14,color:"#fff",minWidth:280,maxWidth:340}}>
      <p style={{marginBottom:12,lineHeight:1.6,fontSize:14}}>{msg.text}</p>
      {msg.stats && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
          {msg.stats.map((s,i) => (
            <div key={i} style={{background:"rgba(255,255,255,.1)",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:10,opacity:.7,marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:16,fontWeight:700}}>{s.val}</div>
            </div>
          ))}
        </div>
      )}
      {msg.images && <ImageGrid images={msg.images} onOpen={(imgs, i) => onOpen(imgs, i)} />}
    </div>
  );
}

/* Message bubble */
function MessageBubble({ msg, onReact, onOpen }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const QUICK_EMOJI = ["👍","❤","😂","😮","😢","🙏"];

  if (msg.type === "system") return <div className="sys-msg">{msg.text}</div>;

  const renderContent = () => {
    if (msg.type === "voice") return (
      <div className="msg-bubble voice-bubble">
        <button className="voice-play-btn" onClick={() => {}}>▶</button>
        <VoiceBars count={28} progress={0} />
        <span className="voice-dur">{fmtDuration(msg.duration || 0)}</span>
      </div>
    );
    if (msg.type === "file") return (
      <div className="msg-bubble file-bubble">
        <div className="file-icon" style={{fontSize:24}}>{fileIcon(msg.fileType)}</div>
        <div className="file-info">
          <div className="file-name">{msg.fileName}</div>
          <div className="file-size">{msg.fileSize}</div>
        </div>
      </div>
    );
    if (msg.type === "images") return <div style={{padding:"4px 0"}}><ImageGrid images={msg.images} onOpen={onOpen} /></div>;
    if (msg.type === "property") return <PropertyCard msg={msg} onOpen={onOpen} />;
    return (
      <div className="msg-bubble md-bubble" dangerouslySetInnerHTML={{__html: parseMarkdown(msg.text)}} />
    );
  };

  return (
    <div className={`msg-row${msg.isMe ? " self" : ""}`}>
      {!msg.isMe && (
        <div className="msg-avatar" title={msg.senderName}>
          {msg.avatar ? <img src={msg.avatar} alt="" /> : msg.senderName?.charAt(0)}
        </div>
      )}
      <div className="msg-content">
        {!msg.isMe && <div className="msg-sender-name">{msg.senderName}</div>}
        <div className="msg-bubble-wrap">
          <div className="msg-actions">
            {QUICK_EMOJI.map(e => (
              <button key={e} className="msg-action-btn" onClick={() => onReact(msg.id, e)}>{e}</button>
            ))}
            <button className="msg-action-btn" title="ردّ">↩</button>
          </div>
          {renderContent()}
        </div>
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="msg-reactions">
            {msg.reactions.map((r,i) => (
              <div key={i} className="reaction-chip" onClick={() => onReact(msg.id, r.emoji)}>
                <span>{r.emoji}</span>
                <span className="reaction-count">{r.count}</span>
              </div>
            ))}
          </div>
        )}
        <div className="msg-time">
          {msg.time}
          {msg.isMe && <span style={{opacity:.7}}>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

/* Notes Panel */
function NotesPanel({ onClose }) {
  const [notes, setNotes] = useState(initNotes);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({title:"",content:""});

  const openEdit = (n) => { setEditing(n?.id || "new"); setDraft(n ? {title:n.title,content:n.content} : {title:"",content:""}); };
  const save = () => {
    if (!draft.title.trim()) return;
    if (editing === "new") setNotes(ns => [...ns, {id: Date.now().toString(), ...draft, updatedAt:"الآن"}]);
    else setNotes(ns => ns.map(n => n.id === editing ? {...n,...draft,updatedAt:"الآن"} : n));
    setEditing(null);
  };
  const del = (id) => setNotes(ns => ns.filter(n => n.id !== id));

  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="panel-header">
          <div style={{fontSize:22}}>📝</div>
          <div className="panel-title">ملاحظاتي الشخصية</div>
          {editing && <button className="btn btn-secondary" style={{fontSize:12,padding:"5px 10px"}} onClick={() => setEditing(null)}>← رجوع</button>}
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="panel-body">
          {!editing ? (
            <>
              <button className="new-conv-btn" style={{margin:"0 0 14px"}} onClick={() => openEdit(null)}>+ ملاحظة جديدة</button>
              <div className="notes-list">
                {notes.map(n => (
                  <div key={n.id} className="note-card" onClick={() => openEdit(n)}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div className="note-title">{n.title}</div>
                      <button className="msg-action-btn" style={{padding:"2px 6px",fontSize:12}} onClick={e => {e.stopPropagation();del(n.id);}}>🗑</button>
                    </div>
                    <div className="note-preview">{n.content}</div>
                    <div className="note-meta">{n.updatedAt}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="field"><label>العنوان</label><input value={draft.title} onChange={e => setDraft(d => ({...d,title:e.target.value}))} placeholder="عنوان الملاحظة..." /></div>
              <div className="field"><label>المحتوى (يدعم Markdown)</label><textarea value={draft.content} onChange={e => setDraft(d => ({...d,content:e.target.value}))} placeholder="اكتب ملاحظتك هنا..." style={{minHeight:180}} /></div>
              {draft.content && (
                <div style={{padding:12,background:"var(--bg3)",borderRadius:"var(--r-md)",marginTop:8}}>
                  <div style={{fontSize:11,color:"var(--text-3)",marginBottom:6,fontWeight:600}}>معاينة:</div>
                  <div className="md-bubble" dangerouslySetInnerHTML={{__html:parseMarkdown(draft.content)}} style={{fontSize:13}} />
                </div>
              )}
            </>
          )}
        </div>
        {editing && (
          <div className="panel-footer">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>إلغاء</button>
            <button className="btn btn-primary" onClick={save}>💾 حفظ</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Profile Panel */
function ProfilePanel({ profile, onClose, onSave, theme, onTheme }) {
  const [draft, setDraft] = useState({...profile});
  const fileRef = useRef();

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(d => ({...d, avatar: ev.target.result}));
    reader.readAsDataURL(file);
  };

  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">الملف الشخصي والإعدادات</div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="panel-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" onClick={() => fileRef.current?.click()}>
              {draft.avatar ? <img src={draft.avatar} alt="" /> : draft.name?.charAt(0)}
              <div className="profile-avatar-overlay"><span style={{fontSize:20}}>📷</span></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
            <div style={{fontSize:12,color:"var(--text-3)"}}>انقر لتغيير الصورة</div>
          </div>

          <div className="field"><label>الاسم</label><input value={draft.name} onChange={e => setDraft(d => ({...d,name:e.target.value}))} /></div>
          <div className="field"><label>البريد الإلكتروني</label><input value={draft.email} onChange={e => setDraft(d => ({...d,email:e.target.value}))} type="email" /></div>
          <div className="field"><label>الحالة</label><input value={draft.status} onChange={e => setDraft(d => ({...d,status:e.target.value}))} placeholder="متاح للتواصل..." /></div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-2)",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>المظهر</label>
            <div className="theme-grid">
              {THEMES.map(t => (
                <div key={t.id} className={`theme-swatch${theme === t.id ? " active" : ""}`}
                  style={{background:t.bg,color:t.accent,border:`2px solid ${theme===t.id?"var(--sage)":"var(--border)"}`}}
                  onClick={() => onTheme(t.id)}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel-footer">
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={() => { onSave(draft); onClose(); }}>حفظ التغييرات</button>
        </div>
      </div>
    </div>
  );
}

/* New Group Panel */
function NewGroupPanel({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [desc, setDesc] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("light");
  const EMOJIS = ["💬","🏠","🎓","💼","🏆","🌿","⭐","🔥","💡","🎯","📊","🌐"];

  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="panel-header">
          <div style={{fontSize:22}}>👥</div>
          <div className="panel-title">مجموعة جديدة</div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="panel-body">
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <div style={{width:72,height:72,borderRadius:16,background:"var(--sage-pale)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,border:"2px solid var(--sage)"}}>{emoji}</div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-2)",marginBottom:6}}>رمز المجموعة</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {EMOJIS.map(e => (
                <div key={e} onClick={() => setEmoji(e)} style={{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",border:`2px solid ${emoji===e?"var(--sage)":"var(--border)"}`,background:emoji===e?"var(--sage-pale)":"var(--bg3)"}}>{e}</div>
              ))}
            </div>
          </div>
          <div className="field"><label>اسم المجموعة</label><input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: فريق التسويق..." /></div>
          <div className="field"><label>وصف (اختياري)</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="وصف مختصر للمجموعة..." style={{minHeight:70}} /></div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-2)",marginBottom:8}}>ثيم المجموعة</label>
            <div className="theme-grid">
              {THEMES.map(t => (
                <div key={t.id} className={`theme-swatch${selectedTheme===t.id?" active":""}`}
                  style={{background:t.bg,color:t.accent,border:`2px solid ${selectedTheme===t.id?"var(--sage)":"var(--border)"}`}}
                  onClick={() => setSelectedTheme(t.id)}>{t.label}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel-footer">
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={() => { if(name.trim()) { onCreate({name, emoji, desc, theme: selectedTheme}); onClose(); } }}>إنشاء المجموعة</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
export default function EcoSpaceApp() {
  const [theme, setTheme] = useState("light");
  const [conversations, setConversations] = useState(initConversations);
  const [messages, setMessages] = useState(initMessages);
  const [activeConv, setActiveConv] = useState("c1");
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiCat, setEmojiCat] = useState(0);
  const [search, setSearch] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null); // {images, idx}
  const [openPanel, setOpenPanel] = useState(null); // "notes"|"profile"|"newgroup"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState({ name: "Vivienne Marigold", email: "vivienne@econovo.club", status: "متاح للتواصل", avatar: null });
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // convId -> bool

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recTimer = useRef(null);
  const textareaRef = useRef(null);

  /* Apply theme */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConv]);

  /* Simulate typing indicator */
  useEffect(() => {
    const interval = setInterval(() => {
      const typingConvs = conversations.filter(c => c.typing).map(c => c.id);
      setTypingUsers(prev => {
        const next = {...prev};
        typingConvs.forEach(id => { next[id] = true; });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [conversations]);

  /* Recording timer */
  useEffect(() => {
    if (recording) {
      recTimer.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } else {
      clearInterval(recTimer.current);
      setRecSeconds(0);
    }
    return () => clearInterval(recTimer.current);
  }, [recording]);

  const showToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(ts => [...ts, {id, msg, type}]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000);
  }, []);

  const currentConv = useMemo(() => conversations.find(c => c.id === activeConv), [conversations, activeConv]);
  const currentMsgs = useMemo(() => messages[activeConv] || [], [messages, activeConv]);

  const filteredConvs = useMemo(() => {
    const q = search.toLowerCase();
    return q ? conversations.filter(c => c.name.toLowerCase().includes(q) || c.lastMsg.toLowerCase().includes(q)) : conversations;
  }, [conversations, search]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() && attachments.length === 0) return;
    const now = new Date().toLocaleTimeString("ar", {hour:"2-digit",minute:"2-digit"});
    const msgs = [];

    if (inputText.trim()) {
      msgs.push({ id: Date.now(), sender: "me", senderName: profile.name, isMe: true, type: "text", text: inputText.trim(), time: now, reactions: [] });
    }

    attachments.forEach((a, i) => {
      if (a.type === "image") {
        msgs.push({ id: Date.now() + i + 1, sender: "me", senderName: profile.name, isMe: true, type: "images", images: [a.dataUrl], time: now, reactions: [] });
      } else {
        msgs.push({ id: Date.now() + i + 1, sender: "me", senderName: profile.name, isMe: true, type: "file", fileName: a.name, fileSize: a.size, fileType: a.ext, time: now, reactions: [] });
      }
    });

    setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), ...msgs] }));
    setInputText("");
    setAttachments([]);
    setShowEmoji(false);

    setConversations(prev => prev.map(c => c.id === activeConv ? {...c, lastMsg: inputText || "مرفق", lastTime: now, unread: 0} : c));

    // Simulate reply after delay
    const replyDelay = 1200 + Math.random() * 2000;
    if (currentConv?.type === "dm") {
      setTimeout(() => {
        const replies = ["شكراً على تواصلك! 😊","ممتاز، سأتحقق من ذلك.","رائع! هل تريد المزيد من التفاصيل؟","تم الاستلام! 👍","بالتأكيد، سأتابع معك قريباً."];
        const reply = { id: Date.now() + 9999, sender: "other", senderName: currentConv.name, isMe: false, type: "text", text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString("ar", {hour:"2-digit",minute:"2-digit"}), reactions: [] };
        setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), reply] }));
        setConversations(prev => prev.map(c => c.id === activeConv ? {...c, lastMsg: reply.text, lastTime: reply.time} : c));
      }, replyDelay);
    }
  }, [inputText, attachments, activeConv, currentConv, profile.name]);

  const sendVoice = useCallback(() => {
    if (!recording) { setRecording(true); return; }
    setRecording(false);
    const now = new Date().toLocaleTimeString("ar", {hour:"2-digit",minute:"2-digit"});
    const voiceMsg = { id: Date.now(), sender: "me", senderName: profile.name, isMe: true, type: "voice", duration: recSeconds || 5, time: now, reactions: [] };
    setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), voiceMsg] }));
    setConversations(prev => prev.map(c => c.id === activeConv ? {...c, lastMsg: "🎤 رسالة صوتية", lastTime: now} : c));
    showToast("تم إرسال الرسالة الصوتية 🎤");
  }, [recording, recSeconds, activeConv, profile.name, showToast]);

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach(file => {
      const ext = file.name.split(".").pop().toLowerCase();
      const isImg = ["jpg","jpeg","png","gif","webp"].includes(ext);
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => setAttachments(prev => [...prev, {name: file.name, type: "image", dataUrl: e.target.result, size: (file.size/1024 > 1000 ? (file.size/1048576).toFixed(1)+"MB" : (file.size/1024).toFixed(0)+"KB"), ext}]);
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, {name: file.name, type: "file", size: (file.size/1024 > 1000 ? (file.size/1048576).toFixed(1)+"MB" : (file.size/1024).toFixed(0)+"KB"), ext}]);
      }
    });
    showToast(`تم إرفاق ${files.length} ملف`);
  }, [showToast]);

  const addReaction = useCallback((msgId, emoji) => {
    setMessages(prev => ({
      ...prev,
      [activeConv]: (prev[activeConv] || []).map(m => {
        if (m.id !== msgId) return m;
        const reactions = [...(m.reactions || [])];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) existing.count++;
        else reactions.push({emoji, count: 1});
        return {...m, reactions};
      })
    }));
  }, [activeConv]);

  const insertMarkdown = (prefix, suffix = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = inputText.slice(start, end);
    const newText = inputText.slice(0, start) + prefix + selected + suffix + inputText.slice(end);
    setInputText(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  };

  const createGroup = useCallback((groupData) => {
    const newGroup = {
      id: "g" + Date.now(),
      type: "group",
      name: groupData.name + " " + groupData.emoji,
      avatar: null, initials: groupData.emoji,
      online: false, typing: false, unread: 0,
      lastMsg: "تم إنشاء المجموعة",
      lastTime: new Date().toLocaleTimeString("ar", {hour:"2-digit",minute:"2-digit"}),
      color: "#0E2A24", coverEmoji: groupData.emoji, theme: groupData.theme,
    };
    setConversations(prev => [newGroup, ...prev]);
    setMessages(prev => ({...prev, [newGroup.id]: [{id:1, sender:"system", senderName:"النظام", isMe:false, type:"system", text:`تم إنشاء مجموعة "${groupData.name}" ${groupData.emoji}`}]}));
    setActiveConv(newGroup.id);
    showToast(`تم إنشاء "${groupData.name}" ✓`, "ok");
  }, [showToast]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const selectConv = (id) => {
    setActiveConv(id);
    setConversations(prev => prev.map(c => c.id === id ? {...c, unread: 0} : c));
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="app" dir="rtl">
        {/* RAIL */}
        <div className="rail">
          <div className="rail-logo" title="Eco Space">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>

          {[
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, key:"home", tip:"الرئيسية"},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, key:"msgs", tip:"الرسائل", active:true, badge: conversations.reduce((s,c) => s+c.unread,0) > 0},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, key:"cal", tip:"التقويم"},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, key:"notes", tip:"الملاحظات", onClick: () => setOpenPanel("notes")},
          ].map(b => (
            <button key={b.key} className={`rail-btn${b.active?" active":""}`} title={b.tip} onClick={b.onClick}>
              {b.icon}
              {b.badge && <div className="badge" />}
            </button>
          ))}

          <div className="rail-spacer" />

          {/* New Group */}
          <button className="rail-btn" title="مجموعة جديدة" onClick={() => setOpenPanel("newgroup")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>

          {/* Settings */}
          <button className="rail-btn" title="الإعدادات" onClick={() => setOpenPanel("profile")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>

          {/* Avatar */}
          <div className="rail-avatar" title={profile.name} onClick={() => setOpenPanel("profile")} style={{marginTop:8,marginBottom:4}}>
            {profile.avatar ? <img src={profile.avatar} alt="" /> : profile.name.charAt(0)}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className={`sidebar${sidebarOpen ? "" : " mobile-hidden"}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">الرسائل</div>
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="بحث في المحادثات..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <button className="new-conv-btn" onClick={() => setOpenPanel("newgroup")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            محادثة جديدة
          </button>

          <div className="conv-list">
            {filteredConvs.map(conv => (
              <div key={conv.id} className={`conv-item${activeConv === conv.id ? " active" : ""}`} onClick={() => selectConv(conv.id)}>
                <div className="conv-avatar">
                  <div className="conv-avatar-img" style={{background: conv.type === "group" ? "var(--sage-pale)" : undefined, fontSize: conv.type === "group" ? 22 : undefined}}>
                    {conv.type === "group" ? conv.coverEmoji || "👥" : (conv.avatar ? <img src={conv.avatar} alt="" /> : conv.initials)}
                  </div>
                  {conv.type === "dm" && <div className={`online-dot ${conv.online ? "online" : "offline"}`} />}
                </div>
                <div className="conv-info">
                  <div className="conv-name">{conv.name}</div>
                  <div className={`conv-preview${typingUsers[conv.id] ? " typing" : ""}`}>
                    {typingUsers[conv.id] ? "يكتب..." : conv.lastMsg}
                  </div>
                </div>
                <div className="conv-meta">
                  <div className="conv-time">{conv.lastTime}</div>
                  {conv.unread > 0 && <div className="conv-badge">{conv.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="chat-area">
          {currentConv ? (<>
            {/* Header */}
            <div className="chat-header">
              {window.innerWidth < 768 && (
                <button className="icon-btn" onClick={() => setSidebarOpen(s => !s)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              )}
              <div className="chat-header-avatar">
                <div className="chat-header-avatar-img" style={currentConv.type==="group"?{fontSize:22,background:"var(--sage-pale)"}:{}}>
                  {currentConv.type === "group" ? currentConv.coverEmoji || "👥" : (currentConv.avatar ? <img src={currentConv.avatar} alt="" /> : currentConv.initials)}
                </div>
                {currentConv.type==="dm" && <div className={`online-dot ${currentConv.online ? "online" : "offline"}`} style={{position:"absolute",bottom:1,right:1,border:"2px solid var(--bg2)"}} />}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{currentConv.name}</div>
                <div className="chat-header-status">
                  {typingUsers[activeConv]
                    ? <span className="status-typing">يكتب...</span>
                    : currentConv.type === "dm"
                      ? (currentConv.online ? <><span style={{width:7,height:7,borderRadius:"50%",background:"var(--ok)",display:"inline-block"}} /><span className="status-online">متصل الآن</span></> : <span className="status-offline">غير متصل</span>)
                      : <span style={{color:"var(--text-3)"}}>{currentConv.type === "group" ? "مجموعة" : ""}</span>
                  }
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn" title="معلومات" onClick={() => showToast("قريباً: معلومات المحادثة")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </button>
                <button className="icon-btn" title="بحث">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
                <button className="icon-btn" title="ملاحظات" onClick={() => setOpenPanel("notes")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              <div className="date-sep"><div className="date-sep-line"/><div className="date-sep-text">اليوم</div><div className="date-sep-line"/></div>
              {currentMsgs.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onReact={addReaction} onOpen={(imgs, idx) => setMediaPreview({images: imgs, idx})} />
              ))}
              {typingUsers[activeConv] && (
                <div className="msg-row">
                  <div className="msg-avatar">{currentConv.initials?.charAt(0)}</div>
                  <div className="msg-bubble" style={{padding:"10px 16px",background:"var(--bubble-other)",display:"inline-flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--text-3)",animation:`pulse ${0.6+i*0.15}s infinite`}} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
              {/* Markdown toolbar */}
              {showMarkdown && (
                <div className="input-toolbar">
                  {[
                    {label:"B",tip:"عريض",action:() => insertMarkdown("**","**")},
                    {label:"I",tip:"مائل",action:() => insertMarkdown("*","*")},
                    {label:"`",tip:"كود",action:() => insertMarkdown("`","`")},
                    {label:"```",tip:"كتلة كود",action:() => insertMarkdown("```\n","\n```")},
                    {label:"H1",tip:"عنوان",action:() => insertMarkdown("# ")},
                    {label:"H2",tip:"عنوان 2",action:() => insertMarkdown("## ")},
                    {label:"> ",tip:"اقتباس",action:() => insertMarkdown("> ")},
                    {label:"- ",tip:"قائمة",action:() => insertMarkdown("- ")},
                  ].map(t => (
                    <button key={t.label} className="toolbar-btn" title={t.tip} onClick={t.action}>{t.label}</button>
                  ))}
                </div>
              )}

              {/* Recording bar */}
              {recording && (
                <div className="recording-bar">
                  <div className="rec-dot" />
                  <span className="rec-timer">{fmtDuration(recSeconds)}</span>
                  <VoiceBars count={20} progress={0} />
                  <button className="rec-cancel" onClick={() => setRecording(false)}>إلغاء</button>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="input-attachments" style={{marginBottom:8}}>
                  {attachments.map((a, i) => (
                    <div key={i} className="attachment-chip">
                      {a.type === "image" ? "🖼" : fileIcon(a.ext)} {a.name} ({a.size})
                      <button className="attachment-chip-remove" onClick={() => setAttachments(prev => prev.filter((_,j) => j !== i))}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="input-row" style={{position:"relative"}}>
                {/* Attach */}
                <button className="input-icon-btn attach-btn" title="إرفاق ملف" onClick={() => fileInputRef.current?.click()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <input ref={fileInputRef} type="file" hidden multiple onChange={e => handleFiles(e.target.files)} />

                {/* Emoji */}
                <button className="input-icon-btn emoji-btn" onClick={() => setShowEmoji(s => !s)}>😊</button>

                {/* Markdown toggle */}
                <button className="input-icon-btn attach-btn" title="تنسيق Markdown" onClick={() => setShowMarkdown(s => !s)} style={showMarkdown ? {background:"var(--sage-pale)",color:"var(--obs)"} : {}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                </button>

                {/* Text input */}
                <div className="input-box">
                  <textarea
                    ref={textareaRef}
                    placeholder="اكتب رسالة... (Shift+Enter لسطر جديد)"
                    value={inputText}
                    onChange={e => { setInputText(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                </div>

                {/* Voice */}
                <button className={`input-icon-btn voice-btn${recording ? " recording" : ""}`} title={recording ? "إنهاء التسجيل وإرسال" : "رسالة صوتية"} onClick={sendVoice}>
                  {recording
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>

                {/* Send */}
                <button className="input-icon-btn send-btn" onClick={sendMessage} disabled={!inputText.trim() && attachments.length === 0 && !recording}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmoji && (
                <div className="emoji-picker" style={{bottom:80}}>
                  <div className="emoji-cats">
                    {EMOJI_CATS.map((cat, i) => (
                      <button key={i} className={`emoji-cat-btn${emojiCat===i?" active":""}`} onClick={() => setEmojiCat(i)}>{cat.label}</button>
                    ))}
                  </div>
                  <div className="emoji-grid">
                    {EMOJI_CATS[emojiCat].emojis.map(e => (
                      <button key={e} className="emoji-item" onClick={() => { setInputText(t => t + e); }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">اختر محادثة للبدء</div>
              <div className="empty-state-sub">اختر محادثة من القائمة أو ابدأ محادثة جديدة</div>
            </div>
          )}
        </div>
      </div>

      {/* PANELS */}
      {openPanel === "notes" && <NotesPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "profile" && <ProfilePanel profile={profile} onClose={() => setOpenPanel(null)} onSave={setProfile} theme={theme} onTheme={setTheme} />}
      {openPanel === "newgroup" && <NewGroupPanel onClose={() => setOpenPanel(null)} onCreate={createGroup} />}

      {/* MEDIA PREVIEW */}
      {mediaPreview && <MediaPreview images={mediaPreview.images} startIdx={mediaPreview.idx} onClose={() => setMediaPreview(null)} />}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.type==="error"?" error":t.type==="ok"?" ok":""}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}
