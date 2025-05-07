#!/usr/bin/env python3
"""
Mint a PAI Key on XRPL test‑net.
"""

import argparse, time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import autofill_and_sign
from xrpl.models.transactions import SignerListSet, EscrowCreate

RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC)

def submit_and_wait(tx, wallet):
    signed = autofill_and_sign(tx, wallet, client)
    tx_hash = signed.get_hash()
    client.submit(signed)
    print("Submitted:", tx_hash)
    # simple polling loop
    while True:
        res = client.request({"id": 1, "command": "tx", "transaction": tx_hash})
        if res.result.get("validated"):
            print("✅ Validated:", tx_hash)
            return
        time.sleep(2)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True, help="human secret seed (s...)")
    ap.add_argument("--agent", required=True, help="agent address (r...)")
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--deadline", default="48h")  # placeholder
    args = ap.parse_args()

    human = Wallet(seed=args.seed)  # <‑‑ removed sequence param

    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{
            "SignerEntry": {"Account": args.agent, "SignerWeight": 1}
        }],
    )

    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
    )

    submit_and_wait(signer_tx, human)
    submit_and_wait(escrow_tx, human)

if __name__ == "__main__":
    main()
