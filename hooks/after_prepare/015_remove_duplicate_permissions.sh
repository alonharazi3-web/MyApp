#!/bin/bash

MANIFEST="platforms/android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST" ]; then
    echo "AndroidManifest.xml not found, skipping..."
    exit 0
fi

# Remove duplicate WRITE_EXTERNAL_STORAGE permissions
# Keep only the first occurrence
awk '
    /<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/ {
        if (!seen) {
            print
            seen = 1
        }
        next
    }
    { print }
' "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"

echo "✅ Removed duplicate permissions from AndroidManifest.xml"
