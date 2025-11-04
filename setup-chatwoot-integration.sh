#!/bin/bash

# Complete Setup Script for Google OAuth Token API
# This script will set up everything needed for the Chatwoot integration

set -e  # Exit on error

PSQL_PATH="/Applications/Postgres.app/Contents/Versions/17/bin/psql"
DB_URL="postgresql://lucascc@localhost:5432/formulario_secretaria"

echo "🚀 Google OAuth Token API - Complete Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is available
if [ ! -f "$PSQL_PATH" ]; then
    echo "❌ PostgreSQL not found at $PSQL_PATH"
    echo "Please update PSQL_PATH in this script"
    exit 1
fi

# Step 1: Run migration
echo "📦 Step 1: Running database migration..."
$PSQL_PATH "$DB_URL" -f database/migration_add_chatwoot_account_id.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""

# Step 2: Verify table structure
echo "🔍 Step 2: Verifying table structure..."
$PSQL_PATH "$DB_URL" -c "\d clients" | grep chatwoot_account_id

if [ $? -eq 0 ]; then
    echo "✅ Column chatwoot_account_id confirmed"
else
    echo "❌ Column not found"
    exit 1
fi

echo ""

# Step 3: Check if server dependencies are installed
echo "📚 Step 3: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Step 4: Test server startup
echo "🧪 Step 4: Testing server startup..."
npm run server > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 5

# Test health endpoint
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health | grep -o "ok" || echo "failed")

if [ "$HEALTH_CHECK" = "ok" ]; then
    echo "✅ Server is running correctly"
else
    echo "❌ Server health check failed"
    cat /tmp/server_test.log
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

kill $SERVER_PID 2>/dev/null || true
sleep 2

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "=========================================="
echo "📋 Next Steps:"
echo "=========================================="
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Access Admin Panel:"
echo "   http://localhost:5173/?admin=true"
echo ""
echo "3. Create or edit a client and add Chatwoot Account ID"
echo ""
echo "4. Test the endpoint:"
echo "   curl -X POST http://localhost:3001/api/oauth/google-token-chatwoot \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"chatwootAccountId\": \"YOUR_ID\"}'"
echo ""
echo "=========================================="
echo "📚 Documentation:"
echo "=========================================="
echo ""
echo "- API Guide: N8N_GOOGLE_TOKEN_API.md"
echo "- Implementation: IMPLEMENTATION_CHATWOOT_TOKEN.md"
echo "- Test Results: TEST_RESULTS.md"
echo ""
echo "🎉 Ready to integrate with n8n!"
echo ""
