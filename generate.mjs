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
  const file =
    tema === "escuro"
      ? resolve(__dirname, "assets/wallpaper-escuro.jpg")
      : resolve(__dirname, "assets/wallpaper-claro.jpg");
  const uri = fileToDataUri(file, null);
  if (!uri) {
    console.warn(`Wallpaper não encontrado: ${file}`);
    return "";
  }
  return uri;
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
  const heights = [4.5, 7, 9.5, 12];
  return heights
    .map((h, i) => {
      const on = i < n;
      return `<rect x="${i * 4.6}" y="${12 - h}" width="3.2" height="${h}" rx="1" fill="${color}" fill-opacity="${on ? 1 : 0.3}"/>`;
    })
    .join("");
}

function wifiSvg(color = "#000") {
  return `<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.6 10.6 0 0 0 8.5.6 10.6 10.6 0 0 0 1 3.6l1.2 1.2a8.9 8.9 0 0 1 6.3-2.5Zm0 3.4c1.5 0 2.9.6 3.9 1.5l1.2-1.2a7.3 7.3 0 0 0-10.2 0l1.2 1.2c1-.9 2.4-1.5 3.9-1.5Zm0 3.4c-.6 0-1.2.3-1.6.7l1.6 1.6 1.6-1.6c-.4-.4-1-.7-1.6-.7Z" fill="${color}"/></svg>`;
}

