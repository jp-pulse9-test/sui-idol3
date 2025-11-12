#!/bin/bash

# Sui Move Contract Deployment Script

set -e

echo "🚀 Starting Sui Move contract deployment..."

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Error: sui CLI not found. Please install Sui CLI first."
    echo "Visit: https://docs.sui.io/build/install"
    exit 1
fi

# Check active address
echo "📍 Checking active address..."
ACTIVE_ADDRESS=$(sui client active-address)
echo "Active address: $ACTIVE_ADDRESS"

# Check balance
echo "💰 Checking SUI balance..."
sui client gas

# Ask for network confirmation
echo ""
read -p "Deploy to which network? (testnet/mainnet) [testnet]: " NETWORK
NETWORK=${NETWORK:-testnet}

if [ "$NETWORK" = "mainnet" ]; then
    read -p "⚠️  WARNING: Deploying to MAINNET. Are you sure? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Switch to correct network
echo "🌐 Switching to $NETWORK..."
sui client switch --env $NETWORK

# Build the Move package
echo "🔨 Building Move package..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy
echo "📦 Deploying package..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment successful!"

# Parse deployment output
PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.effects.created[] | select(.owner == "Immutable") | .reference.objectId')
PHOTOCARD_TYPE=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

echo ""
echo "📝 Deployment Information:"
echo "=========================="
echo "Package ID: $PACKAGE_ID"
echo "Network: $NETWORK"
echo ""

# Save to file
echo "💾 Saving deployment info..."
cat > deployed_addresses.json <<EOF
{
  "network": "$NETWORK",
  "packageId": "$PACKAGE_ID",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$ACTIVE_ADDRESS"
}
EOF

echo "✅ Deployment info saved to deployed_addresses.json"

# Create .env entry
echo ""
echo "📄 Add these to your .env file:"
echo "================================"
echo "VITE_SUI_PACKAGE_ID=$PACKAGE_ID"
echo "VITE_SUI_NETWORK=$NETWORK"
echo ""

echo "🎉 Deployment complete!"
