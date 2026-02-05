#!/bin/bash

MANIFEST="platforms/android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST" ]; then
    echo "AndroidManifest.xml not found"
    exit 0
fi

# בדוק אם כבר קיים
if grep -q "JSON_FILE_HANDLER" "$MANIFEST"; then
    echo "Intent filter already exists"
    exit 0
fi

# הוסף את ה-intent-filter לפני </activity> הראשון
sed -i '0,/<\/activity>/{s|<\/activity>|            <intent-filter android:label="JSON_FILE_HANDLER">\
                <action android:name="android.intent.action.VIEW" />\
                <category android:name="android.intent.category.DEFAULT" />\
                <category android:name="android.intent.category.BROWSABLE" />\
                <data android:scheme="file" />\
                <data android:scheme="content" />\
                <data android:mimeType="application/json" />\
            </intent-filter>\
        </activity>|}' "$MANIFEST"

echo "✅ JSON intent-filter added"
