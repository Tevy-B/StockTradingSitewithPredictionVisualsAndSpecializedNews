# Stock Trading Site with Prediction Meter

This project now includes:
- A React + Vite front-end.
- A Node/Express back-end API that serves live stock quotes/news and manages a portfolio ticker list.

## Live data + token safety

Live data is fetched server-side from Finnhub, and the API token stays on the back end.

1. Copy `.env.example` to `.env`.
2. Set `FINNHUB_API_KEY` in `.env`.
3. Run dependencies and start the app.

```bash
npm i
npm run dev
```

This starts:
- Front end: `http://localhost:3000`
- Back end: `http://localhost:8787`

The front end talks to the back end via `/api` proxy, so your token is not exposed in browser code.

## Portfolio behavior

- Default portfolio tickers are loaded at startup.
- You can add any valid stock ticker from the UI.
- The app refreshes live quote data periodically.

## Prototype (view-only)

[https://www.figma.com/design/d8bfzb4WuPsTIx5Q7eNhsj/Stock-Trading-Site-with-Prediction-Meter.](https://www.figma.com/make/d8bfzb4WuPsTIx5Q7eNhsj/Stock-Trading-Site-with-Prediction-Meter?fullscreen=1&t=7KJ1NVsYoJ3BugA9-1)

## Please note

This repository is proprietary. All content (code, design files, images, animations, and documentation) is Copyright © 2026 Tevy-B.
All rights reserved — no reuse, distribution, or derivative works are permitted without express written permission.
