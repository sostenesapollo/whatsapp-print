# WhatsApp Print

Gera PNG idêntico ao WhatsApp iOS (claro / escuro). Tem editor **100% no browser**.

## Editor online (R2)

https://pub-1201b8b15bf3455ab30396aa22245d5f.r2.dev/

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

## Deploy do editor no R2

Bucket `whatsapp-print`, público em `pub-1201b8b15bf3455ab30396aa22245d5f.r2.dev`.

```fish
# usa as STORAGE_* da conta (mesmo account_id)
source ~/.config/books/r2-migrate.env  # ou as STORAGE_* do giftsqr
# preferir as chaves STORAGE_ do giftsqr .env (account 21a349…)
cd web
aws s3 sync . s3://whatsapp-print/ --endpoint-url https://21a34919918fda46cfa60e377b5a9911.r2.cloudflarestorage.com
```
