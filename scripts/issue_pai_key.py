#!/usr/bin/env python3
"""
Phase‑0 demo: mint a PAI Key on XRPL test‑net.
Works with xrpl‑py 4.1.0 .
"""
import argparse, time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import SignerListSet, EscrowCreate, SignerEntry
from xrpl.transaction import sign_and_submit
from xrpl.models.requests import Tx

RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC)


def wait_validation(tx_hash: str) -> None:
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
    p.add_argument("--limit", type=int, default=100, help="XRP escrow amount")
    args = p.parse_args()

    human = Wallet.from_seed(args.seed)

    # 1) grant agent signer rights
    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[SignerEntry(account=args.agent, signer_weight=1)],
    )

    # 2) lock funds in escrow to the agent
    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
    )

    for tx in (signer_tx, escrow_tx):
        resp = sign_and_submit(client, human, tx)  # correct argument order
        tx_hash = resp.result["hash"]
        print("Submitted:", tx_hash)
        wait_validation(tx_hash)


if __name__ == "__main__":
    main()
