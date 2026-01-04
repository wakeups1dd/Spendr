#!/bin/bash
# Test Script for parse-sms Edge Function (Linux/Mac)
# This script tests the deployed Edge Function with sample SMS messages

PROJECT_REF="gwrcmbuovmuzjczolfxk"
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/parse-sms"

# Get anon key from .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$ANON_KEY" ]; then
    echo "❌ Error: Could not find VITE_SUPABASE_ANON_KEY in .env file"
    exit 1
fi

echo "🧪 Testing parse-sms Edge Function"
echo "Function URL: $FUNCTION_URL"
echo ""

# Test function
test_sms() {
    local name="$1"
    local sms="$2"
    local expected_type="$3"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test: $name"
    echo "SMS: $sms"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"smsText\": \"$sms\", \"userId\": \"test-user-id\"}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        success=$(echo "$body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            amount=$(echo "$body" | jq -r '.data.amount')
            type=$(echo "$body" | jq -r '.data.type')
            merchant=$(echo "$body" | jq -r '.data.merchant')
            category=$(echo "$body" | jq -r '.data.category')
            confidence=$(echo "$body" | jq -r '.data.confidence')
            bank=$(echo "$body" | jq -r '.data.metadata.bankName')
            date=$(echo "$body" | jq -r '.data.date')
            
            echo "✅ Success!"
            echo "   Amount: Rs. $amount"
            echo "   Type: $type"
            echo "   Merchant: $merchant"
            echo "   Category: $category"
            echo "   Confidence: $(echo "$confidence * 100" | bc)%"
            echo "   Bank: $bank"
            echo "   Date: $date"
            
            if [ "$type" = "$expected_type" ]; then
                return 0
            else
                echo "   ⚠️  Warning: Expected type '$expected_type' but got '$type'"
                return 1
            fi
        else
            error=$(echo "$body" | jq -r '.error')
            echo "❌ Failed: $error"
            return 1
        fi
    else
        echo "❌ Error: HTTP $http_code"
        echo "$body" | jq -r '.error' 2>/dev/null || echo "$body"
        return 1
    fi
}

# Run tests
SUCCESS=0
FAIL=0

test_sms "HDFC Bank Debit" "Rs.1,234.56 debited from A/c XX1234 on 15-Jan-24 by NEFT UPI/SWIGGY. Avl Bal: Rs.50,000.00" "expense"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

test_sms "ICICI Bank Credit" "INR 5,000.00 credited to A/c XX5678 on 20-Jan-24. Ref No:123456. Avl Bal:INR 55,000.00" "income"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

test_sms "SBI UPI Payment" "A/c XX9012 debited by Rs.999.00 on 15-Jan-24. UPI/PAYTM. Avl Bal Rs.40,000.00" "expense"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

test_sms "Axis Bank Payment" "Rs.2,500.00 paid to AMAZON on 20-Jan-24. Avl Bal Rs.30,000.00" "expense"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

test_sms "Generic Debit" "Rs.500.00 debited from your account on 25-Jan-24" "expense"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

test_sms "Generic Credit" "INR 10,000.00 credited to your account on 01-Feb-24. Salary payment." "income"
[ $? -eq 0 ] && ((SUCCESS++)) || ((FAIL++))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Summary"
echo "   Total Tests: 6"
echo "   ✅ Passed: $SUCCESS"
echo "   ❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed! Your function is working correctly."
    exit 0
else
    echo "⚠️  Some tests failed. Check the error messages above."
    exit 1
fi


