import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePerformanceSymbol, buildDirectReply } from '../../src/utils/jarvisReply.ts';

test('parsePerformanceSymbol extracts ticker from natural question', () => {
  assert.equal(parsePerformanceSymbol('what is the performance of tsm stock today'), 'TSM');
});

test('buildDirectReply prioritizes direct answer first', () => {
  const text = buildDirectReply('TSM is up 1.2% today.', 'Want the 1-week trend too?');
  assert.ok(text.startsWith('TSM is up 1.2% today.'));
  assert.ok(text.includes('Follow-up (optional):'));
});
