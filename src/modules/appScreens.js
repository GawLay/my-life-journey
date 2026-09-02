/**
 * Procedural placeholder app screens for the Work cards.
 *
 * Each returns an inline <svg> (viewBox 300×620, a phone aspect) styled as a calm,
 * dark-mode app UI tinted with the project's accent — so the grid reads as *real
 * product work* instead of abstract gradient smoke. Swap any card for a real
 * screenshot by adding `image:` to the project (see src/data/projects.js).
 */

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a, b, t) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const r = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${r.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const FONT = 'Inter, system-ui, sans-serif';

function statusBar(T) {
  return `
    <rect x="128" y="14" width="46" height="15" rx="7.5" fill="#020306"/>
    <text x="22" y="30" font-size="12" font-weight="600" font-family="${FONT}" fill="${T.b}">9:41</text>
    <rect x="252" y="20" width="22" height="11" rx="2.5" fill="none" stroke="${T.d}" stroke-width="1.3"/>
    <rect x="254" y="22" width="15" height="7" rx="1.5" fill="${T.b}"/>`;
}

function tabBar(T, active) {
  const xs = [42, 114, 186, 258];
  const icons = xs
    .map((x, i) => {
      const c = i === active ? T.tint : T.f;
      const dot = i === active ? `<circle cx="${x}" cy="583" r="2.4" fill="${T.tint}"/>` : '';
      return `<rect x="${x - 9}" y="574" width="18" height="18" rx="5.5" fill="none" stroke="${c}" stroke-width="1.6"/>${dot}`;
    })
    .join('');
  return `<rect x="0" y="556" width="300" height="1" fill="${T.f}"/>${icons}`;
}

function listRows(T, n, y0) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + i * 54;
    s += `
      <rect x="22" y="${y}" width="40" height="40" rx="12" fill="${T.panel2}"/>
      <rect x="74" y="${y + 8}" width="112" height="9" rx="4.5" fill="${T.b}" opacity="0.82"/>
      <rect x="74" y="${y + 24}" width="70" height="7" rx="3.5" fill="${T.d}"/>
      <rect x="230" y="${y + 14}" width="46" height="10" rx="5" fill="${T.tint}" opacity="0.75"/>`;
  }
  return s;
}

