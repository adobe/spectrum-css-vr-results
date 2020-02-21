#!/bin/bash

set -e

BRANCH_TO_MERGE=$(echo ${GITHUB_REF} | sed -e "s/refs\/heads\///g")
REPO_FULLNAME=$(jq -r ".repository.full_name" "$GITHUB_EVENT_PATH")

if [[ -z "$GITHUB_TOKEN" ]]; then
	echo "Set the GITHUB_TOKEN env variable."
	exit 1
fi

git remote set-url origin https://x-access-token:$GITHUB_TOKEN@github.com/$REPO_FULLNAME.git

git config --global user.email "actions@github.com"
git config --global user.name "Github gh-pages branch Merge Action"

set -o xtrace

git fetch origin

git merge origin/$BRANCH_TO_MERGE --allow-unrelated-histories --no-edit

git push origin gh-pages

git push origin --delete $BRANCH_TO_MERGE