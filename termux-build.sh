#!/bin/bash

# ========================================
# בניית APK עם Termux + GitHub Actions
# ========================================

# ========================================
# 🔧 הגדרות - ערוך את הערכים האלה!
# ========================================

GITHUB_USER="YOUR_GITHUB_USERNAME"          # למשל: alonharazi3-web
GITHUB_EMAIL="YOUR_EMAIL@gmail.com"         # המייל שלך
GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"          # הדבק כאן את הטוקן מ-GitHub!
REPO_NAME="feedback-app"                     # שם ה-repository
APP_NAME="Feedback Workshop"                 # שם האפליקציה
PACKAGE_NAME="com.feedback.app"              # Package name (com.yourname.appname)

# ========================================
# ⚙️ התקנה והכנה
# ========================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 בונה APK עם Cordova + GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 [1/10] מתקין חבילות נדרשות..."
pkg update -y > /dev/null 2>&1
pkg install git nodejs-lts -y > /dev/null 2>&1

echo "🔧 [2/10] מגדיר Git..."
git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"

echo "📱 [3/10] מתקין Cordova..."
npm install -g cordova > /dev/null 2>&1

# ========================================
# 📂 מציאת קבצי האפליקציה
# ========================================

echo "📂 [4/10] מחפש קבצי אפליקציה..."

# נתיבים אפשריים
PATHS=(
    "/storage/emulated/0/Download/feedback-app-CORDOVA-WITH-PERMISSIONS"
    "/storage/emulated/0/Download/cordova-project"
    "~/storage/downloads/feedback-app-CORDOVA-WITH-PERMISSIONS"
)

APP_SOURCE=""
for path in "${PATHS[@]}"; do
    if [ -d "$path" ]; then
        APP_SOURCE="$path"
        echo "   ✅ מצאתי: $path"
        break
    fi
done

if [ -z "$APP_SOURCE" ]; then
    echo "   ⚠️  לא מצאתי אוטומטית"
    echo ""
    echo "   אנא הזן את הנתיב המלא לתיקיית האפליקציה:"
    echo "   (לדוגמה: /storage/emulated/0/Download/MyApp)"
    echo ""
    read -p "   נתיב: " APP_SOURCE
    
    if [ ! -d "$APP_SOURCE" ]; then
        echo "   ❌ תיקייה לא קיימת: $APP_SOURCE"
        exit 1
    fi
fi

echo "   📍 משתמש בקבצים מ: $APP_SOURCE"
echo ""

# ========================================
# 🏗️ יצירת פרויקט Cordova
# ========================================

echo "🏗️  [5/10] יוצר פרויקט Cordova..."
cd ~
rm -rf "$REPO_NAME" 2>/dev/null
cordova create "$REPO_NAME" "$PACKAGE_NAME" "$APP_NAME" > /dev/null 2>&1
cd "$REPO_NAME"

# ========================================
# 📋 העתקת קבצים
# ========================================

echo "📋 [6/10] מעתיק קבצי אפליקציה..."

if [ -d "$APP_SOURCE/www" ]; then
    rm -rf www/*
    cp -r "$APP_SOURCE/www/"* www/
else
    rm -rf www/*
    cp -r "$APP_SOURCE/"* www/
fi

# ========================================
# 🤖 הוספת פלטפורמה
# ========================================

echo "🤖 [7/10] מוסיף פלטפורמת Android..."
cordova platform add android --save > /dev/null 2>&1

# ========================================
# ⚙️ יצירת GitHub Actions Workflow
# ========================================

echo "⚙️  [8/10] יוצר workflow לבניה אוטומטית..."
mkdir -p .github/workflows

cat > .github/workflows/build-android.yml << 'WORKFLOW_EOF'
name: Build Android APK

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
    
    - name: Accept licenses
      run: yes | sdkmanager --licenses || true
    
    - name: Install Cordova
      run: npm install -g cordova@latest
    
    - name: Add Android platform
      run: cordova platform add android@latest
    
    - name: Install plugins
      run: |
        cordova plugin add cordova-plugin-file
        cordova plugin add cordova-plugin-filechooser
        cordova plugin add cordova-plugin-camera
        cordova plugin add cordova-plugin-android-permissions
        cordova plugin add cordova-plugin-media-capture
        cordova plugin add cordova-plugin-whitelist
        cordova plugin add cordova-plugin-statusbar
        cordova plugin add cordova-plugin-dialogs
        cordova plugin add cordova-plugin-device
    
    - name: Build APK
      run: cordova build android --debug
    
    - name: Prepare outputs
      run: |
        mkdir -p outputs
        find platforms/android/app/build/outputs/apk/debug -name "*.apk" -exec cp {} outputs/app-debug.apk \;
        ls -lh outputs/
    
    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: feedback-app-debug
        path: outputs/app-debug.apk
        if-no-files-found: error
WORKFLOW_EOF

# ========================================
# 🚫 יצירת .gitignore
# ========================================

cat > .gitignore << 'GITIGNORE_EOF'
node_modules/
platforms/
plugins/
*.apk
*.aab
.DS_Store
Thumbs.db
GITIGNORE_EOF

# ========================================
# 🔗 Git Setup
# ========================================

echo "🔗 [9/10] מאתחל Git repository..."
git init > /dev/null 2>&1
git add . > /dev/null 2>&1
git commit -m "Initial Cordova project with permissions" > /dev/null 2>&1
git branch -M main > /dev/null 2>&1

# ========================================
# ☁️ יצירת Repository + Upload
# ========================================

echo "☁️  [10/10] מעלה ל-GitHub..."

# יצירת repository
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Feedback Workshop App\",\"private\":false}" > /dev/null 2>&1

sleep 2

# Upload
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git" > /dev/null 2>&1
git push -u origin main > /dev/null 2>&1

# ========================================
# ✅ סיום
# ========================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ✅ ✅  הכל מוכן!  ✅ ✅ ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 GitHub Actions בונה את ה-APK עכשיו!"
echo ""
echo "🔗 צפה בבנייה כאן:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME/actions"
echo ""
echo "⏱️  זמן בנייה: ~5-10 דקות"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 אחרי שהבנייה מסתיימת:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   1. לחץ על הבנייה האחרונה (✅ ירוק)"
echo "   2. גלול למטה ל-'Artifacts'"
echo "   3. הורד 'feedback-app-debug'"
echo "   4. חלץ את ה-APK"
echo "   5. התקן במכשיר"
echo "   6. הרשאות יתבקשו אוטומטית! ✨"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 עדכונים עתידיים (3 פקודות):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   cd ~/$REPO_NAME"
echo "   cp -r [קבצים חדשים] www/"
echo "   git add . && git commit -m 'עדכון' && git push"
echo ""
echo "   (GitHub Actions יבנה אוטומטית!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
