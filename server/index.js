import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const finnhubToken = process.env.FINNHUB_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const frontendBuildDir = path.resolve(repoRoot, 'build');

const defaultPortfolio = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];
const portfolioSymbols = new Set(defaultPortfolio);

const safeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const compactNumber = (value) => {
  if (!Number.isFinite(value)) return 'N/A';
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
};

const calculatePrediction = ({ changePercent, pe }) => {
  const momentum = Math.max(-10, Math.min(10, changePercent)) * 2.5;
  const valuation = pe > 0 ? Math.max(-15, Math.min(15, (30 - pe) * 0.6)) : 0;
  return Math.max(0, Math.min(100, Math.round(55 + momentum + valuation)));
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) reject(new Error('Body too large'));
  });
  req.on('end', () => {
    try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
  });
  req.on('error', reject);
});

const finnhubFetch = async (apiPath, params = {}) => {
  if (!finnhubToken) throw new Error('Server is missing FINNHUB_API_KEY.');
  const query = new URLSearchParams({ ...params, token: finnhubToken });
  const response = await fetch(`https://finnhub.io/api/v1/${apiPath}?${query.toString()}`);
  if (!response.ok) throw new Error(`Finnhub request failed: ${response.status}`);
  const data = await response.json();
  if (data?.error) throw new Error(data.error);
  return data;
};

const buildStock = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const [quote, profile, metricResponse] = await Promise.all([
    finnhubFetch('quote', { symbol: upperSymbol }),
    finnhubFetch('stock/profile2', { symbol: upperSymbol }),
    finnhubFetch('stock/metric', { symbol: upperSymbol, metric: 'all' }),
  ]);

  const currentPrice = safeNumber(quote.c);
  if (!currentPrice) throw new Error(`No quote returned for ${upperSymbol}`);

  const previousClose = safeNumber(quote.pc, currentPrice);
  const rawChange = safeNumber(quote.d, currentPrice - previousClose);
  const changePercent = safeNumber(quote.dp, previousClose ? (rawChange / previousClose) * 100 : 0);
  const pe = safeNumber(metricResponse?.metric?.peNormalizedAnnual || metricResponse?.metric?.peTTM, 0);
  const marketCap = safeNumber(profile?.marketCapitalization, 0) * 1_000_000;

  return {
    symbol: upperSymbol,
    name: profile?.name || upperSymbol,
    price: currentPrice,
    change: rawChange,
    changePercent,
    prediction: calculatePrediction({ changePercent, pe }),
    volume: compactNumber(safeNumber(quote.v, 0)),
    marketCap: compactNumber(marketCap),
    pe,
  };
};

const contentTypeByExtension = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const serveStatic = async (req, res, requestUrl) => {
  const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const normalizedPath = path.normalize(requestedPath).replace(/^(?:\.\.[/\\])+/, '');
  let filePath = path.join(frontendBuildDir, normalizedPath);

  try {
    await stat(filePath);
  } catch {
    filePath = path.join(frontendBuildDir, 'index.html');
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypeByExtension[ext] || 'application/octet-stream' });
    res.end(data);
    return true;
  } catch {
    return false;
  }
};

createServer(async (req, res) => {
  if (!req.url) return json(res, 404, { error: 'Not found' });
  if (req.method === 'OPTIONS') return json(res, 200, {});

  const requestUrl = new URL(req.url, `http://localhost:${port}`);

  try {
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      return json(res, 200, {
        ok: true,
        usingLiveData: Boolean(finnhubToken),
        staticBundlePresent: await stat(frontendBuildDir).then(() => true).catch(() => false),
      });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/portfolio') {
      return json(res, 200, { symbols: Array.from(portfolioSymbols) });
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/portfolio') {
      const body = await readBody(req);
      const symbol = String(body?.symbol || '').trim().toUpperCase();
      if (!/^[A-Z.]{1,10}$/.test(symbol)) {
        return json(res, 400, { error: 'Ticker must contain only letters/dot and be 1-10 characters.' });
      }
      await finnhubFetch('quote', { symbol });
      portfolioSymbols.add(symbol);
      return json(res, 201, { symbols: Array.from(portfolioSymbols) });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/stocks') {
      const symbols = String(requestUrl.searchParams.get('symbols') || '')
        .split(',').map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
      const stocks = await Promise.all(symbols.map(buildStock));
      return json(res, 200, { stocks });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/stocks/search') {
      const q = String(requestUrl.searchParams.get('q') || '').trim();
      if (!q) return json(res, 200, { results: [] });
      const data = await finnhubFetch('search', { q });
      const results = (data?.result || [])
        .filter((item) => item.type === 'Common Stock' && item.symbol)
        .slice(0, 8)
        .map((item) => ({ symbol: item.symbol, name: item.description || item.displaySymbol || item.symbol }));
      return json(res, 200, { results });
    }

    const newsMatch = requestUrl.pathname.match(/^\/api\/stocks\/([^/]+)\/news$/);
    if (req.method === 'GET' && newsMatch) {
      const symbol = decodeURIComponent(newsMatch[1]).toUpperCase();
      const fromDate = new Date(Date.now() - 604800000).toISOString().slice(0, 10);
      const toDate = new Date().toISOString().slice(0, 10);
      const data = await finnhubFetch('company-news', { symbol, from: fromDate, to: toDate });
      const news = (data || []).slice(0, 10).map((item) => ({
        id: item.id,
        headline: item.headline,
        source: item.source,
        summary: item.summary,
        datetime: item.datetime,
        url: item.url,
      }));
      return json(res, 200, { news });
    }

    const served = await serveStatic(req, res, requestUrl);
    if (served) return;

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Server error' });
  }
}).listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
