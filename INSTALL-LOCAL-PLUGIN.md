# MyApp v5.2 - התקנה עם Intent Filter

## 🎯 פתרון הבעיה

הבעיה: `<edit-config>` ב-config.xml לא נתמך ב-Cordova ישן.
**הפתרון: plugin מקומי מינימלי!**

---

## 💻 התקנה ב-Termux

```bash
cd /storage/emulated/0/Download
unzip -o MyApp-v52-LOCAL-PLUGIN.zip
cp -rf cordova-project/* ~/MyApp/
cd ~/MyApp
rm -rf platforms/ plugins/

# התקן plugins (שים לב - json-intent-filter הוא מקומי!)
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-android-permissions
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-x-socialsharing
cordova plugin add https://github.com/darryncampbell/darryncampbell-cordova-plugin-intent.git
cordova plugin add plugins-local/json-intent-filter

# Build
cordova platform add android
cordova build android --release
```

---

## 🔧 מה עושה ה-plugin המקומי?

`plugins-local/json-intent-filter/` מכיל:
- `plugin.xml` - מגדיר את ה-intent-filter
- `package.json` - מטא-דאטה

**זה עובד ב-plugin.xml** (תמיד עבד!) **ולא ב-config.xml** (רק מ-Cordova 9+)

---

## ✅ יתרונות

- ✅ עובד עם Cordova ישן
- ✅ אין dependencies (tostr וכו')
- ✅ פשוט ונקי
- ✅ Plugin מקומי - שליטה מלאה

---

## 🚀 GitHub Actions

ב-workflow, להוסיף:
```yaml
- run: cordova plugin add plugins-local/json-intent-filter
```

אחרי שאר ה-plugins.
