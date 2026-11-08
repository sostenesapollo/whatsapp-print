#!/usr/bin/env node
/** Gera assets/exemplo-claro.png e assets/exemplo-escuro.png para o README. */
import { chromium } from "playwright";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { gerarPrint } from "./generate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const base = {
  contato: "Camila Ferreira",
  foto: "",
  horaStatus: "09:14",
  bateria: 72,
  sinal: 4,
  wifi: true,
  mensagens: [
    { tipo: "data", texto: "2 de nov. de 2026" },
    { de: "ela", texto: "bom dia joyce, terminei a lista do enxoval", hora: "09:12" },
    { de: "ela", texto: "cortei 18 itens q iam ficar encostados", hora: "09:13" },
    { de: "eu", texto: "marcou tudo? rs", hora: "09:15", status: "lido" },
    {
      de: "ela",
      texto: "só o da primeira semana. deu 240 a menos do q eu tinha planejado",
      hora: "09:16",
    },
    { de: "ela", texto: "obrigada de vdd 🙏", hora: "09:17" },
  ],
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const tema of ["claro", "escuro"]) {
    const out = resolve(__dirname, `assets/exemplo-${tema}.png`);
    const path = await gerarPrint(
      { ...base, tema, saida: out },
      { baseDir: __dirname, browser },
    );
    console.log(`OK → ${path}`);
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
