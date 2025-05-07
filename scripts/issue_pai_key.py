#!/usr/bin/env python3
"""
Phase‑0 demo: mint a PAI Key on the XRPL *test‑net*.
Works on xrpl‑py ≥ 4.0 (uses Wallet.from_seed + sign_and_submit).
"""

import argparse, time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.transaction import sign_and_submit
from xrpl.models.requests import Tx

RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC)


def wait_validation(tx_hash: str) -> None:
    """Poll until the transaction is validated."""
    while True:
        res = client.request(Tx(transaction=tx_hash))
        if res.result.get("validated"):
            print("✅ Validated:", tx_hash)
            return
        time.sleep(2)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--seed", required=True, help="human secret seed (s...)")
    p.add_argument("--agent", required=True, help="agent classic address (r...)")
    p.add_argument("--limit", type=int, default=100, help="XRP escrow size")
    args = p.parse_args()

    # create wallet object from seed
    human = Wallet.from_seed(args.seed)

    # 1) grant agent signer rights
    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{
            "SignerEntry": {"Account": args.agent, "SignerWeight": 1}
        }],
    )

    # 2) lock funds in escrow to the agent
    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
    )

    for tx in (signer_tx, escrow_tx):
        resp = sign_and_submit(tx, client, human)   # auto‑fill, sign, submit
        tx_hash = resp.result["hash"]
        print("Submitted:", tx_hash)
        wait_validation(tx_hash)


if __name__ == "__main__":
    main()
