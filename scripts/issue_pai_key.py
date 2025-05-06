#!/usr/bin/env python3
"""
Mint a PAI Key on XRPL test‑net.

Example:
python issue_pai_key.py \
  --seed s████yourUserSecret \
  --agent r████agentPubKey \
  --limit 100 --deadline 48h
"""
import argparse
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import (
    safe_sign_and_submit_transaction,
    send_reliable_submission,
)
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.models.requests import AccountInfo

TEST_RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(TEST_RPC)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True, help="secret seed of the HUMAN wallet (starts with s)")
    ap.add_argument("--agent", required=True, help="classic address of the AGENT (starts with r)")
    ap.add_argument("--limit", type=int, default=100, help="XRP to lock in escrow")
    ap.add_argument("--deadline", default="48h", help="placeholder, not enforced yet")
    args = ap.parse_args()

    # initialise wallet and fetch current sequence
    human = Wallet(seed=args.seed, sequence=0)
    seq = client.request(
        AccountInfo(account=human.classic_address, ledger_index="current")
    ).result["account_data"]["Sequence"]

    # 1. give the agent limited signer rights
    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{
            "SignerEntry": {
                "Account": args.agent,
                "SignerWeight": 1
            }
        }],
        sequence=seq,
    )

    # 2. lock funds in an escrow to the agent
    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP → drops
        sequence=seq + 1,
    )

    for tx in (signer_tx, escrow_tx):
        signed = safe_sign_and_autofill_and_submit_transaction(tx, human, client)
        send_reliable_submission(signed.result["tx_json"]["hash"], client)
        print("Submitted:", signed.result["tx_json"]["hash"])

if __name__ == "__main__":
    main()
