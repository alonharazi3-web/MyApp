# 📱 Feedback Workshop App - אפליקציית משוב לסדנאות

אפליקציית Android מלאה לניהול משוב בסדנאות אימפרוביזציה, בנויה עם Apache Cordova.

## ✨ מה חדש בגרסה זו?

### 🔐 הרשאות עובדות!
- ✅ האפליקציה מבקשת הרשאות אוטומטית
- ✅ תמיכה מלאה ב-Android 13+ (Samsung A55)
- ✅ הרשאות אחסון, מצלמה, וקבצים
- ✅ Native Android code עם Cordova

### 📱 תכונות:
- ✅ 7 תרגילי אימפרוביזציה
- ✅ מעקב אחר 4 חניכים
- ✅ ייצוא JSON ו-CSV/Excel
- ✅ 12 שיטות שמירה שונות (כפתורי בדיקה)
- ✅ שמירת היסטוריה - חנויות ומלונות
- ✅ Zoom במכתב JPG
- ✅ עברית מלאה

---

## 🚀 התקנה מהירה

### אופציה 1: הורד APK מוכן (מומלץ)
1. לך ל-**Releases** או **Actions**
2. הורד `feedback-app-debug.apk`
3. התקן במכשיר
4. אשר הרשאות בפעם הראשונה ✅

### אופציה 2: בנה בעצמך
```bash
# התקן Cordova
npm install -g cordova

# התקן dependencies
npm install

# הוסף פלטפורמה
cordova platform add android

# בנה APK
cordova build android
```

ראה [BUILD-GUIDE.md](BUILD-GUIDE.md) להוראות מפורטות.

---

## 📋 דרישות מערכת

- **Android:** 7.0+ (API 24+)
- **מומלץ:** Android 13+ לתמיכה מלאה
- **נבדק על:** Samsung A55

---

## 🔐 הרשאות

האפליקציה מבקשת:
- 📁 **אחסון** - לשמירת קבצי JSON/CSV
- 📷 **מצלמה** - לצילום (שימוש עתידי)
- 🌐 **אינטרנט** - אופציונלי

**ההרשאות מתבקשות אוטומטית בפתיחה ראשונה!**

---

## 📖 מדריך שימוש

### התחלת עבודה:
1. **דף ניהול** - הזן שם הערכה, מעריך, וחניכים
2. **דף הערכה** - עבור על 7 התרגילים
3. **דף סיכום** - מלא ציונים ומשוב
4. **ייצוא** - שמור JSON/CSV

### 7 התרגילים:
1. **בלון** - דיאלוג עם בלון דמיוני
2. **טיח** - משימת הומינט ברחוב + חנות
3. **דולירה** - קריאת רגשות והבנת אנשים
4. **דויד** - אסטרטגיית משא ומתן
5. **לילה** - הומינט לילי + מלון
6. **מכתב** - כתיבת מכתב לפי הנחיות
7. **יומינט** - אתגרי רחוב + חדר מלון

---

## 🧪 בדיקת שיטות שמירה

בדף הניהול יש **12 כפתורי בדיקה**:

### JSON (6 שיטות):
- File System API (בחירת מיקום)
- Blob Download
- Data URI
- Window.open
- Temp Link
- מפל חכם (מומלץ)

### CSV (6 שיטות):
- File System API
- Blob Download
- Data URI
- Force Download
- iframe
- מפל חכם (מומלץ)

**לחץ על כפתור ובדוק אם הקובץ נשמר!**

---

## 🛠️ פיתוח

### מבנה הפרויקט:
```
├── config.xml              # Cordova config
├── package.json            # Dependencies
├── www/                    # קוד האפליקציה
│   ├── index.html
│   ├── js/
│   │   ├── permissions.js  # מנהל הרשאות
│   │   ├── app.js         # אתחול
│   │   ├── export.js      # ייצוא
│   │   └── ...
│   └── css/
└── platforms/              # קוד Native
    └── android/
```

### Scripts:
```bash
npm run build:android       # Build release
npm run build:android:debug # Build debug
npm run run:android         # Run on device
npm run install:plugins     # Install Cordova plugins
```

---

## 🐛 פתרון בעיות

### הרשאות לא מתבקשות?
1. ✅ ודא שהתקנת מ-APK (לא דפדפן)
2. ✅ בדוק Console: `chrome://inspect`
3. ✅ הסר והתקן מחדש

### קבצים לא נשמרים?
1. ✅ בדוק הרשאות: הגדרות → אפליקציות → הרשאות
2. ✅ נסה שיטות שמירה שונות בכפתורי בדיקה
3. ✅ בדוק Console לשגיאות

### יומינט לא עובד?
✅ תוקן! הוספנו `renderQuestion` method

### Zoom במכתב?
✅ תוקן! לחץ על התמונה לזום

---

## 📦 גודל APK

- **Debug:** ~20MB
- **Release (unsigned):** ~15MB
- **Release (signed + optimized):** ~10MB

---

## 🔄 עדכונים

### v1.0.0 (31 ינואר 2026)
- ✅ הוספת Cordova + Native plugins
- ✅ תיקון בעיית הרשאות
- ✅ תמיכה ב-Android 13+
- ✅ Zoom במכתב JPG
- ✅ תיקון יומינט
- ✅ 12 כפתורי בדיקה לשמירה
- ✅ מנהל הרשאות אוטומטי

---

## 📄 רישיון

MIT License - ראה LICENSE

---

## 💬 תמיכה

יש בעיה? פתח Issue או קרא את [BUILD-GUIDE.md](BUILD-GUIDE.md)

---

**נבנה עם ❤️ לסדנאות אימפרוביזציה**
