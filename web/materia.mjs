/**
 * Matéria de portal (modelo do print de referência).
 * Renderiza a página em 862px de largura (mesma proporção do print) e exporta em @2x.
 */
export const ARTIGO_W = 862;

export const MODELO_MATERIA = {
  marca: "Startups",
  secao1: "Início",
  secao2: "Negócios",
  titulo:
    "À espera da filha, casal de brasileiros cria aplicativo para organizar o enxoval e passa de 40 mil downloads",
  linhaFina:
    "Gabriel e Bruna transformaram a lista que usavam em casa no Enxovaly, app que monta o enxoval de acordo com a data do parto e o clima da cidade.",
  atualizado: "Atualizado há 2 horas",
  imagem: "media/casal-enxoval.jpg",
  legenda:
    "Gabriel e Bruna, criadores do Enxovaly: o aplicativo nasceu durante a organização do enxoval da filha do casal.",
  credito: "(Enxovaly/Divulgação)",
  corpo: [],
};

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const ICO = {
  menu: `<svg width="30" height="20" viewBox="0 0 20 13" fill="none" aria-hidden="true"><path d="M1 1h18M1 6.5h18M1 12h18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`,
  busca: `<svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.6" cy="8.6" r="6.3" stroke="currentColor" stroke-width="1.7"/><path d="m13.4 13.4 4.7 4.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  cycle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.2-5.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M20 4v5h-5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export function renderArtigo(d, { editavel = false } = {}) {
  const edit = editavel === true;
  const ed = (path, val, tag = "span", cls = "") =>
    `<${tag}${cls ? ` class="${cls}"` : ""} data-edit="${path}" contenteditable="true">${esc(val)}</${tag}>`;

  const imagem = d.imagem
    ? `<img class="hero-img" src="${esc(d.imagem)}" alt="" data-upload="imagem"/>`
    : `<div class="hero-vazia" data-upload="imagem">Clique para escolher a imagem</div>`;
  const hero = edit
    ? `<div class="hero-wrap"><button type="button" class="shuff" data-shuffle="pg-foto" title="Próxima imagem">${ICO.cycle}</button>${imagem}</div>`
    : imagem;

  const corpo = (d.corpo || [])
    .map((p, i) =>
      edit
        ? `<p class="p"><span data-edit="corpo.${i}.texto" contenteditable="true">${esc(p.texto)}</span></p>`
        : `<p class="p">${esc(p.texto)}</p>`
    )
    .join("");

  return `<div class="artigo" id="artigo" style="width:${ARTIGO_W}px">
  <style>
    #artigo *{box-sizing:border-box;margin:0;padding:0}
    #artigo{
      background:#fff;color:#16181c;font-family:"Inter",-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;
      -webkit-font-smoothing:antialiased;padding-bottom:40px;
    }
    #artigo .top{display:flex;align-items:center;justify-content:space-between;height:78px;padding:0 36px;border-bottom:1px solid #e6e6e4;color:#1b1b1b}
    #artigo .menu,#artigo .busca{display:grid;place-items:center;width:36px;height:36px;background:none;border:0;color:#1b1b1b;cursor:default;flex-shrink:0}
    #artigo .logo{
      font-family:"Playfair Display","Times New Roman",Georgia,serif;font-weight:800;font-size:34px;
      letter-spacing:-.6px;color:#b31217;line-height:1;white-space:nowrap;
    }
    #artigo .conteudo{padding:0 36px}
    #artigo .trilha{display:flex;align-items:center;gap:10px;margin-top:27px;font-size:18px;line-height:1.2;color:#6b6f73}
    #artigo .trilha .sep{color:#b9bcbe;font-size:17px}
    #artigo .trilha .sec{color:#b31217;font-weight:700}
    #artigo .titulo{
      margin-top:14px;font-family:"Playfair Display","Times New Roman",Georgia,serif;
      font-weight:700;font-size:44px;line-height:1.16;letter-spacing:-.5px;color:#131417;
    }
    #artigo .linha{margin-top:19px;font-size:23px;line-height:1.5;letter-spacing:-.2px;color:#3d4145}
    #artigo .atualizado{margin-top:21px;font-size:18px;color:#8e9295}
    #artigo figure{margin-top:26px}
    #artigo .hero-wrap{position:relative;display:block}
    #artigo .hero-img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;background:#eceff1}
    #artigo .hero-vazia{
      display:grid;place-items:center;width:100%;aspect-ratio:3/2;background:#eceff1;
      color:#98a0a6;font-size:18px;letter-spacing:.02em;
    }
    #artigo .legenda{margin-top:15px;font-size:21px;line-height:1.45;color:#7b7f83}
    #artigo .legenda .cred{white-space:normal}
    #artigo .corpo .p{margin-top:26px;font-size:23px;line-height:1.62;color:#25282b}
    #artigo [data-edit]:hover,#artigo [data-upload]:hover{outline:1.5px dashed #53bdeb;outline-offset:3px}
    #artigo [data-edit]:focus{outline:2px solid #53bdeb;outline-offset:3px}
    #artigo [data-upload]{cursor:pointer}
    #artigo .shuff{
      position:absolute;z-index:5;top:10px;right:10px;display:inline-flex;align-items:center;justify-content:center;
      width:30px;height:30px;border:0;border-radius:999px;cursor:pointer;padding:0;line-height:0;
      background:rgba(15,18,20,.9);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.35);
      opacity:0;pointer-events:none;transition:opacity .12s ease;
    }
    #artigo .hero-wrap:hover .shuff,#artigo .hero-wrap:focus-within .shuff{opacity:1;pointer-events:auto}
    #artigo .shuff:hover{background:#25d366;color:#04210f}
    #artigo .shuff svg{display:block;pointer-events:none}
  </style>
  <header class="top">
    <button type="button" class="menu" aria-hidden="true">${ICO.menu}</button>
    <div class="logo">${edit ? `<span data-edit="marca" contenteditable="true">${esc(d.marca)}</span>` : esc(d.marca)}</div>
    <button type="button" class="busca" aria-hidden="true">${ICO.busca}</button>
  </header>
  <div class="conteudo">
    <div class="trilha">
      ${ed("secao1", d.secao1)}
      <span class="sep">›</span>
      ${ed("secao2", d.secao2, "span", "sec")}
    </div>
    <h1 class="titulo"${edit ? ` data-edit="titulo" contenteditable="true"` : ""}>${esc(d.titulo)}</h1>
    ${ed("linhaFina", d.linhaFina, "p", "linha")}
    ${ed("atualizado", d.atualizado, "div", "atualizado")}
    <figure>
      ${hero}
      <figcaption class="legenda">${ed("legenda", d.legenda)} ${ed("credito", d.credito, "span", "cred")}</figcaption>
    </figure>
    <div class="corpo">${corpo}</div>
  </div>
</div>`;
}
