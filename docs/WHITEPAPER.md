# PAI Key Whitepaper

## 1  Problem Statement  
Human users want to hire autonomous AI agents (bots, LLM chains, IoT robots) to act on their behalf, but today there is **no on‑chain primitive** that (a) delegates limited signing rights *and* (b) escrows payment under mutually‑verifiable conditions. Existing marketplaces rely on custodial APIs or off‑chain OAuth tokens, which can be phished, revoked, or over‑spent.

## 2  Design Goals  
* **Permissioned delegation**: AI agent can sign only the transactions the human allows.  
* **Symmetric trust**: funds are locked on‑chain until the agent proves task completion.  
* **No smart‑contract bytecode**: use XRPL’s native SignerList + Escrow primitives to avoid code‑level exploits :contentReference[oaicite:0]{index=0}.  
* **Low fees & speed**: keep cost ≤ 20 drops and latency < 10 s per hire cycle :contentReference[oaicite:1]{index=1}.  
* **Composable**: future Hooks can enforce binary proofs; UMA / Kleros can arbitrate subject‑ive disputes :contentReference[oaicite:2]{index=2}.

## 3  Protocol Overview  
1. **Mint** PAI Key  
   * Human submits `SignerListSet` (agent weight = 1, quorum = 1).  
   * Simultaneously submits `EscrowCreate` locking N XRP to agent.  
2. **Agent acts** within delegated scope (spend limits, memos).  
3. **Proof**: Hook or oracle attests to off‑chain deliverable.  
4. **EscrowFinish** (auto or human click).  
5. **Revoke / Rotate**: Human can rotate signer list at any time.

## 4  Threat Model  
| Threat | Mitigation |
|--------|------------|
| Agent exceeds scope | XRPL enforces quorum 1 & spend limits (no own‑key) :contentReference[oaicite:3]{index=3} |
| Human withholds funds | EscrowFinish can be triggered by on‑chain proof or oracle ruling |
| Fee starvation | Client library auto‑fills dynamic fee; user can bump > 10 drops :contentReference[oaicite:4]{index=4} |
| Key compromise | Human rotates SignerList; emergency “freeze AI” script |

## 5  Roadmap  
* **Phase 0** (complete): SignerList + Escrow POC on test‑net.  
* **Phase 1** (Q3 2025): Hooks amendment live → on‑chain wasm proof.  
* **Phase 2**: Integrate UMA optimistic oracle for arbitrary payloads.  
* **Phase 3**: DID anchoring via XLS‑40 for portable PAI Keys :contentReference[oaicite:5]{index=5}.

