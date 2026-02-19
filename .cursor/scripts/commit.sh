#!/bin/bash
# Helper script to commit and push. Handles rebase when remote has changes.
# Usage: .cursor/scripts/commit.sh "commit message"

set -e

if [ -z "$1" ]; then
    echo "Error: Commit message required"
    exit 1
fi

BRANCH=$(git branch --show-current)
REMOTE="origin"

# Create a temporary file with the commit message
TEMP_MSG=$(mktemp)
echo "$1" > "$TEMP_MSG"

echo "Committing changes..."
git commit --no-verify -F "$TEMP_MSG"

# Clean up
rm "$TEMP_MSG"

# Check if there are remote changes and try to pull/rebase before pushing
echo "Checking for remote changes..."
git fetch "$REMOTE" "$BRANCH" || true

LOCAL=$(git rev-parse HEAD)
REMOTE_REF=$(git rev-parse "$REMOTE/$BRANCH" 2>/dev/null || echo "")

if [ -n "$REMOTE_REF" ] && [ "$LOCAL" != "$REMOTE_REF" ]; then
    echo "Remote branch has changes. Attempting to rebase..."

    if git rebase "$REMOTE/$BRANCH"; then
        echo "Rebase successful!"
    else
        echo "Rebase failed due to conflicts."
        echo "Please resolve conflicts and run:"
        echo "  git rebase --continue"
        echo "  git push $REMOTE $BRANCH"
        exit 1
    fi
else
    echo "Local branch is up to date with remote."
fi

# Push to remote
echo "Pushing to $REMOTE/$BRANCH..."
if git push "$REMOTE" "$BRANCH"; then
    echo "Successfully pushed to $REMOTE/$BRANCH"
else
    echo "Push failed. You may need to pull/rebase again or resolve conflicts."
    exit 1
fi
