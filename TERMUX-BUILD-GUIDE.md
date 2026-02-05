# 📱 בניית APK עם Termux + GitHub Actions - מדריך מלא

## 🎯 סקריפט אחד - מההתחלה ועד APK מוכן!

### מה אני צריך ממך:

1. **שם משתמש GitHub:** (למשל `alonharazi3-web`)
2. **מייל GitHub:** (למשל `alonharazi3@gmail.com`)
3. **שם ה-repository:** (למשל `feedback-app`)
4. **Personal Access Token:** (ניצור יחד)

---

## 🔐 שלב 0: יצירת Personal Access Token

### ב-GitHub (דפדפן):

1. לך ל: https://github.com/settings/tokens
2. לחץ **"Generate new token"** → **"Generate new token (classic)"**
3. תן שם: `Termux Build Token`
4. סמן: ✅ **repo** (כל האופציות)
5. לחץ **"Generate token"**
6. **העתק את הטוקן** (יראה כמו: `ghp_xxxxxxxxxxxx`)
7. **שמור אותו** - לא תוכל לראות אותו שוב!

---

## 🚀 שלב 1: הכנת Termux

פתח Termux והעתק את הסקריפט הזה **בשלמותו**:

```bash
#!/bin/bash

# ========================================
# הגדרות - שנה את הערכים האלה!
# ========================================

GITHUB_USER="alonharazi3-web"          # שם המשתמש שלך ב-GitHub
GITHUB_EMAIL="alonharazi3@gmail.com"   # המייל שלך
GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"     # הדבק את הטוקן כאן!
REPO_NAME="feedback-app"                # שם ה-repository
APP_NAME="Feedback Workshop"            # שם האפליקציה
PACKAGE_NAME="com.feedback.app"         # Package name

# ========================================
# התקנה והכנה
# ========================================

echo "📦 מתקין חבילות נדרשות..."
pkg update -y
pkg install git nodejs-lts -y

echo "🔧 מגדיר Git..."
git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"

echo "📱 מתקין Cordova..."
npm install -g cordova

# ========================================
# בדיקה איפה הקבצים נמצאים
# ========================================

echo ""
echo "📂 בדיקת מיקום קבצי האפליקציה..."
echo ""

# נתיבים אפשריים
PATHS=(
    "/storage/emulated/0/Download/feedback-app-CORDOVA-WITH-PERMISSIONS"
    "/storage/emulated/0/Download/cordova-project/www"
    "~/storage/downloads/feedback-app-CORDOVA-WITH-PERMISSIONS"
    "~/downloads/feedback-app-CORDOVA-WITH-PERMISSIONS"
)

APP_SOURCE=""
for path in "${PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ מצאתי: $path"
        APP_SOURCE="$path"
        break
    fi
done

if [ -z "$APP_SOURCE" ]; then
    echo "❌ לא מצאתי את תיקיית האפליקציה!"
    echo ""
    echo "אנא ספק את הנתיב המלא:"
    read -p "נתיב: " APP_SOURCE
fi

echo ""
echo "📍 משתמש בקבצים מ: $APP_SOURCE"
echo ""

# ========================================
# יצירת פרויקט Cordova
# ========================================

echo "🏗️ יוצר פרויקט Cordova..."
cd ~
rm -rf "$REPO_NAME"
cordova create "$REPO_NAME" "$PACKAGE_NAME" "$APP_NAME"
cd "$REPO_NAME"

# ========================================
# העתקת קבצים
# ========================================

echo "📋 מעתיק קבצי אפליקציה..."

# בדוק אם יש www/ בתיקייה שמצאנו
if [ -d "$APP_SOURCE/www" ]; then
    echo "מעתיק מ-www..."
    rm -rf www/*
    cp -r "$APP_SOURCE/www/"* www/
else
    echo "מעתיק את כל התיקייה..."
    rm -rf www/*
    cp -r "$APP_SOURCE/"* www/
fi

# ========================================
# הוספת פלטפורמה
# ========================================

echo "🤖 מוסיף פלטפורמת Android..."
cordova platform add android --save

# ========================================
# יצירת GitHub Actions Workflow
# ========================================

echo "⚙️ יוצר GitHub Actions workflow..."
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
    
    - name: Setup Java JDK
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
    
    - name: Accept Android licenses
      run: yes | sdkmanager --licenses || true
    
    - name: Install Cordova
      run: npm install -g cordova@latest
    
    - name: Install dependencies
      run: |
        if [ -f package.json ]; then
          npm install
        fi
    
    - name: Add Android platform
      run: cordova platform add android@latest
    
    - name: Install Cordova plugins
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
    
    - name: Build Debug APK
      run: cordova build android --debug
    
    - name: List outputs
      run: find platforms/android -name "*.apk" -type f -exec ls -lh {} \;
    
    - name: Prepare APK
      run: |
        mkdir -p outputs
        find platforms/android/app/build/outputs/apk/debug -name "*.apk" -exec cp {} outputs/feedback-app-debug.apk \;
    
    - name: Upload Debug APK
      uses: actions/upload-artifact@v4
      with:
        name: feedback-app-debug
        path: outputs/feedback-app-debug.apk
        if-no-files-found: error
WORKFLOW_EOF

# ========================================
# יצירת .gitignore
# ========================================

echo "🚫 יוצר .gitignore..."
cat > .gitignore << 'GITIGNORE_EOF'
node_modules/
platforms/
plugins/
*.apk
*.ipa
.DS_Store
Thumbs.db
GITIGNORE_EOF

# ========================================
# Git Setup
# ========================================

echo "🔗 מאתחל Git repository..."
git init
git add .
git commit -m "Initial Cordova project with permissions"
git branch -M main

# ========================================
# יצירת Repository ב-GitHub
# ========================================

echo ""
echo "📝 יוצר repository ב-GitHub..."

# צור repository דרך GitHub API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Feedback Workshop App with Cordova\",\"private\":false}"

echo ""
echo "⏳ ממתין 3 שניות..."
sleep 3

# ========================================
# Push לGitHub
# ========================================

echo "⬆️ מעלה ל-GitHub..."
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git push -u origin main

# ========================================
# סיום
# ========================================

echo ""
echo "✅ ✅ ✅ הכל מוכן! ✅ ✅ ✅"
echo ""
echo "📱 כעת GitHub Actions בונה את ה-APK אוטומטית!"
echo ""
echo "🔗 לך לכאן כדי לראות את הבנייה:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME/actions"
echo ""
echo "⏱️ הבנייה לוקחת בערך 5-10 דקות"
echo ""
echo "📥 אחרי שזה מסתיים:"
echo "   1. לחץ על הבנייה האחרונה"
echo "   2. גלול למטה ל-Artifacts"
echo "   3. הורד feedback-app-debug.apk"
echo "   4. התקן במכשיר"
echo "   5. הרשאות יתבקשו אוטומטית! ✨"
echo ""
echo "🔄 לעדכונים עתידיים:"
echo "   cd ~/$REPO_NAME"
echo "   cp -r [נתיב קבצים חדשים] www/"
echo "   git add ."
echo "   git commit -m 'עדכון'"
echo "   git push"
echo ""
```

