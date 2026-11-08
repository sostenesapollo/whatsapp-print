/** Pool de nomes, fotos e conversas pra botão Aleatório. */

export const NOMES = {
  mulher: [
    "Ana Paula Souza", "Beatriz Lima", "Camila Ferreira", "Carolina Mendes",
    "Daniela Rocha", "Eduarda Martins", "Fernanda Alves", "Gabriela Costa",
    "Helena Barbosa", "Isabela Nunes", "Juliana Pereira", "Larissa Oliveira",
    "Letícia Ramos", "Mariana Santos", "Natália Ribeiro", "Patricia Gomes",
    "Priscila Araujo", "Rafaela Dias", "Sabrina Leal", "Tatiane Moreira",
    "Vanessa Cardoso", "Amanda Vieira", "Bruna Teixeira", "Claudia Freitas",
    "Debora Pires", "Elaine Castro", "Fabiana Lopes", "Giovana Duarte",
  ],
  homem: [
    "André Silva", "Bruno Carvalho", "Carlos Eduardo", "Diego Martins",
    "Felipe Rocha", "Gabriel Souza", "Henrique Lima", "Igor Fernandes",
    "João Pedro Alves", "Lucas Mendes", "Marcelo Costa", "Nicolas Barbosa",
    "Pedro Henrique", "Rafael Nunes", "Thiago Oliveira", "Vinicius Ramos",
  ],
};

/** Blocos de conversa (estilo print gestante). `imagem` opcional usa mídia do produto. */
export const CONVERSAS = [
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "usei a lista inteira, só comprei o essencial" },
      { de: "ela", texto: "tinha coisa pra 6 meses q o guia manda comprar só depois" },
      { de: "ela", texto: "e eu achando q precisava de tudo antes do berço chegar" },
      { tipo: "data", texto: "hoje" },
      { de: "ela", texto: "Terminei aqui o conteúdo de vocês gente, e amei 🫶", imagem: "media/drive-manual.png" },
      { de: "eu", texto: "Ficamos muito felizes, todos os dias uma mamãe nos manda uma mensagem 🩷🩷🫶", status: "lido" },
      { de: "ela", texto: "🫶🫶🫶" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "bom dia joyce, terminei a lista do enxoval" },
      { de: "ela", texto: "cortei 18 itens q iam ficar encostados" },
      { de: "ela", texto: "imprimi e fui riscando com calma", imagem: "media/produto-manual.jpg" },
      { de: "eu", texto: "marcou tudo? rs", status: "lido" },
      { de: "ela", texto: "só o da primeira semana. deu 240 a menos 🙏" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "meninas eu tava em panico com a mala da maternidade" },
      { de: "ela", texto: "segui o checklist de voces e ficou bem menor" },
      { de: "eu", texto: "e o essencial ficou?", status: "lido" },
      { de: "ela", texto: "ficou. e sobrou espaço ainda kkk" },
      { de: "ela", texto: "obrigada de verdade 💕" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "joyce, o plano de parto salvou minha conversa com o medico" },
      { de: "ela", texto: "eu n sabia nem por onde começar" },
      { de: "eu", texto: "que bom 🫶 qualquer dúvida manda", status: "lido" },
      { de: "ela", texto: "mandeii pra minha irmã tbm, ela ta gravida" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "gente o modulo do enxoval inteligente é ouro" },
      { de: "ela", texto: "eu ia comprar 3 trocadores kkkk", imagem: "media/drive-manual.png" },
      { de: "eu", texto: "haha clássico! melhor cortar agora", status: "lido" },
      { de: "ela", texto: "cortei e ainda achei fralda mais barata no site q voces indicam" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "meu marido leu o manual cmg ontem" },
      { de: "ela", texto: "ele q sempre falava q era exagero agora ta anotando" },
      { de: "eu", texto: "adorei isso 🥹", status: "lido" },
      { de: "ela", texto: "ele ate falou da lista do pos parto" },
      { de: "ela", texto: "valeu demais 🙏" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "oi, comprei ontem e ja baixei tudo" },
      { de: "ela", texto: "o pdf do enxoval ja imprimei", imagem: "media/produto-manual.jpg" },
      { de: "eu", texto: "qualquer coisa estamos aqui", status: "lido" },
      { de: "ela", texto: "ja indiquei no grupo da gestante daqui" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "eu tava perdida com o que levar pro hospital" },
      { de: "ela", texto: "segui a ordem de voces e ficou claro" },
      { de: "ela", texto: "sem comprar bobagem" },
      { de: "eu", texto: "perfeito, é exatamente isso 🩷", status: "lido" },
      { de: "ela", texto: "amei o material" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "joyce boa noitee" },
      { de: "ela", texto: "terminei o bonus das checklists" },
      { de: "ela", texto: "vou usar semana q vem na consulta", imagem: "media/drive-manual.png" },
      { de: "eu", texto: "marca os pontos q mais importam pra voce", status: "lido" },
      { de: "ela", texto: "ja marquei 👍" },
    ],
  },
  {
    msgs: [
      { tipo: "data", texto: "auto" },
      { de: "ela", texto: "pessoal, economizei uns 300 reais so com a lista" },
      { de: "ela", texto: "tinha marcado um monte de coisa 'por garantia'" },
      { de: "eu", texto: "que alivio ne?", status: "lido" },
      { de: "ela", texto: "demais. e o bebe nem chegou ainda kkk" },
    ],
  },
];

