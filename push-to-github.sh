#!/bin/bash
#
# push-to-github.sh — stage everything, ask for a description, then commit & push.
#
# No credentials are stored here. When git asks for a password, use a GitHub
# Personal Access Token (PAT) — NOT your account password (GitHub disabled that
# for git in 2021). Create one at: https://github.com/settings/tokens
#
set -e
cd "$(dirname "$0")"

# 1. Make sure this is a git repo
if [ ! -d .git ]; then
  echo "Initializing a new git repository…"
  git init -q
  git branch -M main
fi

# 2. Make sure a commit identity exists (local fallback only)
git config user.name  >/dev/null 2>&1 || git config user.name  "DivAmok-Divine"
git config user.email >/dev/null 2>&1 || git config user.email "DivAmok-Divine@users.noreply.github.com"

# 3. Make sure an 'origin' remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No 'origin' remote is set yet."
  echo "Create an empty repo on GitHub first, then paste its URL below."
  echo "  e.g. https://github.com/DivAmok-Divine/divamok-grant-finder-app.git"
  read -r -p "GitHub repo URL: " repo_url
  [ -z "$repo_url" ] && { echo "Aborted — a remote URL is required."; exit 1; }
  git remote add origin "$repo_url"
fi

# 4. Ask for the push description (commit message)
echo ""
read -r -p "📝 Describe this push: " message
[ -z "$message" ] && { echo "Aborted — a description is required."; exit 1; }

# 5. Stage, commit, push
git add -A
git commit -m "$message" || echo "ℹ️  Nothing new to commit — pushing any existing commits."

branch="$(git rev-parse --abbrev-ref HEAD)"
echo "🚀 Pushing to origin/${branch}…"
git push -u origin "$branch"

echo "✅ Done."
