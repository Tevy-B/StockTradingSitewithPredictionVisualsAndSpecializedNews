import { createServer } from 'node:http';
import { stat, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const finnhubToken = process.env.FINNHUB_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const frontendBuildDir = path.resolve(repoRoot, 'build');
const dataDir = path.resolve(__dirname, 'data');
const storePath = path.resolve(dataDir, 'store.json');

const finnhubCache = new Map();

const createCacheKey = (apiPath, params = {}) => {
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${apiPath}?${new URLSearchParams(sorted).toString()}`;
};

const defaultPortfolio = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];

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

const normalizeExchange = (exchange) => {
  const raw = String(exchange || '').trim();
  if (!raw) return 'Unknown exchange';
  const upper = raw.toUpperCase();
  if (upper.includes('NASDAQ')) return 'NASDAQ';
  if (upper.includes('NEW YORK') || upper === 'NYSE' || upper.includes('NYSE')) return 'NYSE';
  if (upper.includes('AMEX') || upper.includes('NYSE AMERICAN')) return 'NYSE American';
  if (upper.includes('ARCA')) return 'NYSE Arca';
  if (upper.includes('OTC')) return 'OTC';
  return raw;
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

let store = {
  users: [],
  sessions: [],
  portfolios: {},
  stockSnapshots: {},
};

const saveStore = async () => {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
};

const loadStore = async () => {
  try {
    const raw = await readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    store = {
      users: parsed.users || [],
      sessions: parsed.sessions || [],
      portfolios: parsed.portfolios || {},
      stockSnapshots: parsed.stockSnapshots || {},
    };
  } catch {
    await saveStore();
  }
};

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

const createSession = (userId) => {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
  store.sessions.push({ token, userId, expiresAt });
  return token;
};

const getUserFromAuthHeader = (req) => {
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  const session = store.sessions.find((item) => item.token === token && item.expiresAt > Date.now());
  if (!session) return null;
  return store.users.find((user) => user.id === session.userId) || null;
};

const nyDateParts = () => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return {
    weekday: parts.weekday,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  };
};

const getWeekendTargetDate = () => {
  const { weekday, date } = nyDateParts();
  const d = new Date(`${date}T00:00:00-05:00`);
  if (weekday === 'Sat') d.setDate(d.getDate() - 1);
  if (weekday === 'Sun') d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
};

const isWeekendNy = () => {
  const { weekday } = nyDateParts();
  return weekday === 'Sat' || weekday === 'Sun';
};

const finnhubFetch = async (apiPath, params = {}, options = {}) => {
  const { ttlMs = 15000, allowStaleOnError = true } = options;
  if (!finnhubToken) throw new Error('Server is missing FINNHUB_API_KEY.');

  const cacheKey = createCacheKey(apiPath, params);
  const now = Date.now();
  const cached = finnhubCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.data;

  const query = new URLSearchParams({ ...params, token: finnhubToken });
  try {
    const response = await fetch(`https://finnhub.io/api/v1/${apiPath}?${query.toString()}`);
    if (response.status === 429) {
      if (allowStaleOnError && cached?.data) return cached.data;
      throw new Error('Finnhub rate limit reached (429). Please retry in a minute.');
    }
    if (!response.ok) throw new Error(`Finnhub request failed: ${response.status}`);

    const data = await response.json();
    if (data?.error) throw new Error(data.error);
    finnhubCache.set(cacheKey, { data, expiresAt: now + ttlMs });
    return data;
  } catch (error) {
    if (allowStaleOnError && cached?.data) return cached.data;
    throw error;
  }
};

const buildStock = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const [quote, profile, metricResponse] = await Promise.all([
    finnhubFetch('quote', { symbol: upperSymbol }, { ttlMs: 15000 }),
    finnhubFetch('stock/profile2', { symbol: upperSymbol }, { ttlMs: 1000 * 60 * 60 * 12 }),
    finnhubFetch('stock/metric', { symbol: upperSymbol, metric: 'all' }, { ttlMs: 1000 * 60 * 60 * 6 }),
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
    exchange: normalizeExchange(profile?.exchange),
    price: currentPrice,
    change: rawChange,
    changePercent,
    prediction: calculatePrediction({ changePercent, pe }),
    volume: compactNumber(safeNumber(quote.v, 0)),
    marketCap: compactNumber(marketCap),
    pe,
  };
};

const findConceptValue = (items = [], concepts = []) => {
  const conceptSet = new Set(concepts.map((item) => item.toLowerCase()));
  const found = items.find((item) => conceptSet.has(String(item?.concept || '').toLowerCase()));
  return safeNumber(found?.value, 0);
};

const toBillions = (value) => Number((safeNumber(value, 0) / 1_000_000_000).toFixed(2));

