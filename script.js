const initialData = { url: 'https://', text: '', email: '', subject: '', message: '', phone: '', ssid: '', password: '', security: 'WPA' };
const initialCustom = { size: 280, foreground: '#172033', background: '#ffffff', level: 'M', margin: 3, rounded: false };
let state = {
  theme: localStorage.getItem('qr-theme') || 'light',
  type: 'url',
  data: { ...initialData },
  custom: { ...initialCustom },
  logo: null,
  value: '',
  generated: false,
  history: JSON.parse(localStorage.getItem('qr-history') || '[]'),
  toastTimer: null
};

const typeInfo = {
  url: ['URL', '↗'], text: ['Text', 'T'], email: ['Email', '@'], phone: ['Phone', '☎'], wifi: ['Wi-Fi', '⌁']
};
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));

function appTemplate() {
  return `<div class="app">
    <header class="navbar"><div class="nav-inner">
      <button class="brand" data-scroll="generator" aria-label="Go to generator"><span class="brand-mark">⌗</span><span>QR <b>Studio</b></span></button>
      <nav class="nav-links">${['generator', 'history', 'about'].map(item => `<button data-scroll="${item}">${item[0].toUpperCase() + item.slice(1)}</button>`).join('')}</nav>
      <div class="nav-actions"><button class="theme-button" id="theme-toggle" aria-label="Toggle color theme">${state.theme === 'light' ? '☾' : '☀'}</button><button class="button button-primary nav-create" data-scroll="generator-workspace">Create QR →</button><button class="menu-button" id="menu-toggle" aria-label="Toggle navigation">☰</button></div>
    </div></header>
    <main>
      <section class="hero" id="generator"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> 100% Client-Side <span class="eyebrow-divider">•</span> No Data Upload</div><h1>Create QR codes<br><span>instantly.</span></h1><p>Generate, customize, and download beautiful QR codes directly from your browser.</p><button class="button button-primary hero-cta" data-scroll="generator-workspace">Start creating →</button><div class="trust-row"><div class="avatar-stack"><span>JS</span><span>AK</span><span>MR</span></div><span>Trusted by makers worldwide</span></div></div><div class="hero-art" aria-hidden="true"><div class="glow"></div><div class="floating-card float-top"><span>✦</span><b>Made for sharing</b></div><div class="hero-qr">⌗<div class="hero-qr-inner">⌗</div></div><div class="floating-card float-bottom"><span>✓</span><b>Private by design</b></div></div></section>
      <section class="workspace" id="generator-workspace"><div class="config-panel"><div class="panel-heading"><div><span class="overline">Generator</span><h2>What do you want to share?</h2></div><span class="step-count">01 / 02</span></div><div class="type-selector">${Object.entries(typeInfo).map(([id, [label, icon]]) => `<button class="type-tab ${state.type === id ? 'active' : ''}" data-type="${id}"><span>${icon}</span><b>${label}</b></button>`).join('')}</div><div class="input-area" id="input-area"></div><div class="customizer"><div class="section-label"><span>◈</span> Customize appearance</div><div class="range-row"><div class="range-heading"><span>QR size</span><b id="size-value">${state.custom.size}px</b></div><input id="qr-size" type="range" min="180" max="360" step="10" value="${state.custom.size}"></div><div class="custom-grid"><label class="color-field"><span>Foreground</span><div><input id="foreground" type="color" value="${state.custom.foreground}"><code id="foreground-value">${state.custom.foreground}</code></div></label><label class="color-field"><span>Background</span><div><input id="background" type="color" value="${state.custom.background}"><code id="background-value">${state.custom.background}</code></div></label></div><div class="custom-grid"><label class="select-field"><span>Error correction</span><select class="input select" id="level"><option value="L">Low (L)</option><option value="M">Medium (M)</option><option value="Q">Quartile (Q)</option><option value="H">High (H)</option></select></label><label class="select-field"><span>Quiet zone</span><select class="input select" id="margin"><option value="1">Small</option><option value="3">Standard</option><option value="5">Large</option></select></label></div><div class="toggle-row"><div><b>Rounded modules</b><span>Soften the QR code corners</span></div><button class="switch ${state.custom.rounded ? 'on' : ''}" id="rounded-toggle" aria-label="Toggle rounded modules"><span></span></button></div></div><div class="logo-uploader"><div class="section-label"><span>▣</span> Add a logo <span class="optional">Optional</span></div><div id="logo-area"></div></div></div><section class="preview-panel"><div class="panel-heading"><div><span class="overline">Live preview</span><h2>Your QR code</h2></div><span class="live-dot"><i></i> Live</span></div><div class="preview-stage"><div class="qr-frame" id="qr-frame"></div></div><div id="preview-meta"></div><div class="download-row"><button class="button button-dark" id="download-png">↓ Download PNG</button><button class="button button-outline" id="download-svg">▧ Download SVG</button></div><div class="preview-actions"><button id="copy-content">▣ Copy content</button><button id="reset">↻ Reset</button></div></section></section>
      <section class="content-section history-section" id="history"><div class="section-title-row"><div><span class="overline">Your creations</span><h2>Recent history</h2></div><button class="text-button danger" id="clear-history">Clear history　⌫</button></div><div id="history-list"></div></section>
      <section class="about-section" id="about"><div class="about-copy"><span class="overline">Built differently</span><h2>Simple tools.<br><span>More privacy.</span></h2><p>QR Studio is a privacy-focused QR code generator that lets you create and customize QR codes directly in your browser.</p><a href="#generator">Learn more about our approach →</a></div><div class="feature-grid">${[['✓', '100% Client-Side', 'Your data never leaves your browser.'], ['?', 'No Account Required', 'Start creating without sign-ups or friction.'], ['✦', 'Privacy Focused', 'A calm, private alternative to online tools.'], ['⌗', 'Fast Generation', 'Instant previews as you customize.']].map(([icon, title, text]) => `<div class="feature-card"><div class="feature-icon">${icon}</div><h3>${title}</h3><p>${text}</p></div>`).join('')}</div></section>
    </main><footer><button class="brand footer-brand" data-scroll="generator"><span class="brand-mark">⌗</span><span>QR <b>Studio</b></span></button><span>Create beautiful QR codes privately and instantly.</span><div class="footer-links"><button data-scroll="generator">Generator</button><button data-scroll="history">History</button><button data-scroll="about">About</button></div><small>© 2026 QR Studio · Developer: Sarthak Dhabale</small></footer><div id="toast-root"></div>
  </div>`;
}