const MESES = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickOther(arr, current) {
  if (!arr?.length) return current || "";
  if (arr.length === 1) return arr[0];
  let next = pick(arr);
  let guard = 0;
  while (next === current && guard++ < 8) next = pick(arr);
  return next;
}

/** @param {'mulher'|'homem'|'ambos'} modo */
export function pickGenero(modo = "ambos", { foto = "", contato = "" } = {}) {
  if (modo === "homem" || modo === "mulher") return modo;
  // ambos: tenta manter o gênero atual; senão 50/50
  if (String(foto).includes("/homem/")) return "homem";
  if (String(foto).includes("/mulher/")) return "mulher";
  const nome = String(contato || "").trim();
  if (NOMES.homem.includes(nome)) return "homem";
  if (NOMES.mulher.includes(nome)) return "mulher";
  return Math.random() < 0.5 ? "homem" : "mulher";
}

export function randomFoto({ avatars, foto = "", contato = "", modo = "ambos" } = {}) {
  const genero = pickGenero(modo, { foto, contato });
  const same = avatars?.[genero] || [];
  const pool = [...(avatars?.mulher || []), ...(avatars?.homem || [])];
  return pickOther(same.length ? same : pool, foto);
}

export function randomNome({ foto = "", contato = "", modo = "ambos" } = {}) {
  const genero = pickGenero(modo, { foto, contato });
  return pickOther(NOMES[genero] || NOMES.mulher, contato);
}

export const MSG_IMGS = [
  "media/drive-manual.png",
  "media/produto-manual.jpg",
];

export function randomMsgImg(current = "") {
  return pickOther(MSG_IMGS, current) || MSG_IMGS[0];
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function randomTime(baseH = 9, baseM = 0) {
  const h = Math.min(23, baseH + Math.floor(Math.random() * 3));
  const m = (baseM + Math.floor(Math.random() * 18)) % 60;
  return `${pad(h)}:${pad(m)}`;
}

function formatDate(d) {
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function buildDates() {
  const hoje = new Date();
  const passado = new Date(hoje);
  passado.setDate(hoje.getDate() - (3 + Math.floor(Math.random() * 20)));
  return { passado: formatDate(passado), hoje: formatDate(hoje) };
}

/**
 * @param {{ tema?: string, modo?: 'mulher'|'homem'|'ambos', avatars: { homem: string[], mulher: string[] } }} opts
 */
export function randomConversation({ tema = "escuro", modo = "ambos", avatars }) {
  const genero = pickGenero(modo);
  const fotos = avatars[genero] || [];
  const nomes = NOMES[genero];
  const conv = pick(CONVERSAS);
  const dates = buildDates();

  let tH = 8 + Math.floor(Math.random() * 10);
  let tM = Math.floor(Math.random() * 50);
  const mensagens = conv.msgs.map((m) => {
    if (m.tipo === "data") {
      const texto = m.texto === "hoje" ? dates.hoje : m.texto === "auto" ? dates.passado : m.texto;
      return { tipo: "data", texto };
    }
    const hora = randomTime(tH, tM);
    // avança alguns minutos
    tM += 1 + Math.floor(Math.random() * 4);
    if (tM >= 60) { tH += 1; tM -= 60; }
    const out = { de: m.de, texto: m.texto, hora };
    if (m.status) out.status = m.status;
    if (m.imagem) out.imagem = m.imagem;
    return out;
  });

  const lastHora = [...mensagens].reverse().find((m) => m.hora)?.hora;
  return {
    contato: pick(nomes),
    tema,
    horaStatus: lastHora || randomTime(12, 0),
    bateria: Math.random() < 0.25 ? 8 + Math.floor(Math.random() * 18) : 35 + Math.floor(Math.random() * 60),
    sinal: 3 + Math.floor(Math.random() * 2),
    wifi: Math.random() < 0.9,
    foto: fotos.length ? pick(fotos) : "",
    mensagens,
  };
}
