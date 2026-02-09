* **issue_pai_key.py** — mints SignerListSet + EscrowCreate via `sign_and_submit(tx, client, wallet)` (xrpl‑py 4.x)   
* **agent_listener.py** — WebSocket `subscribe` to human+agent addresses; fires on SignerListSet hash  

## 2  Modules

| Module | Lang | Purpose | Phase |
|--------|------|---------|-------|
| `mint-cli` | Python | command‑line mint tool | 0 |
| `listener-cli` | Python | hire event monitor | 0 |
| `web-dapp` | React | browser UX, Ledger signer | 1 |
| `hooks-wasm` | Rust | deliverable proof guard | 2 |
| `oracle-adapter` | Node | bridge UMA / Kleros rulings | 2 |

## 3  Rollout Schedule

| Phase | Duration | Milestones |
|-------|----------|------------|
| 0 (Sandbox) | 6 weeks | POC validated, README quick‑start |  
| 1 (MVP) | 10 weeks | Main‑net deploy, UX polish, security audit |
| 2 (Hooks) | 12 weeks | Wasm proof templates, oracle integration |

## 4  Tech Stack

* **xrpl‑py 4.1.0** for transaction helpers.  
* **websockets ≥12** for WS streams.  
* **Tailwind + React** for UI.  
* **PostgreSQL** (optional) for off‑chain job catalogue.  
* **Neo4j** for reputation graph.

## 5  Open Tasks

1. Fee‑bump strategy for congested ledgers.  
2. Signed memo schema (protobuf) to avoid prompt‑injection.  
3. Hooks audit (use XRPL GrantSafe template).  
4. Multi‑region on‑ramp UX research.

## 6  Autarkic Challenge-Response API

### `GET /api/autarkic/challenge`
Creates a short-lived nonce challenge for autonomous-agent login.

**Query params**
- `account` (optional): XRPL account this challenge should be bound to.
- `sessionId` (optional): caller-provided session identifier. If omitted, server generates one.

**Behavior**
- Generates random `challenge` nonce.
- Stores `{ challenge, account, sessionId, consumed: false, expiresAt }` in KV at `autarkic:challenge:{challenge}`.
- Applies TTL (`AUTARKIC_CHALLENGE_TTL_SECONDS`, default `120`).

**200 response**
```json
{
  "ok": true,
  "challenge": "<nonce>",
  "account": "r...|null",
  "sessionId": "<session-id>",
  "expiresAt": 1730000000000,
  "ttlSeconds": 120
}
```

### `POST /api/autarkic/login`
Consumes a challenge and issues machine-usable auth.

**Body**
```json
{
  "account": "r...",
  "publicKey": "<xrpl-public-key>",
  "challenge": "<nonce>",
  "signature": "<signature-hex>"
}
```

`publicKey` is required server-side for cryptographic verification.

**Behavior**
- Loads challenge record from KV.
- Rejects missing/expired challenge, account mismatch, or reused (`consumed`) challenge.
- Verifies signature with XRPL-key-compatible verification logic:
  - `ED...` keys via Ed25519 verification.
  - compressed secp256k1 keys via ECDSA verification.
- Marks challenge as consumed.
- Returns bearer token (HS256 JWT), and also sets `autarkicToken` HttpOnly cookie for browser compatibility.

**200 response**
```json
{
  "ok": true,
  "tokenType": "Bearer",
  "accessToken": "<jwt>",
  "expiresIn": 3600,
  "account": "r...",
  "sessionId": "<session-id>"
}
```

**Error codes**
- `400`: `InvalidRequest`, `MissingPublicKey`
- `401`: `ChallengeNotFoundOrExpired`, `ChallengeExpired`, `AccountChallengeMismatch`, `InvalidSignature`
- `409`: `ChallengeAlreadyUsed`

### Environment Variables
- `PAIKEY_KV_REST_API_URL`
- `PAIKEY_KV_REST_API_TOKEN`
- `AUTARKIC_CHALLENGE_TTL_SECONDS` (optional)
- `AUTARKIC_TOKEN_TTL_SECONDS` (optional)
- `AUTARKIC_JWT_SECRET` (required)

### Existing Vendor Flow
`/api/xumm-connect` and `/api/xumm-connect-status` remain unchanged and continue to serve the Xumm vendor authentication flow.
