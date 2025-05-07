#!/usr/bin/env python3
"""
Mint a PAI Key on the XRPL *test‑net*.

Example:
python issue_pai_key.py \
  --seed s████HUMAN_SECRET \
  --agent r████AGENT_ADDRESS \
  --limit 100
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
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True, help="human *secret* seed (starts with s)")
    ap.add_argument("--agent", required=True, help="agent classic address (starts with r)")
    ap.add_argument("--limit", type=int, default=100, help="XRP escrow size")
    args = ap.parse_args()

    # create wallet object from seed
    human = Wallet(seed=args.seed)

    # 1) give the agent delegated signing rights
    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{
            "SignerEntry": {"Account": args.agent, "SignerWeight": 1}
        }],
    )

    # 2) lock funds in an escrow to the agent
    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
    )

    for tx in (signer_tx, escrow_tx):
        result = sign_and_submit(tx, client, human)  # auto‑fill, sign, submit
        tx_hash = result.result["hash"]
        print("Submitted:", tx_hash)
        wait_validation(tx_hash)


if __name__ == "__main__":
    main()
