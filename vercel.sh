#!/bin/bash

# Only build if commit message contains "need deploy"
if echo "$VERCEL_GIT_COMMIT_MESSAGE" | grep -qi "need deploy"; then
  echo "✅ Build allowed (commit message contains 'need deploy')"
  exit 1   # non-zero -> DO build
else
  echo "🛑 Build skipped (no 'need deploy' in commit message)"
  exit 0   # zero -> skip build
fi
