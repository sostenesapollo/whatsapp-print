#!/usr/bin/env node
import { createServer } from "http";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  statSync,
} from "fs";
import { resolve, dirname, extname, join, basename } from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import {
  buildHtml,
  loadPhotoDataUri,
  gerarPrint,
} from "../generate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONV = resolve(ROOT, "conversas/gestante");
const UPLOADS = resolve(ROOT, "uploads");
const OUT = resolve(ROOT, "out/gestante");
const PUBLIC = resolve(__dirname, "public");
const PORT = Number(process.env.PORT || 3847);

mkdirSync(CONV, { recursive: true });
mkdirSync(UPLOADS, { recursive: true });

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendFile(res, path) {
  if (!existsSync(path)) {
    res.writeHead(404);
    return res.end("not found");
  }
  const ext = extname(path).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".json": "application/json",
  };
  const buf = readFileSync(path);
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  res.end(buf);
}

function listConversas() {
  return readdirSync(CONV)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const id = f.replace(/\.json$/, "");
      const data = JSON.parse(readFileSync(resolve(CONV, f), "utf8"));
      const tema = data.tema || "escuro";
      const thumb = resolve(OUT, tema, `${id}.png`);
      const thumbAlt = resolve(OUT, "escuro", `${id}.png`);
      const thumbClaro = resolve(OUT, "claro", `${id}.png`);
      let thumbUrl = null;
      if (existsSync(thumb)) thumbUrl = `/thumb/${tema}/${id}.png`;
      else if (existsSync(thumbAlt)) thumbUrl = `/thumb/escuro/${id}.png`;
      else if (existsSync(thumbClaro)) thumbUrl = `/thumb/claro/${id}.png`;
      return {
        id,
        contato: data.contato,
        tema,
        thumb: thumbUrl,
        msgs: (data.mensagens || []).filter((m) => m.tipo !== "data").length,
      };
    });
}

function loadConversa(id) {
  const file = resolve(CONV, `${id}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function saveConversa(id, data) {
  const file = resolve(CONV, `${id}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = parts[i + 1];
    const idx = Number(key);
    if (!Number.isNaN(idx) && Array.isArray(cur)) cur = cur[idx];
    else {
      if (cur[key] == null) cur[key] = Number.isNaN(Number(next)) ? {} : [];
      cur = cur[key];
    }
  }
  const last = parts[parts.length - 1];
  const lastIdx = Number(last);
  if (!Number.isNaN(lastIdx) && Array.isArray(cur)) cur[lastIdx] = value;
  else cur[last] = value;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const { pathname } = url;

    if (req.method === "GET" && pathname === "/") {
      return sendFile(res, resolve(PUBLIC, "index.html"));
    }
    if (req.method === "GET" && pathname.startsWith("/assets/")) {
      return sendFile(res, resolve(PUBLIC, pathname.slice(1)));
    }
    if (req.method === "GET" && pathname.startsWith("/thumb/")) {
      // /thumb/escuro/01-camila.png
      const parts = pathname.split("/");
      const tema = parts[2];
      const file = parts[3];
      return sendFile(res, resolve(OUT, tema, file));
    }
    if (req.method === "GET" && pathname.startsWith("/uploads/")) {
      return sendFile(res, resolve(UPLOADS, basename(pathname)));
    }

    if (req.method === "GET" && pathname === "/api/list") {
      return json(res, 200, { items: listConversas() });
    }

    if (req.method === "GET" && pathname.startsWith("/api/conversa/")) {
      const id = decodeURIComponent(pathname.slice("/api/conversa/".length));
      const data = loadConversa(id);
      if (!data) return json(res, 404, { error: "não encontrada" });
      return json(res, 200, { id, data });
    }

    if (req.method === "PUT" && pathname.startsWith("/api/conversa/")) {
      const id = decodeURIComponent(pathname.slice("/api/conversa/".length));
      const raw = await readBody(req);
      const data = JSON.parse(raw.toString("utf8"));
      saveConversa(id, data);
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/preview") {
      const raw = await readBody(req);
      const data = JSON.parse(raw.toString("utf8"));
      data.editavel = true;
      const photoSrc = loadPhotoDataUri(data.foto, ROOT);
      const html = buildHtml(data, photoSrc, ROOT);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    if (req.method === "POST" && pathname === "/api/upload") {
      const raw = await readBody(req);
      const ctype = req.headers["content-type"] || "";
      // expect: application/json { path, name, dataUrl }
      const body = JSON.parse(raw.toString("utf8"));
      const m = String(body.dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!m) return json(res, 400, { error: "dataUrl inválido" });
      const ext =
        m[1] === "image/png"
          ? "png"
          : m[1] === "image/webp"
            ? "webp"
            : m[1] === "image/gif"
              ? "gif"
              : "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const dest = resolve(UPLOADS, name);
      writeFileSync(dest, Buffer.from(m[2], "base64"));
      return json(res, 200, { path: dest, url: `/uploads/${name}` });
    }

    if (req.method === "POST" && pathname === "/api/gerar") {
      const raw = await readBody(req);
      const { id, data } = JSON.parse(raw.toString("utf8"));
      if (!id || !data) return json(res, 400, { error: "id/data obrigatórios" });
      saveConversa(id, data);
      const tema = data.tema === "claro" ? "claro" : "escuro";
      mkdirSync(resolve(OUT, tema), { recursive: true });
      const saida = resolve(OUT, tema, `${id}.png`);
      const outPath = await gerarPrint(
        { ...data, saida, editavel: false },
        { baseDir: ROOT },
      );
      // also generate the other theme? only current
      return json(res, 200, {
        ok: true,
        path: outPath,
        thumb: `/thumb/${tema}/${id}.png?t=${Date.now()}`,
      });
    }

    if (req.method === "POST" && pathname === "/api/gerar-ambos") {
      const raw = await readBody(req);
      const { id, data } = JSON.parse(raw.toString("utf8"));
      saveConversa(id, data);
      const browser = await chromium.launch({ headless: true });
      const thumbs = {};
      try {
        for (const tema of ["claro", "escuro"]) {
          mkdirSync(resolve(OUT, tema), { recursive: true });
          const saida = resolve(OUT, tema, `${id}.png`);
          await gerarPrint(
            { ...data, tema, saida, editavel: false },
            { baseDir: ROOT, browser },
          );
          thumbs[tema] = `/thumb/${tema}/${id}.png?t=${Date.now()}`;
        }
      } finally {
        await browser.close();
      }
      return json(res, 200, { ok: true, thumbs });
    }

    res.writeHead(404);
    res.end("not found");
  } catch (err) {
    console.error(err);
    json(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`WhatsApp Print Editor → http://127.0.0.1:${PORT}`);
});
