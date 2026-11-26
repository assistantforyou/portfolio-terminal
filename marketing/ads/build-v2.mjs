// Ad set v2: prices THB 399 / 699, competitor and data-source logos, charts and illustrations.
// Writes to marketing/ads/v2/ only. The first ad set (marketing/ads/out, build.mjs) is left untouched.
// Run from the repo root: node marketing/ads/build-v2.mjs  (needs Chromium + playwright)
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = join(here, "v2"), SRC = join(V2, "src"), OUT = join(V2, "out");
rmSync(SRC, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true });
mkdirSync(SRC, { recursive: true }); mkdirSync(OUT, { recursive: true });
const uri = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");
const LOGO = uri(join(V2, "assets", "lekha-logo-navy.png"));
const LG = Object.fromEntries(["bloomberg", "koyfin", "tradingview", "tikr", "finviz", "morningstar", "seekingalpha", "stockanalysis", "sec", "fred", "alpaca", "coingecko", "frankfurter"].map((k) => [k, uri(join(V2, "assets", "logos", k + ".png"))]));

/* ---------- Prices ---------- */
const FX = 32.7; // THB per USD
const PAID = 399, PREM = 699;
const baht = (n) => "฿" + Math.round(n).toLocaleString("en-US");
const P = [
  { n: "Bloomberg Terminal", logo: "bloomberg", v: 31980 / 12, list: "$31,980 / yr", focus: "Institutional terminal" },
  { n: "Koyfin Premium", logo: "koyfin", v: 79, list: "$79 / mo", focus: "Research and dashboards" },
  { n: "TradingView Premium", logo: "tradingview", v: 69.95, list: "$69.95 / mo", focus: "Charting and screening" },
  { n: "TIKR Pro", logo: "tikr", v: 54.95, list: "$54.95 / mo", focus: "Global financials and valuation" },
  { n: "Finviz Elite", logo: "finviz", v: 39.5, list: "$39.50 / mo", focus: "Screening and charts" },
  { n: "Koyfin Plus", logo: "koyfin", v: 39, list: "$39 / mo", focus: "Research and dashboards" },
  { n: "Morningstar Investor", logo: "morningstar", v: 34.95, list: "$34.95 / mo", focus: "Ratings and portfolio tools" },
  { n: "TIKR Plus", logo: "tikr", v: 24.95, list: "$24.95 / mo", focus: "Global financials and valuation" },
  { n: "Seeking Alpha Premium", logo: "seekingalpha", v: 299 / 12, list: "$299 / yr", focus: "Analyst ratings and news" },
  { n: "LEKHA Premium", us: 1, plan: "Premium", t: PREM, list: `฿${PREM} / mo` },
  { n: "Stock Analysis Pro", logo: "stockanalysis", v: 9.99, list: "$9.99 / mo", focus: "Financial statements and data" },
  { n: "LEKHA Paid", us: 1, plan: "Paid", t: PAID, list: `฿${PAID} / mo` },
];
for (const p of P) if (!p.us) p.t = Math.round(p.v * FX);
const cheaperThan = P.filter((p) => !p.us && p.t > PAID).length; // competitors above LEKHA Paid
const NCOMP = P.filter((p) => !p.us).length;
if (cheaperThan !== 9 || P.filter((p) => !p.us && p.t > PREM).length !== 9) throw new Error("headline claim 9 of 10 no longer holds");
const SRC_NOTE = `Monthly price in baht at list price on monthly billing, checked 23 Nov 2026. USD list prices converted at 1 USD = ${FX.toFixed(2)} THB. Seeking Alpha is $299 a year and Bloomberg is $31,980 a year per third-party reports (one terminal), both divided by 12. Annual billing lowers several competitor prices.`;
const DISC = "Analysis software, not investment advice. Data may be delayed. Prices in THB, billed monthly through Stripe, renew until cancelled.";
const TM = "Third-party names and logos belong to their owners and are used only to identify the products compared.";

