#!/usr/bin/env node
import { readdirSync, readFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { gerarPrint } from "./generate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONV = resolve(__dirname, "conversas/gestante");
const OUT = resolve(__dirname, "out/gestante");
const TEMAS = ["claro", "escuro"];
const KEEP = new Set(["04-rafaela", "18-sabrina"]); // já editados pelo usuário no escuro

async function main() {
  const files = readdirSync(CONV).filter((f) => f.endsWith(".json")).sort();
  for (const tema of TEMAS) mkdirSync(resolve(OUT, tema), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  let n = 0;
  const total = files.length * TEMAS.length;
  for (const tema of TEMAS) {
    for (const file of files) {
      const id = file.replace(/\.json$/, "");
      n++;
      const dest = resolve(OUT, tema, `${id}.png`);
      if (tema === "escuro" && KEEP.has(id) && existsSync(dest)) {
        console.log(`  ${n}/${total} [${tema}] ${id} (mantém PNG editado)`);
        continue;
      }
      const data = JSON.parse(readFileSync(resolve(CONV, file), "utf8"));
      data.tema = tema;
      data.saida = dest;
      await gerarPrint(data, { baseDir: __dirname, browser });
      console.log(`  ${n}/${total} [${tema}] ${id}`);
    }
  }
  await browser.close();
  console.log("Pronto.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
