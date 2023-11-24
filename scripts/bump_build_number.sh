#!/bin/bash
set -eu -o pipefail
cd "$(dirname "$0")"/..

log () { echo "[$(date +%Y-%m-%dT%H:%M:%S%Z)]" "$@"; }

log "Asserting that the workdir is clean"
if ! git diff --quiet; then
  log "Error, workdir is not clean: aborting" >&2
  exit 1
fi

log "Saving the currently checked out branch"
CURRENT_BRANCH=$(git branch --show-current)
trap "git checkout $CURRENT_BRANCH" EXIT

: ${BRANCH_TO_BUILD:=main}
LATEST_BUILD_NUMBER=$(./scripts/get_latest_build_number.sh)
BUILD_NUMBER=$(($LATEST_BUILD_NUMBER + 1))
GIT_LOCAL_BRANCH=bump-build-${BRANCH_TO_BUILD}-${BUILD_NUMBER}
log "Build number to use for the beta build: $BUILD_NUMBER"

log "Creating branch '${GIT_LOCAL_BRANCH}' based on branch '$BRANCH_TO_BUILD'"
git checkout $BRANCH_TO_BUILD
git pull
git checkout -b $GIT_LOCAL_BRANCH

log "Generating env file required by Fastlane..."
tee .env <<EOF
export INCREMENT_BUILD_NUMBER=true
export BUILD_NUMBER=${BUILD_NUMBER}
export COMMIT_CHANGES_TO_GIT=true
export BRANCH_TO_BUILD=${BRANCH_TO_BUILD}
export GIT_LOCAL_BRANCH=${GIT_LOCAL_BRANCH}
EOF

log "Running the fastlane build number bumper script"
(. .env && cd fastlane && bundle exec fastlane set_app_build_number)

# TODO push the ${GIT_LOCAL_BRANCH} branch, and create a PR for it
# TODO put the core-build-engineers as PR reviewers
git branch -l -a
