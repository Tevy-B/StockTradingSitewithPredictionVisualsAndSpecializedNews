import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExchange, getWeekendTargetDate, isWeekendNy, consensusFromRecommendation } from '../../server/lib/marketUtils.js';

test('normalizeExchange maps common exchange names', () => {
  assert.equal(normalizeExchange('NASDAQ NMS - GLOBAL MARKET'), 'NASDAQ');
  assert.equal(normalizeExchange('New York Stock Exchange'), 'NYSE');
  assert.equal(normalizeExchange('NYSE AMERICAN'), 'NYSE American');
  assert.equal(normalizeExchange(''), 'Unknown exchange');
});

test('weekend helpers derive Friday target date', () => {
  const saturday = new Date('2026-04-11T15:00:00Z');
  const sunday = new Date('2026-04-12T15:00:00Z');
  const monday = new Date('2026-04-13T15:00:00Z');

  assert.equal(isWeekendNy(saturday), true);
  assert.equal(isWeekendNy(sunday), true);
  assert.equal(isWeekendNy(monday), false);

  assert.equal(getWeekendTargetDate(saturday), '2026-04-10');
  assert.equal(getWeekendTargetDate(sunday), '2026-04-10');
});

test('consensusFromRecommendation computes directional consensus', () => {
  assert.equal(consensusFromRecommendation({ strongBuy: 10, buy: 5, hold: 1, sell: 0, strongSell: 0 }).consensus, 'Strong Buy');
  assert.equal(consensusFromRecommendation({ strongBuy: 0, buy: 0, hold: 1, sell: 4, strongSell: 4 }).consensus, 'Strong Sell');
  assert.equal(consensusFromRecommendation({ strongBuy: 2, buy: 3, hold: 7, sell: 2, strongSell: 0 }).consensus, 'Buy');
});
