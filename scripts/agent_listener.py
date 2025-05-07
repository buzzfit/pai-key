#!/usr/bin/env python3
"""
Listen for the SignerListSet that “hires” an agent
(i.e., adds the agent address to the human account’s signer list).

Example
-------
python agent_listener.py \
  --agent rxBEwPCb2gMDFH8q1LsTpoePPhyPXxADJ \
  --human rNBdhPKeJxVjK9Rfyr1LrU1j5pMbyvvjPR
"""

import argparse
import asyncio
import json
import websockets

WS_URL = "wss://s.altnet.rippletest.net:51233"


async def listen(agent_addr: str, human_addr: str) -> None:
    async with websockets.connect(WS_URL) as ws:
        # Subscribe to transactions that affect EITHER account
        await ws.send(json.dumps({
            "command": "subscribe",
            "accounts": [agent_addr, human_addr]
        }))
        print("Listening for SignerListSet that hires me …")

        async for raw in ws:
            data = json.loads(raw)
            tx = data.get("transaction")
            if (
                tx
                and tx.get("TransactionType") == "SignerListSet"
                and agent_addr in json.dumps(tx)  # agent appears in signer entry
            ):
                print(f"✅ Hired! TX: {tx['hash']}")
                return  # exit after first confirmation


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True, help="agent classic address (r…)")
    ap.add_argument("--human", required=True, help="human classic address (r…)")
    args = ap.parse_args()

    asyncio.run(listen(args.agent, args.human))
