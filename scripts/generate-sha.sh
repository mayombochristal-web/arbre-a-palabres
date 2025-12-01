#!/bin/bash

# Script pour générer les clés SHA-1 et SHA-256 pour Android
# Usage: ./scripts/generate-sha.sh [keystore-path] [alias]

set -e

# Default values
KEYSTORE_PATH="${1:-arbre-palabres.keystore}"
ALIAS="${2:-arbre-palabres}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Generating SHA keys for Android...${NC}"
echo ""

# Check if keystore exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}Keystore not found. Creating new keystore...${NC}"
    echo ""
    
    keytool -genkey -v \
        -keystore "$KEYSTORE_PATH" \
        -alias "$ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000
    
    echo ""
    echo -e "${GREEN}Keystore created successfully!${NC}"
fi

echo ""
echo -e "${GREEN}Extracting SHA-1 and SHA-256...${NC}"
echo ""

# Extract SHA-1
echo "SHA-1:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$ALIAS" | grep SHA1 | head -1

echo ""

# Extract SHA-256
echo "SHA-256:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$ALIAS" | grep SHA256 | head -1

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the SHA-1 fingerprint above"
echo "2. Go to Firebase Console > Project Settings"
echo "3. Add Android app with package name: com.arbreapala bres.app"
echo "4. Paste the SHA-1 fingerprint"
echo "5. Download google-services.json"
echo "6. Place it in android/app/google-services.json"
