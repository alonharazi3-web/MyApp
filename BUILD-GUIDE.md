# 🚀 מדריך בניית APK עם הרשאות - Cordova

## 📋 הבעיה שנפתרה:

בגרסה הקודמת, האפליקציה **לא ביקשה הרשאות** כי:
1. ❌ PWA טהור אין לו Native Code
2. ❌ WebView לא יכול לבקש הרשאות Android
3. ❌ config.xml לבד לא עושה כלום

## ✅ הפתרון - Cordova עם Native Plugins:

עכשיו האפליקציה בנויה עם **Apache Cordova** שמוסיף:
- ✅ קוד Java/Kotlin Native
- ✅ בקשת הרשאות בזמן ריצה
- ✅ תמיכה ב-Android 13+ (Samsung A55)

---

## 🔧 אופציה 1: בניה עם GitHub Actions (קל ומהיר!)

### שלב 1: העלה לGitHub
```bash
# צור repository חדש ב-GitHub
# העלה את כל התיקיות:
git init
git add .
git commit -m "Initial commit with Cordova"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/feedback-app.git
git push -u origin main
```

### שלב 2: בנה APK אוטומטית
1. לך ל-**Actions** tab ב-GitHub
2. הריצה תתחיל אוטומטית
3. אחרי ~5-10 דקות - הורד APK מ-**Artifacts**

### שלב 3: התקן
1. הורד `feedback-app-debug.apk`
2. התקן במכשיר
3. **הרשאות יתבקשו אוטומטית!** ✅

---

## 🔧 אופציה 2: בניה מקומית (למתקדמים)

### דרישות:
- Node.js 18+
- Java JDK 17
- Android SDK
- Gradle

### התקנה:
```bash
# התקן Cordova
npm install -g cordova

# התקן dependencies
npm install

# הוסף פלטפורמת Android
cordova platform add android

# התקן plugins
npm run install:plugins
```

### בניה:
```bash
# Debug APK
cordova build android --debug

# Release APK (לא חתום)
cordova build android --release

# הרצה ישירה למכשיר מחובר
cordova run android
```

### מיקום ה-APK:
```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔐 הרשאות שהאפליקציה מבקשת:

### 1. אחסון (Storage)
**Android 12 ומטה:**
- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`

**Android 13+ (Samsung A55):**
- `READ_MEDIA_IMAGES`
- `READ_MEDIA_VIDEO`
- `READ_MEDIA_AUDIO`

### 2. מצלמה (Camera)
- `CAMERA`

### 3. אינטרנט (אופציונלי)
- `INTERNET`
- `ACCESS_NETWORK_STATE`

---

## 📱 איך ההרשאות עובדות:

### בפעם הראשונה שפותחים את האפליקציה:

1. **Cordova מאתחל** (`deviceready` event)
2. **Permissions Manager מתעורר**
3. **בודק הרשאות קיימות**
4. **מבקש הרשאות חסרות**
5. **משתמש מאשר/דוחה**

### הקוד:
```javascript
// בקובץ js/permissions.js
document.addEventListener('deviceready', async function() {
    window.permissionsManager = new PermissionsManager();
    await window.permissionsManager.requestStoragePermissions();
});
```

---

## 🧪 בדיקת הרשאות:

### אחרי התקנה:
1. **הגדרות** → **אפליקציות** → **Feedback Workshop**
2. לחץ על **הרשאות**
3. ודא:
   - ✅ **קבצים ומדיה** מאושר
   - ✅ **מצלמה** מאושר

### במצב Debug:
פתח Chrome DevTools:
```
chrome://inspect
```
בקונסול תראה:
```
📱 Cordova ready! Initializing permissions...
📁 מבקש הרשאות אחסון...
✅ הרשאות אחסון ניתנו!
```

---

## 🐛 פתרון בעיות:

### בעיה: "App not installed" / "Package appears to be corrupt"
**פתרון:** הסר APK קודם לפני התקנה חדשה

