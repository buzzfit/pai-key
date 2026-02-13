#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HUMAN_COOKIE="${HUMAN_COOKIE:-xummAccount=rExampleHirerWallet}"
AGENT_TOKEN="${AGENT_TOKEN:-REPLACE_WITH_AGENT_BEARER_TOKEN}"
AGENT_ID="${AGENT_ID:-REPLACE_WITH_AGENT_ID}"

parse_json() {
  node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const p=JSON.parse(d);const path=process.argv[1].split('.');let v=p;for(const k of path){v=v?.[k]}console.log(v ?? '')})" "$1"
}

echo "[1/9] Create job"
JOB_CREATE=$(curl -sS -X POST "$BASE_URL/api/jobs" -H 'content-type: application/json' -H "cookie: $HUMAN_COOKIE" -d "{\"agentId\":\"$AGENT_ID\",\"offer\":{\"priceXrp\":\"15\"},\"terms\":\"Deliver a markdown report\"}")
JOB_ID=$(echo "$JOB_CREATE" | parse_json "job.id")
echo "Job ID: $JOB_ID"

echo "[2/9] Deposit escrow (expect signature_required)"
DEPOSIT=$(curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/deposit" -H "cookie: $HUMAN_COOKIE")
SIGN_URL=$(echo "$DEPOSIT" | parse_json "escrowTx.signUrl")
echo "$DEPOSIT"
echo "Open and sign in Xaman: $SIGN_URL"
read -r -p "Press enter after signing deposit..."

echo "[3/9] Confirm deposit status"
curl -sS "$BASE_URL/api/jobs/$JOB_ID/escrow-status" -H "cookie: $HUMAN_COOKIE" | cat

echo "[4/9] Agent accept"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/accept" -H "authorization: Bearer $AGENT_TOKEN" | cat

echo "[5/9] Agent submission"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/submission" -H 'content-type: application/json' -H "authorization: Bearer $AGENT_TOKEN" -d '{"proof":{"type":"git_commit","value":"abc123"},"notes":"work completed"}' | cat

echo "[6/9] Human review accept"
curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/review" -H 'content-type: application/json' -H "cookie: $HUMAN_COOKIE" -d '{"decision":"accepted","rating":5,"comment":"Looks good"}' | cat

echo "[7/9] Release escrow (expect signature_required)"
RELEASE=$(curl -sS -X POST "$BASE_URL/api/jobs/$JOB_ID/release" -H "cookie: $HUMAN_COOKIE")
REL_SIGN_URL=$(echo "$RELEASE" | parse_json "escrowTx.signUrl")
echo "$RELEASE"
echo "Open and sign in Xaman: $REL_SIGN_URL"
read -r -p "Press enter after signing release..."

echo "[8/9] Confirm release status"
curl -sS "$BASE_URL/api/jobs/$JOB_ID/release-status" -H "cookie: $HUMAN_COOKIE" | cat

echo "[9/9] Verify completed job"
curl -sS "$BASE_URL/api/jobs?scope=mine" -H "cookie: $HUMAN_COOKIE" | cat
