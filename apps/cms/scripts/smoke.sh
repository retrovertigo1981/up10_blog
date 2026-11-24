#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${UP10_API_URL:-https://api.up10.cl/wp-json/up10/v1}"

echo "== ping =="
curl -fsS "$BASE_URL/ping"
echo

echo "== home =="
curl -fsS "$BASE_URL/home" | head -c 1200
echo

echo "== categories =="
curl -fsS "$BASE_URL/categories" | head -c 800
echo
