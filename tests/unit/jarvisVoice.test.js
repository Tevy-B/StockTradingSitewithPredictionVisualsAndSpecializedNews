import test from 'node:test';
import assert from 'node:assert/strict';
import { pickHumanLikeVoice, DEFAULT_PAUSE_MS } from '../../src/utils/jarvisVoice.ts';

test('pickHumanLikeVoice returns explicit preferred voice when provided', () => {
  const voices = [{ name: 'Voice A', lang: 'en-US' }, { name: 'Voice B', lang: 'en-GB' }];
  const selected = pickHumanLikeVoice(voices, 'Voice B');
  assert.equal(selected?.name, 'Voice B');
});

test('pickHumanLikeVoice falls back to preferred human-like names', () => {
  const voices = [{ name: 'Robot', lang: 'en-US' }, { name: 'Microsoft Aria Online', lang: 'en-US' }];
  const selected = pickHumanLikeVoice(voices);
  assert.equal(selected?.name, 'Microsoft Aria Online');
});

test('default pause is long enough for natural speaking gap', () => {
  assert.equal(DEFAULT_PAUSE_MS, 1500);
});
