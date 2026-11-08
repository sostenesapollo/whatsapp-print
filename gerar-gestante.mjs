#!/usr/bin/env node
/**
 * Gera prints WhatsApp a partir das conversas DEP do manual gestante.
 * Datas remapeadas para out–nov/2026; baterias e horas do status variadas.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { gerarPrint } from "./generate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "/Users/sostenesapollo/dev/manual-gestante-tranquila/site";
const OUT = resolve(__dirname, "out/gestante");
const TEMAS = ["claro", "escuro"];

const MESES = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

function fmt(dia, mes /* 1-12 */, ano = 2026) {
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

function img(rel) {
  return resolve(SITE, rel);
}

/** [diaOut, mesOut, diaHoje, mesHoje, horaStatus, bateria] */
const META = [
  [4, 10, 2, 11, "08:14", 12],
  [7, 10, 3, 11, "09:41", 87],
  [9, 10, 4, 11, "13:22", 34],
  [11, 10, 5, 11, "16:48", 61],
  [14, 10, 5, 11, "10:05", 23],
  [15, 10, 6, 11, "19:37", 74],
  [17, 10, 6, 11, "07:52", 9],
  [18, 10, 7, 11, "06:18", 52],
  [20, 10, 7, 11, "11:55", 91],
  [21, 10, 8, 11, "22:11", 18],
  [22, 10, 8, 11, "14:33", 45],
  [23, 10, 1, 11, "07:29", 68],
  [24, 10, 2, 11, "12:47", 81],
  [25, 10, 3, 11, "15:10", 27],
  [26, 10, 4, 11, "20:06", 55],
  [27, 10, 5, 11, "11:19", 93],
  [28, 10, 6, 11, "10:42", 39],
  [29, 10, 7, 11, "16:51", 14],
  [30, 10, 8, 11, "18:44", 72],
  [31, 10, 8, 11, "21:03", 48],
];

const DEP = [
  {
    name: "Camila Ferreira Rocha",
    ava: "imagens/chat/a1.webp",
    msgs: [
      { k: "in", h: "18:41", sep: "first", x: "oi joyce, comprei o manual ontem" },
      { k: "in", h: "18:42", x: "já baixei tudo no celular, obrigada por responder" },
      {
        k: "in",
        h: "18:43",
        x: "e eu tinha comprado 3 macacões RN já, voltei e troquei por maior",
      },
      { k: "in", h: "09:12", sep: "hoje", x: "bom dia joyce, terminei a lista do enxoval" },
      { k: "in", h: "09:13", x: "cortei 18 itens q iam ficar encostados" },
      {
        k: "in",
        h: "09:14",
        img: "imagens/cover-1.webp",
        x: "imprimi e fui riscando com calma",
      },
      { k: "out", h: "09:15", x: "marcou tudo? rs" },
      {
        k: "in",
        h: "09:16",
        x: "só o da primeira semana. deu 240 a menos do q eu tinha planejado",
      },
      { k: "in", h: "09:17", x: "obrigada de vdd 🙏" },
    ],
  },
  {
    name: "Lilian Alves Nazar de Paula",
    ava: "imagens/chat/a12.webp",
    msgs: [
      { k: "in", h: "08:02", sep: "first", x: "oi" },
      { k: "in", h: "08:03", x: "bom dia" },
      { k: "out", h: "08:04", x: "oi lilian, bom dia! tudo bem?" },
      { k: "in", h: "08:05", x: "é do manual?" },
      { k: "out", h: "08:06", x: "é sim" },
      { k: "in", h: "08:07", x: "eu comprei com vocês e to amando" },
      { k: "in", h: "08:08", x: "já li o de enxoval e o de nutrição" },
      {
        k: "in",
        h: "08:07",
        sep: "hoje",
        x: "o cardápio da semana 2 salvou meus enjoos, sério",
      },
      {
        k: "in",
        h: "08:08",
        img: "imagens/cover-2.webp",
        x: "to seguindo as receitas",
      },
      { k: "out", h: "08:09", x: "ai que bom!! obrigada por voltar aqui" },
      { k: "in", h: "08:10", x: "que isso, obrigada eu 🙂" },
    ],
  },
  {
    name: "Juliana Prado Mattos",
    ava: "imagens/chat/a2.webp",
    msgs: [
      {
        k: "in",
        h: "13:02",
        sep: "first",
        x: "oi joyce, to de 16 semanas e o enjoo ta me derrubando",
      },
      { k: "in", h: "13:03", x: "desde a 6 semanas é assim, não para" },
      { k: "in", h: "13:04", x: "nem água eu conseguir tomar" },
      {
        k: "in",
        h: "13:05",
        x: "a médica só mandou comer bolacha e ficar de repouso",
      },
      { k: "in", h: "13:06", x: "já tentei de tudo e nada desce" },
      { k: "in", h: "13:07", x: "e ainda tenho q trabalhar em pé" },
      {
        k: "in",
        h: "13:20",
        sep: "hoje",
        x: "voltei pra falar q o suco de gengibre do guia 2 funcionou",
      },
      { k: "out", h: "13:21", x: "que bom!! consegue comer algo sólido?" },
      {
        k: "in",
        h: "13:22",
        x: "arroz, frango e abóbora. e o quadro de ferro me fez procurar a médica",
      },
      { k: "in", h: "13:23", x: "descobri anemia, já to tratando" },
      { k: "out", h: "13:24", x: "ainda bem q vc levou isso pra consulta" },
    ],
  },
  {
    name: "Rafaela Duarte Lima",
    ava: "imagens/chat/a3.webp",
    msgs: [
      {
        k: "in",
        h: "21:14",
        sep: "first",
        x: "joyce, baixei o plano de parto pra preencher com meu marido",
      },
      { k: "out", h: "21:15", x: "faz junto sim, é bom vcs conversarem" },
      { k: "in", h: "16:22", sep: "hoje", x: "preenchi com ele hj" },
      { k: "in", h: "16:23", x: "tinha campo q a gente nem sabia q existia kkk" },
      {
        k: "in",
        h: "16:24",
        img: "imagens/chat/p3.webp",
        x: "32 semanas e tudo pronto",
      },
      { k: "out", h: "16:25", x: "e ficou do jeito q vcs querem?" },
      { k: "in", h: "16:26", x: "ficou. vou levar impresso na maternidade" },
      { k: "in", h: "16:27", x: "a obstetra leu e disse q tava completo" },
      { k: "out", h: "16:28", x: "fico feliz demais 🥲" },
    ],
  },
  {
    name: "Patrícia Nogueira Salles",
    ava: "imagens/chat/a4.webp",
    msgs: [
      {
        k: "in",
        h: "08:52",
        sep: "first",
        x: "joyce, tenho consulta quinta e quero levar o capítulo dos direitos",
      },
      {
        k: "in",
        h: "08:53",
        x: "a empresa já começou a me escalar pra fechar caixa até tarde",
      },
      { k: "in", h: "08:54", x: "e eu fico com medo de falar" },
      {
        k: "in",
        h: "08:55",
        x: "eu trabalho de carteira assinada, tenho direito de mudar de função?",
      },
      { k: "in", h: "08:56", x: "não sabia q podia pedir isso" },
      { k: "out", h: "08:57", x: "leva sim, e marca antes o que te interessa" },
      { k: "in", h: "10:41", sep: "hoje", x: "levei impresso na consulta" },
      {
        k: "in",
        h: "10:42",
        x: "ela respeitou tudo e ainda anotou o atestado q eu tinha direito",
      },
      { k: "out", h: "10:43", x: "sério?" },
      { k: "in", h: "10:44", x: "sem o manual eu ia aceitar o q viesse" },
      {
        k: "in",
        h: "10:45",
        x: "a parte de licença é bem explicada, com a lei citada",
      },
    ],
  },
  {
    name: "Aline Cordeiro Marques",
    ava: "imagens/chat/a5.webp",
    msgs: [
      {
        k: "in",
        h: "19:02",
        sep: "first",
        x: "joyce, o chá de bebê é sábado e eu to perdida com a lista",
      },
      { k: "out", h: "19:03", x: "usa os textos do guia 4, resolve isso em 10 min" },
      { k: "in", h: "19:04", x: "vou usar sim, obrigada" },
      { k: "in", h: "19:30", sep: "hoje", x: "fiz o chá no sábado com os textos" },
      {
        k: "in",
        h: "19:31",
        img: "imagens/cover-4.webp",
        x: "a lista é essa, imprimi e deixei na mesa",
      },
      { k: "out", h: "19:32", x: "q mesa! repetiu alguma coisa?" },
      { k: "in", h: "19:33", x: "nenhuma haha todo mundo foi na lista" },
      { k: "in", h: "19:34", x: "e consegui curtir a festa até 🥰" },
    ],
  },
  {
    name: "Iasmin Silva",
    ava: "imagens/chat/a13.webp",
    msgs: [
      {
        k: "in",
        h: "17:20",
        sep: "first",
        x: "joyce, oi, tudo bem? meu chefe quer me tirar do caixa",
      },
      {
        k: "in",
        h: "17:21",
        x: "falou q grávida não pode ficar muito tempo sentada",
      },
      {
        k: "out",
        h: "17:22",
        x: "pode sim. ele pode te remanejar se precisar, mas não te prejudicar",
      },
      { k: "in", h: "17:23", x: "não sabia q era direito" },
      { k: "in", h: "17:24", x: "vou levar o capítulo pra ele" },
      { k: "in", h: "09:40", sep: "hoje", x: "levei e ele deixou tudo como tava" },
      { k: "in", h: "09:41", x: "até pediu desculpa" },
      { k: "out", h: "09:42", x: "olha q bom! pediu por escrito?" },
      { k: "in", h: "09:43", x: "pedi no RH, já mandaram" },
      { k: "out", h: "09:44", x: "perfeito, agora fica guardado" },
    ],
  },
  {
    name: "Bruna Teixeira Alves",
    ava: "imagens/chat/a6.webp",
    msgs: [
      {
        k: "in",
        h: "06:02",
        sep: "first",
        x: "joyce, o bebê nasceu e a pega ta doendo mto",
      },
      { k: "in", h: "06:03", x: "ele tem 9 dias e eu to chorando de dor" },
      { k: "in", h: "06:04", x: "o bico ta rachado" },
      {
        k: "in",
        h: "06:05",
        x: "a doula falou q o selinho é o q mais importa",
      },
      { k: "in", h: "06:06", x: "mas tá difícil de acertar sozinha" },
      { k: "in", h: "06:07", x: "todo mundo fala q é só pegar jeito" },
      { k: "in", h: "06:12", sep: "hoje", x: "segui o passo a passo do cap 5" },
      { k: "out", h: "06:13", x: "e hj?" },
      {
        k: "in",
        h: "06:14",
        x: "parou de doer em 3 dias e ele ganhou 180g na pesagem",
      },
      {
        k: "in",
        h: "06:15",
        x: "eu ia desistir no primeiro dia, chorei quando virou",
      },
      { k: "out", h: "06:16", x: "parabéns mãe ❤️ me chama se apertar de novo" },
    ],
  },
  {
    name: "Thaís Moreira Campos",
    ava: "imagens/chat/a7.webp",
    msgs: [
      {
        k: "in",
        h: "11:40",
        sep: "first",
        x: "joyce to montando o cantinho de amamentação do quarto",
      },
      { k: "in", h: "11:41", x: "a cadeira já ficou do jeito q o guia mostra" },
      {
        k: "in",
        h: "11:42",
        x: "o quarto é pequeno e o berço fica do lado da cama, cabe?",
      },
      {
        k: "in",
        h: "11:43",
        img: "imagens/cover-6.webp",
        x: "usei esse checklist: agua, lanche e a almofada na cadeira do lado",
      },
      { k: "out", h: "11:44", x: "tudo no seu alcance?" },
      {
        k: "in",
        h: "11:45",
        x: "tudo. meu marido falou q ficou mais fácil de noite",
      },
      { k: "in", h: "11:46", x: "o guia 6 tb me deixou menos perdida com o pós" },
      { k: "out", h: "11:47", x: "boa sorte no parto, viu" },
    ],
  },
  {
    name: "Vanessa Rangel Duarte",
    ava: "imagens/chat/a8.webp",
    msgs: [
      {
        k: "in",
        h: "22:30",
        sep: "first",
        x: "joyce, 34 semanas e gestação de risco aqui",
      },
      { k: "in", h: "22:31", x: "a cada semana é exame novo" },
      { k: "in", h: "22:32", x: "e eu quase não durmo" },
      {
        k: "in",
        h: "22:33",
        x: "minha pressão subiu e a médica mandou repouso",
      },
      { k: "in", h: "22:34", x: "aí fico só com o celular mesmo" },
      {
        k: "in",
        h: "22:35",
        x: "tenho medo de perguntar as coisas pra médica e ela achar bobagem",
      },
      {
        k: "in",
        h: "03:14",
        sep: "hoje",
        x: "o manual virou minha consulta das 3h da manhã",
      },
      {
        k: "in",
        h: "03:15",
        x: "cada dúvida tem a fonte oficial do lado, parei de ir no google",
      },
      { k: "out", h: "03:16", x: "levou as dúvidas pro obstetra tb?" },
      { k: "in", h: "03:17", x: "levei, já com a lista pronta" },
      {
        k: "in",
        h: "03:18",
        x: "e a parte de direitos me deu coragem pra exigir acompanhante no parto",
      },
    ],
  },
  {
    name: "Larissa Fonseca Pires",
    ava: "imagens/chat/a9.webp",
    msgs: [
      {
        k: "in",
        h: "14:00",
        sep: "first",
        x: "oi joyce, primeira gestação, 22 anos e perdida",
      },
      { k: "in", h: "14:01", x: "minha tia tb fala q tanto exame é exagero" },
      { k: "in", h: "14:02", x: "nem sei o q perguntar na consulta" },
      {
        k: "in",
        h: "14:03",
        x: "minha mãe fala q eu exagero indo em toda consulta",
      },
      { k: "in", h: "14:04", x: "e eu fico na dúvida se ela tem razão" },
      { k: "in", h: "14:05", x: "obrigada por responder viu" },
      { k: "in", h: "14:07", sep: "hoje", x: "li o guia inteiro em 2 dias" },
      { k: "in", h: "14:08", x: "parei de googlar coisa e ficar assustada" },
      { k: "out", h: "14:09", x: "o q mais te abriu o olho?" },
      {
        k: "in",
        h: "14:10",
        x: "os exames certos em cada mês. eu tava pulando consulta e nem via",
      },
      { k: "in", h: "14:11", x: "chego segunda com tudo anotado" },
    ],
  },
  {
    name: "Michele Barbosa Reis",
    ava: "imagens/chat/a10.webp",
    msgs: [
      {
        k: "in",
        h: "07:10",
        sep: "first",
        x: "joyce, o checklist da mala é o q eu preciso",
      },
      { k: "in", h: "07:11", x: "tenho 36 semanas já, tô correndo" },
      { k: "out", h: "07:12", x: "imprime e vai marcando, sem pressa" },
      { k: "in", h: "07:26", sep: "hoje", x: "imprimi e colei na geladeira" },
      {
        k: "in",
        h: "07:27",
        img: "imagens/chat/p10.webp",
        x: "fui marcando durante a semana, sem deixar pra véspera",
      },
      { k: "out", h: "07:28", x: "nos intervalos do trabalho?" },
      { k: "in", h: "07:29", x: "sim, no ônibus eu leio no celular" },
      {
        k: "in",
        h: "07:30",
        x: "meu marido é meu acompanhante. tá tudo marcado, obrigada",
      },
    ],
  },
  {
    name: "Tha Sousa",
    ava: "imagens/chat/a14.webp",
    msgs: [
      {
        k: "in",
        h: "12:10",
        sep: "first",
        x: "oi joyce, meu bebê tem 2 meses e eu voltei a trabalhar",
      },
      { k: "in", h: "12:11", x: "to tirando leite no banheiro da empresa" },
      { k: "out", h: "12:12", x: "a empresa tem sala de apoio à amamentação?" },
      { k: "in", h: "12:13", x: "tem, mas a chave fica com o gerente" },
      { k: "out", h: "12:14", x: "isso é obrigação deles. pede por escrito" },
      { k: "in", h: "13:02", sep: "hoje", x: "consegui a chave e o horário" },
      { k: "in", h: "13:03", x: "levei o guia e mostrei a lei pro RH" },
      { k: "in", h: "13:04", x: "e comprei o potinho térmico q vc indica" },
      { k: "out", h: "13:05", x: "q vitória! agora é manter o estoque" },
      { k: "in", h: "13:06", x: "obrigada, sério" },
    ],
  },
  {
    name: "Francineide Alves da Silva",
    ava: "imagens/chat/a11.webp",
    msgs: [
      {
        k: "in",
        h: "12:37",
        sep: "first",
        x: "joyce vou ser sincera, achei caro de primeira",
      },
      {
        k: "in",
        h: "12:38",
        x: "tenho 2 filhos, no primeiro saí comprando tudo q aparecia",
      },
      { k: "in", h: "12:39", x: "e no segundo ele já reclamava de gasto" },
      { k: "in", h: "12:40", x: "meu marido falou q é dinheiro jogado fora" },
      {
        k: "in",
        h: "12:41",
        x: "mostrei a conta da primeira gestação e ele calou",
      },
      { k: "out", h: "12:42", x: "kkkk homens" },
      { k: "in", h: "12:43", x: "né" },
      { k: "in", h: "12:44", x: "só a lista de enxoval cortou 240 reais da conta" },
      { k: "out", h: "12:45", x: "kk é essa a conta q importa" },
      { k: "in", h: "12:46", x: "e a parte de direito eu nem sabia q existia" },
      { k: "in", h: "12:47", x: "obrigada por responder sem pressa, viu" },
    ],
  },
  {
    name: "Carol Lamach",
    ava: "imagens/chat/a15.webp",
    msgs: [
      {
        k: "in",
        h: "15:30",
        sep: "first",
        x: "joyce, minha sogra quer comprar berço, carrinho e tudo em dobro",
      },
      { k: "in", h: "15:31", x: "por causa do quarto dele na casa dela" },
      { k: "out", h: "15:32", x: "se ele vai dormir lá com frequência, faz sentido" },
      { k: "in", h: "15:33", x: "vai, toda semana" },
      {
        k: "in",
        h: "10:12",
        sep: "hoje",
        x: "resolvi o dobro só do básico, o resto fica aqui",
      },
      { k: "in", h: "10:13", x: "e cortei 14 itens q ela tinha mandado" },
      { k: "out", h: "10:14", x: "boa, sem duplicar o q não usa" },
      { k: "in", h: "10:15", x: "deu 300 reais de economia kkk" },
      { k: "out", h: "10:16", x: "aí sim. e a sogra?" },
      { k: "in", h: "10:17", x: "entendeu, até elogiou o checklist" },
    ],
  },
  {
    name: "Daniela Vieira Castro",
    ava: "imagens/chat/a2.webp",
    msgs: [
      {
        k: "in",
        h: "20:00",
        sep: "first",
        x: "comprei pra mim e meu marido acabou lendo mais q eu kkk",
      },
      {
        k: "in",
        h: "20:01",
        x: "tô de 30 semanas e a gente começou o plano de parto",
      },
      { k: "in", h: "20:02", x: "obrigada por responder no domingo, viu" },
      { k: "out", h: "20:03", x: "eu q agradeço, de vdd" },
      {
        k: "in",
        h: "20:04",
        x: "eu tava insegura com o parto e o guia ajudou nós dois",
      },
      {
        k: "in",
        h: "20:05",
        x: "a parte de direitos do acompanhante deixou ele seguro pra ir comigo",
      },
      {
        k: "in",
        h: "20:06",
        x: "ele me acompanha em todas as consultas desde então",
      },
      {
        k: "in",
        h: "20:07",
        x: "e a gente já preencheu o plano junto, a obstetra leu e achou certo",
      },
      { k: "out", h: "20:08", x: "que parceiro! manda um beijo pra ele" },
      {
        k: "in",
        h: "20:09",
        x: "agradecemos nós dois. virou leitura obrigatória aqui em casa",
      },
    ],
  },
  {
    name: "Rafaela Victoria",
    ava: "imagens/chat/a16.webp",
    msgs: [
      {
        k: "in",
        h: "19:40",
        sep: "first",
        x: "oi joyce, primeira gestação, 30 semanas",
      },
      {
        k: "in",
        h: "19:41",
        x: "meu convênio não cobre doula, dá pra levar alguém?",
      },
      {
        k: "out",
        h: "19:42",
        x: "acompanhante é direito. doula varia por contrato, confere no seu",
      },
      { k: "in", h: "19:43", x: "vou conferir e pedir por escrito" },
      {
        k: "in",
        h: "11:02",
        sep: "hoje",
        x: "conferi, a doula tá liberada mas precisa de autorização",
      },
      { k: "in", h: "11:03", x: "pedi e saiu na hora" },
      { k: "out", h: "11:04", x: "q bom! e o plano de parto?" },
      { k: "in", h: "11:05", x: "já preenchi, vou entregar na internação" },
      { k: "out", h: "11:06", x: "vai dar certo, viu" },
      { k: "in", h: "11:07", x: "obrigada por me deixar segura" },
    ],
  },
  {
    name: "Sabrina Leal Monteiro",
    ava: "imagens/chat/a4.webp",
    msgs: [
      {
        k: "in",
        h: "10:05",
        sep: "first",
        x: "joyce, a lista de enxoval inteligente me fez cortar 26 itens",
      },
      {
        k: "in",
        h: "10:06",
        x: "minha irmã me deu 3 carrinhos de recém nascido",
      },
      { k: "in", h: "10:07", x: "não usei nem metade até agora" },
      { k: "in", h: "10:08", x: "usei a lista inteira, só comprei o essencial" },
      {
        k: "in",
        h: "10:09",
        x: "tinha coisa pra 6 meses q o guia manda comprar só depois",
      },
      {
        k: "in",
        h: "10:10",
        x: "e eu achando q precisava de tudo antes do berço chegar",
      },
      {
        k: "in",
        h: "10:13",
        sep: "hoje",
        img: "imagens/chat/p4.webp",
        x: "deu 310 de diferença e sobrou pro berço",
      },
      { k: "out", h: "10:14", x: "aí sim, sem peso de dívida" },
      { k: "in", h: "10:15", x: "sem peso. obrigada de vdd" },
    ],
  },
  {
    name: "Fernanda Queiroz Dias",
    ava: "imagens/chat/a6.webp",
    msgs: [
      {
        k: "in",
        h: "16:40",
        sep: "first",
        x: "joyce, me ajuda a organizar as perguntas da consulta",
      },
      { k: "in", h: "16:41", x: "e sempre saio achando q incomodei" },
      {
        k: "in",
        h: "16:42",
        x: "minha médica é bem objetiva e eu travo na hora de perguntar",
      },
      {
        k: "in",
        h: "16:43",
        x: "saio da consulta com dúvida e vontade de chorar",
      },
      { k: "out", h: "16:44", x: "anota em tópicos, tipo o modelo do guia" },
      { k: "in", h: "16:48", sep: "hoje", x: "levei anotado na consulta de hj" },
      {
        k: "in",
        h: "16:49",
        x: "saí com tudo respondido, sem vergonha de perguntar",
      },
      { k: "out", h: "16:50", x: "e foi tranquilo?" },
      {
        k: "in",
        h: "16:51",
        x: "foi. organizei em tópicos, do jeito q o manual sugere",
      },
      {
        k: "in",
        h: "16:52",
        x: "o de nutrição mostrou q eu tava comendo errado tb",
      },
    ],
  },
  {
    name: "Kelly Andrade Souza",
    ava: "imagens/chat/a9.webp",
    msgs: [
      {
        k: "in",
        h: "18:30",
        sep: "first",
        x: "joyce, 3ª gestação e eu achando q já sabia tudo kkk",
      },
      {
        k: "in",
        h: "18:31",
        x: "na segunda gestação eu não sabia nem q podia levar acompanhante",
      },
      {
        k: "in",
        h: "18:32",
        x: "minhas 2 primeiras gestações foram no susto, sem plano",
      },
      { k: "in", h: "18:33", x: "agora quero chegar preparada" },
      { k: "in", h: "18:34", x: "to lendo o guia de direitos com calma" },
      {
        k: "in",
        h: "18:35",
        x: "mas descobri direito q nem sabia q existia, tipo acompanhante",
      },
      { k: "in", h: "18:38", sep: "hoje", x: "preenchi o plano de parto" },
      { k: "in", h: "18:39", x: "a maternidade leu sem discutir" },
      { k: "out", h: "18:40", x: "e o parto foi como vc quis?" },
      { k: "in", h: "18:41", x: "foi, com a sala do jeito q pedi" },
      { k: "out", h: "18:42", x: "que vitória, kelly" },
    ],
  },
];

function firstSlug(name) {
  return String(name || "contato")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function toConversa(dep, meta, index, tema) {
  const [d1, m1, d2, m2, horaStatus, bateria] = meta;
  const first = fmt(d1, m1);
  const hoje = fmt(d2, m2);
  const mensagens = [];

  for (const m of dep.msgs) {
    if (m.sep === "first") mensagens.push({ tipo: "data", texto: first });
    else if (m.sep === "hoje") mensagens.push({ tipo: "data", texto: hoje });
    else if (m.sep) mensagens.push({ tipo: "data", texto: m.sep });

    const item = {
      de: m.k === "out" ? "eu" : "ela",
      texto: m.x || "",
      hora: m.h,
    };
    if (m.k === "out") item.status = "lido";
    if (m.img) item.imagem = img(m.img);
    mensagens.push(item);
  }

  const slug = String(index + 1).padStart(2, "0");
  return {
    contato: dep.name,
    foto: img(dep.ava),
    tema,
    horaStatus,
    bateria,
    sinal: 3 + (index % 2),
    wifi: index % 5 !== 0,
    saida: resolve(OUT, tema, `${slug}-${firstSlug(dep.name)}.png`),
    mensagens,
  };
}

function exportJson() {
  const dir = resolve(__dirname, "conversas/gestante");
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < DEP.length; i++) {
    const data = toConversa(DEP[i], META[i], i, "escuro");
    delete data.saida;
    const id = `${String(i + 1).padStart(2, "0")}-${firstSlug(DEP[i].name)}`;
    writeFileSync(resolve(dir, `${id}.json`), JSON.stringify(data, null, 2) + "\n");
  }
  console.log(`OK → ${DEP.length} JSONs em conversas/gestante/`);
}

async function main() {
  if (process.argv.includes("--export-json")) {
    exportJson();
    return;
  }

  for (const tema of TEMAS) mkdirSync(resolve(OUT, tema), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const total = DEP.length * TEMAS.length;
  console.log(`Gerando ${DEP.length} conversas × ${TEMAS.length} temas → ${OUT}`);

  let n = 0;
  for (const tema of TEMAS) {
    for (let i = 0; i < DEP.length; i++) {
      const data = toConversa(DEP[i], META[i], i, tema);
      const path = await gerarPrint(data, { baseDir: SITE, browser });
      n++;
      console.log(`  ${n}/${total} [${tema}] ${data.contato} → ${path}`);
    }
  }

  await browser.close();
  console.log("Pronto.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
