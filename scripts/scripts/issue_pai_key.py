#!/usr/bin/env python3
"""
Quick demo: mint a PAI Key on XRPL testnet.
Usage:
    python issue_pai_key.py --seed <user-secret> --agent <agent-pubkey> --limit 100 --deadline 48h
"""
import argparse, xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import safe_sign_and_submit_transaction, send_reliable_submission
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.models.requests import AccountInfo

TEST_URL = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(TEST_URL)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True)
    ap.add_argument("--agent", required=True)
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--deadline", default="48h")  # not yet enforced
    args = ap.parse_args()

    user_wallet = Wallet(seed=args.seed, sequence=0)
    info = client.request(AccountInfo(account=user_wallet.classic_address,
                                      ledger_index="current")).result
    seq = info["account_data"]["Sequence"]

    signer_tx = SignerListSet(
        account=user_wallet.classic_address,
        signer_quorum=1,
        signer_entries=[{"SignerEntry": {"Account": args.agent, "SignerWeight": 1}}],
        sequence=seq
    )
    escrow_tx = EscrowCreate(
        account=user_wallet.classic_address,
        amount=str(args.limit * 1_000_000),  # XRP ➜ drops
        destination=args.agent,
        sequence=seq + 1
    )

    for tx in (signer_tx, escrow_tx):
        stx = safe_sign_and_submit_transaction(tx, user_wallet, client)
        send_reliable_submission(stx.result["tx_json"]["hash"], client)
        print("Submitted:", stx.result["tx_json"]["hash"])

if __name__ == "__main__":
    main()
