#!/usr/bin/env python3
"""
Mint a PAI Key on XRPL test‑net (works on xrpl‑py 4.x).
"""

import argparse, time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import (
    safe_sign_and_autofill_and_submit_transaction,
)
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.models.requests import Tx

RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC)

def wait_validation(tx_hash):
    while True:
        res = client.request(Tx(transaction=tx_hash))
        if res.result.get("validated"):
            print("✅ Validated:", tx_hash)
            return
        time.sleep(2)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--seed", required=True, help="human secret seed (s...)")
    p.add_argument("--agent", required=True, help="agent address (r...)")
    p.add_argument("--limit", type=int, default=100)
    args = p.parse_args()

    human = Wallet(seed=args.seed)

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

    for tx in (signer_tx, escrow_tx):
        stx = safe_sign_and_autofill_and_submit_transaction(tx, human, client)
        print("Submitted:", stx.result["tx_json"]["hash"])
        wait_validation(stx.result["tx_json"]["hash"])

if __name__ == "__main__":
    main()
