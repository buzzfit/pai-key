#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HUMAN_COOKIE="${HUMAN_COOKIE:-xummAccount=rExampleHirerWallet}"
AGENT_TOKEN="${AGENT_TOKEN:-REPLACE_WITH_AGENT_BEARER_TOKEN}"
AGENT_ID="${AGENT_ID:-REPLACE_WITH_AGENT_ID}"
ADMIN_SECRET="${ADMIN_SECRET:-REPLACE_WITH_DISPUTE_ADMIN_SECRET}"

echo "[1/6] Create job"
JOB_CREATE=$(curl -sS -X POST "$BASE_URL/api/jobs" \
  -H 'content-type: application/json' \
  -H "cookie: $HUMAN_COOKIE" \
  -d "{\"agentId\":\"$AGENT_ID\",\"offer\":{\"priceXrp\":\"15\"},\"terms\":\"Deliver a markdown report\",\"deadline\":\"2027-01-01\"}")
JOB_ID=$(echo "$JOB_CREATE" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).job.id));")
echo "Job ID: $JOB_ID"

echo "[2/6] Deposit escrow"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/deposit" -H "cookie: $HUMAN_COOKIE" | cat

echo "[3/6] Agent submission"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/submission" \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $AGENT_TOKEN" \
  -d '{"proof":{"type":"git_commit","value":"abc123"},"notes":"work completed"}' | cat

echo "[4/6] Human review accept"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/review" \
  -H 'content-type: application/json' \
  -H "cookie: $HUMAN_COOKIE" \
  -d '{"decision":"accepted","rating":5,"comment":"Looks good"}' | cat

echo "[5/6] Release escrow"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/release" -H "cookie: $HUMAN_COOKIE" | cat

echo "[6/6] (Optional) dispute resolve example"
echo "curl -X POST $BASE_URL/api/jobs/$JOB_ID/resolve -H 'x-dispute-admin-secret: $ADMIN_SECRET' -H 'content-type: application/json' -d '{\"resolution\":\"refund\"}'"
