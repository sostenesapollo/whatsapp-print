const W = 390, H = 844;

export const EXAMPLES = {
  escuro: {
    contato: "Sabrina Leal",
    tema: "escuro",
    horaStatus: "16:51",
    bateria: 14,
    sinal: 4,
    wifi: true,
    foto: "",
    _preview: "examples/escuro.png",
    mensagens: [
      { tipo: "data", texto: "29 de out. de 2026" },
      { de: "ela", texto: "usei a lista inteira, só comprei o essencial", hora: "10:08" },
      { de: "ela", texto: "tinha coisa pra 6 meses q o guia manda comprar só depois", hora: "10:09" },
      { de: "ela", texto: "e eu achando q precisava de tudo antes do berço chegar", hora: "10:10" },
      { tipo: "data", texto: "7 de nov. de 2026" },
      { de: "ela", texto: "Terminei aqui o conteúdo de vocês gente, e amei 🫶", hora: "10:13", imagem: "media/drive-manual.png" },
      { de: "eu", texto: "Ficamos muito felizes, todos os dias uma mamãe nos manda uma mensagem 🩷🩷🫶", hora: "10:14", status: "lido" },
      { de: "ela", texto: "🫶🫶🫶", hora: "10:15" },
    ],
  },
  claro: {
    contato: "Camila Ferreira",
    tema: "claro",
    horaStatus: "09:14",
    bateria: 72,
    sinal: 4,
    wifi: true,
    foto: "",
    _preview: "examples/claro.png",
    mensagens: [
      { tipo: "data", texto: "2 de nov. de 2026" },
      { de: "ela", texto: "bom dia joyce, terminei a lista do enxoval", hora: "09:12" },
      { de: "ela", texto: "cortei 18 itens q iam ficar encostados", hora: "09:13" },
      { de: "ela", texto: "imprimi e fui riscando com calma", hora: "09:14", imagem: "media/produto-manual.jpg" },
      { de: "eu", texto: "marcou tudo? rs", hora: "09:15", status: "lido" },
      { de: "ela", texto: "só o da primeira semana. deu 240 a menos 🙏", hora: "09:16" },
    ],
  },
};

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function checks(status) {
  const color = status === "lido" ? "#53BDEB" : "#9AA3A9";
  return `<svg class="ticks" viewBox="0 0 16 11" width="16" height="11">
    <path d="M10.2 1.1 3.4 9.4 0.9 7" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.1 1.1 8.2 9.4 6.4 7.6" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function signal(n, color) {
  // 4 barras, baseline comum (viewBox 19×12)
  return [5, 7.2, 9.4, 11.5]
    .map((h, i) => {
      const x = 1 + i * 4.5;
      const y = 12 - h;
      const on = i < n;
      return `<rect x="${x}" y="${y}" width="3.1" height="${h}" rx="0.9" fill="${color}" fill-opacity="${on ? 1 : 0.28}"/>`;
    })
    .join("");
}

function wifi(color) {
  // arco wifi centrado opticamente na mesma faixa 12px
  return `<path d="M9.5 2.1c2.55 0 4.9.95 6.7 2.55l-1.15 1.15a7.6 7.6 0 0 0-11.1 0L2.8 4.65A9.9 9.9 0 0 1 9.5 2.1Zm0 3.35c1.6 0 3.05.6 4.15 1.6l-1.15 1.15a4.3 4.3 0 0 0-6 0L5.35 7.05a5.9 5.9 0 0 1 4.15-1.6Zm0 3.35c.7 0 1.35.25 1.85.7L9.5 11.3 7.65 9.5c.5-.45 1.15-.7 1.85-.7Z" fill="${color}"/>`;
}

function battery(pct, color) {
  const low = pct <= 20;
  const fill = low ? "#FF3B30" : color;
  const w = Math.max(2.2, (pct / 100) * 18.4);
  // corpo 23×12 + pino — altura total 12, alinhado com sinal/wifi
  return `<svg class="ico bat" width="27" height="12" viewBox="0 0 27 12" aria-hidden="true">
    <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="1"/>
    <rect x="2" y="2" width="${w.toFixed(2)}" height="8" rx="1.8" fill="${fill}"/>
    <path d="M23.5 3.6v4.8c1.1-.35 1.1-4.45 0-4.8Z" fill="${color}" fill-opacity="0.45"/>
  </svg>`;
}

function avatarSvg() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="#C5C9CD"/><circle cx="40" cy="30" r="14" fill="#F2F3F5"/><ellipse cx="40" cy="62" rx="22" ry="16" fill="#F2F3F5"/></svg>`)}`;
}

function theme(dark) {
  return dark
    ? {
        bg: "#0B0B0B", fg: "#FFFFFF", glass: "rgba(38,38,40,0.72)", glassBorder: "rgba(255,255,255,0.10)",
        glassHi: "rgba(255,255,255,0.07)", bubbleOut: "#144D37", bubbleIn: "#242626", bubbleFg: "#FFFFFF",
        meta: "rgba(255,255,255,0.58)", dateBg: "#1D1F1F", dateFg: "rgba(255,255,255,0.62)",
        inputBg: "rgba(38,38,40,0.85)", icon: "#FFFFFF", micBg: "#FFFFFF", micFg: "#000000",
        shadow: "rgba(0,0,0,0.35)", wallpaper: "media/wallpaper-escuro.jpg", fade: "11,11,11",
      }
    : {
        bg: "#F5F1EB", fg: "#000000", glass: "rgba(255,255,255,0.78)", glassBorder: "rgba(0,0,0,0.06)",
        glassHi: "rgba(255,255,255,0.9)", bubbleOut: "#D9FDD3", bubbleIn: "#FFFFFF", bubbleFg: "#111B21",
        meta: "#667781", dateBg: "#FFFFFF", dateFg: "#54656F",
        inputBg: "rgba(255,255,255,0.92)", icon: "#000000", micBg: "#000000", micFg: "#FFFFFF",
        shadow: "rgba(0,0,0,0.10)", wallpaper: "media/wallpaper-claro.jpg", fade: "245,241,235",
      };
}

function msgsHtml(list) {
  let html = "";
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (m.tipo === "data") {
      html += `<div class="date-pill"><span data-edit="mensagens.${i}.texto" contenteditable="true">${esc(m.texto)}</span></div>`;
      continue;
    }
    const next = list[i + 1], prev = list[i - 1];
    const mine = m.de === "eu";
    const side = mine ? "out" : "in";
    const first = !prev || prev.tipo === "data" || prev.de !== m.de;
    const last = !next || next.tipo === "data" || next.de !== m.de;
    const meta = `<span class="meta"><span data-edit="mensagens.${i}.hora" contenteditable="true">${esc(m.hora || "")}</span>${mine ? checks(m.status || "lido") : ""}</span>`;
    const text = m.texto ? `<span class="text" data-edit="mensagens.${i}.texto" contenteditable="true">${esc(m.texto)}</span>` : "";
    const img = m.imagem ? `<img class="media" src="${esc(m.imagem)}" alt="" data-upload="mensagens.${i}.imagem"/>` : "";
    html += `<div class="row ${side}${first ? " first" : ""}${last ? " tail" : ""}">
      <div class="bubble ${side}${m.imagem ? " has-img" : ""}">${img}${m.imagem ? `<div class="caption">${text}${meta}</div>` : `${text}${meta}`}</div>
    </div>`;
  }
  return html;
}

export function renderPhone(data) {
  const dark = data.tema !== "claro";
  const t = theme(dark);
  const bateria = Math.min(100, Math.max(0, Number(data.bateria ?? 80)));
  const sinal = Number(data.sinal ?? 4);
  const foto = data.foto || avatarSvg();
  const wifi = data.wifi !== false;

  return `<div class="phone" id="phone" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:${t.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;-webkit-font-smoothing:antialiased">
  <style>
    #phone *{box-sizing:border-box;margin:0;padding:0}
    #phone .wallpaper{position:absolute;inset:0;background:${t.bg} url('${t.wallpaper}') center/cover no-repeat;${dark ? "filter:brightness(.72);" : ""}}
    #phone .fade-top{position:absolute;top:0;left:0;right:0;height:118px;z-index:18;background:linear-gradient(to bottom,rgba(${t.fade},1) 0%,rgba(${t.fade},1) 72%,rgba(${t.fade},0))}
    #phone .fade-bottom{position:absolute;bottom:0;left:0;right:0;height:92px;z-index:18;background:linear-gradient(to top,rgba(${t.fade},1) 0%,rgba(${t.fade},1) 62%,rgba(${t.fade},0))}
    #phone .glass{background:${t.glass};backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);border:.5px solid ${t.glassBorder};box-shadow:inset 0 1px 0 ${t.glassHi},0 2px 10px ${t.shadow}}
    #phone .status{position:absolute;top:0;left:0;right:0;height:54px;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:12px 28px 0 42px;color:${t.fg}}
    #phone .time{font-size:16px;font-weight:600;letter-spacing:-.2px;line-height:1;display:block}
    #phone .status-right{display:flex;align-items:center;gap:7px;height:12px;line-height:0}
    #phone .status-right .ico{display:block;flex-shrink:0;overflow:visible}
    #phone .header{position:absolute;top:58px;left:0;right:0;height:44px;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 16px}
    #phone .header-left{display:flex;align-items:center;min-width:0;height:44px}
    #phone .back{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}
    #phone .avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;background:#C5C9CD;margin-left:10px;display:block;flex-shrink:0}
    #phone .name{margin-left:10px;font-size:17px;font-weight:600;letter-spacing:-.3px;color:${t.fg};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;line-height:22px;display:block}
    #phone .actions{height:44px;border-radius:22px;padding:0 16px;display:flex;align-items:center;gap:26px;box-shadow:inset 0 1px 0 ${t.glassHi}}
    #phone .back.glass,#phone .actions.glass{box-shadow:inset 0 1px 0 ${t.glassHi}}
    #phone .chat{position:absolute;top:112px;bottom:80px;left:0;right:0;overflow:hidden;z-index:5;padding:0 14px 10px 16px;display:flex;flex-direction:column;justify-content:flex-end}
    #phone .date-pill{align-self:center;margin:10px 0}
    #phone .date-pill span{display:inline-block;background:${t.dateBg};color:${t.dateFg};font-size:12.5px;font-weight:500;padding:5px 11px;border-radius:9px}
    #phone .row{display:flex;margin-top:2px} #phone .row.first{margin-top:8px}
    #phone .row.out{justify-content:flex-end} #phone .row.in{justify-content:flex-start}
    #phone .bubble{position:relative;max-width:80%;padding:7px 11px 7px 12px;border-radius:18px;font-size:17px;line-height:1.3;letter-spacing:-.2px;color:${t.bubbleFg}}
    #phone .bubble.out{background:${t.bubbleOut}} #phone .bubble.in{background:${t.bubbleIn}}
    #phone .row.tail.in .bubble{border-bottom-left-radius:5px} #phone .row.tail.out .bubble{border-bottom-right-radius:5px}
    #phone .text{white-space:pre-wrap;word-break:break-word}
    #phone .meta{float:right;display:inline-flex;align-items:center;gap:4px;margin:8px 0 -4px 12px;color:${t.meta};font-size:12px;line-height:1;position:relative;top:2px}
    #phone .bubble.has-img{padding:4px;max-width:76%}
    #phone .media{display:block;width:100%;max-width:262px;max-height:330px;object-fit:cover;border-radius:14px}
    #phone .caption{padding:6px 8px 4px 9px}
    #phone .scroll-hint{position:absolute;right:16px;bottom:96px;z-index:25;width:34px;height:34px;border-radius:50%;display:grid;place-items:center}
    #phone .composer{position:absolute;left:0;right:0;bottom:0;height:80px;z-index:30;padding:0 14px 30px;display:flex;align-items:center;gap:12px}
    #phone .plus,#phone .cam{width:30px;height:30px;display:grid;place-items:center}
    #phone .input{flex:1;height:38px;border-radius:19px;background:${t.inputBg};border:.5px solid ${t.glassBorder};display:flex;align-items:center;justify-content:flex-end;padding:0 12px}
    #phone .mic{width:38px;height:38px;border-radius:50%;background:${t.micBg};display:grid;place-items:center}
    #phone [data-edit]:hover,#phone [data-upload]:hover{outline:1.5px dashed #53BDEB;outline-offset:2px;border-radius:4px}
    #phone [data-edit]:focus{outline:2px solid #53BDEB;outline-offset:2px}
    #phone [data-upload]{cursor:pointer}
  </style>
  <div class="wallpaper"></div>
  <div class="chat">${msgsHtml(data.mensagens || [])}</div>
  <div class="fade-top"></div><div class="fade-bottom"></div>
  <div class="status">
    <div class="time" data-edit="horaStatus" contenteditable="true">${esc(data.horaStatus || "09:14")}</div>
    <div class="status-right">
      <svg class="ico" width="19" height="12" viewBox="0 0 19 12" aria-hidden="true">${signal(sinal, t.fg)}</svg>
      ${wifi ? `<svg class="ico" width="19" height="12" viewBox="0 0 19 12" aria-hidden="true">${wifi(t.fg)}</svg>` : ""}
      ${battery(bateria, t.fg)}
    </div>
  </div>
  <div class="header">
    <div class="header-left">
      <div class="back glass"><svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M10 2 2.2 10 10 18" stroke="${t.icon}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <img class="avatar" src="${esc(foto)}" alt="" data-upload="foto"/>
      <div class="name" data-edit="contato" contenteditable="true">${esc(data.contato || "Contato")}</div>
    </div>
    <div class="actions glass">
      <svg width="27" height="20" viewBox="0 0 27 20" fill="none"><rect x="1.2" y="2.2" width="17" height="15.6" rx="3.8" stroke="${t.icon}" stroke-width="2"/><path d="m18.6 8 6.2-3.9v11.8L18.6 12" stroke="${t.icon}" stroke-width="2" stroke-linejoin="round"/></svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6.6 2.8c.5-.4 1.2-.4 1.6.1l2.4 2.9c.4.5.4 1.2 0 1.7L9.3 9.1a.9.9 0 0 0-.1 1c1.1 2 2.7 3.6 4.7 4.7.3.2.7.2 1-.1l1.6-1.3c.5-.4 1.2-.4 1.7 0l2.9 2.4c.5.4.5 1.1.1 1.6l-1.6 1.9c-.8.9-2 1.3-3.2 1-3.2-.8-6.1-2.6-8.4-4.9S4 10.3 3.2 7.1c-.3-1.2.1-2.4 1-3.2l2.4-1.1Z" stroke="${t.icon}" stroke-width="1.9" stroke-linejoin="round"/></svg>
    </div>
  </div>
  <div class="scroll-hint glass"><svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1.5 1.5 7 7l5.5-5.5" stroke="${t.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="composer">
    <div class="plus"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2v18M2 11h18" stroke="${t.icon}" stroke-width="2" stroke-linecap="round"/></svg></div>
    <div class="input"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.5 12.5V7a3.5 3.5 0 0 0-3.5-3.5H7A3.5 3.5 0 0 0 3.5 7v10A3.5 3.5 0 0 0 7 20.5h5.5l8-8Z" stroke="${t.icon}" stroke-width="1.7" stroke-linejoin="round"/><path d="M12.5 20.5v-4.5a3.5 3.5 0 0 1 3.5-3.5h4.5" stroke="${t.icon}" stroke-width="1.7" stroke-linejoin="round"/></svg></div>
    <div class="cam"><svg width="26" height="22" viewBox="0 0 26 22" fill="none"><path d="M9.3 2.5h7.4l1.6 2.3h3.4a2.8 2.8 0 0 1 2.8 2.8v9.6a2.8 2.8 0 0 1-2.8 2.8H4.3a2.8 2.8 0 0 1-2.8-2.8V7.6a2.8 2.8 0 0 1 2.8-2.8h3.4l1.6-2.3Z" stroke="${t.icon}" stroke-width="1.9" stroke-linejoin="round"/><circle cx="13" cy="12" r="4.2" stroke="${t.icon}" stroke-width="1.9"/></svg></div>
    <div class="mic"><svg width="14" height="21" viewBox="0 0 14 21" fill="none"><rect x="3.6" y="1" width="6.8" height="12" rx="3.4" fill="${t.micFg}"/><path d="M1.2 9.8a5.8 5.8 0 0 0 11.6 0M7 15.8V20" stroke="${t.micFg}" stroke-width="1.8" stroke-linecap="round"/></svg></div>
  </div>
</div>`;
}
