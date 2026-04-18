# Crypto Universe

Scroll through the size of things in crypto — from a single satoshi's shadow to the entire global economy.

## Stack

- Vite + React 19 + TypeScript
- Static JSON data refreshed daily by a GitHub Action
- Sources: CoinGecko (coin prices / market caps), Forbes Real-Time Billionaires (with a curated fallback), curated references (GDPs, gold, etc.)

## Development

```sh
npm install
npm run dev           # start the app
npm run data:all      # refresh local data/*.json
npm run build         # typecheck + production build
```

The daily data refresh runs in CI — see [`.github/workflows/refresh-data.yml`](.github/workflows/refresh-data.yml).
Everything the browser needs is pre-computed into [`public/data/universe.json`](public/data/universe.json).

## Deploy

A push to `main` deploys the static build to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
**One-time setup:** in the repo, go to _Settings → Pages → Build and deployment → Source_ and choose **GitHub Actions**.

The data-refresh job commits into `main`, which triggers the deploy job automatically — so new market data appears on the live site within a few minutes of each nightly refresh.

## Layout

- `src/` — the React app
- `scripts/` — data fetchers and the merger run by the Action
- `public/data/` — committed, pre-computed JSON the frontend loads
