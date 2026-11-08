# WhatsApp Print

Gera um PNG idêntico ao chat do WhatsApp iOS a partir de um JSON.

## Setup (uma vez)

```fish
cd ~/dev/whatsapp-print
bun install
bunx playwright install chromium
```

## Uso

1. Copia o exemplo e edita:

```fish
cp conversa.exemplo.json minha-conversa.json
```

2. Preenche contato, foto e mensagens. Gera:

```fish
bun run generate minha-conversa.json
```

O PNG sai em `out/` (ou no caminho de `saida` no JSON).

## Formato do JSON

| Campo | Descrição |
|---|---|
| `contato` | Nome no header |
| `foto` | Caminho da foto: relativo, absoluto ou `~/…`. Vazio = avatar cinza |
| `horaStatus` | Status bar (ex. `17:01`). Omitir = hora atual do Mac |
| `bateria` | 0–100 (≤20 vermelha). Omitir = % real da bateria do Mac |
| `saida` | Caminho do PNG (opcional) |
| `mensagens` | Lista abaixo |

Mensagens:

```json
{ "tipo": "data", "texto": "26 de mar. de 2021" }
{ "de": "eu", "texto": "Oi", "hora": "09:10", "status": "lido" }
{ "de": "ele", "texto": "E aí", "hora": "09:11" }
```

- `de`: `eu` (bolha verde, direita) ou `ele` / `ela` (bolha branca, esquerda)
- `status` (só em `eu`): `enviado` | `entregue` | `lido`
