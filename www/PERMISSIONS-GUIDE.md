# 🔐 מדריך הרשאות Android - חשוב מאוד!

## ⚠️ בעיה: קבצים לא נשמרים?

אם **שום שיטת שמירה לא עובדת**, הבעיה היא כנראה **הרשאות Android חסרות**.

---

## ✅ הפתרון:

### אם משתמש ב-Cordova/PhoneGap/Capacitor:

1. **העתק** את `config.xml` לתיקיית הפרויקט
2. **בנה מחדש** את ה-APK:
   ```bash
   cordova build android
   # או
   capacitor build android
   ```
3. **ההרשאות יתווספו אוטומטית**

---

### אם משתמש בכלי אחר (Android Studio, etc.):

1. **העתק** את `platforms/android/AndroidManifest.xml`
2. **שים** אותו בתיקיית `app/src/main/` של הפרויקט
3. **בנה מחדש** את ה-APK

---

## 📋 אילו הרשאות נדרשות:

```xml
<!-- עבור Android 9 ומטה -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                 android:maxSdkVersion="28" />

<!-- עבור כל גרסאות Android -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

**הערה:** מ-Android 10+ (API 29), השימוש הוא ב-Scoped Storage שלא דורש הרשאה מיוחדת.

---

## 🔍 איך לבדוק אם ההרשאות קיימות:

### אחרי התקנת APK:

1. **הגדרות** → **אפליקציות**
2. בחר **Feedback App**
3. לחץ על **הרשאות**
4. ודא ש-**אחסון** מאושר ✅

---

## 🛠️ פתרון בעיות:

### אם עדיין לא עובד:

#### בדיקה 1: וודא גרסת Android
```
Settings → About Phone → Android Version
```
- Android 10+ (API 29+): צריך Scoped Storage
- Android 9 ומטה: צריך WRITE_EXTERNAL_STORAGE

#### בדיקה 2: בדוק Console Errors
פתח את Chrome DevTools:
```
chrome://inspect
```
חפש שגיאות כמו:
- "Permission denied"
- "SecurityError"
- "Failed to execute 'showSaveFilePicker'"

#### בדיקה 3: נסה בדפדפן רגיל
פתח את `index.html` ב-Chrome במכשיר.
אם עובד שם אבל לא ב-APK = בעיית הרשאות.

---

## 💡 טיפ חשוב:

**אם בונה APK עם WebView2APK או כלי דומה:**

לפעמים הכלי לא מוסיף הרשאות אוטומטית.
צריך להוסיף אותן ידנית ב-settings של הכלי!

---

## 📞 צריך עזרה נוספת?

אם עדיין לא עובד, בדוק:
1. ✅ ההרשאות בקובץ config.xml או AndroidManifest.xml
2. ✅ הרשאות ניתנו באפליקציה (Settings → App → Permissions)
3. ✅ גרסת Android נתמכת (5.0+)
4. ✅ Console אין שגיאות JavaScript

---

**אחרי הוספת ההרשאות - שיטות 1, 3, 7, 10 צריכות לעבוד! 🎉**
