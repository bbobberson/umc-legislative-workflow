#!/bin/bash

echo "🔥 Pre-warming pages for demo..."

# Get base URL (default to localhost:3000)
BASE_URL=${1:-"http://localhost:3000"}

echo "Using base URL: $BASE_URL"

# Warm main pages
echo "Warming main pages..."
curl -s -o /dev/null "$BASE_URL/" && echo "✓ Home page"
curl -s -o /dev/null "$BASE_URL/submit" && echo "✓ Submit page" 
curl -s -o /dev/null "$BASE_URL/secretary" && echo "✓ Secretary page"
curl -s -o /dev/null "$BASE_URL/recorder" && echo "✓ Recorder page"

# Get sample petition ID
echo "Getting sample data..."
PETITION_ID=$(curl -s "$BASE_URL/api/petitions" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PETITION_ID" ]; then
    echo "✓ Found petition ID: $PETITION_ID"
    
    # Warm dynamic pages with sample data
    curl -s -o /dev/null "$BASE_URL/recorder/vote/$PETITION_ID" && echo "✓ Vote recording page"
    curl -s -o /dev/null "$BASE_URL/secretary/petition/$PETITION_ID" && echo "✓ Secretary petition detail page"
    
    # Get committee vote ID and warm approve page
    VOTE_ID=$(curl -s "$BASE_URL/api/committee-votes" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ ! -z "$VOTE_ID" ]; then
        curl -s -o /dev/null "$BASE_URL/recorder/approve/$VOTE_ID" && echo "✓ Approval page"
    fi
else
    echo "⚠️ No petition data found - some pages won't be warmed"
fi

echo ""
echo "🚀 All pages pre-warmed! Demo should now be fast."
echo ""
echo "Pro tip: Run this script before every demo to ensure fast page loads."