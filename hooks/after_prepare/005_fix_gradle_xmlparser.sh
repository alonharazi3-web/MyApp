#!/bin/bash

CORDOVA_GRADLE="platforms/android/CordovaLib/cordova.gradle"

if [ ! -f "$CORDOVA_GRADLE" ]; then
    echo "cordova.gradle not found, skipping..."
    exit 0
fi

# Check if already fixed
if grep -q "import groovy.xml.XmlParser" "$CORDOVA_GRADLE"; then
    echo "✅ cordova.gradle already fixed"
    exit 0
fi

# Add imports at the beginning
sed -i '1i import groovy.xml.XmlParser\nimport groovy.xml.XmlSlurper' "$CORDOVA_GRADLE"

# Replace XmlParser usage
sed -i 's/new XmlParser(/new groovy.xml.XmlParser(/g' "$CORDOVA_GRADLE"
sed -i 's/new XmlSlurper(/new groovy.xml.XmlSlurper(/g' "$CORDOVA_GRADLE"

echo "✅ cordova.gradle XmlParser issue fixed"
