/**
 * Permissions Manager - בקשת הרשאות בהפעלה ראשונה
 */

document.addEventListener('deviceready', function() {
    console.log('📱 Cordova ready');
    
    if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.permissions) {
        console.warn('⚠️ Permissions plugin not available');
        return;
    }
    
    var permissions = window.cordova.plugins.permissions;
    
    // רשימת הרשאות נדרשות
    var permissionsList = [
        permissions.CAMERA,
        permissions.READ_EXTERNAL_STORAGE,
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_MEDIA_IMAGES,
        permissions.READ_MEDIA_VIDEO,
        permissions.READ_MEDIA_AUDIO
    ];
    
    console.log('📋 Requesting permissions silently:', permissionsList);
    
    // בקש הרשאות בשקט - ללא alerts
    setTimeout(function() {
        permissions.requestPermissions(permissionsList, 
            function(status) {
                if (status.hasPermission) {
                    console.log('✅ All permissions granted!');
                } else {
                    console.log('⚠️ Some permissions denied');
                }
            },
            function(error) {
                console.error('❌ Permission request failed:', error);
            }
        );
    }, 1000);
}, false);

// Fallback for browser
if (!window.cordova) {
    console.log('⚠️ Running in browser - permissions not available');
}