---

## 📝 איך להשתמש בסקריפט:

### 1. ערוך את השורות 8-13:
```bash
GITHUB_USER="YOUR_USERNAME"           # שנה לשלך!
GITHUB_EMAIL="your@email.com"         # שנה לשלך!
GITHUB_TOKEN="ghp_YOUR_TOKEN"         # הדבק את הטוקן!
REPO_NAME="feedback-app"               # שם הרצוי
APP_NAME="Feedback Workshop"           # שם לאפליקציה
PACKAGE_NAME="com.feedback.app"        # Package name
```

### 2. שמור לקובץ:
```bash
# ב-Termux:
nano ~/build-app.sh
# הדבק את הסקריפט המעודכן
# Ctrl+O לשמור
# Ctrl+X לצאת
```

### 3. תן הרשאות הרצה:
```bash
chmod +x ~/build-app.sh
```

### 4. הרץ!
```bash
~/build-app.sh
```

---

## 🔄 עדכונים עתידיים (3 פקודות בלבד!):

```bash
cd ~/feedback-app
cp -r /storage/emulated/0/Download/NEW_FILES/* www/
git add . && git commit -m "עדכון" && git push
```

**זהו!** GitHub Actions יבנה אוטומטית! 🚀

---

## 🐛 פתרון בעיות:

### בעיה: "Permission denied"
```bash
termux-setup-storage
# אשר הרשאות
```

### בעיה: "Repository already exists"
```bash
# מחק repository קיים ב-GitHub דרך הדפדפן
# או שנה את REPO_NAME בסקריפט
```

### בעיה: "Authentication failed"
```bash
# בדוק שהטוקן תקין והדבקת אותו נכון
# ודא שיש לו הרשאות 'repo'
```

### בעיה: "cordova command not found"
```bash
npm install -g cordova
# המשך עם הסקריפט
```

---

## ✅ Checklist:

- [ ] יצרתי Personal Access Token ב-GitHub
- [ ] עדכנתי את הסקריפט עם הפרטים שלי
- [ ] שמרתי לקובץ ~/build-app.sh
- [ ] נתתי הרשאות: chmod +x ~/build-app.sh
- [ ] הרצתי: ~/build-app.sh
- [ ] הבנייה רצה ב-GitHub Actions
- [ ] הורדתי APK מ-Artifacts
- [ ] התקנתי במכשיר
- [ ] הרשאות התבקשו! ✨

---

**זה הכל! סקריפט אחד ואתה מקבל APK עובד עם הרשאות! 🎉**