const mapReportToEntry = (reportItem) => {
  const report = reportItem?.report || {};
  const bs = report.bs || [];
  const ic = report.ic || [];
  const cf = report.cf || [];
  const year = reportItem?.year || '';
  const quarter = reportItem?.quarter || '';

  return {
    period: quarter ? `Q${quarter} ${year}` : `${year}`,
    revenue: toBillions(findConceptValue(ic, ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'])),
    netIncome: toBillions(findConceptValue(ic, ['NetIncomeLoss'])),
    totalAssets: toBillions(findConceptValue(bs, ['Assets'])),
    totalLiabilities: toBillions(findConceptValue(bs, ['Liabilities'])),
    shareholdersEquity: toBillions(findConceptValue(bs, ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'])),
    operatingCashFlow: toBillions(findConceptValue(cf, ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'])),
  };
};

const consensusFromRecommendation = (rec) => {
  const strongBuy = safeNumber(rec?.strongBuy, 0);
  const buy = safeNumber(rec?.buy, 0);
  const hold = safeNumber(rec?.hold, 0);
  const sell = safeNumber(rec?.sell, 0);
  const strongSell = safeNumber(rec?.strongSell, 0);
  const bullishScore = strongBuy * 2 + buy;
  const bearishScore = strongSell * 2 + sell;

  let consensus = 'Hold';
  if (bullishScore >= bearishScore + 8) consensus = 'Strong Buy';
  else if (bullishScore > bearishScore + 2) consensus = 'Buy';
  else if (bearishScore >= bullishScore + 8) consensus = 'Strong Sell';
  else if (bearishScore > bullishScore + 2) consensus = 'Sell';

  return { consensus, buyCount: strongBuy + buy, holdCount: hold, sellCount: strongSell + sell };
};

const buildStockDetail = async (symbol, stockSnapshot) => {
  const [metricResponse, financials, recommendations, priceTarget] = await Promise.all([
    finnhubFetch('stock/metric', { symbol, metric: 'all' }, { ttlMs: 1000 * 60 * 60 * 6 }),
    finnhubFetch('stock/financials-reported', { symbol }, { ttlMs: 1000 * 60 * 60 * 12 }),
    finnhubFetch('stock/recommendation', { symbol }, { ttlMs: 1000 * 60 * 60 * 6 }),
    finnhubFetch('stock/price-target', { symbol }, { ttlMs: 1000 * 60 * 60 * 6 }),
  ]);

  const reports = Array.isArray(financials?.data) ? financials.data : [];
  const sorted = reports.sort((a, b) => new Date(b?.endDate || 0).getTime() - new Date(a?.endDate || 0).getTime());
  const annual = sorted.filter((item) => ['10-K', '20-F', '40-F'].includes(item?.form)).slice(0, 4).map(mapReportToEntry);
  const quarterly = sorted.filter((item) => !['10-K', '20-F', '40-F'].includes(item?.form)).slice(0, 4).map(mapReportToEntry);

  const latestRec = Array.isArray(recommendations) && recommendations.length > 0 ? recommendations[0] : {};
  const derivedConsensus = consensusFromRecommendation(latestRec);
  const averagePriceTarget = safeNumber(priceTarget?.targetMean || priceTarget?.targetMedian, stockSnapshot?.price || 0);

  return {
    beta: safeNumber(metricResponse?.metric?.beta, 1),
    eps: safeNumber(metricResponse?.metric?.epsTTM || metricResponse?.metric?.epsNormalizedAnnual, 0),
    dividend: safeNumber(metricResponse?.metric?.dividendPerShareAnnual, 0),
    high52w: safeNumber(metricResponse?.metric?.['52WeekHigh'], stockSnapshot?.price || 0),
    low52w: safeNumber(metricResponse?.metric?.['52WeekLow'], stockSnapshot?.price || 0),
    balanceSheet: { annual, quarterly },
    analystConsensus: {
      consensus: derivedConsensus.consensus,
      averagePriceTarget,
      highTarget: safeNumber(priceTarget?.targetHigh, averagePriceTarget),
      lowTarget: safeNumber(priceTarget?.targetLow, averagePriceTarget),
      buyCount: derivedConsensus.buyCount,
      holdCount: derivedConsensus.holdCount,
      sellCount: derivedConsensus.sellCount,
      ratings: [],
    },
  };
};

const getUserPortfolio = (userId) => {
  if (!Array.isArray(store.portfolios[userId])) {
    store.portfolios[userId] = [...defaultPortfolio];
  }
  return store.portfolios[userId];
};

const getStocksForUser = async (symbols) => {
  const weekend = isWeekendNy();
  const targetDate = getWeekendTargetDate();
  const stocks = [];
  let usedCacheOnly = weekend;

  for (const symbol of symbols) {
    const cached = store.stockSnapshots[symbol];
    if (weekend && cached && cached.marketDate === targetDate) {
      stocks.push(cached.stock);
      continue;
    }

    try {
      const live = await buildStock(symbol);
      stocks.push(live);
      store.stockSnapshots[symbol] = {
        stock: live,
        marketDate: targetDate,
        savedAt: new Date().toISOString(),
      };
      usedCacheOnly = false;
    } catch (error) {
      if (cached?.stock) {
        stocks.push(cached.stock);
      } else {
        throw error;
      }
    }
  }

  await saveStore();
  return {
    stocks,
    lastRefreshDate: targetDate,
    usedCacheOnly,
  };
};

const contentTypeByExtension = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const serveStatic = async (res, requestUrl) => {
  const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const normalizedPath = path.normalize(requestedPath).replace(/^(?:\.\.[/\\])+/, '');
  let filePath = path.join(frontendBuildDir, normalizedPath);
  try { await stat(filePath); } catch { filePath = path.join(frontendBuildDir, 'index.html'); }
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypeByExtension[ext] || 'application/octet-stream' });
    res.end(data);
    return true;
  } catch { return false; }
};

await loadStore();

createServer(async (req, res) => {
  if (!req.url) return json(res, 404, { error: 'Not found' });
  if (req.method === 'OPTIONS') return json(res, 200, {});
  const requestUrl = new URL(req.url, `http://localhost:${port}`);

  try {
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      return json(res, 200, { ok: true, usingLiveData: Boolean(finnhubToken), isWeekendNy: isWeekendNy() });
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/auth/register') {
      const body = await readBody(req);
      const email = String(body?.email || '').trim().toLowerCase();
      const password = String(body?.password || '');
      if (!email || password.length < 6) return json(res, 400, { error: 'Email and password (min 6 chars) are required.' });
      if (store.users.some((u) => u.email === email)) return json(res, 409, { error: 'Email already registered.' });

      const salt = crypto.randomBytes(16).toString('hex');
      const user = { id: crypto.randomUUID(), email, salt, passwordHash: hashPassword(password, salt), createdAt: new Date().toISOString() };
      store.users.push(user);
      store.portfolios[user.id] = [...defaultPortfolio];
      const token = createSession(user.id);
      await saveStore();
      return json(res, 201, { token, user: { id: user.id, email: user.email } });
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/auth/login') {
      const body = await readBody(req);
      const email = String(body?.email || '').trim().toLowerCase();
      const password = String(body?.password || '');
      const user = store.users.find((u) => u.email === email);
      if (!user) return json(res, 401, { error: 'Invalid credentials.' });
      if (hashPassword(password, user.salt) !== user.passwordHash) return json(res, 401, { error: 'Invalid credentials.' });
      const token = createSession(user.id);
      await saveStore();
      return json(res, 200, { token, user: { id: user.id, email: user.email } });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/auth/me') {
      const user = getUserFromAuthHeader(req);
      if (!user) return json(res, 401, { error: 'Unauthorized' });
      return json(res, 200, { user: { id: user.id, email: user.email } });
    }

    const user = getUserFromAuthHeader(req);

    if (requestUrl.pathname.startsWith('/api/') && !requestUrl.pathname.startsWith('/api/auth/') && !user) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/portfolio') {
      return json(res, 200, { symbols: getUserPortfolio(user.id) });
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/portfolio') {
      const body = await readBody(req);
      const symbol = String(body?.symbol || '').trim().toUpperCase();
      if (!/^[A-Z.]{1,10}$/.test(symbol)) return json(res, 400, { error: 'Ticker must contain only letters/dot and be 1-10 characters.' });

      const portfolio = getUserPortfolio(user.id);
      if (!portfolio.includes(symbol)) portfolio.push(symbol);
      await saveStore();
      return json(res, 201, { symbols: portfolio });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/stocks') {
      const symbols = String(requestUrl.searchParams.get('symbols') || '')
        .split(',').map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
      const result = await getStocksForUser(symbols);
      return json(res, 200, result);
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/stocks/search') {
      const q = String(requestUrl.searchParams.get('q') || '').trim();
      if (!q) return json(res, 200, { results: [] });
      const data = await finnhubFetch('search', { q }, { ttlMs: 1000 * 60 * 10 });
      const results = (data?.result || []).filter((item) => item.symbol).slice(0, 12).map((item) => ({
        symbol: item.symbol,
        name: item.description || item.displaySymbol || item.symbol,
        exchange: normalizeExchange(item.primaryExchange || item.exchange || ''),
        type: item.type || '',
      }));
      return json(res, 200, { results });
    }

    const detailMatch = requestUrl.pathname.match(/^\/api\/stocks\/([^/]+)\/detail$/);
    if (req.method === 'GET' && detailMatch) {
      const symbol = decodeURIComponent(detailMatch[1]).toUpperCase();
      const stockSnapshot = await buildStock(symbol);
      const detail = await buildStockDetail(symbol, stockSnapshot);
      return json(res, 200, { detail });
    }

    const newsMatch = requestUrl.pathname.match(/^\/api\/stocks\/([^/]+)\/news$/);
    if (req.method === 'GET' && newsMatch) {
      const symbol = decodeURIComponent(newsMatch[1]).toUpperCase();
      const fromDate = new Date(Date.now() - 604800000).toISOString().slice(0, 10);
      const toDate = new Date().toISOString().slice(0, 10);
      const data = await finnhubFetch('company-news', { symbol, from: fromDate, to: toDate }, { ttlMs: 1000 * 60 * 30 });
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

    const served = await serveStatic(res, requestUrl);
    if (served) return;
    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Server error' });
  }
}).listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
