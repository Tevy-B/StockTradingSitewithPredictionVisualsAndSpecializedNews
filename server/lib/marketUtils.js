export const normalizeExchange = (exchange) => {
  const raw = String(exchange || '').trim();
  if (!raw) return 'Unknown exchange';
  const upper = raw.toUpperCase();
  if (upper.includes('NASDAQ')) return 'NASDAQ';
  if (upper.includes('AMEX') || upper.includes('NYSE AMERICAN')) return 'NYSE American';
  if (upper.includes('NEW YORK') || upper === 'NYSE' || upper.includes('NYSE')) return 'NYSE';
  if (upper.includes('ARCA')) return 'NYSE Arca';
  if (upper.includes('OTC')) return 'OTC';
  return raw;
};

export const nyDateParts = (currentDate = new Date()) => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  });
  const parts = Object.fromEntries(dtf.formatToParts(currentDate).map((p) => [p.type, p.value]));
  return {
    weekday: parts.weekday,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  };
};

export const getWeekendTargetDate = (currentDate = new Date()) => {
  const { weekday, date } = nyDateParts(currentDate);
  const d = new Date(`${date}T00:00:00-05:00`);
  if (weekday === 'Sat') d.setDate(d.getDate() - 1);
  if (weekday === 'Sun') d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
};

export const isWeekendNy = (currentDate = new Date()) => {
  const { weekday } = nyDateParts(currentDate);
  return weekday === 'Sat' || weekday === 'Sun';
};

export const consensusFromRecommendation = (rec = {}, safeNumber = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
}) => {
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