### בעיה: הרשאות לא מתבקשות
**בדוק:**
1. ✅ התקנת מ-APK (לא דפדפן)
2. ✅ Cordova plugins מותקנים
3. ✅ `cordova.js` טוען ראשון

### בעיה: "cordova is not defined"
**פתרון:** ודא ש-`cordova.js` בראש index.html

### בעיה: שמירת קבצים עדיין לא עובדת
**בדוק:**
1. ✅ הרשאות ניתנו בהגדרות
2. ✅ אין שגיאות בקונסול
3. ✅ נסה שיטות שמירה שונות

---

## 📂 מבנה הפרויקט:

```
feedback-app/
├── config.xml                    # Cordova config + plugins
├── package.json                  # NPM dependencies
├── .github/
│   └── workflows/
│       └── build-android.yml     # GitHub Actions
├── www/                          # אפליקציה
│   ├── index.html               # + cordova.js
│   ├── js/
│   │   ├── permissions.js       # NEW! Permissions manager
│   │   ├── app.js
│   │   ├── export.js
│   │   └── ...
│   ├── css/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── ...
└── platforms/                    # נוצר בבנייה
    └── android/                  # קוד Android Native
```

---

## 🎯 Plugins שמותקנים:

1. **cordova-plugin-file** - שמירת קבצים
2. **cordova-plugin-filechooser** - בחירת קבצים
3. **cordova-plugin-camera** - צילום
4. **cordova-plugin-android-permissions** - בקשת הרשאות ⭐
5. **cordova-plugin-media-capture** - הקלטה
6. **cordova-plugin-whitelist** - אבטחה
7. **cordova-plugin-statusbar** - status bar
8. **cordova-plugin-dialogs** - התראות
9. **cordova-plugin-device** - מידע מכשיר

---

## 🔥 שינויים מהגרסה הקודמת:

### index.html:
```html
<!-- לפני -->
<script src="FileSaver.min.js"></script>
<script type="module" src="js/app.js"></script>

<!-- אחרי -->
<script src="cordova.js"></script>              ← NEW!
<script src="js/permissions.js"></script>       ← NEW!
<script src="FileSaver.min.js"></script>
<script type="module" src="js/app.js"></script>
```

### קבצים חדשים:
- ✅ `config.xml` - Cordova configuration
- ✅ `package.json` - Dependencies
- ✅ `www/js/permissions.js` - Permissions manager
- ✅ `.github/workflows/build-android.yml` - Auto build

---

## 💡 טיפים:

### 1. בדיקה מהירה - דפדפן
```bash
# הרץ שרת מקומי
npx http-server www -p 8080
# פתח בדפדפן: http://localhost:8080
```
**שים לב:** הרשאות לא יעבדו בדפדפן, רק ב-APK!

### 2. Debug על מכשיר
```bash
# חבר מכשיר USB + Developer Mode
cordova run android

# פתח DevTools
chrome://inspect
```

### 3. שחרור (Release) חתום
צריך keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

---

## 📞 תמיכה:

אם יש בעיות:
1. בדוק Console ב-Chrome DevTools
2. בדוק הרשאות בהגדרות
3. וודא ש-Cordova plugins מותקנים:
   ```bash
   cordova plugin list
   ```
4. בנה מחדש:
   ```bash
   cordova clean
   cordova build android
   ```

---

## ✅ checklist לפני השקה:

- [ ] Build APK מצליח
- [ ] APK מתקין על Samsung A55
- [ ] הרשאות מתבקשות בפתיחה ראשונה
- [ ] הרשאות מופיעות בהגדרות
- [ ] שמירת JSON עובדת
- [ ] שמירת CSV עובדת (עברית תקינה)
- [ ] מצלמה עובדת (אם צריך)
- [ ] כל התרגילים פועלים
- [ ] יומינט עובד
- [ ] Zoom במכתב עובד

---

**זה אמור לפתור את בעיית ההרשאות לגמרי! 🎉**
