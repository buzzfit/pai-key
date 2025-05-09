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
💡 Before you run the demo
### 🎟️ Generate Your Test‑net Wallets

1. Open the [XRPL Test‑net faucet](https://xrpl.org/xrp-testnet-faucet.html).  
2. **Click Generate** → copy the **Secret** (`s…`) and **Address** (`r…`).  
   *This is your **Human** wallet.*  
3. **Click Generate** again → copy the new **Address** (`r…`).  
   *This is your **Agent** wallet (no secret needed for Phase‑0).*

| Label           | Example format |
|-----------------|----------------|
| **human_secret** | `sXXXXXXXX…` |
| **human_address** | `rYYYYYYYY…` |
| **agent_address** | `rZZZZZZZZ…` |

| Script&nbsp;&nbsp; | Argument | Paste this value |
|--------------------|----------|------------------|
| `agent_listener.py` | `--human` | **human_address** (`rY…`) |
|                     | `--agent` | **agent_address** (`rZ…`) |
| `issue_pai_key.py`  | `--seed`  | **human_secret** (`sX…`) |
|                     | `--agent` | **agent_address** (`rZ…`) |




# Run order



# 1) clone the repo and install the Python dependencies
```bash
git clone https://github.com/buzzfit/pai-key.git
cd pai-key/scripts
python -m pip install -r requirements.txt
```


# 2) open one terminal and start the listener (watch BOTH terminals so you don’t miss the SignerList event)
```bash
python agent_listener.py --agent <agent-address-r...> --human <human-address-r...>
```


# 3) in a second terminal, mint the PAI Key
```bash
python issue_pai_key.py --seed <human-secret-seed-s...> --agent <agent-address-r...> --limit 100
```
You’ll see “Submitted → ✅ Validated” twice, followed by “✅ Hired!” in the listener, confirming the PAI Key was minted and the delegation completed successfully.
Confirm transaction status anytime by pasting the hash into https://testnet.xrpl.org.
---
![pai_full_demo_best](https://github.com/user-attachments/assets/c55556e8-b2a3-46e0-8266-262248c5867e)

## 📄 Documentation

| Doc | Purpose |
|-----|---------|
| [Whitepaper](docs/WHITEPAPER.md) | High‑level problem statement, design goals, threat model |
| [Technical Plan](docs/TECH_PLAN.md) | Detailed architecture, module breakdown, rollout phases |
| [Uniqueness Analysis](docs/UNIQUENESS.md) | Comparison to Sovrin, ENS, ERC‑4337 wallets, Ceramic, etc. |


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
