#!/usr/bin/env bash
set -e

# Ensure logged in to npm before creating release commit
if ! npm whoami &>/dev/null; then
	echo "Not logged in to npm. Run: npm login"
	npm login
fi

standard-version "$@"
tag=$(git describe --tags --abbrev=0)

npm publish || {
	echo "Publish failed. Reverting release commit and tag."
	git reset --hard HEAD~1
	git tag -d "$tag"
	exit 1
}
