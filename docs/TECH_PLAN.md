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
