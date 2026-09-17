#!/usr/bin/env bash

set -u

FAILED=0

pass() {
  echo "PASS — $1"
}

fail() {
  echo "FAIL — $1"
  FAILED=1
}

echo
echo "========== STUDYSETU AUTOMATED VERIFICATION =========="

# ------------------------------------------------------
# 1. SERVER / PROJECT
# ------------------------------------------------------

if [ -d "$HOME/studysetu" ]; then
  pass "StudySetu project directory"
else
  fail "StudySetu project directory"
fi

if [ -f "package.json" ]; then
  pass "package.json"
else
  fail "package.json"
fi

# ------------------------------------------------------
# 2. CORE PROJECT FILES
# ------------------------------------------------------

CORE_FILES=(
  "src/app/page.tsx"
  "src/app/layout.tsx"
  "src/data/exam-categories.ts"
  "src/data/exams.ts"
  "src/data/subjects.ts"
  "src/data/topics.ts"
  "src/data/study-material.ts"
)

for file in "${CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "Core file: $file"
  else
    fail "Missing core file: $file"
  fi
done

# ------------------------------------------------------
# 3. STUDY / TEST ENGINE
# ------------------------------------------------------

ENGINE_FILES=(
  "src/data/question-bank.ts"
  "src/data/content-engine.ts"
  "src/components/mcq-practice.tsx"
  "src/components/test-engine.tsx"
  "src/components/study-content-viewer.tsx"
)

for file in "${ENGINE_FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "Engine file: $file"
  else
    fail "Missing engine file: $file"
  fi
done

# ------------------------------------------------------
# 4. IMPORTANT ROUTES
# ------------------------------------------------------

ROUTES=(
  "src/app/study/page.tsx"
  "src/app/study/material/page.tsx"
  "src/app/study/material/mcq/page.tsx"
  "src/app/study/material/topic-test/page.tsx"
  "src/app/study/mcq-practice/page.tsx"
  "src/app/study/topic-test/page.tsx"
  "src/app/study/mock-test/page.tsx"
  "src/app/study/content/page.tsx"
)

for file in "${ROUTES[@]}"; do
  if [ -f "$file" ]; then
    pass "Route file: $file"
  else
    fail "Missing route: $file"
  fi
done

# ------------------------------------------------------
# 5. UPSC DATA CONNECTION
# ------------------------------------------------------

if grep -q "upsc-cse" src/data/exams.ts; then
  pass "UPSC exam definition"
else
  fail "UPSC exam definition"
fi

if grep -q "examId: 'upsc-cse'" src/data/subjects.ts; then
  pass "UPSC subject connection"
else
  fail "UPSC subject connection"
fi

if grep -q "subjectId: 'upsc-" src/data/topics.ts; then
  pass "UPSC topic connection"
else
  fail "UPSC topic connection"
fi

if grep -q "topicId: 'upsc-" src/data/study-material.ts; then
  pass "UPSC material connection"
else
  fail "UPSC material connection"
fi

if grep -q "examId: 'upsc-cse'" src/data/question-bank.ts; then
  pass "UPSC question-bank connection"
else
  fail "UPSC question-bank connection"
fi

# ------------------------------------------------------
# 6. EXISTING SSC REGRESSION PROTECTION
# ------------------------------------------------------

if grep -q "ssc-cgl" src/data/exams.ts; then
  pass "SSC exam preserved"
else
  fail "SSC exam missing"
fi

if grep -q "ssc-cgl-" src/data/subjects.ts; then
  pass "SSC subjects preserved"
else
  fail "SSC subjects missing"
fi

if grep -q "cgl-" src/data/topics.ts; then
  pass "SSC topics preserved"
else
  fail "SSC topics missing"
fi

# ------------------------------------------------------
# 7. TYPESCRIPT / PRODUCTION BUILD
# ------------------------------------------------------

echo
echo "========== BUILD VERIFICATION =========="

if npm run build >/tmp/studysetu-verify-build.log 2>&1; then
  pass "Production build"
else
  fail "Production build"
  echo
  echo "----- BUILD ERROR -----"
  tail -50 /tmp/studysetu-verify-build.log
fi

# ------------------------------------------------------
# 8. GIT INTEGRITY
# ------------------------------------------------------

echo
echo "========== GIT VERIFICATION =========="

if git diff --check; then
  pass "Git diff integrity"
else
  fail "Git diff integrity"
fi

if git remote get-url origin >/dev/null 2>&1; then
  pass "GitHub remote configured"
else
  fail "GitHub remote configured"
fi

# ------------------------------------------------------
# FINAL RESULT
# ------------------------------------------------------

echo

if [ "$FAILED" -eq 0 ]; then
  echo "=================================================="
  echo "CONFIRMED — ALL AUTOMATED CHECKS PASSED"
  echo "STUDYSETU DEVELOPMENT FRAMEWORK VERIFIED"
  echo "=================================================="
  exit 0
else
  echo "=================================================="
  echo "ERROR — AUTOMATED VERIFICATION FAILED"
  echo "DO NOT PUSH — FIX FAILED CHECKS FIRST"
  echo "=================================================="
  exit 1
fi
