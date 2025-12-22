#!/bin/bash
# Test all jq expressions from workflow files

echo "Testing jq expressions..."
errors=0

# Test 1: opencode.yml line 202
echo -n "Test 1 (opencode.yml:202): "
echo '[]' | jq -r --arg issue_pattern "Issue #17:" '[.[] | select(.title | startswith($issue_pattern))] | .[0].id // empty' && echo "✅" || { echo "❌"; ((errors++)); }

# Test 2: opencode.yml line 207
echo -n "Test 2 (opencode.yml:207): "
echo '[{"status":"open","parent":"epic1","dependencies":[],"blocked_by":[]}]' | jq --arg epic_id "epic1" '[.[] | select(.status == "open" and (.dependencies // [] | contains([$epic_id]) | not) and (.blocked_by // [] | length == 0) and ((.parent // empty) == $epic_id))]' > /dev/null && echo "✅" || { echo "❌"; ((errors++)); }

# Test 3: opencode-workers-v2.yml line 97 (same as test 2)
echo -n "Test 3 (workers:97): "
echo '[{"status":"open","parent":"epic1","dependencies":[],"blocked_by":[]}]' | jq --arg epic_id "epic1" '[.[] | select(.status == "open" and (.dependencies // [] | contains([$epic_id]) | not) and (.blocked_by // [] | length == 0) and ((.parent // empty) == $epic_id))]' > /dev/null && echo "✅" || { echo "❌"; ((errors++)); }

# Test 4: opencode-workers-v2.yml line 547
echo -n "Test 4 (workers:547): "
echo '[{"status":"open","dependencies":[],"blocked_by":[]}]' | jq '[.[] | select(.status == "open" and (.dependencies // [] | length == 0) and (.blocked_by // [] | length == 0))] | length' > /dev/null && echo "✅" || { echo "❌"; ((errors++)); }

# Test 5: opencode-workers-v2.yml line 549
echo -n "Test 5 (workers:549): "
echo '[{"status":"open","dependencies":[1],"blocked_by":[2]}]' | jq '[.[] | select(.status == "open" and ((.dependencies // [] | length > 0) or (.blocked_by // [] | length > 0)))] | length' > /dev/null && echo "✅" || { echo "❌"; ((errors++)); }

# Test 6: opencode-workers-v2.yml line 630 (same as test 2)
echo -n "Test 6 (workers:630): "
echo '[{"status":"open","parent":"epic1","dependencies":[],"blocked_by":[]}]' | jq --arg epic_id "epic1" '[.[] | select(.status == "open" and (.dependencies // [] | contains([$epic_id]) | not) and (.blocked_by // [] | length == 0) and ((.parent // empty) == $epic_id))]' > /dev/null && echo "✅" || { echo "❌"; ((errors++)); }

echo ""
if [ $errors -eq 0 ]; then
  echo "🎉 All jq expressions are valid!"
  exit 0
else
  echo "❌ Found $errors invalid jq expression(s)"
  exit 1
fi