/* ---------- Tokens and page shell ---------- */
const CSS = `
:root{--bg:#FCF7F0;--panel:#FFFFFF;--line:#E3DCCF;--fg:#17223B;--muted:#6E685C;--accent:#0A7A6A;--soft:#DFF0EC}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font-family:Inter,"Noto Sans Thai",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.pad{position:absolute;inset:0;padding:84px 84px 72px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:26px;border-bottom:1px solid var(--line)}
.logo{height:54px;width:auto;display:block}
.tag{font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:500}
h1{font-size:82px;line-height:1.06;font-weight:700;letter-spacing:-.03em}
h2{font-size:56px;line-height:1.1;font-weight:700;letter-spacing:-.025em}
.lead{font-size:30px;line-height:1.42;color:var(--muted)}
.acc{color:var(--accent)}
.grow{flex:1}
.foot{font-size:18px;line-height:1.45;color:var(--muted);border-top:1px solid var(--line);padding-top:16px;margin-top:22px}
.eyebrow{font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:600}
.btn{display:inline-block;background:var(--fg);color:#FCF7F0;font-weight:600;font-size:30px;padding:24px 44px}
.fig{font-size:110px;font-weight:700;letter-spacing:-.04em;line-height:1}
.rule{height:1px;background:var(--line)}
.ill{align-self:flex-start;display:inline-block;border:1px solid var(--accent);color:var(--accent);font-size:17px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;padding:6px 12px}
`;
const sp = (n) => `<div style="height:${n}px"></div>`;
const head = (tag) => `<div class="top"><img class="logo" src="${LOGO}" alt="LEKHA Financials"><span class="tag">${tag}</span></div>`;
const CENTER_JS = `document.querySelectorAll(".pad[data-center]").forEach(function(p){var k=Array.prototype.slice.call(p.children),top=k[0],foot=k.filter(function(x){return x.classList.contains("foot")})[0],mid=k.filter(function(x){return x!==top&&x!==foot&&!x.classList.contains("grow")});k.filter(function(x){return x.classList.contains("grow")}).forEach(function(x){x.remove()});var e=function(x){return x&&!x.textContent.trim()&&!x.querySelector("img,svg,table")&&x.style.height};while(mid.length&&e(mid[0])){mid[0].remove();mid.shift()}while(mid.length&&e(mid[mid.length-1])){mid[mid.length-1].remove();mid.pop()}var w=document.createElement("div");w.style.cssText="flex:1;display:flex;flex-direction:column;justify-content:center";mid.forEach(function(x){w.appendChild(x)});top.after(w)});`;
const page = (w, h, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LEKHA ad</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}body{width:${w}px;height:${h}px}</style></head><body>${body}<script>${CENTER_JS}</script></body></html>`;

/* ---------- SVG helpers ---------- */
let cid = 0;
const NAVY = "#17223B", MUTED = "#6E685C", LINE = "#E3DCCF", TEAL = "#0A7A6A", GREY = "#B9B3A6";
const logoImg = (key, x, y, s) => { const id = "c" + ++cid; return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.2}"/></clipPath><image href="${LG[key]}" x="${x}" y="${y}" width="${s}" height="${s}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>`; };
const wordmark = (x, y, w) => `<image href="${LOGO}" x="${x}" y="${y}" width="${w}" height="${w / 3.594}"/>`;
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 20}" font-family="${o.mono ? "IBM Plex Mono" : "Inter"}" font-weight="${o.w || 400}" fill="${o.c || NAVY}" text-anchor="${o.a || "start"}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${s}</text>`;
const svg = (w, h, inner) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

/* Horizontal bar chart on a log axis (THB per month), logos in the label column. */
function chartLog(W, rowH, fs) {
  const L = 360, PW = W - L - 140, top = 50, ph = rowH * P.length, H = top + ph + 96;
  const X = (v) => L + ((Math.log10(v) - 2) / 3) * PW;
  const ticks = [100, 1000, 10000, 100000];
  let o = ticks.map((k) => `<line x1="${X(k)}" y1="${top - 8}" x2="${X(k)}" y2="${top + ph}" stroke="${LINE}" stroke-width="1.5"/><line x1="${X(k)}" y1="${top + ph}" x2="${X(k)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X(k), top + ph + 34, baht(k), { a: "middle", c: MUTED, fs: 21 })}`).join("");
  o += `<line x1="${L}" y1="${top - 8}" x2="${L}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/><line x1="${L}" y1="${top + ph}" x2="${X(100000)}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/>`;
  o += t(0, 24, "PLATFORM", { fs: 16, c: MUTED, ls: 2 }) + t((L + X(100000)) / 2, top + ph + 80, "Thai baht per month, logarithmic scale", { a: "middle", c: MUTED, fs: 20 });
  P.forEach((p, i) => {
    const y = top + i * rowH, bh = rowH * 0.6, by = y + (rowH - bh) / 2, cy = y + rowH / 2, ic = Math.min(36, rowH * 0.7), col = p.us ? TEAL : NAVY;
    if (p.us) o += wordmark(0, cy - 13, 96) + t(110, cy + fs * 0.34, p.plan, { fs, w: 700, c: TEAL });
    else o += logoImg(p.logo, 0, cy - ic / 2, ic) + t(ic + 14, cy + fs * 0.34, p.n, { fs, w: 500 });
    o += `<rect x="${L}" y="${by}" width="${X(p.t) - L}" height="${bh}" fill="${p.us ? TEAL : GREY}"/>` + t(X(p.t) + 14, cy + fs * 0.34, baht(p.t), { fs, mono: 1, w: p.us ? 700 : 500, c: col });
  });
  return svg(W, H, o);
}

