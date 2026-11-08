#!/usr/bin/env node
import { chromium } from "playwright";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, extname, isAbsolute, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIDTH = 390;
const HEIGHT = 844;

const AVATAR_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="40" fill="#C5C9CD"/>
  <circle cx="40" cy="30" r="14" fill="#F2F3F5"/>
  <ellipse cx="40" cy="62" rx="22" ry="16" fill="#F2F3F5"/>
</svg>
`)}`;

function wallpaperDataUri(tema = "claro") {
  const dark = tema === "escuro";
  const icons = [];
  const shapes = [
    `M5 8h3l1.5-2h5L16 8h3v10H5z M12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0`,
    `M5 14a3 3 0 1 0 0.1 0 M17 14a3 3 0 1 0 0.1 0 M5 14h4l2-5h4l2 5 M11 9v5`,
    `M4 10a7 7 0 0 1 14 0v5h-3v-5a4 4 0 0 0-8 0v5H4z`,
    `M9 3a5 5 0 0 1 3 9v3H9v-3a5 5 0 0 1 0-9z M9 16h5 M9 18h5`,
    `M5 7h10v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z M15 9h2a2 2 0 0 1 0 4h-2 M8 4c1 1 1 2 0 3 M11 4c1 1 1 2 0 3`,
    `M3 5h14v10H3z M1 15h18v2H1z`,
    `M8 5v10a2.5 2.5 0 1 1-1.5-2.3V8l8-2v7a2.5 2.5 0 1 1-1.5-2.3V5z`,
    `M2 11l18-8-6 9 1 6-4-3-5 2 2-6z`,
    `M10 17s-7-4.5-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.5-7 9-7 9z`,
    `M3 4h14v10H8l-4 4V4z`,
  ];
  let i = 0;
  for (let y = 12; y < 640; y += 52) {
    for (let x = 8; x < 360; x += 58) {
      const ox = x + ((y / 52) % 2 === 0 ? 0 : 18);
      const s = shapes[i % shapes.length];
      icons.push(`<g transform="translate(${ox},${y}) scale(0.85)" fill="none" stroke="${dark ? "#2A3942" : "#C9BFB4"}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="${s}"/></g>`);
      i++;
    }
  }
  const bg = dark ? "#0B141A" : "#E5DDD5";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
  <rect width="360" height="640" fill="${bg}"/>
  <g opacity="${dark ? "0.85" : "0.7"}">${icons.join("\n")}</g>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function checksSvg(status) {
  const color =
    status === "lido" ? "#53BDEB" : status === "entregue" ? "#9AA3A9" : "#9AA3A9";
  const double = status === "lido" || status === "entregue";
  if (!double) {
    return `<svg class="ticks" viewBox="0 0 12 11" width="12" height="11"><path d="M11.1 1.1 4.2 9.4 0.9 6.2" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  return `<svg class="ticks" viewBox="0 0 16 11" width="16" height="11">
    <path d="M10.2 1.1 3.4 9.4 0.9 7" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.1 1.1 8.2 9.4 6.4 7.6" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function signalBars(n = 4, color = "#000") {
  const heights = [4, 6, 8, 10];
  return heights
    .map((h, i) => {
      const on = i < n;
      return `<rect x="${i * 4}" y="${10 - h}" width="2.5" height="${h}" rx="0.6" fill="${on ? color : color + "33"}"/>`;
    })
    .join("");
}

function batterySvg(pct, color = "#000") {
  const low = pct <= 20;
  const fill = low ? "#FF3B30" : "#34C759";
  const w = Math.max(1.5, (pct / 100) * 18);
  return `
  <svg width="27" height="13" viewBox="0 0 27 13">
    <rect x="0.5" y="0.5" width="23" height="12" rx="2.5" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="1"/>
    <rect x="2" y="2" width="${w}" height="9" rx="1.2" fill="${fill}"/>
    <path d="M24.5 4h1.2c.7 0 1.3.6 1.3 1.3v2.4c0 .7-.6 1.3-1.3 1.3H24.5" fill="${color}" fill-opacity="0.35"/>
    ${low ? `<text x="11.5" y="9.5" text-anchor="middle" font-size="8" font-family="-apple-system,system-ui,sans-serif" font-weight="600" fill="#fff">${pct}</text>` : ""}
  </svg>`;
}

function fileToDataUri(filePath, fallback = null) {
  if (!filePath || !existsSync(filePath)) return fallback;
  const buf = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase().replace(".", "") || "jpeg";
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "gif"
          ? "image/gif"
          : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function resolveMedia(pathOrEmpty, baseDir) {
  if (!pathOrEmpty) return null;
  const expanded = expandPath(String(pathOrEmpty).trim());
  const abs = isAbsolute(expanded) ? expanded : resolve(baseDir, expanded);
  return fileToDataUri(abs, null);
}

function renderMessages(mensagens, baseDir) {
  let html = "";
  let prevFrom = null;

  for (const m of mensagens) {
    if (m.tipo === "data") {
      html += `<div class="date-pill"><span>${esc(m.texto)}</span></div>`;
      prevFrom = null;
      continue;
    }

    const mine = m.de === "eu";
    const side = mine ? "out" : "in";
    const grouped = prevFrom === m.de;
    const status = m.status || "lido";
    const meta = mine
      ? `<span class="meta">${esc(m.hora)}${checksSvg(status)}</span>`
      : `<span class="meta">${esc(m.hora)}</span>`;

    const mediaSrc = resolveMedia(m.imagem, baseDir);
    const hasImg = Boolean(mediaSrc);
    const textHtml = m.texto
      ? `<span class="text">${esc(m.texto)}</span>`
      : "";
    const imgHtml = hasImg
      ? `<img class="media" src="${mediaSrc}" alt=""/>`
      : "";

    html += `
      <div class="row ${side}${grouped ? " grouped" : ""}">
        <div class="bubble ${side}${hasImg ? " has-img" : ""}">
          ${imgHtml}
          ${hasImg && textHtml ? `<div class="caption">${textHtml}${meta}</div>` : `${textHtml}${meta}`}
        </div>
      </div>`;
    prevFrom = m.de;
  }
  return html;
}

function agoraHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function bateriaDoMac() {
  try {
    const out = execSync("pmset -g batt", { encoding: "utf8" });
    const m = out.match(/(\d+)%/);
    if (m) return Math.min(100, Math.max(0, Number(m[1])));
  } catch {}
  return 80;
}

function expandPath(p) {
  if (!p) return p;
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function resolveTema(data) {
  const raw = String(data.tema || data.theme || "claro").toLowerCase();
  if (raw === "escuro" || raw === "dark" || raw === "dark-mode") return "escuro";
  return "claro";
}

function buildHtml(data, photoSrc, baseDir = __dirname) {
  const tema = resolveTema(data);
  const dark = tema === "escuro";
  const bateria =
    data.bateria === undefined || data.bateria === null || data.bateria === ""
      ? bateriaDoMac()
      : Math.min(100, Math.max(0, Number(data.bateria)));
  const wifi = data.wifi !== false;
  const sinal = Number(data.sinal ?? 4);
  const horaStatus = data.horaStatus || agoraHHMM();

  const t = dark
    ? {
        phoneBg: "#0B141A",
        statusFg: "#E9EDEF",
        icon: "#E9EDEF",
        headerBg: "rgba(31,44,52,0.95)",
        headerBorder: "rgba(255,255,255,0.08)",
        accent: "#53BDEB",
        name: "#E9EDEF",
        bubbleOut: "#005C4B",
        bubbleIn: "#202C33",
        bubbleFg: "#E9EDEF",
        meta: "#8696A0",
        dateBg: "#182229",
        dateFg: "#8696A0",
        scrollBg: "#1F2C34",
        scrollFg: "#8696A0",
        plusBg: "#1F2C34",
        inputBg: "#1F2C34",
        cam: "#AEBAC1",
        home: "#E9EDEF",
        tickUnread: "#8696A0",
      }
    : {
        phoneBg: "#E5DDD5",
        statusFg: "#000",
        icon: "#000",
        headerBg: "rgba(247,247,247,0.92)",
        headerBorder: "rgba(0,0,0,0.12)",
        accent: "#007AFF",
        name: "#000",
        bubbleOut: "#DCF8C6",
        bubbleIn: "#fff",
        bubbleFg: "#111",
        meta: "#667781",
        dateBg: "rgba(255,255,255,0.95)",
        dateFg: "#54656F",
        scrollBg: "#fff",
        scrollFg: "#54656F",
        plusBg: "#fff",
        inputBg: "#fff",
        cam: "#111",
        home: "#000",
        tickUnread: "#9AA3A9",
      };

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #000;
  }
  .phone {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    background: ${t.phoneBg};
    overflow: hidden;
  }
  .wallpaper {
    position: absolute; inset: 0;
    background: ${t.phoneBg} url("${wallpaperDataUri(tema)}") repeat;
    background-size: 180px 320px;
    opacity: 1;
  }
  .status {
    position: absolute; top: 0; left: 0; right: 0;
    height: 47px;
    padding: 14px 22px 0;
    display: flex; align-items: center; justify-content: space-between;
    z-index: 20;
    color: ${t.statusFg};
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }
  .status-right { display: flex; align-items: center; gap: 6px; }
  .header {
    position: absolute; top: 47px; left: 0; right: 0;
    height: 52px;
    background: ${t.headerBg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 0.5px solid ${t.headerBorder};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 10px 0 4px;
    z-index: 20;
  }
  .header-left { display: flex; align-items: center; gap: 2px; min-width: 0; }
  .back {
    width: 28px; height: 44px;
    display: grid; place-items: center;
    color: ${t.accent};
  }
  .back svg { width: 12px; height: 20px; }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    object-fit: cover; background: #C5C9CD; flex-shrink: 0;
  }
  .name {
    margin-left: 8px;
    font-size: 16px; font-weight: 600;
    color: ${t.name}; letter-spacing: -0.2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 180px;
  }
  .header-right {
    display: flex; align-items: center; gap: 18px;
    color: ${t.accent}; padding-right: 6px;
  }
  .header-right svg { width: 24px; height: 24px; }
  .chat {
    position: absolute;
    top: 99px; bottom: 90px; left: 0; right: 0;
    overflow: hidden;
    padding: 8px 8px 12px;
    display: flex; flex-direction: column; justify-content: flex-end;
    gap: 2px;
    z-index: 5;
  }
  .date-pill {
    align-self: center;
    margin: 8px 0 10px;
  }
  .date-pill span {
    display: inline-block;
    background: ${t.dateBg};
    color: ${t.dateFg};
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 8px;
    box-shadow: 0 1px 1px rgba(0,0,0,${dark ? "0.25" : "0.06"});
  }
  .row {
    display: flex;
    margin-bottom: 2px;
  }
  .row.grouped { margin-top: -1px; }
  .row.out { justify-content: flex-end; }
  .row.in { justify-content: flex-start; }
  .bubble {
    position: relative;
    max-width: 78%;
    padding: 6px 7px 8px 9px;
    border-radius: 8px;
    font-size: 16px;
    line-height: 1.28;
    color: ${t.bubbleFg};
    box-shadow: 0 1px 0.5px rgba(0,0,0,${dark ? "0.35" : "0.13"});
  }
  .bubble.out {
    background: ${t.bubbleOut};
    border-top-right-radius: 0;
    margin-right: 6px;
  }
  .bubble.in {
    background: ${t.bubbleIn};
    border-top-left-radius: 0;
    margin-left: 6px;
  }
  .row.grouped .bubble.out { border-top-right-radius: 8px; }
  .row.grouped .bubble.in { border-top-left-radius: 8px; }
  .row.out:not(.grouped) .bubble::before {
    content: "";
    position: absolute;
    top: 0; right: -6px;
    width: 0; height: 0;
    border-style: solid;
    border-width: 0 0 10px 8px;
    border-color: transparent transparent transparent ${t.bubbleOut};
    background: none;
  }
  .row.in:not(.grouped) .bubble::before {
    content: "";
    position: absolute;
    top: 0; left: -6px;
    width: 0; height: 0;
    border-style: solid;
    border-width: 0 8px 10px 0;
    border-color: transparent ${t.bubbleIn} transparent transparent;
  }
  .bubble .text {
    white-space: pre-wrap;
    word-break: break-word;
    padding-right: 2px;
  }
  .bubble.has-img {
    padding: 3px;
    max-width: 72%;
    overflow: hidden;
  }
  .bubble .media {
    display: block;
    width: 100%;
    max-width: 240px;
    max-height: 280px;
    object-fit: cover;
    border-radius: 6px;
  }
  .bubble .caption {
    padding: 4px 6px 6px 7px;
  }
  .meta {
    float: right;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin: 4px 0 -2px 10px;
    color: ${t.meta};
    font-size: 11px;
    line-height: 1;
    position: relative;
    top: 4px;
  }
  .ticks { display: block; }
  .scroll-hint {
    position: absolute;
    right: 12px; bottom: 102px;
    width: 34px; height: 34px;
    border-radius: 50%;
    background: ${t.scrollBg};
    box-shadow: 0 1px 4px rgba(0,0,0,${dark ? "0.4" : "0.18"});
    display: grid; place-items: center;
    z-index: 15;
    color: ${t.scrollFg};
  }
  .composer {
    position: absolute; left: 0; right: 0; bottom: 0;
    height: 90px;
    padding: 8px 10px 30px;
    background: transparent;
    display: flex; align-items: center; gap: 10px;
    z-index: 20;
  }
  .plus {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: ${t.plusBg};
    box-shadow: 0 1px 2px rgba(0,0,0,${dark ? "0.3" : "0.08"});
    display: grid; place-items: center;
    flex-shrink: 0;
  }
  .cam, .mic {
    width: 34px; height: 34px;
    display: grid; place-items: center;
    flex-shrink: 0;
    color: ${t.cam};
  }
  .input {
    flex: 1;
    height: 36px;
    border-radius: 20px;
    background: ${t.inputBg};
    border: none;
    box-shadow: 0 1px 2px rgba(0,0,0,${dark ? "0.3" : "0.06"});
    display: flex; align-items: center;
    padding: 0 10px 0 14px;
    gap: 8px;
  }
  .input-sticker {
    margin-left: auto;
    display: grid; place-items: center;
    color: ${t.meta};
  }
  .home-bar {
    position: absolute; bottom: 8px; left: 50%;
    transform: translateX(-50%);
    width: 134px; height: 5px;
    background: ${t.home}; border-radius: 100px;
    z-index: 30;
  }
</style>
</head>
<body>
  <div class="phone" id="phone">
    <div class="wallpaper"></div>

    <div class="status">
      <div>${esc(horaStatus)}</div>
      <div class="status-right">
        <svg width="17" height="11" viewBox="0 0 17 11">${signalBars(sinal, t.icon)}</svg>
        ${
          wifi
            ? `<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm0-3.4c1.7 0 3.2.7 4.3 1.8l-1.4 1.4A4.1 4.1 0 0 0 8 8.4c-1.1 0-2.1.4-2.9 1.2L3.7 8.2A5.9 5.9 0 0 1 8 6.4Zm0-3.5c2.7 0 5.1 1.1 6.9 2.8L13.5 7A7.7 7.7 0 0 0 8 4.6 7.7 7.7 0 0 0 2.5 7L1.1 5.7A9.9 9.9 0 0 1 8 2.9Z" fill="${t.icon}"/></svg>`
            : ""
        }
        ${batterySvg(bateria, t.icon)}
      </div>
    </div>

    <div class="header">
      <div class="header-left">
        <div class="back">
          <svg viewBox="0 0 12 20" fill="none"><path d="M10.5 1.5 2 10l8.5 8.5" stroke="${t.accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <img class="avatar" src="${photoSrc}" alt=""/>
        <div class="name">${esc(data.contato || "Contato")}</div>
      </div>
      <div class="header-right">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15.5 8.5v-2A1.5 1.5 0 0 0 14 5H4.5A1.5 1.5 0 0 0 3 6.5v11A1.5 1.5 0 0 0 4.5 19H14a1.5 1.5 0 0 0 1.5-1.5v-2l5 3.2V5.3l-5 3.2Z" fill="${t.accent}"/></svg>
        <svg viewBox="0 0 24 24" fill="none"><path d="M7.2 3.8c.4-.4 1.1-.5 1.6-.2l2.3 1.5c.5.3.7.9.5 1.4L10.5 9c-.1.4 0 .8.3 1.1l3.1 3.1c.3.3.7.4 1.1.3l2.5-1.1c.5-.2 1.1 0 1.4.5l1.5 2.3c.3.5.2 1.2-.2 1.6l-1.4 1.4c-.7.7-1.7 1-2.7.8-2.5-.5-5.3-2.5-7.9-5.1S4.5 8.6 4 6.1c-.2-1 .1-2 .8-2.7l1.4-1.4Z" fill="${t.accent}"/></svg>
      </div>
    </div>

    <div class="chat">
      ${renderMessages(data.mensagens || [], baseDir)}
    </div>

    <div class="scroll-hint">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="${t.scrollFg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>

    <div class="composer">
      <div class="plus" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="#25D366" stroke-width="2.4" stroke-linecap="round"/></svg>
      </div>
      <div class="input">
        <div style="flex:1"></div>
        <div class="input-sticker" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 3.5h10.2L20.5 8.8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z" stroke="${t.meta}" stroke-width="1.6" stroke-linejoin="round"/>
            <path d="M15 3.6V8a.8.8 0 0 0 .8.8h4.4" stroke="${t.meta}" stroke-width="1.6" stroke-linejoin="round"/>
            <circle cx="9" cy="12.2" r="1.05" fill="${t.meta}"/>
            <circle cx="14.2" cy="12.2" r="1.05" fill="${t.meta}"/>
            <path d="M9.2 15.4c.9.8 1.9 1.2 2.9 1.2s2-.4 2.9-1.2" stroke="${t.meta}" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <div class="cam" aria-hidden="true">
        <svg width="22" height="20" viewBox="0 0 22 20" fill="none"><path d="M8 3.5h6l1.2 1.5H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.8L8 3.5Z" stroke="${t.cam}" stroke-width="1.6"/><circle cx="11" cy="11" r="3.4" stroke="${t.cam}" stroke-width="1.6"/></svg>
      </div>
      <div class="mic" aria-hidden="true">
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><rect x="4" y="1" width="6" height="12" rx="3" stroke="${t.cam}" stroke-width="1.7"/><path d="M1.5 10.5a5.5 5.5 0 0 0 11 0M7 16v4" stroke="${t.cam}" stroke-width="1.7" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div class="home-bar"></div>
  </div>
</body>
</html>`;
}

function loadPhotoDataUri(fotoPath, baseDir) {
  if (!fotoPath) return AVATAR_SVG;
  const expanded = expandPath(String(fotoPath).trim());
  const abs = isAbsolute(expanded) ? expanded : resolve(baseDir, expanded);
  const uri = fileToDataUri(abs, null);
  if (!uri) {
    console.warn(`Foto não encontrada: ${abs} — usando avatar padrão`);
    return AVATAR_SVG;
  }
  return uri;
}

function slug(name) {
  return String(name || "conversa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function gerarPrint(data, { baseDir = process.cwd(), browser } = {}) {
  if (!Array.isArray(data.mensagens) || data.mensagens.length === 0) {
    throw new Error("JSON precisa de mensagens[]");
  }

  const photoSrc = loadPhotoDataUri(data.foto, baseDir);
  const html = buildHtml(data, photoSrc, baseDir);

  const outDir = resolve(__dirname, "out");
  mkdirSync(outDir, { recursive: true });
  const outPath = data.saida
    ? resolve(baseDir, data.saida)
    : resolve(outDir, `${slug(data.contato)}.png`);
  mkdirSync(dirname(outPath), { recursive: true });

  const tmpHtml = resolve(outDir, `.preview-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(tmpHtml, html, "utf8");

  const ownBrowser = !browser;
  const b = browser || (await chromium.launch({ headless: true }));
  try {
    const page = await b.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 3,
    });
    await page.goto(`file://${tmpHtml}`, { waitUntil: "networkidle" });
    await page.locator("#phone").screenshot({ path: outPath, type: "png" });
    await page.close();
  } finally {
    if (ownBrowser) await b.close();
    try {
      const { unlinkSync } = await import("fs");
      unlinkSync(tmpHtml);
    } catch {}
  }

  return outPath;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.log(`Uso:
  bun run generate conversa.json

Edite conversa.exemplo.json ou crie o seu. Campos:
  contato, foto, tema, horaStatus, bateria, saida, mensagens[]

  tema           → claro (padrão) | escuro
  Sem horaStatus → hora atual do Mac
  Sem bateria    → % real da bateria do Mac
  foto           → caminho da imagem (relativo, absoluto ou ~/…)
  mensagem.imagem → foto dentro da bolha
`);
    process.exit(1);
  }

  const jsonPath = resolve(process.cwd(), arg);
  if (!existsSync(jsonPath)) {
    console.error(`Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(jsonPath, "utf8"));
  const outPath = await gerarPrint(data, { baseDir: dirname(jsonPath) });
  console.log(`OK → ${outPath}`);
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
