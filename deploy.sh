#!/bin/bash
# Build and deploy DiabetesRx Tracker to https://diabetesrx.marc-tek.com
# Usage: ./deploy.sh
set -euo pipefail

REMOTE="marc-tek:/var/www/diabetesrx.marc-tek.com/"
LOCAL="dist/public/"

cd "$(dirname "$0")"

echo "==> Building..."
npm run build

echo "==> Syncing to ${REMOTE}"
rsync -az --delete --human-readable --itemize-changes "${LOCAL}" "${REMOTE}"

echo "==> Done: https://diabetesrx.marc-tek.com/"
