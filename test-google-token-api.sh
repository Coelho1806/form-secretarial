#!/bin/bash

# Test script for Google OAuth Token API

API_URL="http://localhost:3001"
CHATWOOT_ACCOUNT_ID="12345"  # Change this to your actual Chatwoot Account ID

echo "🧪 Testing Google OAuth Token API"
echo "=================================="
echo ""

echo "📡 Testing endpoint: POST /api/oauth/google-token-chatwoot"
echo "Chatwoot Account ID: $CHATWOOT_ACCOUNT_ID"
echo ""

# Make the API request
RESPONSE=$(curl -s -X POST "$API_URL/api/oauth/google-token-chatwoot" \
  -H "Content-Type: application/json" \
  -d "{\"chatwootAccountId\": \"$CHATWOOT_ACCOUNT_ID\"}")

# Check if request was successful
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ SUCCESS!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.'
    
    # Extract and display token info
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    CLIENT_ID=$(echo "$RESPONSE" | jq -r '.clientId')
    EMAIL=$(echo "$RESPONSE" | jq -r '.email')
    
    echo ""
    echo "📝 Summary:"
    echo "  • Client ID: $CLIENT_ID"
    echo "  • Email: $EMAIL"
    echo "  • Token (first 50 chars): ${ACCESS_TOKEN:0:50}..."
    echo ""
    echo "🎯 Ready to use in n8n!"
    
else
    echo "❌ ERROR!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.'
    echo ""
    echo "💡 Troubleshooting:"
    echo "  1. Check if the Chatwoot Account ID exists in the database"
    echo "  2. Ensure the client has a Clerk User ID linked"
    echo "  3. Verify the user has connected their Google account"
fi

echo ""
echo "=================================="
