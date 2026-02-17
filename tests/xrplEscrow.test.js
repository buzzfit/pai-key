import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = global.fetch;

test('lookupTransaction calls XRPL RPC tx method', async () => {
  let requestBody = null;
  global.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      async json() {
        return { result: { hash: 'ABC', validated: true, meta: { TransactionResult: 'tesSUCCESS' } } };
      },
    };
  };

  const { lookupTransaction } = await import(`../lib/xrplEscrow.js?${Date.now()}`);
  const tx = await lookupTransaction('ABC');

  assert.equal(requestBody.method, 'tx');
  assert.equal(requestBody.params[0].transaction, 'ABC');
  assert.equal(tx.hash, 'ABC');
});

test.after(() => {
  global.fetch = originalFetch;
});
