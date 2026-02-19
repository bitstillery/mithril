#!/bin/bash
# Lint-staged for LLM-assisted commits. Uses package.json ts:* scripts only.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)

if [ -z "$TS_FILES" ]; then
    echo "No staged TypeScript files to lint"
    exit 0
fi

# Run package.json lint:ts (format + syntax + types)
bun run lint:ts

# Re-stage auto-fixed files
echo "$TS_FILES" | xargs -r git add 2>/dev/null || true
