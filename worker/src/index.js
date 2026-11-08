const TYPES = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
};

function typeFor(key) {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  return TYPES[ext] || "application/octet-stream";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!key || key.endsWith("/")) key += "index.html";

    let obj = await env.BUCKET.get(key);
    if (!obj && !key.includes(".")) {
      obj = await env.BUCKET.get(`${key}/index.html`);
      if (obj) key = `${key}/index.html`;
    }
    if (!obj) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", typeFor(key));
    headers.set("Cache-Control", key.endsWith(".html") || key.endsWith(".mjs")
      ? "public, max-age=60"
      : "public, max-age=86400");
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(obj.body, { headers });
  },
};
