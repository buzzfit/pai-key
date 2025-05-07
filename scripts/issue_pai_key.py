#!/usr/bin/env python3
"""
Phase‑0 demo: mint a PAI Key on XRPL test‑net.
Compatible with xrpl‑py 4.x.

Usage example
-------------
python issue_pai_key.py \
  --seed  sEdVwj3ixPV1Ewi27szr6Wu96VC65SR \
  --agent rPp9KfVKhFxgfN8zm8L9L7WFS2Um2inXKV \
  --limit 100
"""

import argparse
import time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import SignerListSet, EscrowCreate, SignerEntry
from xrpl.transaction import sign_and_submit
from xrpl.models.requests import Tx

RPC_URL = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC_URL)


def wait_until_validated(tx_hash: str) -> None:
    """Poll the ledger until the transaction with tx_hash is validated."""
    while True:
        res = client.request(Tx(transaction=tx_hash))
        if res.result.get("validated"):
            print("✅ Validated:", tx_hash)
            return
        time.sleep(2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", required=True, help="human secret seed (starts with s)")
    parser.add_argument("--agent", required=True, help="agent classic address (starts with r)")
    parser.add_argument("--limit", type=int, default=100, help="XRP escrow amount")
    args = parser.parse_args()

    # create wallet from seed
    human_wallet = Wallet.from_seed(args.seed)

    # 1️⃣ SignerListSet: give the agent delegated signing rights
    signer_tx = SignerListSet(
        account=human_wallet.classic_address,
        signer_quorum=1,
        signer_entries=[
            SignerEntry(account=args.agent, signer_weight=1)
        ],
    )

    # 2️⃣ EscrowCreate: lock funds for the agent
    escrow_tx = EscrowCreate(
        account=human_wallet.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # convert XRP → drops
    )

    for tx in (signer_tx, escrow_tx):
        resp = sign_and_submit(tx, client, human_wallet)  # tx, client, wallet
        tx_hash = resp.result["hash"]
        print("Submitted:", tx_hash)
        wait_until_validated(tx_hash)


if __name__ == "__main__":
    main()
