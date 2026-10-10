#!/bin/bash
# PicklePlay Mobile Runner for Expo Go
echo "=========================================="
echo "    PICKLEPLAY EXPO GO RUNNER             "
echo "=========================================="
echo ""

# Ensure we are in the mobile directory
cd "$(dirname "$0")/mobile" || exit 1

# Check if node_modules exists, install if needed
if [ ! -d "node_modules" ]; then
  echo "Installing Expo mobile dependencies (first time setup)..."
  npm install --legacy-peer-deps
fi

echo ""
echo "Starting Expo server..."
echo "Scan the QR code below using the Expo Go app on your phone!"
echo ""

npx expo start