function inputTemplate() {
  const d = state.data;
  if (state.type === 'url') return field('Website URL', `<input class="input" id="url" value="${escapeHtml(d.url)}" placeholder="https://example.com" inputmode="url">`);
  if (state.type === 'text') return field('Your message', `<textarea class="input textarea" id="text" maxlength="1000" placeholder="Type anything you want to share...">${escapeHtml(d.text)}</textarea>`, `${d.text.length}/1,000`);
  if (state.type === 'email') return `<div class="field-grid">${field('Email address', `<input class="input" id="email" value="${escapeHtml(d.email)}" placeholder="hello@example.com" inputmode="email">`)}${field('Subject', `<input class="input" id="subject" value="${escapeHtml(d.subject)}" placeholder="A quick hello">`)}${field('Message', `<textarea class="input textarea" id="message" placeholder="Write your message...">${escapeHtml(d.message)}</textarea>`)}</div>`;
  if (state.type === 'phone') return field('Phone number', `<input class="input" id="phone" value="${escapeHtml(d.phone)}" placeholder="+1 555 123 4567" inputmode="tel">`);
  return `<div class="field-grid">${field('Network name', `<input class="input" id="ssid" value="${escapeHtml(d.ssid)}" placeholder="My Wi-Fi">`)}${field('Password', `<input class="input" id="password" type="password" value="${escapeHtml(d.password)}" placeholder="••••••••">`)}${field('Security type', `<select class="input select" id="security"><option ${d.security === 'WPA' ? 'selected' : ''}>WPA</option><option ${d.security === 'WEP' ? 'selected' : ''}>WEP</option><option value="nopass" ${d.security === 'nopass' ? 'selected' : ''}>None</option></select>`)}</div>`;
}
function field(label, control, hint = '') { return `<label class="field"><span class="field-label">${label}${hint ? `<small>${hint}</small>` : ''}</span>${control}</label>`; }

