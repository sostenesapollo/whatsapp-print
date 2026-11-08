# WhatsApp Print

Gera PNG idêntico ao WhatsApp iOS (claro / escuro). Tem editor **100% no browser**.

## Editor online

https://whatsapp-print.sostenesapollo25.workers.dev/

(Arquivos no R2 `whatsapp-print`; Worker na frente porque o `*.r2.dev` não serve `/` → `index.html`.)

Dois exemplos no site: **escuro** e **claro**. Clique no texto/foto pra editar, escolha o tema, gere o PNG (baixa e abre numa aba).

| Escuro | Claro |
|---|---|
| ![exemplo escuro](assets/exemplo-escuro.png) | ![exemplo claro](assets/exemplo-claro.png) |

## Setup local

```fish
cd ~/dev/whatsapp-print
bun install
bunx playwright install chromium
```

## CLI

```fish
bun run generate conversa.json
bun run gestante          # lote gestante claro+escuro
bun run from-json         # regenera a partir de conversas/gestante/*.json
bun run exemplos          # assets do README
```

Editor local (Node, lista as conversas do disco):

```fish
bun run editor   # http://127.0.0.1:3847
```

Cópia estática (mesma do R2), servir local:

```fish
cd web
python3 -m http.server 5173
# http://127.0.0.1:5173
```

## JSON

| Campo | Descrição |
|---|---|
| `contato` | Nome no header |
| `foto` | Caminho / URL / data URL |
| `tema` | `claro` ou `escuro` |
| `horaStatus` | Status bar |
| `bateria` | 0–100 |
| `mensagens` | lista abaixo |

```json
{ "tipo": "data", "texto": "2 de nov. de 2026" }
{ "de": "eu", "texto": "Oi", "hora": "09:10", "status": "lido" }
{ "de": "ela", "texto": "E aí", "hora": "09:11", "imagem": "./foto.png" }
```

## Deploy do editor (R2 + Worker)

```fish
# 1) sobe os arquivos estáticos
# (STORAGE_* do giftsqr .env — account 21a349…)
cd web
aws s3 sync . s3://whatsapp-print/ --endpoint-url https://21a34919918fda46cfa60e377b5a9911.r2.cloudflarestorage.com

# 2) Worker com index fallback
cd ../worker
set -x CLOUDFLARE_API_TOKEN (cat ~/.config/cloudflare/workers_api_token)
npx wrangler@4 deploy
```

URL pública: https://whatsapp-print.sostenesapollo25.workers.dev/
