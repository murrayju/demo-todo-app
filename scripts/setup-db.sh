#!/usr/bin/env bash
set -euo pipefail

# Create a free-tier Tiger Data service for this app.
# Requires: tiger CLI installed and authenticated (tiger auth login)

SERVICE_NAME="test-fake-webapp"

echo "Creating Tiger Data service: ${SERVICE_NAME}..."
tiger service create \
  --name "${SERVICE_NAME}" \
  --addons time-series \
  --wait

# Get the service ID from the list
SERVICE_ID=$(tiger service list -o json | jq -r ".[] | select(.name == \"${SERVICE_NAME}\") | .service_id")

if [ -z "${SERVICE_ID}" ]; then
  echo "ERROR: Could not find service ID for ${SERVICE_NAME}"
  exit 1
fi

echo "Service created with ID: ${SERVICE_ID}"
echo "Fetching connection details..."

# Write connection env vars to .env
tiger service get "${SERVICE_ID}" -o env --with-password > .env

echo "Connection details written to .env"
echo ""
echo "Next steps:"
echo "  npm install"
echo "  npm run migrate"
echo "  npm run dev"