function renderInputs() {
  $('#input-area').innerHTML = `${inputTemplate()}<button class="button button-primary generate-button" id="generate">✦ Generate QR code　→</button><div id="form-error"></div>`;
  $('#input-area').querySelectorAll('input,textarea,select').forEach(input => input.addEventListener('input', () => { state.data[input.id] = input.value; if (input.id === 'text') input.closest('.field').querySelector('small').textContent = `${input.value.length}/1,000`; }));
  $('#generate').addEventListener('click', generate);
}
function renderLogo() {
  $('#logo-area').innerHTML = state.logo ? `<div class="logo-preview"><img src="${state.logo.src}" alt="Uploaded logo preview"><div><b>${escapeHtml(state.logo.name)}</b><small>Stored only in this browser</small></div><button class="icon-button" id="remove-logo">⌫</button></div>` : `<div class="drop-zone" id="drop-zone"><span>⇧</span><div><b>Drop your logo here or <u>browse</u></b><small>PNG, JPG, JPEG, SVG · max 1 MB</small></div><input id="logo-input" type="file" accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"></div>`;
  if (!state.logo) { const drop = $('#drop-zone'); const input = $('#logo-input'); drop.addEventListener('click', () => input.click()); input.addEventListener('change', e => readLogo(e.target.files[0])); drop.addEventListener('dragover', e => e.preventDefault()); drop.addEventListener('drop', e => { e.preventDefault(); readLogo(e.dataTransfer.files[0]); }); } else $('#remove-logo').addEventListener('click', () => { state.logo = null; renderLogo(); });
}
function validate() {
  const d = state.data;
  if (state.type === 'url' && (!d.url.trim() || !/^https?:\/\/.+\..+/.test(d.url.trim()))) return 'Enter a valid URL starting with https://';
  if (state.type === 'text' && !d.text.trim()) return 'Add some text to continue.';
  if (state.type === 'email' && (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))) return 'Enter a valid email address.';
  if (state.type === 'phone' && (!d.phone.trim() || !/^[+\d][\d\s().-]{6,}$/.test(d.phone))) return 'Enter a valid phone number.';
  if (state.type === 'wifi' && (!d.ssid.trim() || (d.security !== 'nopass' && !d.password.trim()))) return 'Add a network name and password to continue.';
  return '';
}
function contentValue() { const d = state.data; if (state.type === 'url') return d.url.trim(); if (state.type === 'text') return d.text.trim(); if (state.type === 'email') return `mailto:${d.email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.message)}`; if (state.type === 'phone') return `tel:${d.phone.replace(/\s/g, '')}`; return `WIFI:T:${d.security};S:${d.ssid};P:${d.password};;`; }
function generate() {
  const error = validate(); if (error) { $('#form-error').innerHTML = `<span class="field-error">${error}</span>`; showToast(error, 'error'); return; }
  state.value = contentValue(); state.generated = true;
  state.history = [{ id: Date.now(), label: typeInfo[state.type][0], preview: state.value.slice(0, 68), type: state.type, data: { ...state.data }, custom: { ...state.custom }, logo: state.logo, createdAt: Date.now() }, ...state.history.filter(item => item.preview !== state.value).slice(0, 7)];
  persist(); renderPreview(); renderHistory(); showToast('QR code generated');
}
function makeQr() {
  if (typeof qrcode !== 'function') return null;
  const qr = qrcode(0, state.custom.level); qr.addData(state.value || 'QR Studio'); qr.make(); return qr;
}
function renderPreview() {
  const frame = $('#qr-frame'); const meta = $('#preview-meta');
  if (!state.generated) { frame.innerHTML = `<div class="empty-qr"><span class="qr-symbol">⌗</span><span>Your QR code will appear here</span><small>Fill in your content and hit generate</small></div>`; meta.innerHTML = ''; return; }
  const qr = makeQr(); if (!qr) { frame.innerHTML = '<div class="empty-qr"><span>QR library unavailable</span><small>Check your connection and reload.</small></div>'; return; }
  const dataUrl = qr.createDataURL(8, state.custom.margin); frame.innerHTML = `<img src="${dataUrl}" alt="Generated QR code" style="width:min(${state.custom.size}px,100%);height:auto;image-rendering:pixelated">`;
  meta.innerHTML = `<div class="preview-meta"><div><span>CONTENT TYPE</span><b>${state.value.startsWith('http') ? 'Website URL' : 'Custom content'}</b></div><div><span>CHARACTERS</span><b>${state.value.length}</b></div><div><span>ERROR CORRECTION</span><b>${state.custom.level}</b></div></div>`;
}
function download(format) {
  if (!state.generated) return showToast('Generate a QR code first.', 'error');
  const qr = makeQr(); if (!qr) return showToast('QR library unavailable.', 'error');
  const link = document.createElement('a'); link.download = `qr-studio-code.${format}`;
  if (format === 'png') link.href = qr.createDataURL(12, state.custom.margin);
  else { const svg = qr.createSvgTag(8, state.custom.margin); link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); }
  link.click(); if (format === 'svg') setTimeout(() => URL.revokeObjectURL(link.href), 1000); showToast('QR downloaded');
}
function readLogo(file) { if (!file) return; if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) return showToast('Use a PNG, JPG, JPEG, or SVG file.', 'error'); if (file.size > 1024 * 1024) return showToast('That image is larger than 1 MB.', 'error'); const reader = new FileReader(); reader.onload = e => { state.logo = { src: e.target.result, name: file.name }; renderLogo(); showToast('Logo uploaded'); }; reader.readAsDataURL(file); }
function renderHistory() {
  const list = $('#history-list'); if (!state.history.length) { list.innerHTML = `<div class="empty-history"><div class="qr-symbol">⌗</div><h3>No QR codes yet</h3><p>Your generated codes will show up here for quick access.</p></div>`; return; }
  list.innerHTML = `<div class="history-list">${state.history.map(item => `<div class="history-card"><div class="history-icon">⌗</div><div class="history-info"><b>${escapeHtml(item.label)}</b><span>${escapeHtml(item.preview)}</span><small>${new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></div><button class="icon-button reuse" data-id="${item.id}" aria-label="Reuse QR code">↻</button><button class="icon-button danger-icon delete" data-id="${item.id}" aria-label="Delete QR code">⌫</button></div>`).join('')}</div>`;
  list.querySelectorAll('.reuse').forEach(button => button.addEventListener('click', () => reuse(button.dataset.id)));
  list.querySelectorAll('.delete').forEach(button => button.addEventListener('click', () => { state.history = state.history.filter(item => String(item.id) !== button.dataset.id); persist(); renderHistory(); showToast('History item deleted'); }));
}
function reuse(id) { const item = state.history.find(entry => String(entry.id) === id); if (!item) return; state.type = item.type; state.data = { ...item.data }; state.custom = { ...initialCustom, ...(item.custom || {}) }; state.logo = item.logo || null; state.generated = false; renderInputs(); renderLogo(); syncCustomControls(); $('#generator-workspace').scrollIntoView({ behavior: 'smooth' }); showToast('Loaded from history'); }
function syncCustomControls() { $('#qr-size').value = state.custom.size; $('#size-value').textContent = `${state.custom.size}px`; $('#foreground').value = state.custom.foreground; $('#foreground-value').textContent = state.custom.foreground; $('#background').value = state.custom.background; $('#background-value').textContent = state.custom.background; $('#level').value = state.custom.level; $('#margin').value = state.custom.margin; $('#rounded-toggle').classList.toggle('on', state.custom.rounded); }
function showToast(message, type = 'success') { const root = $('#toast-root'); clearTimeout(state.toastTimer); root.innerHTML = `<div class="toast toast-${type}"><span class="toast-icon">${type === 'error' ? '×' : '✓'}</span><span>${escapeHtml(message)}</span><button id="close-toast">×</button></div>`; $('#close-toast').onclick = () => root.innerHTML = ''; state.toastTimer = setTimeout(() => root.innerHTML = '', 3200); }
function persist() { localStorage.setItem('qr-history', JSON.stringify(state.history)); localStorage.setItem('qr-theme', state.theme); }
function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

document.documentElement.dataset.theme = state.theme;
$('#app').innerHTML = appTemplate();
renderInputs(); renderLogo(); renderPreview(); renderHistory(); syncCustomControls();
document.addEventListener('click', event => { const target = event.target.closest('[data-scroll]'); if (target) { scrollTo(target.dataset.scroll); $('.nav-links').classList.remove('open'); } });
$('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = state.theme; $('#theme-toggle').textContent = state.theme === 'light' ? '☾' : '☀'; persist(); });
$('#menu-toggle').addEventListener('click', () => $('.nav-links').classList.toggle('open'));
document.querySelectorAll('.type-tab').forEach(button => button.addEventListener('click', () => { state.type = button.dataset.type; state.data = { ...initialData }; state.generated = false; document.querySelectorAll('.type-tab').forEach(item => item.classList.toggle('active', item === button)); renderInputs(); renderPreview(); }));
['qr-size', 'foreground', 'background', 'level', 'margin'].forEach(id => $(`#${id}`).addEventListener('input', event => { const map = { 'qr-size': 'size', foreground: 'foreground', background: 'background', level: 'level', margin: 'margin' }; state.custom[map[id]] = id === 'qr-size' || id === 'margin' ? Number(event.target.value) : event.target.value; syncCustomControls(); if (state.generated) renderPreview(); }));
$('#rounded-toggle').addEventListener('click', () => { state.custom.rounded = !state.custom.rounded; syncCustomControls(); });
$('#download-png').addEventListener('click', () => download('png')); $('#download-svg').addEventListener('click', () => download('svg'));
$('#copy-content').addEventListener('click', () => { if (!state.generated) return showToast('Generate a QR code first.', 'error'); navigator.clipboard?.writeText(state.value).then(() => showToast('Copied successfully!')); });
$('#reset').addEventListener('click', () => { state.data = { ...initialData }; state.custom = { ...initialCustom }; state.logo = null; state.value = ''; state.generated = false; renderInputs(); renderLogo(); syncCustomControls(); renderPreview(); });
$('#clear-history').addEventListener('click', () => { state.history = []; persist(); renderHistory(); showToast('History deleted'); });
