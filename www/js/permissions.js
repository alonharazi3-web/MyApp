/**
 * Permissions Manager - בקשת הרשאות בהפעלה ראשונה
 */

document.addEventListener('deviceready', function() {
    console.log('📱 Cordova ready - requesting permissions');
    
    // Show immediate alert
    setTimeout(function() {
        alert('🔐 האפליקציה דורשת הרשאות!\n\n' +
              '✅ אישור גישה לקבצים\n' +
              '✅ אישור גישה למצלמה\n\n' +
              'לחץ OK ואשר את כל ההרשאות');
    }, 500);
    
    if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.permissions) {
        console.warn('⚠️ Permissions plugin not available');
        alert('❌ שגיאה: Plugin הרשאות לא זמין!\n\nאנא התקן מחדש את האפליקציה.');
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
    
    console.log('📋 Requesting permissions:', permissionsList);
    
    // בקשת כל ההרשאות
    setTimeout(function() {
        permissions.requestPermissions(permissionsList, 
            function(status) {
                if (status.hasPermission) {
                    console.log('✅ All permissions granted!');
                    alert('✅ הרשאות אושרו!\n\nהאפליקציה מוכנה לשימוש.');
                } else {
                    console.log('⚠️ Some permissions denied');
                    alert('⚠️ חלק מההרשאות נדחו!\n\nהאפליקציה עלולה לא לעבוד כראוי.\n\nלך להגדרות → אפליקציות → Feedback Workshop → הרשאות');
                }
            },
            function(error) {
                console.error('❌ Permission request failed:', error);
                alert('❌ שגיאה בבקשת הרשאות!\n\n' + error + '\n\nפתח הגדרות ידנית ואפשר הרשאות.');
            }
        );
    }, 1000);
}, false);

// Fallback for browser
if (!window.cordova) {
    console.log('⚠️ Running in browser - permissions not available');
}
