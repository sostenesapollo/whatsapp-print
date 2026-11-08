# WhatsApp Print

Gera um PNG idêntico ao chat do WhatsApp iOS a partir de um JSON. Temas **claro** e **escuro**, com wallpaper oficial de doodles.

## Exemplos

| Claro | Escuro |
|---|---|
| ![exemplo claro](assets/exemplo-claro.png) | ![exemplo escuro](assets/exemplo-escuro.png) |

## Setup (uma vez)

```fish
cd ~/dev/whatsapp-print
bun install
bunx playwright install chromium
```

## Editor visual

Lista os prints existentes, preview ao vivo, clique no texto pra editar, clique na foto/imagem pra trocar, seletor de tema, gera PNG:

```fish
bun run export-json   # uma vez: cria conversas/gestante/*.json
bun run editor        # http://127.0.0.1:3847
```

## Uso (CLI)

1. Copia o exemplo e edita:

```fish
cp conversa.exemplo.json minha-conversa.json
```

2. Preenche contato, foto e mensagens. Gera:

```fish
bun run generate minha-conversa.json
```

O PNG sai em `out/` (ou no caminho de `saida` no JSON).

Para regenerar os previews do README:

```fish
bun run exemplos
```

## Formato do JSON

| Campo | Descrição |
|---|---|
| `contato` | Nome no header |
| `foto` | Caminho da foto: relativo, absoluto ou `~/…`. Vazio = avatar cinza |
| `tema` | `claro` (padrão) ou `escuro` |
| `horaStatus` | Status bar (ex. `17:01`). Omitir = hora atual do Mac |
| `bateria` | 0–100 (≤20 vermelha). Omitir = % real da bateria do Mac |
| `saida` | Caminho do PNG (opcional) |
| `mensagens` | Lista abaixo |

### Claro

```json
{
  "contato": "Camila Ferreira",
  "tema": "claro",
  "horaStatus": "09:14",
  "bateria": 72,
  "mensagens": [
    { "tipo": "data", "texto": "2 de nov. de 2026" },
    { "de": "ela", "texto": "bom dia joyce, terminei a lista do enxoval", "hora": "09:12" },
    { "de": "eu", "texto": "marcou tudo? rs", "hora": "09:15", "status": "lido" }
  ]
}
```

### Escuro

```json
{
  "contato": "Camila Ferreira",
  "tema": "escuro",
  "horaStatus": "09:14",
  "bateria": 72,
  "mensagens": [
    { "tipo": "data", "texto": "2 de nov. de 2026" },
    { "de": "ela", "texto": "bom dia joyce, terminei a lista do enxoval", "hora": "09:12" },
    { "de": "eu", "texto": "marcou tudo? rs", "hora": "09:15", "status": "lido" }
  ]
}
```

Lote gestante (claro + escuro):

```fish
bun run gestante
```

Saída em `out/gestante/claro/` e `out/gestante/escuro/`.

Wallpapers em `assets/wallpaper-claro.jpg` e `assets/wallpaper-escuro.jpg`.

Mensagens:

```json
{ "tipo": "data", "texto": "26 de mar. de 2021" }
{ "de": "eu", "texto": "Oi", "hora": "09:10", "status": "lido" }
{ "de": "ele", "texto": "E aí", "hora": "09:11" }
```

- `de`: `eu` (bolha verde, direita) ou `ele` / `ela` (bolha branca/cinza, esquerda)
- `status` (só em `eu`): `enviado` | `entregue` | `lido`
