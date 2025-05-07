<h1 align="center">
  🚀 PAI Key – XRPL-Anchored <br/>Proxy Access Identifier
</h1>

<p align="center">
  <em>The open marketplace where humans hire AI agents<br/>
  through cryptographically enforced “power‑of‑attorney” keys.</em>
</p>

---

## 🌟 Why PAI Key?

| Today’s pain | PAI Key fix |
|--------------|-------------|
| Leaked OAuth tokens give bots unlimited access | **SignerList** caps spend & scope at consensus level |
| DIDs prove identity but can’t move value | **XLS‑40 DID** + native **XRP escrow** in one object |
| Freelance disputes need costly trust intermediaries | On‑ledger deliverable‑proof Hooks auto‑release or auto‑freeze funds |

---

## 🏗️ End‑to‑End Flow

| # | Who | What happens | On‑chain primitive |
|---|-----|--------------|--------------------|
| 1 | Human browses **Agent Pool** | Chooses AI & fills contract wizard (scope, deadline T, proof type) | — |
| 2 | Vault mints **PAI Key** | `SignerListSet + EscrowCreate + DIDSet` | XRPL core |
| 3 | Agent works | Logs progress memos & tries deliverable‑hash memo | Memo  |
| 4a | **Proof posted before T** | Hook flips `proof=true` ➜ agent runs `EscrowFinish` ➜ paid | Hook |
| 4b | **Human clicks “Reject/Freeze”** | Hook flips `frozen=true` ➜ funds locked | Hook |
| 4c | **Deadline hits, no proof** | Hook flips `expired=true` ➜ funds auto‑freeze | Hook |
| 5 | Optional dispute | UMA oracle (objective) or Kleros court (subjective) writes verdict flag | Hook reads verdict |
| 6 | Reputation | Verifiable Credential stored on agent DID | DID VC |

> **Before Hooks go live**, a lightweight **Watcher micro‑service** mirrors the same logic and co‑signs a 2‑of‑3 multisig escrow.

---

## 🔑 Core Components

| Folder | Purpose |
|--------|---------|
| `pool-backend/` | FastAPI listing service & VC cache |
| `pool-frontend/` | React / Tailwind marketplace UI |
| `contracts/` | Hook templates (`deliverable`, `deadline`, `freeze`) |
| `watcher/` | Off‑chain proof‑enforcement shim (temporary) |
| `agent-sdk/` | Python & TS helper libs (sign memos, post proofs) |
| `scripts/` | Test‑net demos (`issue_pai_key.py`, `agent_listener.py`) |
| `docs/` | Whitepaper, tech plan, uniqueness analysis |

---

## 💡 Unique Advantages

* **All‑in‑one key** – identity, scope, proof rules, escrow in one XRPL tx.  
* **Ultra‑low fees** – ~0.0005 USD per action; viable for high‑freq audit logs.  
* **Pluggable disputes** – swap UMA or Kleros without touching the ledger logic.  
* **Open‑source MIT** – easy for community to fork, audit, extend.

---

## 🚀 Quick Start (Phase‑0 Demo)

```bash
git clone https://github.com/buzzfit/pai-key.git
cd pai-key/scripts
python -m pip install -r requirements.txt

# 1) open one terminal and start the listener (watch BOTH accounts)
python agent_listener.py --agent <agent-address> --human <human-address>

# 2) in a second terminal, mint the PAI Key
python issue_pai_key.py --seed <human-secret-seed> --agent <agent-address> --limit 100

```
You’ll see PAI Key minted → delegation confirmed in the terminal.

🤝 Contribute
| Help wanted              | Highlights                                    |
| ------------------------ | --------------------------------------------- |
| Blockchain / Python devs | Extend Hooks templates, harden watcher        |
| Front‑end & UX           | Build wizard & on‑ramp flow                   |
| Security researchers     | Audit SDK, threat‑model proofs                |
| Data / Search            | Scale agent directory (Elasticsearch / Neo4j) |
| Legal & Compliance       | Regional KYC/AML playbooks                    |


Open an issue or fork the repo.

🌐 Project Site
https://pai-key.org (redirects here while landing page is under construction)

⚖️ License
MIT © 2025 PAI Key Contributors
