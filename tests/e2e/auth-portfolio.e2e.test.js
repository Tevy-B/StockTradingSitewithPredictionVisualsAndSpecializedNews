import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('auth + portfolio flow persists user symbols', async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'stockpredict-test-'));
  const port = 8799;

  const server = spawn('node', ['server/index.js'], {
    env: {
      ...process.env,
      PORT: String(port),
      STORE_PATH: path.join(tempDir, 'store.json'),
      FINNHUB_API_KEY: 'test-key-not-used',
    },
    stdio: 'ignore',
  });

  try {
    for (let i = 0; i < 30; i += 1) {
      try {
        const health = await fetch(`http://127.0.0.1:${port}/api/health`);
        if (health.ok) break;
      } catch {}
      await wait(150);
    }

    const registerResp = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'qa@example.com', password: 'supersecret' }),
    });
    assert.equal(registerResp.status, 201);
    const registerPayload = await registerResp.json();
    assert.ok(registerPayload.token);

    const meResp = await fetch(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registerPayload.token}` },
    });
    assert.equal(meResp.status, 200);

    const addResp = await fetch(`http://127.0.0.1:${port}/api/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registerPayload.token}`,
      },
      body: JSON.stringify({ symbol: 'LLY' }),
    });
    assert.equal(addResp.status, 201);

    const portfolioResp = await fetch(`http://127.0.0.1:${port}/api/portfolio`, {
      headers: { Authorization: `Bearer ${registerPayload.token}` },
    });
    assert.equal(portfolioResp.status, 200);
    const portfolioPayload = await portfolioResp.json();
    assert.ok(portfolioPayload.symbols.includes('LLY'));
  } finally {
    server.kill('SIGTERM');
  }
});
