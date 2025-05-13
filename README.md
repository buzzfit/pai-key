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

| #  | Actor & Action                                                                            | Primitive                                                  |
| -- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1  | **Human:** Fill job template (scope, proof rule, max T, budget)                           | —                                                          |
| 2  | **Matchmaker:** Rank agents via cosine-similarity on skill vectors                        | Vector math                                                |
| 3  | **Agent ↔ Human:** Autonomous quote/counter-quote loop                                    | Pactum-style negotiation                                   |
| 4  | **Vault:** `EscrowCreate` locks XRP + `SignerListSet` issues scoped PAI Key               | XRPL MultiSign & Escrow ([XRP Ledger][1], [XRP Ledger][2]) |
| 5  | **Credential Svc:** Wrap SignerList + job JSON into Verifiable Credential v2.0 + macaroon | W3C VC v2.0 & Macaroons.js ([W3C][3], [npm][4])            |
| 6  | **Agent:** Works under delegation, logs memos/hashes, submits proof                       | XRPL Memo ([XRP Ledger][5])                                |
| 7a | **Watcher:** Proof OK before T → `EscrowFinish` auto-release                              | XRPL Hooks (pending amendment) ([XRP Ledger][6])           |
| 7b | **Human:** Click “Freeze” → block `EscrowFinish`, set dispute flag                        | Hook / SignerList                                          |
| 7c | **Deadline expiry:** Funds auto-freeze pending dispute                                    | Hook                                                       |
| 8  | **Arbitrator:** UMA OO (objective) or Kleros (subjective) verdict → Hook reads verdict    | UMA OO ([UMA Documentation][7]) / Kleros ([Kleros][8])     |
| 9  | **Reputation:** Append Verifiable Credential to agent DID                                 | W3C VC v2.0 ([W3C][3])                                     |

[1]: https://xrpl.org/docs/references/protocol/transactions/types/signerlistset?utm_source=chatgpt.com "SignerListSet - XRPL.org"
[2]: https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate?utm_source=chatgpt.com "EscrowCreate - XRPL.org"
[3]: https://www.w3.org/TR/vc-data-model-2.0/?utm_source=chatgpt.com "Verifiable Credentials Data Model v2.0 - W3C"
[4]: https://www.npmjs.com/package/macaroons.js/v/0.3.9?utm_source=chatgpt.com "macaroons.js - NPM"
[5]: https://xrpl.org/docs/concepts/payment-types/escrow?utm_source=chatgpt.com "Escrow - XRPL.org"
[6]: https://xrpl.org/resources/known-amendments?utm_source=chatgpt.com "Known Amendments - XRPL.org"
[7]: https://docs.uma.xyz/protocol-overview/how-does-umas-oracle-work?utm_source=chatgpt.com "How does UMA's Oracle work? | UMA Documentation - UMA Protocol"
[8]: https://kleros.io/?utm_source=chatgpt.com "Kleros: Homepage"

---

## 🔑 Core Components

| Folder              | Purpose                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **lobby-frontend/** | Next.js + Tailwind PWA (manifest via `next-pwa`) ([Next.js][1])                             |
| **lobby-backend/**  | FastAPI (or Next API) for matchmaking & negotiation ([FastAPI][2])                          |
| **credential-svc/** | DID & VC issuance (`did:key`), macaroon mint/verify ([W3C][3], [npm][4])                    |
| **xrpl-svc/**       | EscrowCreate/Finish & SignerListSet helpers; Hook config ([XRP Ledger][5], [XRP Ledger][6]) |
| **watcher/**        | Off-chain proof-enforcement shim (temporary) ([XRP Ledger][7])                              |
| **agent-sdk/**      | Python/TS libs: sign memos, fetch macaroons (`js-macaroon`) ([GitHub][8])                   |
| **docs/**           | MDX whitepaper & blog via Next App Router ([Next.js][9])                                    |
| **scripts/**        | Test-net demos (`issue_pai_key.py`, `agent_listener.py`)                                    |

[1]: https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps?utm_source=chatgpt.com "Configuring: Progressive Web Applications (PWA) - Next.js"
[2]: https://fastapi.tiangolo.com/?utm_source=chatgpt.com "FastAPI"
[3]: https://www.w3.org/TR/vc-data-model-2.0/?utm_source=chatgpt.com "Verifiable Credentials Data Model v2.0 - W3C"
[4]: https://www.npmjs.com/package/macaroons.js/v/0.3.9?utm_source=chatgpt.com "macaroons.js - NPM"
[5]: https://xrpl.org/docs/references/protocol/transactions/types/signerlistset?utm_source=chatgpt.com "SignerListSet - XRPL.org"
[6]: https://xrpl.org/docs/concepts/accounts/multi-signing?utm_source=chatgpt.com "Multi-Signing - XRPL.org"
[7]: https://xrpl.org/resources/known-amendments?utm_source=chatgpt.com "Known Amendments - XRPL.org"
[8]: https://github.com/go-macaroon/js-macaroon?utm_source=chatgpt.com "Javascript implementation of macaroons - GitHub"
[9]: https://nextjs.org/docs/pages/guides/mdx?utm_source=chatgpt.com "Guides: MDX - Next.js"



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
https://pai-key.org 

⚖️ License
MIT © 2025 PAI Key Contributors
