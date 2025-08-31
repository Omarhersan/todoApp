#!/bin/bash

# Test script for external API auto-enhancement
# This script tests creating a task via WhatsApp/external API and verifies enhancement

echo "Testing External API Auto-Enhancement..."

# Configuration
API_KEY="${N8N_API_KEY:-test_key_123}"
USER_PHONE="1234567890"
BASE_URL="http://localhost:3001"

echo "Using API Key: $API_KEY"
echo "User Phone: $USER_PHONE"
echo "Base URL: $BASE_URL"

# Test 1: Create a task via external API
echo -e "\n1. Creating task via external API..."

RESPONSE=$(curl -s -X POST "$BASE_URL/api/external/todos" \
  -H "Authorization: Bearer $API_KEY" \
  -H "x-call-from: n8n" \
  -H "x-user-phone: $USER_PHONE" \
  -H "Content-Type: application/json" \
  -d '{"title": "buy groceries for dinner", "description": "Need to get ingredients for tonight"}')

echo "Response: $RESPONSE"

# Extract task ID from response (assuming JSON format)
TASK_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -n "$TASK_ID" ]; then
    echo "Task created with ID: $TASK_ID"
    
    # Wait a moment for enhancement to process
    echo -e "\n2. Waiting 5 seconds for enhancement to complete..."
    sleep 5
    
    # Test 2: Check if task was enhanced
    echo -e "\n3. Checking enhancement status..."
    
    ENHANCED_TASK=$(curl -s -X GET "$BASE_URL/api/external/todos/$TASK_ID" \
      -H "Authorization: Bearer $API_KEY" \
      -H "x-call-from: n8n" \
      -H "x-user-phone: $USER_PHONE")
    
    echo "Enhanced task: $ENHANCED_TASK"
    
    # Check if enhanced_title exists
    if echo "$ENHANCED_TASK" | grep -q "enhanced_title"; then
        echo -e "\n✅ SUCCESS: Task was auto-enhanced via external API!"
        echo "Enhancement detected in response."
    else
        echo -e "\n⚠️  WARNING: Task may not be enhanced yet, or enhancement failed."
        echo "Check server logs for enhancement status."
    fi
else
    echo -e "\n❌ ERROR: Failed to create task or extract task ID"
    echo "Response: $RESPONSE"
fi

echo -e "\nTest completed."
