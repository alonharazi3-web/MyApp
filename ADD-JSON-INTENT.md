# How to Add JSON File Opening

After building, if you want the app to open JSON files automatically:

## Option 1: Edit AndroidManifest.xml manually

File: `platforms/android/app/src/main/AndroidManifest.xml`

Find the `MainActivity` activity section and add this **inside** the `<activity>` tag:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="file" />
    <data android:scheme="content" />
    <data android:mimeType="application/json" />
</intent-filter>
```

## Option 2: Use plugin.xml approach

Create a custom Cordova plugin that adds this automatically.

## Option 3: Skip this feature

The app works perfectly without auto-opening JSON files.
You can still import JSON manually from the app.
