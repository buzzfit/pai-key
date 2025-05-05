#!/usr/bin/env python3
"""
Listens for the agent being added to a SignerList.
Usage: python agent_listener.py --agent <agent-pubkey>
"""
import argparse, asyncio, json, websockets

WS_URL = "wss://s.altnet.rippletest.net:51233"

async def listen(agent):
    async with websockets.connect(WS_URL) as ws:
        await ws.send(json.dumps({"command": "subscribe", "accounts": [agent]}))
        print("Listening for SignerListSet that hires me…")
        async for msg in ws:
            data = json.loads(msg)
            if ("transaction" in data
                and data["transaction"]["TransactionType"] == "SignerListSet"
                and agent in str(data["transaction"])):
                print("✅ Hired! TX:", data["transaction"]["hash"])

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True)
    args = ap.parse_args()
    asyncio.run(listen(args.agent))