const bodies = {
  wallet: (T) => `
    <text x="24" y="70" font-size="13" font-family="${FONT}" fill="${T.d}">Good morning,</text>
    <text x="24" y="90" font-size="17" font-weight="600" font-family="${FONT}" fill="${T.b}">Kyrie</text>
    <rect x="20" y="104" width="260" height="118" rx="20" fill="${T.panel}"/>
    <rect x="20" y="104" width="260" height="118" rx="20" fill="${T.tint}" opacity="0.12"/>
    <text x="40" y="140" font-size="12" font-family="${FONT}" fill="${T.d}">Total balance</text>
    <text x="40" y="172" font-size="27" font-weight="700" font-family="${FONT}" fill="${T.b}">$12,480</text>
    <rect x="40" y="188" width="120" height="8" rx="4" fill="${T.tint}" opacity="0.6"/>
    <circle cx="248" cy="138" r="14" fill="${T.tint}"/>
    ${[46, 110, 174, 238]
      .map(
        (x) =>
          `<circle cx="${x}" cy="256" r="22" fill="${T.panel2}"/><rect x="${x - 9}" y="254" width="18" height="4" rx="2" fill="${T.tint}" opacity="0.85"/><rect x="${x - 15}" y="288" width="30" height="6" rx="3" fill="${T.f}"/>`
      )
      .join('')}
    <text x="24" y="336" font-size="13" font-weight="600" font-family="${FONT}" fill="${T.b}">Recent</text>
    ${listRows(T, 3, 352)}`,

  bank: (T) => `
    <text x="24" y="76" font-size="17" font-weight="600" font-family="${FONT}" fill="${T.b}">Accounts</text>
    <rect x="20" y="92" width="260" height="150" rx="20" fill="${T.panel}"/>
    <rect x="20" y="92" width="260" height="150" rx="20" fill="${T.tint}" opacity="0.16"/>
    <rect x="40" y="120" width="34" height="26" rx="6" fill="${T.tint}" opacity="0.85"/>
    <rect x="40" y="198" width="150" height="10" rx="5" fill="${T.b}" opacity="0.7"/>
    <rect x="40" y="216" width="82" height="7" rx="3.5" fill="${T.d}"/>
    <circle cx="234" cy="210" r="12" fill="#ffffff" opacity="0.22"/>
    <circle cx="250" cy="210" r="12" fill="${T.tint}" opacity="0.9"/>
    <rect x="20" y="262" width="260" height="40" rx="13" fill="${T.panel2}"/>
    <rect x="24" y="266" width="86" height="32" rx="10" fill="${T.tint}" opacity="0.92"/>
    <text x="67" y="287" font-size="11" font-weight="600" font-family="${FONT}" fill="#0b0b0b" text-anchor="middle">Cards</text>
    <text x="160" y="287" font-size="11" font-family="${FONT}" fill="${T.d}">Transfer</text>
    ${listRows(T, 3, 330)}`,

  dashboard: (T) => `
    <text x="24" y="74" font-size="17" font-weight="600" font-family="${FONT}" fill="${T.b}">Overview</text>
    <text x="24" y="94" font-size="12" font-family="${FONT}" fill="${T.d}">This week</text>
    <rect x="20" y="108" width="126" height="84" rx="16" fill="${T.panel}"/>
    <rect x="154" y="108" width="126" height="84" rx="16" fill="${T.panel}"/>
    <text x="38" y="150" font-size="23" font-weight="700" font-family="${FONT}" fill="${T.b}">84%</text>
    <rect x="38" y="162" width="72" height="7" rx="3.5" fill="${T.f}"/>
    <text x="172" y="150" font-size="23" font-weight="700" font-family="${FONT}" fill="${T.tint}">1.2k</text>
    <rect x="172" y="162" width="72" height="7" rx="3.5" fill="${T.f}"/>
    <rect x="20" y="204" width="260" height="152" rx="18" fill="${T.panel}"/>
    <rect x="40" y="224" width="90" height="8" rx="4" fill="${T.d}"/>
    ${[46, 72, 54, 100, 66, 116, 82]
      .map((h, i) => `<rect x="${40 + i * 32}" y="${334 - h}" width="16" height="${h}" rx="5" fill="${i === 5 ? T.tint : T.tintDim}"/>`)
      .join('')}
    ${listRows(T, 1, 388)}`,

  weather: (T) => `
    <text x="150" y="78" font-size="14" font-family="${FONT}" fill="${T.d}" text-anchor="middle">Ho Chi Minh City</text>
    ${[70, 120, 210, 250, 96, 190]
      .map((x, i) => `<circle cx="${x}" cy="${110 + (i % 3) * 26}" r="${1.6 + (i % 2)}" fill="${T.tint}" opacity="0.5"/>`)
      .join('')}
    <circle cx="150" cy="150" r="44" fill="${T.tint}" opacity="0.9"/>
    <circle cx="150" cy="150" r="52" fill="none" stroke="${T.tint}" stroke-width="1" opacity="0.35"/>
    <text x="150" y="248" font-size="54" font-weight="600" font-family="${FONT}" fill="${T.b}" text-anchor="middle">31°</text>
    <text x="150" y="274" font-size="13" font-family="${FONT}" fill="${T.d}" text-anchor="middle">Partly cloudy</text>
    <rect x="20" y="300" width="260" height="98" rx="18" fill="${T.panel}"/>
    ${[48, 102, 156, 210, 258]
      .map(
        (x, i) =>
          `<rect x="${x - 12}" y="318" width="24" height="6" rx="3" fill="${T.f}"/><circle cx="${x}" cy="352" r="9" fill="${i === 2 ? T.tint : T.tintDim}"/><rect x="${x - 10}" y="376" width="20" height="6" rx="3" fill="${T.d}"/>`
      )
      .join('')}`,

  shop: (T) => {
    const card = (x, y) => `
      <rect x="${x}" y="${y}" width="126" height="140" rx="16" fill="${T.panel}"/>
      <rect x="${x + 12}" y="${y + 12}" width="102" height="82" rx="10" fill="${T.tint}" opacity="0.16"/>
      <circle cx="${x + 63}" cy="${y + 53}" r="20" fill="${T.tint}" opacity="0.55"/>
      <rect x="${x + 12}" y="${y + 106}" width="80" height="8" rx="4" fill="${T.b}" opacity="0.78"/>
      <rect x="${x + 12}" y="${y + 122}" width="46" height="7" rx="3.5" fill="${T.tint}"/>`;
    return `
      <text x="24" y="74" font-size="17" font-weight="600" font-family="${FONT}" fill="${T.b}">Shop</text>
      <rect x="20" y="88" width="260" height="34" rx="12" fill="${T.panel2}"/>
      <circle cx="40" cy="105" r="6" fill="none" stroke="${T.d}" stroke-width="1.6"/>
      <rect x="54" y="102" width="94" height="6" rx="3" fill="${T.f}"/>
      ${card(20, 138)}${card(154, 138)}${card(20, 292)}${card(154, 292)}`;
  },

  map: (T) => {
    let grid = '';
    for (let i = 1; i < 6; i++) grid += `<rect x="0" y="${40 + i * 58}" width="300" height="1" fill="${T.f}"/>`;
    for (let i = 1; i < 5; i++) grid += `<rect x="${i * 60}" y="40" width="1" height="352" fill="${T.f}"/>`;
    return `
      <rect x="0" y="40" width="300" height="352" fill="${T.panel}"/>
      ${grid}
      <path d="M58 356 C 110 300, 128 232, 196 192 S 250 120, 240 92" fill="none" stroke="${T.tint}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="356" r="7" fill="${T.tint}"/>
      <circle cx="240" cy="92" r="9" fill="#05060b" stroke="${T.tint}" stroke-width="3"/>
      <rect x="0" y="384" width="300" height="208" rx="22" fill="${T.panel2}"/>
      <rect x="130" y="398" width="40" height="5" rx="2.5" fill="${T.f}"/>
      <circle cx="48" cy="452" r="20" fill="${T.panel}"/>
      <rect x="80" y="440" width="122" height="9" rx="4.5" fill="${T.b}" opacity="0.82"/>
      <rect x="80" y="458" width="80" height="7" rx="3.5" fill="${T.d}"/>
      <rect x="20" y="502" width="260" height="44" rx="14" fill="${T.tint}"/>
      <text x="150" y="529" font-size="13" font-weight="600" font-family="${FONT}" fill="#0b0b0b" text-anchor="middle">Track order</text>`;
  },
};

const TAB = { wallet: 0, bank: 1, dashboard: 2, weather: 0, shop: 1, map: null };

export function screenSVG(kind, tint) {
  const T = {
    tint,
    b: 'rgba(255,255,255,0.92)',
    d: 'rgba(255,255,255,0.44)',
    f: 'rgba(255,255,255,0.15)',
    bg: mix(tint, '#05060b', 0.9),
    panel: mix(tint, '#0c0f18', 0.8),
    panel2: mix(tint, '#12151f', 0.74),
    tintDim: mix(tint, '#0a0c14', 0.5),
  };
  const body = (bodies[kind] || bodies.wallet)(T);
  const tab = TAB[kind];
  const tabMarkup = tab === null || tab === undefined ? '' : tabBar(T, tab);
  return `<svg viewBox="0 0 300 620" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="App interface preview"><rect width="300" height="620" fill="${T.bg}"/>${statusBar(T)}${body}${tabMarkup}</svg>`;
}
