# Stock Trading Site with Prediction Meter

This repository now supports both:
1. **Local development** (front-end + API server), and
2. **Public hosting** as a single full-stack web app.

## Live data + token safety

The Finnhub token is used **only on the server** (`FINNHUB_API_KEY`) and is never bundled into browser code.

---

## Local setup

### 1) Configure environment

Copy `.env.example` to `.env` and set your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
FINNHUB_API_KEY=your_finnhub_api_key_here
PORT=8787
```

### 2) Install and run

```bash
npm i
npm run dev:server
```

In another terminal:

```bash
npm run dev
```

- Front-end (Vite): `http://localhost:3000`
- API server: `http://localhost:8787`

The Vite dev server proxies `/api` to the backend.

---

## Public deployment (website you can open from anywhere)

### Option A: Render (easy)

This repo includes `render.yaml` and can run as one Node web service.

1. Push this repo to GitHub.
2. In Render, create a **New Web Service** from the repo.
3. Render will read `render.yaml`.
4. Add environment variable:
   - `FINNHUB_API_KEY=<your key>`
5. Deploy.

Render gives you a public URL like:
`https://stockpredict-live.onrender.com`

### Option B: Docker (any cloud/VPS)

Build and run:

```bash
docker build -t stockpredict-live .
docker run -p 8787:8787 -e FINNHUB_API_KEY=your_key stockpredict-live
```

Then open `http://<your-server-ip>:8787`.

---

## Production run (without Docker)

```bash
npm i
npm run build
FINNHUB_API_KEY=your_key npm run start
```

This serves both the built front-end and API from one Node process.

---

## Notes

- Default portfolio tickers load at startup.
- You can add any valid ticker symbol from the UI.
- Recent company news is fetched live.
- Financial/analyst deep-detail tab data still uses the project’s local fallback dataset where live equivalents are not yet wired.


---

## GitHub + Render authorization (what you need to click)

I cannot grant cloud permissions from inside this coding environment. You must authorize Render with your GitHub account in your browser.

Use these links:

1. Authorize GitHub in Render:
   - https://dashboard.render.com/select-repo
2. Create a Blueprint deploy from your repo:
   - `https://dashboard.render.com/blueprint/new?repo=<YOUR_GITHUB_REPO_URL>`

After deployment finishes, Render gives you a live URL in the service page (for example `https://stockpredict-live.onrender.com`).

### Click-through checklist

1. Open Render dashboard and connect your GitHub account.
2. Select this repository.
3. Confirm the `render.yaml` blueprint values.
4. Add `FINNHUB_API_KEY` when prompted.
5. Click **Apply** / **Deploy**.
6. Open the generated Render URL and test:
   - `/` for the UI
   - `/api/health` for backend status
