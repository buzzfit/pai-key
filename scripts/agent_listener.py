#!/usr/bin/env python3
"""
Listen for the SignerListSet transaction that hires the agent.

Example:
python agent_listener.py --agent r████agentPubKey
"""
import argparse
import asyncio
import json
import websockets

WS_URL = "wss://s.altnet.rippletest.net:51233"

async def listen(agent_addr: str) -> None:
    async with websockets.connect(WS_URL) as ws:
        # subscribe to txs involving agent's account
        await ws.send(json.dumps({"command": "subscribe", "accounts": [agent_addr]}))
        print("Listening for SignerListSet that hires me …")
        async for raw in ws:
            data = json.loads(raw)
            tx = data.get("transaction")
            if (
                tx
                and tx.get("TransactionType") == "SignerListSet"
                and agent_addr in json.dumps(tx)
            ):
                print(f"✅ Hired! TX: {tx['hash']}")
                return

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True, help="agent classic address (starts with r)")
    args = ap.parse_args()
    asyncio.run(listen(args.agent))
