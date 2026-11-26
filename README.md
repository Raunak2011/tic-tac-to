# toolbox

A neon, mobile-first homepage that keeps every small tool one tap away.

## Tools

| # | Tool | Route | Status |
|---|------|-------|--------|
| 01 | Age Calculator | `#/age-calculator` | Live |
| 02 | Calculator | `#/calculator` | Live |
| 03 | Tic Tac Toe | `#/tic-tac-toe` | Live |
| 04 | Camera | `#/camera` | Live |

## How it works

- `src/tools.jsx` is the single source of truth for the homepage grid. Add an entry there and a new shortcut appears.
- `src/App.jsx` is a tiny hash router (`#/`, `#/tic-tac-toe`, …), so it works on any static host with no extra dependencies.
- `src/pages/` holds one page per tool. Any unfinished tool can fall back to the shared `ToolPlaceholder`.

## Features

- Homepage with shortcut cards, live/soon status, and accent colours per tool
- Age Calculator: age in years/months/days, total days/weeks/months, weekday born, and a next-birthday countdown
- Calculator: full keypad plus keyboard support, percent/sign/backspace, and a last-answers history you can tap to reuse
- Camera: live preview, front/back switching, one-tap capture, in-session photo strip with preview, save and delete
- Photos from the camera never leave the device — no uploads, no storage
- Tic Tac Toe against a **Weak CPU**, an unbeatable **Sharp CPU**, or a friend on the same phone
- Keyboard support in the game: `1`–`9` to place a mark, `R` for a new round
- Responsive layout for desktop, tablet, and phone

## Run locally

Use Vite — it compiles the JSX and hot-reloads as you edit:

```bash
bun install
bun run dev      # http://localhost:5173
```

## Previewing with VS Code "Live Server"

Live Server is a plain static server, so it cannot run `src/main.jsx` on its own — opening the project root that way gives a blank page. The workspace setting in `.vscode/settings.json` points Live Server at the built output instead:

```bash
bun run build     # writes dist/ once
bun run watch     # or keep dist/ rebuilding on every save
```

Reload the VS Code window (or stop and restart "Go Live") once after opening the workspace, then `http://127.0.0.1:5500` serves `dist/`. You can also open `http://127.0.0.1:5500/dist/` directly.

## Build

```bash
bun run build
```

## Tech

React, Vite, and lucide-react.