function batterySvg(pct, color = "#000") {
  const low = pct <= 20;
  const fill = low ? "#FF3B30" : color;
  const w = Math.max(2, (pct / 100) * 19);
  return `
  <svg width="28" height="13" viewBox="0 0 28 13">
    <rect x="0.6" y="0.6" width="23.8" height="11.8" rx="3.6" fill="none" stroke="${color}" stroke-opacity="0.4" stroke-width="1.1"/>
    <rect x="2.6" y="2.6" width="${w}" height="7.8" rx="2" fill="${fill}"/>
    <path d="M25.8 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1Z" fill="${color}" fill-opacity="0.45"/>
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
  const list = mensagens || [];

  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (m.tipo === "data") {
      html += `<div class="date-pill"><span>${esc(m.texto)}</span></div>`;
      continue;
    }

    const next = list[i + 1];
    const prev = list[i - 1];
    const mine = m.de === "eu";
    const side = mine ? "out" : "in";
    const firstOfGroup = !prev || prev.tipo === "data" || prev.de !== m.de;
    const lastOfGroup = !next || next.tipo === "data" || next.de !== m.de;
    const status = m.status || "lido";
    const meta = `<span class="meta">${esc(m.hora)}${mine ? checksSvg(status) : ""}</span>`;

    const mediaSrc = resolveMedia(m.imagem, baseDir);
    const hasImg = Boolean(mediaSrc);
    const textHtml = m.texto ? `<span class="text">${esc(m.texto)}</span>` : "";
    const imgHtml = hasImg ? `<img class="media" src="${mediaSrc}" alt=""/>` : "";

    const cls = [
      "row",
      side,
      firstOfGroup ? "first" : "",
      lastOfGroup ? "tail" : "",
    ].filter(Boolean).join(" ");

    html += `
      <div class="${cls}">
        <div class="bubble ${side}${hasImg ? " has-img" : ""}">
          ${imgHtml}
          ${hasImg ? `<div class="caption">${textHtml}${meta}</div>` : `${textHtml}${meta}`}
        </div>
      </div>`;
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
        bg: "#0B0B0B",
        fg: "#FFFFFF",
        glass: "rgba(38,38,40,0.72)",
        glassBorder: "rgba(255,255,255,0.10)",
        glassHi: "rgba(255,255,255,0.07)",
        bubbleOut: "#144D37",
        bubbleIn: "#242626",
        bubbleFg: "#FFFFFF",
        meta: "rgba(255,255,255,0.58)",
        dateBg: "#1D1F1F",
        dateFg: "rgba(255,255,255,0.62)",
        inputBg: "rgba(38,38,40,0.85)",
        icon: "#FFFFFF",
        iconSoft: "#FFFFFF",
        micBg: "#FFFFFF",
        micFg: "#000000",
        shadow: "rgba(0,0,0,0.35)",
      }
    : {
        bg: "#F5F1EB",
        fg: "#000000",
        glass: "rgba(255,255,255,0.78)",
        glassBorder: "rgba(0,0,0,0.06)",
        glassHi: "rgba(255,255,255,0.9)",
        bubbleOut: "#D9FDD3",
        bubbleIn: "#FFFFFF",
        bubbleFg: "#111B21",
        meta: "#667781",
        dateBg: "#FFFFFF",
        dateFg: "#54656F",
        inputBg: "rgba(255,255,255,0.92)",
        icon: "#000000",
        iconSoft: "#111B21",
        micBg: "#000000",
        micFg: "#FFFFFF",
        shadow: "rgba(0,0,0,0.10)",
      };

  const fade = dark ? "11,11,11" : "245,241,235";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: ${t.bg};
  }
  .phone { width: ${WIDTH}px; height: ${HEIGHT}px; position: relative; overflow: hidden; background: ${t.bg}; }
  .wallpaper {
    position: absolute; inset: 0;
    background: ${t.bg} url("${wallpaperDataUri(tema)}") center / cover no-repeat;
    ${dark ? "filter: brightness(0.72);" : ""}
  }
  .fade-top {
    position: absolute; top: 0; left: 0; right: 0; height: 118px; z-index: 18;
    background: linear-gradient(to bottom, rgba(${fade},1) 0%, rgba(${fade},1) 72%, rgba(${fade},0) 100%);
  }
  .fade-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 92px; z-index: 18;
    background: linear-gradient(to top, rgba(${fade},1) 0%, rgba(${fade},1) 62%, rgba(${fade},0) 100%);
  }
  .glass {
    background: ${t.glass};
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 0.5px solid ${t.glassBorder};
    box-shadow: inset 0 1px 0 ${t.glassHi}, 0 2px 10px ${t.shadow};
  }

  .status {
    position: absolute; top: 0; left: 0; right: 0; height: 54px; z-index: 30;
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 30px 0 52px;
    color: ${t.fg};
  }
  .status .time { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; }
  .status-right { display: flex; align-items: center; gap: 6px; }

  .header {
    position: absolute; top: 58px; left: 0; right: 0; height: 44px; z-index: 30;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 14px 0 16px;
  }
  .header-left { display: flex; align-items: center; min-width: 0; }
  .back {
    width: 44px; height: 44px; border-radius: 50%;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    object-fit: cover; background: #C5C9CD; flex-shrink: 0;
    margin-left: 10px;
  }
  .name {
    margin-left: 10px; font-size: 17px; font-weight: 600; letter-spacing: -0.3px;
    color: ${t.fg}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;
  }
  .actions {
    height: 44px; border-radius: 22px; padding: 0 16px;
    display: flex; align-items: center; gap: 26px;
  }

  .chat {
    position: absolute; top: 112px; bottom: 80px; left: 0; right: 0;
    overflow: hidden; z-index: 5;
    padding: 0 14px 10px 16px;
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .date-pill { align-self: center; margin: 10px 0 10px; }
  .date-pill span {
    display: inline-block; background: ${t.dateBg}; color: ${t.dateFg};
    font-size: 12.5px; font-weight: 500; padding: 5px 11px; border-radius: 9px;
  }
  .row { display: flex; margin-top: 2px; }
  .row.first { margin-top: 8px; }
  .row.out { justify-content: flex-end; }
  .row.in { justify-content: flex-start; }
  .bubble {
    position: relative; max-width: 80%;
    padding: 7px 11px 7px 12px;
    border-radius: 18px;
    font-size: 17px; line-height: 1.3; letter-spacing: -0.2px;
    color: ${t.bubbleFg};
  }
  .bubble.out { background: ${t.bubbleOut}; }
  .bubble.in { background: ${t.bubbleIn}; }
  .row.tail.in .bubble { border-bottom-left-radius: 5px; }
  .row.tail.out .bubble { border-bottom-right-radius: 5px; }
  .row.tail.in .bubble::after, .row.tail.out .bubble::after {
    content: ""; position: absolute; bottom: 0; width: 12px; height: 14px;
  }
  .row.tail.in .bubble::after {
    left: -5px;
    background: radial-gradient(circle at 0 0, transparent 9px, ${t.bubbleIn} 9.5px);
    clip-path: polygon(0 100%, 100% 0, 100% 100%);
  }
  .row.tail.out .bubble::after {
    right: -5px;
    background: radial-gradient(circle at 100% 0, transparent 9px, ${t.bubbleOut} 9.5px);
    clip-path: polygon(0 0, 100% 100%, 0 100%);
  }
  .bubble .text { white-space: pre-wrap; word-break: break-word; }
  .meta {
    float: right; display: inline-flex; align-items: center; gap: 4px;
    margin: 8px 0 -4px 12px; color: ${t.meta};
    font-size: 12px; line-height: 1; position: relative; top: 2px;
  }
  .ticks { display: block; }
  .bubble.has-img { padding: 4px; max-width: 76%; }
  .bubble .media {
    display: block; width: 100%; max-width: 262px; max-height: 330px;
    object-fit: cover; border-radius: 14px;
  }
  .bubble .caption { padding: 6px 8px 4px 9px; }

  .scroll-hint {
    position: absolute; right: 16px; bottom: 96px; z-index: 25;
    width: 34px; height: 34px; border-radius: 50%;
    display: grid; place-items: center;
  }

  .composer {
    position: absolute; left: 0; right: 0; bottom: 0; height: 80px; z-index: 30;
    padding: 0 14px 30px 14px;
    display: flex; align-items: center; gap: 12px;
  }
  .plus, .cam { width: 30px; height: 30px; display: grid; place-items: center; flex-shrink: 0; }
  .input {
    flex: 1; height: 38px; border-radius: 19px;
    background: ${t.inputBg};
    border: 0.5px solid ${t.glassBorder};
    display: flex; align-items: center; justify-content: flex-end; padding: 0 12px;
  }
  .mic {
    width: 38px; height: 38px; border-radius: 50%;
    background: ${t.micBg}; display: grid; place-items: center; flex-shrink: 0;
  }
</style>
</head>
<body>
  <div class="phone" id="phone">
    <div class="wallpaper"></div>

    <div class="chat">
      ${renderMessages(data.mensagens || [], baseDir)}
    </div>

    <div class="fade-top"></div>
    <div class="fade-bottom"></div>

    <div class="status">
      <div class="time">${esc(horaStatus)}</div>
      <div class="status-right">
        <svg width="18" height="12" viewBox="0 0 18 12">${signalBars(sinal, t.fg)}</svg>
        ${wifi ? wifiSvg(t.fg) : ""}
        ${batterySvg(bateria, t.fg)}
      </div>
    </div>

    <div class="header">
      <div class="header-left">
        <div class="back glass">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M10 2 2.2 10 10 18" stroke="${t.icon}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <img class="avatar" src="${photoSrc}" alt=""/>
        <div class="name">${esc(data.contato || "Contato")}</div>
      </div>
      <div class="actions glass">
        <svg width="27" height="20" viewBox="0 0 27 20" fill="none"><rect x="1.2" y="2.2" width="17" height="15.6" rx="3.8" stroke="${t.icon}" stroke-width="2"/><path d="m18.6 8 6.2-3.9v11.8L18.6 12" stroke="${t.icon}" stroke-width="2" stroke-linejoin="round"/></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6.6 2.8c.5-.4 1.2-.4 1.6.1l2.4 2.9c.4.5.4 1.2 0 1.7L9.3 9.1a.9.9 0 0 0-.1 1c1.1 2 2.7 3.6 4.7 4.7.3.2.7.2 1-.1l1.6-1.3c.5-.4 1.2-.4 1.7 0l2.9 2.4c.5.4.5 1.1.1 1.6l-1.6 1.9c-.8.9-2 1.3-3.2 1-3.2-.8-6.1-2.6-8.4-4.9S4 10.3 3.2 7.1c-.3-1.2.1-2.4 1-3.2l2.4-1.1Z" stroke="${t.icon}" stroke-width="1.9" stroke-linejoin="round"/></svg>
      </div>
    </div>

    <div class="scroll-hint glass">
      <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1.5 1.5 7 7l5.5-5.5" stroke="${t.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>

    <div class="composer">
      <div class="plus" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2v18M2 11h18" stroke="${t.icon}" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
      <div class="input">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20.5 12.5V7a3.5 3.5 0 0 0-3.5-3.5H7A3.5 3.5 0 0 0 3.5 7v10A3.5 3.5 0 0 0 7 20.5h5.5l8-8Z" stroke="${t.iconSoft}" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M12.5 20.5v-4.5a3.5 3.5 0 0 1 3.5-3.5h4.5" stroke="${t.iconSoft}" stroke-width="1.7" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="cam" aria-hidden="true">
        <svg width="26" height="22" viewBox="0 0 26 22" fill="none"><path d="M9.3 2.5h7.4l1.6 2.3h3.4a2.8 2.8 0 0 1 2.8 2.8v9.6a2.8 2.8 0 0 1-2.8 2.8H4.3a2.8 2.8 0 0 1-2.8-2.8V7.6a2.8 2.8 0 0 1 2.8-2.8h3.4l1.6-2.3Z" stroke="${t.icon}" stroke-width="1.9" stroke-linejoin="round"/><circle cx="13" cy="12" r="4.2" stroke="${t.icon}" stroke-width="1.9"/></svg>
      </div>
      <div class="mic" aria-hidden="true">
        <svg width="14" height="21" viewBox="0 0 14 21" fill="none"><rect x="3.6" y="1" width="6.8" height="12" rx="3.4" fill="${t.micFg}"/><path d="M1.2 9.8a5.8 5.8 0 0 0 11.6 0M7 15.8V20" stroke="${t.micFg}" stroke-width="1.8" stroke-linecap="round"/></svg>
      </div>
    </div>
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
