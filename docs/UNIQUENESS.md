# PAI Key Uniqueness Analysis

| Project | Ledger | Delegation | Escrow | DID | Verdict |
|---------|--------|------------|--------|-----|---------|
| **PAI Key** | XRPL | Native `SignerList` | Native | XLS‑40 | **8.5 / 10** |
| Hyperledger Indy / Sovrin | Indy | SDK‑level only | None | Native | 6 |
| ENS + Safe 4337 wallet | Ethereum | Module | Safe module | ENS names | 7 |
| Ceramic 3ID + Lit | Multi | OAuth signer | Lit conditional | 3ID | 6 |
| Kleros escrow | Ethereum | None | Kleros Dapp | None | 5 |

### Why PAI Key is unusual

1. **Same chain** provides delegation + escrow with no solidity bytecode.  
2. Fees stay < $0.001 even at 1,500 TPS capacity :contentReference[oaicite:8]{index=8}.  
3. DID anchoring (XLS‑40) lets the key move across chains without bridges :contentReference[oaicite:9]{index=9}.  
4. Hooks roadmap enables on‑chain Wasm proofs instead of Solidity or Cairo contracts :contentReference[oaicite:10]{index=10}.  
5. Oracle‑agnostic: UMA for objective tasks :contentReference[oaicite:11]{index=11}, Kleros for subjective :contentReference[oaicite:12]{index=12}.

**Uniqueness rating: 8.5 / 10** — Few projects natively combine signer delegation, escrow, and DID on a low‑fee L1.

