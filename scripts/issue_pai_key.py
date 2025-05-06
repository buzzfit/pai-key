#!/usr/bin/env python3
"""
Mint a PAI Key on XRPL test‑net.

Usage:
python issue_pai_key.py \
  --seed s████humanSecret \
  --agent r████agentPub \
  --limit 100 --deadline 48h
"""
import argparse, time
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import autofill_and_sign
from xrpl.models.transactions import SignerListSet, EscrowCreate
from xrpl.models.requests import AccountInfo, Tx

RPC = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(RPC)

def submit_and_wait(tx, wallet):
    """sign, autofill, submit, wait for validation"""
    signed = autofill_and_sign(tx, wallet, client)
    sub = client.submit(signed)
    tx_hash = sub.result["tx_json"]["hash"]
    print("Submitted:", tx_hash)
    # simple polling until the tx is validated
    while True:
        res = client.request(Tx(transaction=tx_hash))
        if res.result.get("validated"):
            print("✅ Validated:", tx_hash)
            return
        time.sleep(2)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True)
    ap.add_argument("--agent", required=True)
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--deadline", default="48h")  # placeholder
    args = ap.parse_args()

    human = Wallet(seed=args.seed, sequence=0)
    seq = client.request(AccountInfo(account=human.classic_address,
                                     ledger_index="current")).result["account_data"]["Sequence"]

    signer_tx = SignerListSet(
        account=human.classic_address,
        signer_quorum=1,
        signer_entries=[{"SignerEntry": {"Account": args.agent, "SignerWeight": 1}}],
        sequence=seq,
    )
    escrow_tx = EscrowCreate(
        account=human.classic_address,
        destination=args.agent,
        amount=str(args.limit * 1_000_000),  # XRP -> drops
        sequence=seq + 1,
    )

    submit_and_wait(signer_tx, human)
    submit_and_wait(escrow_tx, human)

if __name__ == "__main__":
    main()
