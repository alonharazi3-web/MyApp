#!/data/data/com.termux/files/usr/bin/bash
set -e
GITHUB_USER="alonharazi3-web"
GITHUB_EMAIL="alonharazi3@gmail.com"
REPO_NAME="myapp"
BRANCH="main"
REPO_DIR="$HOME/myapp-repo"
GREEN='\033[0;32m';RED='\033[0;31m';CYAN='\033[0;36m';NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

echo -e "\n${CYAN}══════════════════════════════════${NC}"
echo -e "${CYAN}  Improv Workshop — Clean Deploy${NC}"
echo -e "${CYAN}══════════════════════════════════${NC}\n"

command -v git   >/dev/null 2>&1 || { info "Installing git...";   pkg install -y git;   }
command -v unzip >/dev/null 2>&1 || { info "Installing unzip..."; pkg install -y unzip; }

git config --global user.name  "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"
git config --global init.defaultBranch "$BRANCH"
git config --global credential.helper store
git config --global http.postBuffer 52428800
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 300

CRED_FILE="$HOME/.git-credentials"
if [ ! -f "$CRED_FILE" ] || ! grep -q "github.com" "$CRED_FILE" 2>/dev/null; then
  echo "  Need GitHub token. Go to: https://github.com/settings/tokens"
  read -p "  Paste ghp_... token: " GH_TOKEN
  [ -z "$GH_TOKEN" ] && err "No token provided."
  echo "https://${GITHUB_USER}:${GH_TOKEN}@github.com" > "$CRED_FILE"
  chmod 600 "$CRED_FILE"
  ok "Token saved"
fi

GH_TOKEN=$(grep "github.com" "$CRED_FILE" | head -1 | sed 's|https://[^:]*:\([^@]*\)@.*|\1|')
REMOTE_URL="https://${GITHUB_USER}:${GH_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

ZIP_PATH="$1"
if [ -z "$ZIP_PATH" ]; then
  ZIP_PATH=$(ls -t /sdcard/Download/MyApp-github*.zip 2>/dev/null | head -1)
  [ -z "$ZIP_PATH" ] && ZIP_PATH=$(ls -t ~/storage/downloads/MyApp-github*.zip 2>/dev/null | head -1)
  [ -z "$ZIP_PATH" ] && err "No MyApp-github zip found in Downloads"
  info "Found: $ZIP_PATH"
fi
[ -f "$ZIP_PATH" ] || err "File not found: $ZIP_PATH"

VERSION=$(unzip -p "$ZIP_PATH" "github-ready/config.xml" 2>/dev/null \
  | grep -o 'version="[^"]*"' | head -1 | sed 's/version="//;s/"//') || true
[ -z "$VERSION" ] && VERSION="unknown"
info "Version: $VERSION"

info "Cleaning old repo..."
rm -rf "$REPO_DIR"

info "Cloning fresh..."
git clone "$REMOTE_URL" "$REPO_DIR" || err "Clone failed! Check repo exists + token valid"
cd "$REPO_DIR"
ok "Repo cloned"

info "Wiping old files..."
find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name '.github' -exec rm -rf {} +
ok "Old files removed"

info "Extracting zip..."
unzip -o "$ZIP_PATH" -d /tmp/_myapp_extract > /dev/null
if [ -d "/tmp/_myapp_extract/github-ready" ]; then
  cp -r /tmp/_myapp_extract/github-ready/. "$REPO_DIR/"
else
  cp -r /tmp/_myapp_extract/. "$REPO_DIR/"
fi
rm -rf /tmp/_myapp_extract
ok "Files extracted"

git add -A
git status --short | head -20

git diff --cached --quiet 2>/dev/null && { info "No changes detected"; exit 0; }

COMMIT_MSG="clean deploy: v${VERSION} ($(date '+%Y-%m-%d %H:%M'))"
info "Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"
git push -u origin "$BRANCH"

echo -e "\n${GREEN}══════════════════════════════════${NC}"
echo -e "${GREEN}  Done! APK building on GitHub.${NC}"
echo -e "${GREEN}══════════════════════════════════${NC}"
echo "  Actions: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
echo ""