/* Cumulative twelve-month cost, linear axes, logos at the line ends. */
function chartCost(W, H) {
  const L = 140, R = 345, top = 24, B = 78, pw = W - L - R, ph = H - top - B;
  const X = (m) => L + (m / 12) * pw, Y = (v) => top + ph - (v / 32000) * ph;
  const series = P.filter((p) => p.n !== "Bloomberg Terminal").map((p) => ({ p, end: p.t * 12 })).sort((a, b) => b.end - a.end);
  let o = [0, 10000, 20000, 30000].map((v) => `<line x1="${L}" y1="${Y(v)}" x2="${L + pw}" y2="${Y(v)}" stroke="${LINE}" stroke-width="1.5"/>${t(L - 14, Y(v) + 7, baht(v), { a: "end", c: MUTED, fs: 20 })}`).join("");
  o += [0, 3, 6, 9, 12].map((m) => `<line x1="${X(m)}" y1="${top + ph}" x2="${X(m)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X(m), top + ph + 34, m, { a: "middle", c: MUTED, fs: 20 })}`).join("");
  o += `<line x1="${L}" y1="${top}" x2="${L}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/><line x1="${L}" y1="${top + ph}" x2="${L + pw}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/>`;
  o += t(L + pw / 2, top + ph + 70, "Months of subscription", { a: "middle", c: MUTED, fs: 20 }) + t(20, top + ph / 2, "Cumulative cost, THB", { a: "middle", c: MUTED, fs: 20, rot: -90 });
  series.forEach(({ p, end }) => { o += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(12)}" y2="${Y(end)}" stroke="${p.us ? TEAL : GREY}" stroke-width="${p.us ? 5 : 3}" stroke-linecap="round"/>`; });
  let last = -1e9; // label collision pass, top to bottom
  series.forEach(({ p, end }) => { let y = Y(end); if (y - last < 30) y = last + 30; last = y; const col = p.us ? TEAL : NAVY;
    o += `<circle cx="${X(12)}" cy="${Y(end)}" r="${p.us ? 7 : 5}" fill="${p.us ? TEAL : GREY}"/>`;
    o += p.us ? wordmark(X(12) + 16, y - 7, 70) + t(X(12) + 94, y + 6, baht(end), { mono: 1, fs: 19, w: 700, c: col }) + t(X(12) + 196, y + 6, p.plan, { fs: 17, w: 700, c: TEAL }) : logoImg(p.logo, X(12) + 16, y - 13, 26) + t(X(12) + 50, y + 6, baht(end), { mono: 1, fs: 19, c: col }) + t(X(12) + 150, y + 6, p.n.replace(/ Premium$/, " Premium"), { fs: 17, c: MUTED }); });
  return svg(W, H, o);
}

/* Dot matrix: how many months of LEKHA Paid one month of Bloomberg pays for. */
function chartDots(W) {
  const months = P[0].t / PAID, cols = 12, rows = Math.ceil(months / cols), cell = 34, gap = 6, L = 120, top = 56, H = top + rows * (cell + gap) + 84;
  let o = "";
  for (let c = 0; c < cols; c++) o += t(L + c * (cell + gap) + cell / 2, top - 14, c + 1, { a: "middle", fs: 16, c: MUTED });
  [1, 5, 10, 15, rows].forEach((r) => { o += t(L - 14, top + (r - 1) * (cell + gap) + cell / 2 + 6, r, { a: "end", fs: 18, c: MUTED }); });
  for (let i = 0; i < Math.ceil(months); i++) { const c = i % cols, r = Math.floor(i / cols), f = Math.min(1, months - i); o += `<rect x="${L + c * (cell + gap)}" y="${top + r * (cell + gap)}" width="${cell * f}" height="${cell}" fill="${TEAL}"/>`; }
  o += t(L + (cols * (cell + gap)) / 2, 18, "Month of the year", { a: "middle", fs: 18, c: MUTED });
  o += t(24, top + (rows * (cell + gap)) / 2, "Year", { a: "middle", fs: 18, c: MUTED, rot: -90 });
  o += `<rect x="${L + cols * (cell + gap) + 36}" y="${top}" width="${cell}" height="${cell}" fill="${TEAL}"/>` + t(L + cols * (cell + gap) + 36 + cell + 12, top + 24, "= one month", { fs: 22, w: 600 }) + t(L + cols * (cell + gap) + 36, top + 60, `of LEKHA Paid`, { fs: 22, c: MUTED }) + t(L + cols * (cell + gap) + 36, top + 90, `at ${baht(PAID)}`, { fs: 22, c: MUTED });
  return { s: svg(W, H, o), months };
}

/* Horizontal bar chart of a small data set with a numeric axis. */
function chartBars(W, rows, max, step, title, rowH = 62) {
  const L = 270, PW = W - L - 70, top = 20, ph = rows.length * rowH, H = top + ph + 90;
  const X = (v) => L + (v / max) * PW;
  let o = "";
  for (let v = 0; v <= max; v += step) o += `<line x1="${X(v)}" y1="${top}" x2="${X(v)}" y2="${top + ph}" stroke="${LINE}" stroke-width="1.5"/><line x1="${X(v)}" y1="${top + ph}" x2="${X(v)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X(v), top + ph + 34, v, { a: "middle", fs: 20, c: MUTED })}`;
  o += `<line x1="${L}" y1="${top}" x2="${L}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/><line x1="${L}" y1="${top + ph}" x2="${X(max)}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/>`;
  rows.forEach(([n, v], i) => { const y = top + i * rowH, bh = rowH * 0.6, cy = y + rowH / 2; o += t(L - 18, cy + 8, n, { a: "end", fs: 23, w: 500 }) + `<rect x="${L}" y="${y + (rowH - bh) / 2}" width="${X(v) - L}" height="${bh}" fill="${TEAL}"/>` + t(X(v) + 12, cy + 8, v, { fs: 23, w: 700, c: TEAL, mono: 1 }); });
  o += t((L + X(max)) / 2, top + ph + 78, title, { a: "middle", fs: 20, c: MUTED });
  return svg(W, H, o);
}

/* Seeded Monte Carlo (geometric Brownian motion) for the illustrations. */
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const MU = 0.08, SIG = 0.18, NP = 3000, NS = 252;
const MC = (() => {
  const r = mulberry(20261123), z = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
  const dt = 1 / NS, steps = Array.from({ length: NS + 1 }, () => new Float64Array(NP)); const sample = [];
  for (let p = 0; p < NP; p++) { let v = 100; steps[0][p] = v; const path = [100]; for (let s = 1; s <= NS; s++) { v *= Math.exp((MU - 0.5 * SIG * SIG) * dt + SIG * Math.sqrt(dt) * z()); steps[s][p] = v; if (p < 30) path.push(v); } if (p < 30) sample.push(path); }
  const q = (arr, f) => { const a = Array.from(arr).sort((x, y) => x - y); return a[Math.floor(f * (a.length - 1))]; };
  const band = steps.map((a) => [q(a, 0.05), q(a, 0.25), q(a, 0.5), q(a, 0.75), q(a, 0.95)]);
  return { band, sample, final: Array.from(steps[NS]), var5: q(steps[NS], 0.05) - 100 };
})();
function chartFan(W, H) {
  const L = 96, top = 20, B = 78, R = 30, pw = W - L - R, ph = H - top - B, lo = 60, hi = 180;
  const X = (s) => L + (s / NS) * pw, Y = (v) => top + ph - ((v - lo) / (hi - lo)) * ph;
  let o = [60, 100, 140, 180].map((v) => `<line x1="${L}" y1="${Y(v)}" x2="${L + pw}" y2="${Y(v)}" stroke="${LINE}" stroke-width="1.5"/>${t(L - 14, Y(v) + 7, v, { a: "end", c: MUTED, fs: 20 })}`).join("");
  o += [0, 3, 6, 9, 12].map((m) => `<line x1="${X((m / 12) * NS)}" y1="${top + ph}" x2="${X((m / 12) * NS)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X((m / 12) * NS), top + ph + 34, m, { a: "middle", c: MUTED, fs: 20 })}`).join("");
  const poly = (i, j) => MC.band.map((b, s) => `${X(s).toFixed(1)},${Y(Math.min(hi, Math.max(lo, b[i]))).toFixed(1)}`).concat(MC.band.map((b, s) => `${X(NS - s).toFixed(1)},${Y(Math.min(hi, Math.max(lo, MC.band[NS - s][j]))).toFixed(1)}`)).join(" ");
  o += `<polygon points="${poly(0, 4)}" fill="${TEAL}" fill-opacity=".14"/><polygon points="${poly(1, 3)}" fill="${TEAL}" fill-opacity=".24"/>`;
  MC.sample.slice(0, 16).forEach((p) => { o += `<polyline points="${p.map((v, s) => `${X(s).toFixed(1)},${Y(Math.min(hi, Math.max(lo, v))).toFixed(1)}`).join(" ")}" fill="none" stroke="${NAVY}" stroke-opacity=".22" stroke-width="1.2"/>`; });
  o += `<polyline points="${MC.band.map((b, s) => `${X(s).toFixed(1)},${Y(b[2]).toFixed(1)}`).join(" ")}" fill="none" stroke="${TEAL}" stroke-width="4"/>`;
  o += `<line x1="${L}" y1="${top}" x2="${L}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/><line x1="${L}" y1="${top + ph}" x2="${L + pw}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/>`;
  o += t(L + pw / 2, top + ph + 70, "Months from today", { a: "middle", c: MUTED, fs: 20 }) + t(26, top + ph / 2, "Portfolio value (start = 100)", { a: "middle", c: MUTED, fs: 20, rot: -90 });
  o += t(X(NS) - 10, Y(MC.band[NS][2]) - 14, "Median", { a: "end", fs: 20, w: 700, c: TEAL }) + t(X(NS) - 10, Y(MC.band[NS][4]) + 26, "5th to 95th percentile", { a: "end", fs: 18, c: MUTED }) + t(X(NS) - 10, Y(MC.band[NS][3]) + 6, "25th to 75th", { a: "end", fs: 18, c: MUTED });
  return svg(W, H, o);
}
function chartHist(W, H) {
  const L = 96, top = 20, B = 78, R = 50, pw = W - L - R, ph = H - top - B, x0 = -40, x1 = 100, bw = 5;
  const bins = Array.from({ length: (x1 - x0) / bw }, () => 0); MC.final.forEach((v) => { const i = Math.min(bins.length - 1, Math.max(0, Math.floor((v - 100 - x0) / bw))); bins[i]++; });
  const pct = bins.map((c) => (c / NP) * 100), ymax = 15, X = (v) => L + ((v - x0) / (x1 - x0)) * pw, Y = (v) => top + ph - (v / ymax) * ph;
  let o = [0, 5, 10, 15].map((v) => `<line x1="${L}" y1="${Y(v)}" x2="${L + pw}" y2="${Y(v)}" stroke="${LINE}" stroke-width="1.5"/>${t(L - 14, Y(v) + 7, v + "%", { a: "end", c: MUTED, fs: 20 })}`).join("");
  o += [-40, -20, 0, 20, 40, 60, 80, 100].map((v) => `<line x1="${X(v)}" y1="${top + ph}" x2="${X(v)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X(v), top + ph + 34, (v > 0 ? "+" : "") + v + "%", { a: "middle", c: MUTED, fs: 19 })}`).join("");
  pct.forEach((p, i) => { const a = x0 + i * bw; o += `<rect x="${X(a) + 1.5}" y="${Y(p)}" width="${X(a + bw) - X(a) - 3}" height="${top + ph - Y(p)}" fill="${a + bw <= MC.var5 ? "#9C3B2E" : TEAL}"/>`; });
  o += `<line x1="${X(MC.var5)}" y1="${top}" x2="${X(MC.var5)}" y2="${top + ph}" stroke="#9C3B2E" stroke-width="3" stroke-dasharray="9 7"/>` + t(X(MC.var5) + 14, top + 34, `5th percentile ${MC.var5.toFixed(0)}%`, { a: "start", fs: 21, w: 700, c: "#9C3B2E" });
  o += `<line x1="${L}" y1="${top}" x2="${L}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/><line x1="${L}" y1="${top + ph}" x2="${L + pw}" y2="${top + ph}" stroke="${NAVY}" stroke-width="2"/>`;
  o += t(L + pw / 2, top + ph + 70, "One-year return", { a: "middle", c: MUTED, fs: 20 }) + t(26, top + ph / 2, "Share of simulated paths", { a: "middle", c: MUTED, fs: 20, rot: -90 });
  return svg(W, H, o);
}

/* DCF sensitivity: enterprise value as a multiple of today's free cash flow, hypothetical inputs. */
function chartDcf(W) {
  const G = [4, 6, 8, 10, 12], WACC = [7, 8, 9, 10, 11], TG = 0.025, L = 190, top = 70, cw = (W - L) / 5, ch = 96, H = top + 5 * ch + 70;
  const ev = (g, w) => { let s = 0, f = 1; for (let k = 1; k <= 5; k++) { f *= 1 + g / 100; s += f / Math.pow(1 + w / 100, k); } return s + (f * (1 + TG)) / (w / 100 - TG) / Math.pow(1 + w / 100, 5); };
  const vals = WACC.map((w) => G.map((g) => ev(g, w))), mn = Math.min(...vals.flat()), mx = Math.max(...vals.flat());
  const mix = (a, b, f) => a.map((x, i) => Math.round(x + (b[i] - x) * f)), c0 = [223, 240, 236], c1 = [10, 122, 106];
  let o = G.map((g, j) => t(L + j * cw + cw / 2, top - 16, g + "%", { a: "middle", fs: 22, w: 600 })).join("") + t(L + (5 * cw) / 2, 24, "Free cash flow growth, years 1 to 5", { a: "middle", fs: 19, c: MUTED });
  WACC.forEach((w, i) => { o += t(L - 18, top + i * ch + ch / 2 + 8, w + "%", { a: "end", fs: 22, w: 600 }); G.forEach((g, j) => { const f = (vals[i][j] - mn) / (mx - mn), col = mix(c0, c1, f); o += `<rect x="${L + j * cw + 2}" y="${top + i * ch + 2}" width="${cw - 4}" height="${ch - 4}" fill="rgb(${col})"/>` + t(L + j * cw + cw / 2, top + i * ch + ch / 2 + 9, vals[i][j].toFixed(1) + "x", { a: "middle", fs: 25, w: 700, mono: 1, c: f > 0.45 ? "#FFFFFF" : NAVY }); }); });
  o += t(26, top + (5 * ch) / 2, "WACC", { a: "middle", fs: 19, c: MUTED, rot: -90 }) + t(L + (5 * cw) / 2, top + 5 * ch + 44, "Enterprise value as a multiple of today's free cash flow. Terminal growth 2.5%.", { a: "middle", fs: 19, c: MUTED });
  return svg(W, H, o);
}

/* Relative rotation graph, hypothetical trails. */
function chartRrg(W, H) {
  const L = 90, top = 20, B = 78, R = 20, pw = W - L - R, ph = H - top - B, lo = 94, hi = 106, X = (v) => L + ((v - lo) / (hi - lo)) * pw, Y = (v) => top + ph - ((v - lo) / (hi - lo)) * ph;
  const Q = [["Improving", 94, 100, 100, 106, "#E4ECF7", "#3C5E94"], ["Leading", 100, 100, 106, 106, "#E2F1E8", "#1E7048"], ["Lagging", 94, 94, 100, 100, "#F7E4E1", "#9C3B2E"], ["Weakening", 100, 94, 106, 100, "#F8EDD9", "#8A5A12"]];
  let o = Q.map(([n, a, b, c, d, f, k]) => `<rect x="${X(a)}" y="${Y(d)}" width="${X(c) - X(a)}" height="${Y(b) - Y(d)}" fill="${f}"/>` + t(n === "Improving" || n === "Lagging" ? X(a) + 14 : X(c) - 14, n === "Improving" || n === "Leading" ? Y(d) + 32 : Y(b) - 16, n.toUpperCase(), { a: n === "Improving" || n === "Lagging" ? "start" : "end", fs: 19, w: 700, c: k, ls: 2 })).join("");
  o += [94, 97, 100, 103, 106].map((v) => `<line x1="${X(v)}" y1="${top + ph}" x2="${X(v)}" y2="${top + ph + 8}" stroke="${NAVY}" stroke-width="1.5"/>${t(X(v), top + ph + 34, v, { a: "middle", c: MUTED, fs: 20 })}<line x1="${L - 8}" y1="${Y(v)}" x2="${L}" y2="${Y(v)}" stroke="${NAVY}" stroke-width="1.5"/>${t(L - 14, Y(v) + 7, v, { a: "end", c: MUTED, fs: 20 })}`).join("");
  o += `<line x1="${X(100)}" y1="${top}" x2="${X(100)}" y2="${top + ph}" stroke="${NAVY}" stroke-width="1.5"/><line x1="${L}" y1="${Y(100)}" x2="${L + pw}" y2="${Y(100)}" stroke="${NAVY}" stroke-width="1.5"/><rect x="${L}" y="${top}" width="${pw}" height="${ph}" fill="none" stroke="${NAVY}" stroke-width="2"/>`;
  const T = [["A", [[97.2, 98.1], [97.9, 98.9], [98.9, 99.6], [100, 100.1], [101.2, 100.2], [102.0, 98.8]], TEAL], ["B", [[95.4, 95.6], [95.2, 96.8], [95.7, 98], [96.7, 99.2], [97.9, 100.3], [99.1, 101.1]], "#3C5E94"], ["C", [[103.6, 104.1], [104.7, 103.3], [105, 102], [104.5, 100.9], [103.5, 100.2], [102.4, 99.8]], "#8A5A12"], ["D", [[99.1, 103.2], [100.4, 104], [101.7, 103.9], [102.8, 103], [103.4, 101.9], [103.5, 101]], "#1E7048"], ["E", [[100.5, 96.6], [99.7, 96.1], [98.7, 96], [97.6, 96.5], [96.8, 97.4], [96.5, 98.4]], "#9C3B2E"], ["F", [[95.6, 101.9], [96.4, 102.7], [97.6, 103.1], [98.8, 102.9], [99.8, 102.2], [100.6, 101.2]], "#6B4E9B"]];
  T.forEach(([n, pts, c]) => { o += `<polyline points="${pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round" stroke-opacity=".7"/>`; pts.slice(0, -1).forEach(([x, y]) => { o += `<circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="${c}" fill-opacity=".55"/>`; }); const [lx, ly] = pts[pts.length - 1]; o += `<circle cx="${X(lx)}" cy="${Y(ly)}" r="15" fill="${c}"/>` + t(X(lx), Y(ly) + 7, n, { a: "middle", fs: 19, w: 700, c: "#FFFFFF" }); });
  o += t(L + pw / 2, top + ph + 70, "RS-Ratio: strength against the benchmark", { a: "middle", c: MUTED, fs: 20 }) + t(26, top + ph / 2, "RS-Momentum", { a: "middle", c: MUTED, fs: 20, rot: -90 });
  return svg(W, H, o);
}

/* Real LEKHA theme palettes, drawn as a grid. */
function chartThemes(W) {
  const src = readFileSync(join(here, "..", "..", "public", "app", "lekha-themes.js"), "utf8");
  const rows = [...src.matchAll(/^\s*\["([a-z0-9-]+)", "([^"]+)", "([dl])", "([0-9A-Fa-f ]+)"\]/gm)].map((m) => ({ id: m[1], c: m[4].trim().split(/\s+/).map((h) => "#" + h) })).filter((r) => !r.id.startsWith("lekha")).slice(0, 100);
  if (rows.length !== 100) throw new Error("expected 100 themes, got " + rows.length);
  const cw = 70, ch = 54, gx = 12, gy = 10, total = 10 * cw + 9 * gx, L = (W - total) / 2; let o = "";
  rows.forEach((r, i) => { const x = L + (i % 10) * (cw + gx), y = 6 + Math.floor(i / 10) * (ch + gy), [bg, panel, fg, muted, accent] = r.c;
    o += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="${bg}" stroke="#CFC8BA" stroke-width="1"/><rect x="${x + 7}" y="${y + 7}" width="${cw - 14}" height="${ch - 22}" rx="3" fill="${panel}"/><rect x="${x + 12}" y="${y + 14}" width="26" height="4" rx="2" fill="${fg}"/><rect x="${x + 12}" y="${y + 23}" width="20" height="3" rx="1.5" fill="${muted}"/><circle cx="${x + cw - 18}" cy="${y + 20}" r="5" fill="${accent}"/><rect x="${x + 7}" y="${y + ch - 11}" width="${cw - 14}" height="4" rx="2" fill="${accent}"/>`; });
  return svg(W, 10 * (ch + gy) + 6, o);
}

/* Agent pipeline diagram. */
function chartPipeline(W) {
  const steps = [["Plan", "Choose which of the 13 data tools the question needs"], ["Retrieve", "Quotes, SEC filings, news, macro series and peers"], ["Number the evidence", "Every retrieved fact gets an id and a source"], ["Write typed claims", "Fact, calculated, interpretation or speculation, each citing evidence ids"], ["Verify", "Every number in a fact or calculated claim is checked against its cited evidence"]];
  const bh = 112, gap = 34, H = steps.length * bh + (steps.length - 1) * gap + 6; let o = "";
  steps.forEach(([a, b], i) => { const y = 3 + i * (bh + gap), last = i === steps.length - 1;
    o += `<rect x="3" y="${y}" width="${W - 6}" height="${bh}" fill="${last ? TEAL : "#FFFFFF"}" stroke="${last ? TEAL : LINE}" stroke-width="2"/>` + t(34, y + 66, i + 1, { fs: 40, w: 700, c: last ? "#FFFFFF" : TEAL, mono: 1 }) + t(100, y + 48, a, { fs: 30, w: 700, c: last ? "#FFFFFF" : NAVY }) + t(100, y + 84, b, { fs: 21, c: last ? "#DFF0EC" : MUTED });
    if (!last) o += `<line x1="${W / 2}" y1="${y + bh}" x2="${W / 2}" y2="${y + bh + gap - 8}" stroke="${NAVY}" stroke-width="2.5"/><polygon points="${W / 2 - 9},${y + bh + gap - 14} ${W / 2 + 9},${y + bh + gap - 14} ${W / 2},${y + bh + gap - 1}" fill="${NAVY}"/>`; });
  return svg(W, H, o);
}

const S = {};
const CENTER = new Set(["D5-plans", "D7-agent", "E-story1", "E-story2", "D-story3"]);
const add = (name, w, h, set, body) => (S[name] = { w, h, set, html: page(w, h, CENTER.has(name) ? body.replace('class="pad"', 'class="pad" data-center') : body) });
const W = 1080, H = 1350, SH = 1920, CW = W - 168;
const sPad = (inner) => `<div class="pad" style="padding:250px 84px 270px">${inner}</div>`;
const ILL = `<span class="ill">Illustration</span>`;

/* ================= SET D: price, plans and proof ================= */
const logoStrip = (keys, s) => `<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${keys.map((k) => `<img src="${LG[k]}" style="width:${s}px;height:${s}px;border-radius:${s * 0.2}px;display:block">`).join("")}</div>`;
add("D1-hook", W, H, "D", `<div class="pad">${head("Investment intelligence")}${sp(150)}<h1>Institutional-grade research.<br><span class="acc">From ฿${PAID} a month.</span></h1>${sp(40)}
<p class="lead">Portfolio, filings, valuation, macro data and a cited AI analyst in one workspace.</p><div class="grow"></div>
<div style="font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:16px">Compared with</div>${logoStrip(["bloomberg", "koyfin", "tradingview", "tikr", "finviz", "morningstar", "seekingalpha", "stockanalysis"], 84)}
<div class="foot">${DISC}</div></div>`);

add("D2-prices", W, H, "D", `<div class="pad">${head("Monthly price compared")}${sp(34)}<h2>Both LEKHA plans cost less than<br><span class="acc">9 of the 10 platforms shown.</span></h2>${sp(18)}${chartLog(CW, 55, 21)}<div class="grow"></div><div class="foot">${SRC_NOTE} ${TM}</div></div>`);

add("D3-cost12", W, H, "D", `<div class="pad">${head("Twelve-month cost")}${sp(34)}<h2>The same year,<br><span class="acc">side by side.</span></h2>${sp(22)}${chartCost(CW, 720)}<div class="grow"></div><div class="foot">Cumulative baht at monthly list price. Bloomberg Terminal is off the scale at ${baht(31980 * FX)} for the year and is not drawn. Stock Analysis Pro is cheaper than LEKHA Paid at ${baht(327 * 12)} for the year. ${SRC_NOTE} ${TM}</div></div>`);

const dots = chartDots(CW);
add("D4-bloomberg", W, H, "D", `<div class="pad">${head("What a terminal costs")}${sp(30)}<h2>One month of Bloomberg pays for<br><span class="acc">more than ${Math.floor(dots.months / 12)} years of LEKHA Paid.</span></h2>${sp(14)}<p class="lead" style="font-size:24px">${baht(P[0].t)} buys ${Math.floor(dots.months)} months at ${baht(PAID)}.</p>${sp(6)}${dots.s}<div class="grow"></div><div class="foot">Bloomberg Terminal at $31,980 a year for one terminal per third-party reports, divided by 12 and converted at 1 USD = ${FX.toFixed(2)} THB. Bloomberg does not publish a rate card. ${TM}</div></div>`);

add("D5-plans", W, H, "D", `<div class="pad">${head("Plans")}${sp(40)}<h2>Two plans.<br>One clear monthly price.</h2>${sp(40)}
<div style="display:flex;gap:28px">${[["Paid", PAID, ["Unlimited holdings", "Full price history", "Unlimited valuation symbols", "Cited research agent", "SEC filings, news and macro", "Sector rotation analysis"]], ["Premium", PREM, ["Everything in Paid", "AI analyst and daily briefing", "Monte Carlo, up to 1M paths", "Stress tests", "LLM council reports", "80 research requests a day"]]].map(([nm, p, li], i) => `<div style="flex:1;background:#fff;border:1px solid ${i ? "var(--accent)" : "var(--line)"};border-top:4px solid ${i ? "var(--accent)" : "var(--fg)"};padding:34px 32px 28px"><div class="eyebrow">${nm}</div><div class="fig" style="font-size:84px;margin:14px 0 4px">฿${p}</div><div style="font-size:22px;color:var(--muted)">per month</div><div class="rule" style="margin:24px 0 8px"></div>${li.map((x) => `<div style="font-size:24px;line-height:1.35;padding:11px 0;border-bottom:1px solid var(--line)">${x}</div>`).join("")}</div>`).join("")}</div><div class="grow"></div><div class="foot">${DISC}</div></div>`);

add("D6-pages", W, H, "D", `<div class="pad">${head("Inside the workspace")}${sp(40)}<h2>29 research pages<br><span class="acc">in 7 areas.</span></h2>${sp(30)}${chartBars(CW, [["Deep analysis", 7], ["Macro and markets", 5], ["Account and settings", 5], ["My portfolio", 4], ["Research", 3], ["Sector rotation", 3], ["Simulation", 2]], 8, 1, "Number of pages", 74)}<div class="grow"></div><div class="foot">User-facing pages in the LEKHA workspace. Two admin pages are excluded.</div></div>`);

add("D7-agent", W, H, "D", `<div class="pad">${head("Cited AI research")}${sp(44)}<h2>How every answer<br>is built.</h2>${sp(30)}${chartPipeline(CW)}<div class="grow"></div><div class="foot">The language model never does the arithmetic: calculations run in a tested engine. ${DISC}</div></div>`);

const SRCS = [["sec", "SEC EDGAR", "Filings and reported fundamentals for US filers"], ["fred", "FRED", "Macro series: rates, inflation, employment, GDP"], ["alpaca", "Alpaca", "US quotes and price history"], ["coingecko", "CoinGecko", "Crypto prices"], ["frankfurter", "Frankfurter", "Foreign exchange rates"]];
add("D8-sources", W, H, "D", `<div class="pad">${head("Data sources")}${sp(40)}<h2>Primary sources,<br><span class="acc">named and dated.</span></h2>${sp(26)}<p class="lead" style="font-size:26px">Every figure shows where it came from, when, and whether it was reported or calculated.</p>${sp(24)}
${SRCS.map(([k, n, d]) => `<div style="display:flex;align-items:center;gap:30px;padding:20px 0;border-top:1px solid var(--line)"><img src="${LG[k]}" style="width:${k === "fred" ? 72 : 84}px;height:${k === "fred" ? 72 : 84}px;border-radius:16px;display:block;margin:${k === "fred" ? "6px 6px" : "0"}"><div><div style="font-size:32px;font-weight:700;letter-spacing:-.01em">${n}</div><div style="font-size:23px;color:var(--muted);margin-top:4px">${d}</div></div></div>`).join("")}<div class="grow"></div><div class="foot">${TM}</div></div>`);

add("D9-cta", W, H, "D", `<div class="pad">${head("Get started")}<div class="grow"></div><h1>Start from<br><span class="acc">฿${PAID} a month.</span></h1>${sp(36)}<p class="lead">Premium is ฿${PREM}. Explore the live demo first, no account needed. Cancel any time.</p>${sp(48)}<div><span class="btn">lekhafinancial.com</span></div><div class="grow"></div><div class="foot">${DISC}</div></div>`);

add("D-story1", W, SH, "D", sPad(`${head("Investment intelligence")}${sp(100)}<h1 style="font-size:92px">Institutional-grade research.<br><span class="acc">From ฿${PAID} a month.</span></h1>${sp(44)}<p class="lead">Portfolio, filings, valuation, macro data and a cited AI analyst in one workspace.</p><div class="grow"></div>${logoStrip(["bloomberg", "koyfin", "tradingview", "tikr", "finviz", "morningstar", "seekingalpha", "stockanalysis"], 80)}`));
add("D-story2", W, SH, "D", sPad(`${head("Monthly price compared")}${sp(40)}<h2>Both LEKHA plans cost less than<br><span class="acc">9 of the 10 platforms shown.</span></h2>${sp(24)}${chartLog(CW, 74, 22)}<div class="grow"></div><div class="foot">${SRC_NOTE}</div>`));
add("D-story3", W, SH, "D", sPad(`${head("Get started")}<div class="grow"></div><h1 style="font-size:92px">฿${PAID} a month.<br><span class="acc">฿${PREM} for Premium.</span></h1>${sp(50)}<div><span class="btn">lekhafinancial.com</span></div><div class="grow"></div><div class="foot">${DISC}</div>`));
add("D-square", W, W, "D", `<div class="pad" style="padding:60px 72px 52px">${head("Monthly price compared")}${sp(20)}<h2 style="font-size:40px">Both LEKHA plans cost less than<br><span class="acc">9 of the 10 platforms shown.</span></h2>${sp(4)}${chartLog(W - 144, 39, 18)}<div class="grow"></div><div class="foot" style="font-size:15px;margin-top:6px;padding-top:10px">${SRC_NOTE}</div></div>`);

/* ================= SET E: analysis visuals (illustrations, not market data) ================= */
const NOTE_FAN = `Illustrative simulation: ${NP.toLocaleString("en-US")} paths, ${MU * 100}% expected annual return, ${SIG * 100}% volatility. Hypothetical inputs, not a forecast. ${DISC}`;
add("E1-cover", W, H, "E", `<div class="pad">${head("Analysis, drawn")}<div class="grow"></div><h1>See the work<br><span class="acc">behind the number.</span></h1>${sp(40)}<p class="lead">Rotation, simulation, valuation and risk, each shown with its axes and its assumptions.</p><div class="grow"></div><div class="foot">The charts in this set are illustrations built from hypothetical inputs. They are not market data.</div></div>`);
add("E2-rrg", W, H, "E", `<div class="pad">${head("Sector rotation")}${sp(34)}<h2>Relative rotation,<br><span class="acc">with trails.</span></h2>${sp(16)}${ILL}${sp(14)}${chartRrg(CW, 740)}<div class="grow"></div><div class="foot">Six hypothetical sectors, A to F, six weekly points each, circle marks the latest. Illustration, not market data. ${DISC}</div></div>`);
add("E3-fan", W, H, "E", `<div class="pad">${head("Simulation")}${sp(34)}<h2>A range of outcomes,<br><span class="acc">not one number.</span></h2>${sp(16)}${ILL}${sp(14)}${chartFan(CW, 740)}<div class="grow"></div><div class="foot">${NOTE_FAN}</div></div>`);
add("E4-risk", W, H, "E", `<div class="pad">${head("Risk")}${sp(34)}<h2>Where the<br><span class="acc">downside sits.</span></h2>${sp(16)}${ILL}${sp(14)}${chartHist(CW, 740)}<div class="grow"></div><div class="foot">One-year returns across ${NP.toLocaleString("en-US")} simulated paths; the dashed line marks the 5th percentile. Hypothetical inputs, not a forecast. ${DISC}</div></div>`);
add("E5-dcf", W, H, "E", `<div class="pad">${head("Valuation")}${sp(34)}<h2>Assumptions<br><span class="acc">made visible.</span></h2>${sp(16)}${ILL}${sp(18)}${chartDcf(CW)}<div class="grow"></div><div class="foot">Five-year discounted cash flow with a 2.5% terminal growth rate, on hypothetical inputs. Illustration of the sensitivity view, not a valuation of any company. ${DISC}</div></div>`);
add("E6-themes", W, H, "E", `<div class="pad">${head("Made for you")}${sp(34)}<h2><span class="acc">100</span> themes.<br><span class="acc">10</span> languages.</h2>${sp(18)}<p class="lead" style="font-size:25px">Light and dark palettes, each with a contrast check. English, Thai, Chinese (Simplified and Traditional), Japanese, Korean, Spanish, Hindi, Vietnamese and French.</p>${sp(26)}${chartThemes(CW)}<div class="grow"></div><div class="foot">Each tile is a real LEKHA theme palette: background, panel, text and accent.</div></div>`);
add("E7-cta", W, H, "E", `<div class="pad">${head("Get started")}<div class="grow"></div><h1>See it for<br><span class="acc">yourself.</span></h1>${sp(36)}<p class="lead">Open the live demo, then choose Paid at ฿${PAID} or Premium at ฿${PREM} a month.</p>${sp(48)}<div><span class="btn">lekhafinancial.com</span></div><div class="grow"></div><div class="foot">${DISC}</div></div>`);
add("E-story1", W, SH, "E", sPad(`${head("Simulation")}${sp(36)}<h2>A range of outcomes,<br><span class="acc">not one number.</span></h2>${sp(16)}${ILL}${sp(16)}${chartFan(CW, 860)}${sp(16)}<div class="foot">${NOTE_FAN}</div>`));
add("E-story2", W, SH, "E", sPad(`${head("Sector rotation")}${sp(36)}<h2>Relative rotation,<br><span class="acc">with trails.</span></h2>${sp(16)}${ILL}${sp(16)}${chartRrg(CW, 860)}${sp(16)}<div class="foot">Six hypothetical sectors. Illustration, not market data.</div>`));
add("E-square", W, W, "E", `<div class="pad" style="padding:60px 72px 52px">${head("Simulation")}${sp(22)}<h2 style="font-size:42px">A range of outcomes, <span class="acc">not one number.</span></h2>${sp(12)}${ILL}${sp(10)}${chartFan(W - 144, 560)}<div class="grow"></div><div class="foot" style="font-size:15px;margin-top:6px;padding-top:10px">${NOTE_FAN}</div></div>`);

/* ---------- write + render ---------- */
for (const [n, s] of Object.entries(S)) writeFileSync(join(SRC, n + ".html"), s.html);
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(join(process.env.NODE_PATH || "", "playwright"))); }
const browser = await chromium.launch();
for (const [n, s] of Object.entries(S)) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("file://" + join(SRC, n + ".html"), { waitUntil: "load" }).catch(() => {});
  await p.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await p.waitForTimeout(300);
  const bad = await p.evaluate(() => { const pad = document.querySelector(".pad"), r = [], W = innerWidth, H = innerHeight;
    if (pad.scrollHeight > pad.clientHeight + 1) r.push("pad overflows by " + (pad.scrollHeight - pad.clientHeight));
    for (const e of document.querySelectorAll("body *")) { if (e.classList.contains("pad")) continue; const b = e.getBoundingClientRect(); const sv = e.closest("svg");
      if (sv && e.tagName !== "svg") { const q = sv.getBoundingClientRect(); if (b.width && (b.left < q.left - 1 || b.right > q.right + 1 || b.top < q.top - 1 || b.bottom > q.bottom + 1) && !["clipPath", "defs"].includes(e.tagName) && !e.closest("clipPath")) r.push("svg " + e.tagName + " out of bounds " + Math.round(b.left) + "," + Math.round(b.top) + "," + Math.round(b.right) + "," + Math.round(b.bottom)); }
      if (b.width && (b.right > W - 40 || b.bottom > H - 40) && !sv) r.push(e.tagName + " " + Math.round(b.left) + "," + Math.round(b.top) + "," + Math.round(b.right) + "," + Math.round(b.bottom) + " " + (e.textContent || "").slice(0, 30)); }
    return r.slice(0, 6); });
  if (bad.length) console.log("CHECK", n, JSON.stringify(bad));
  await p.screenshot({ path: join(OUT, n + ".png") });
  await ctx.close();
}
await browser.close();
const names = { D: "Set D: price, plans and proof", E: "Set E: analysis visuals" };
const sections = ["D", "E"].map((k) => `<h2>${names[k]}</h2><div class="g">${Object.entries(S).filter(([, s]) => s.set === k).map(([n, s]) => `<figure><img src="out/${n}.png" loading="lazy"><figcaption>${n} · ${s.w}x${s.h}</figcaption></figure>`).join("")}</div>`).join("");
writeFileSync(join(V2, "index.html"), `<!doctype html><meta charset="utf-8"><title>LEKHA ad set v2 preview</title><style>body{background:#FCF7F0;color:#17223B;font-family:Inter,system-ui,sans-serif;margin:0;padding:40px}h2{margin:40px 0 16px}img{width:100%;border:1px solid #E3DCCF}figure{margin:0}figcaption{font-size:13px;color:#6E685C;margin:6px 0 22px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}</style><h1>LEKHA Financials ad set v2 (THB ${PAID} and ${PREM})</h1>${sections}`);
console.log("rendered", Object.keys(S).length, "slides; MC 5th pct", MC.var5.toFixed(1));
