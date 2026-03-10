#!/usr/bin/env bash
set -e

standard-version "$@"
tag=$(git describe --tags --abbrev=0)

npm publish || {
	echo "Publish failed. Reverting release commit and tag."
	git reset --hard HEAD~1
	git tag -d "$tag"
	exit 1
}
