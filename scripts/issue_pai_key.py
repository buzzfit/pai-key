#!/usr/bin/env python3
"""
Mint a PAI Key on XRPL test‑net.

Usage:
python issue_pai_key.py \
  --seed s████userSecret \
  --agent r████agentPub \
  --limit 100 --deadline 48h
"""
import argparse
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import (
    autofill_and_sign,
    send_reliable_submission,
)
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.models.requests import AccountInfo

TEST_RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(TEST_RPC)

def submit(tx, wallet):
    """Sign, autofill, submit, and wait until validated."""
    signed = autofill_and_sign(tx, wallet, client)
    resp = client.submit(signed)
    send_reliable_submission(resp.result["tx_json"]["hash"], client)
    print("Submitted:", resp.result["tx_json"]["hash"])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True, help="human secret seed (s...)")
    ap.add_argument("--agent", required=True, help="agent address (r...)")
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--deadline", default="48h")  # placeholder
    args = ap.parse_args()

    human = Wallet(seed=args.seed, sequence=0)
    seq = client.request(
        AccountInfo(account=human.classic_address, ledger_index="current")
    ).result["account_data"]["Sequence"]

    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{
            "SignerEntry": {"Account": args.agent, "SignerWeight": 1}
        }],
        sequence=seq,
    )

    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
        sequence=seq + 1,
    )

    submit(signer_tx, human)
    submit(escrow_tx, human)

if __name__ == "__main__":
    main()
