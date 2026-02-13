const XUMM_API_BASE = 'https://xumm.app/api/v1/platform';

function xummHeaders() {
  const apiKey = process.env.XUMM_API_KEY;
  const apiSecret = process.env.XUMM_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('MissingXummCredentials');
  }

  return {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'x-api-secret': apiSecret,
  };
}

export async function createSignPayload(txjson, options = {}) {
  const res = await fetch(`${XUMM_API_BASE}/payload`, {
    method: 'POST',
    headers: xummHeaders(),
    body: JSON.stringify({ txjson, options }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`XummCreatePayloadFailed:${res.status}:${text}`);
  }

  const data = await res.json();
  return {
    uuid: data?.uuid,
    signUrl: data?.next?.always,
    refs: data?.refs || null,
    raw: data,
  };
}

export async function getPayload(uuid) {
  const res = await fetch(`${XUMM_API_BASE}/payload/${uuid}`, {
    method: 'GET',
    headers: xummHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`XummGetPayloadFailed:${res.status}:${text}`);
  }

  return res.json();
}
