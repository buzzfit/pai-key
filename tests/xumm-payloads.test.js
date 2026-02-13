import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = global.fetch;

test('createSignPayload posts txjson to xumm platform', async () => {
  process.env.XUMM_API_KEY = 'k';
  process.env.XUMM_API_SECRET = 's';

  let captured = null;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      async json() {
        return { uuid: 'uuid-1', next: { always: 'https://xumm.app/sign/uuid-1' }, refs: {} };
      },
    };
  };

  const { createSignPayload } = await import(`../lib/xummPayloads.js?${Date.now()}`);
  const payload = await createSignPayload({ TransactionType: 'EscrowCreate', Amount: '1000' });

  assert.equal(captured.url, 'https://xumm.app/api/v1/platform/payload');
  assert.equal(payload.uuid, 'uuid-1');
  assert.match(payload.signUrl, /xumm\.app\/sign/);
  assert.equal(JSON.parse(captured.options.body).txjson.TransactionType, 'EscrowCreate');
});

test.after(() => {
  global.fetch = originalFetch;
});
