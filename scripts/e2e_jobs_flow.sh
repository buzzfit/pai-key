#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HUMAN_COOKIE="${HUMAN_COOKIE:-xummAccount=rExampleHirerWallet}"
AGENT_TOKEN="${AGENT_TOKEN:-REPLACE_WITH_AGENT_BEARER_TOKEN}"
AGENT_ID="${AGENT_ID:-REPLACE_WITH_AGENT_ID}"
ADMIN_SECRET="${ADMIN_SECRET:-REPLACE_WITH_DISPUTE_ADMIN_SECRET}"

parse_json() {
  node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const p=JSON.parse(d);const path=process.argv[1].split('.');let v=p;for(const k of path){v=v?.[k]}console.log(v ?? '')})" "$1"
}

echo "[1/7] Create job"
JOB_CREATE=$(curl -sS -X POST "$BASE_URL/api/jobs" \
  -H 'content-type: application/json' \
  -H "cookie: $HUMAN_COOKIE" \
  -d "{\"agentId\":\"$AGENT_ID\",\"offer\":{\"priceXrp\":\"15\"},\"terms\":\"Deliver a markdown report\",\"deadline\":\"2027-01-01\"}")
JOB_ID=$(echo "$JOB_CREATE" | parse_json "job.id")
echo "Job ID: $JOB_ID"

echo "[2/7] Deposit escrow"
DEPOSIT=$(curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/deposit" -H "cookie: $HUMAN_COOKIE")
echo "$DEPOSIT"

echo "[3/7] Agent polls escrowed jobs"
ESCROWED=$(curl -sS "$BASE_URL/api/jobs?scope=all&status=escrowed" -H "authorization: Bearer $AGENT_TOKEN")
echo "$ESCROWED"

echo "[4/7] Agent submission"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/submission" \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $AGENT_TOKEN" \
  -d '{"proof":{"type":"git_commit","value":"abc123"},"notes":"work completed"}' | cat

echo "[5/7] Human review accept"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/review" \
  -H 'content-type: application/json' \
  -H "cookie: $HUMAN_COOKIE" \
  -d '{"decision":"accepted","rating":5,"comment":"Looks good"}' | cat

echo "[6/7] Release escrow"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/release" -H "cookie: $HUMAN_COOKIE" | cat

echo "[7/7] Optional dispute resolution examples"
echo "curl -X POST $BASE_URL/api/jobs/$JOB_ID/dispute -H 'cookie: $HUMAN_COOKIE' -H 'content-type: application/json' -d '{\"reason\":\"Need arbitration\"}'"
echo "curl -X POST $BASE_URL/api/jobs/$JOB_ID/resolve -H 'x-dispute-admin-secret: $ADMIN_SECRET' -H 'content-type: application/json' -d '{\"resolution\":\"refund\"}'"
