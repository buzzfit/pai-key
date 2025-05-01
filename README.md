<h1 align="center">
  🚀 PAI Key – XRPL-Anchored <br/>Proxy Access Identifier
</h1>

<p align="center">
  <em>Give your AI a cryptographic power-of-attorney—<br/>
  hired in seconds, revoked in one click, logged on-ledger for pennies.</em>
</p>

---

## ✨ Why PAI Key Matters

| Trend | Pain Today | How PAI Key Fixes It |
|-------|-----------|----------------------|
| **AI agents shifting from chat ➜ direct actions** | Leaked OAuth tokens & over-privileged API keys. | XRPL **SignerList** limits exactly what an AI can sign or spend. |
| **Identity & payment live on separate rails** | DIDs can’t move value; wallets can’t prove identity. | **XLS-40 DID** + native **XRP escrow** in one ledger object. |
| **L1 gas is still expensive for high-freq logs** | >$0.10 to log on Ethereum. | **10-drop fee** (≈ $0.0005) → affordable per-action audit trail. |

---

## 🔥 What Makes Us Different

| Feature |  PAI Key (XRPL) | Hyperledger Indy / Sovrin | ENS | ERC-4337 Wallet | Ceramic 3ID |
|---------|-----------------|---------------------------|-----|-----------------|-------------|
| DID anchor | **XRPL (XLS-40)** | Indy ledger | Naming only | No native DID | did:pkh / 3id |
| Built-in payment rail | **Native XRP escrow / pay-chan** | ✗ | ✗ | Gas + relayer | ✗ |
| Proxy transaction control | **SignerList delegated signer** | ✗ | ✗ | Smart modules | ✗ |
| On-ledger spend caps | **Hooks (Q4 2025)** | ✗ | ✗ | Relayer logic | ✗ |
| Typical fee | **< $0.001** | N/A | Gas | Gas | N/A |

> **Uniqueness score:** ★ **9 / 10** — native identity, payments, and proxy access on the same high-throughput ledger.

---

## 🛠️ Repository Layout (initial scaffold)

pai-key/ ├─ README.md ← you are here ├─ LICENSE ← MIT ├─ scripts/ ← Phase-0 demos │ ├─ issue_pai_key.py │ └─ agent_listener.py ├─ vault-frontend/ ← React app (placeholder) ├─ vault-api/ ← FastAPI back-end (placeholder) ├─ agent-sdk/ ← Python client lib (placeholder) └─ docs/ ├─ PAI_Key_Technical_Plan.pdf └─ uniqueness.md

yaml
Copy
Edit

Phase-0 demo mints a PAI Key on XRPL test-net in under 60 s.

---

## 🗺️ Roadmap & Compliance Milestones

| Phase | Target Window | Headline Deliverables |
|-------|---------------|-----------------------|
| **0 Sandbox** | May 2025 | Test-net scripts, README GIF |
| **1 Public MVP** | Aug 2025 | Fiat on-ramp UI, OFAC checks, one-click freeze |
| **Security Audit** | Q1 2025 | External Hooks & signer audit |
| **2 Hooks Launch** | Q4 2025 | On-ledger spend limits, VC bridge |
| **Insurance & Policies** | Pre-beta | Tech-E&O cover, plain-language disclosures |

*Detailed budget lives in `/docs/budget.md` (coming soon).*

---

## 🚀 Quick Start (after demo scripts land)

```bash
git clone https://github.com/<your-user>/pai-key.git
cd pai-key/scripts
python -m pip install -r requirements.txt
python issue_pai_key.py --seed <user-secret> --agent <agent-pubkey> --limit 100
python agent_listener.py --agent <agent-pubkey>
Terminal shows: PAI Key minted → delegation confirmed.

🤝 How to Contribute

Role	What We Need
Blockchain / Python Devs	Extend xrpl-py demo, write Hooks templates.
Front-end Devs	Build the React “PAI Vault” with one-click fiat top-up.
Security Researchers	Threat-model signer compromise & prompt-injection.
UX Designers	Design freeze/revoke flows & fiat KYC screens.
Legal & Compliance	Refine OFAC, Travel-Rule, MiCA adaptations.
Open an issue, fork the repo, or email hello@pai-key.org.

🌐 Project Site
https://pai-key.org
(Currently redirects here while we bootstrap a full landing page.)

⚖️ License
MIT © 2025 PAI Key Contributors

yaml
Copy
Edit

---

**Next step**  
*Copy the code-block, drop it into `README.md` in your repo, commit, push—and your landing page will sparkle without revealing budget numbers.*









Search



