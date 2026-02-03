/**
 * Main Application Entry Point
 * Handles routing, initialization, and page management
 */

import { Storage } from './storage.js';
import { Router } from './router.js';
import { ExportManager } from './export.js';
import { LandingPage } from './pages/landing.js';
import { AdminPage } from './pages/admin.js';
import { EvaluatorPage } from './pages/evaluator.js';
import { AssessmentPage } from './pages/assessment.js';
import { SummaryPage } from './pages/summary.js';

// Global app state
window.app = {
    currentPage: 'landing',
    currentTrainee: 0,
    currentExercise: 0,
    currentSummaryTrainee: 0,
    primaryTrainees: [],
    data: {
        assessmentName: '',
        trainee1: '',
        trainee2: '',
        trainee3: '',
        trainee4: '',
        highlights: '',
        evaluatorName: '',
        primaryTrainees: [],
        exerciseData: {},
        summaryData: {},
        storeHistory: [],
        hotelHistory: []
    },
    traineeColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    exercises: ['בלון', 'טיח', 'דולירה', 'דויד', 'לילה', 'מכתב', 'יומינט'],
    criteria: [
        'כישורי חשיבה - יכולת למידה',
        'כישורי חשיבה - גמישות מחשבתית',
        'כישורי חשיבה - תכנון',
        'טקטי - גמישות ביצועית',
        'טקטי - בטחון מול יעילות',
        'טקטי - מיומנויות',
        'טקטי - יכולות דיווח',
        'טקטי - שטח/בינאישי',
        'אישיות - חוסן, עמימות ולחץ',
        'אישיות - גמישות מחשבתית',
        'אישיות - עבודה בצוות',
        'סיכום כללי'
    ]
};

// Initialize storage
window.storage = new Storage();

// Initialize export manager
window.exportManager = new ExportManager();

// Initialize router
window.router = new Router();

// Register pages
window.router.register('landing', new LandingPage());
window.router.register('admin', new AdminPage());
window.router.register('evaluator', new EvaluatorPage());
window.router.register('assessment', new AssessmentPage());
window.router.register('summary', new SummaryPage());

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App initializing...');
    
    // Load saved data
    window.storage.loadData();
    
    // Navigate to landing page
    window.router.navigate('landing');
    
    // Setup auto-save every 30 seconds
    setInterval(() => {
        if (window.app.currentPage !== 'landing') {
            window.storage.saveData();
            console.log('💾 Auto-saved');
        }
    }, 30000);
    
    console.log('✅ App initialized');
});

// Global helper functions
window.getTraineeName = function(index) {
    const names = [
        window.app.data.trainee1,
        window.app.data.trainee2,
        window.app.data.trainee3,
        window.app.data.trainee4
    ];
    return names[index] || 'חניך ' + (index + 1);
};

window.escapeHtml = function(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
};

window.csvEscape = function(text) {
    if (!text) return '';
    text = String(text);
    if (text.indexOf(',') !== -1 || text.indexOf('"') !== -1 || text.indexOf('\n') !== -1) {
        return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
};

// Make global navigation function
window.goToPage = function(pageId) {
    window.storage.saveData();
    window.router.navigate(pageId);
};

// Make global export functions
window.exportToExcel = async function() {
    console.log('📊 Exporting to Excel...');
    try {
        await window.exportManager.exportToExcel();
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ שגיאה בייצוא Excel:\n' + error.message);
    }
};

window.shareToWhatsApp = function() {
    console.log('📱 Sharing to WhatsApp...');
    try {
        window.exportManager.shareToWhatsApp();
    } catch (error) {
        console.error('Share error:', error);
        alert('❌ שגיאה בשיתוף:\n' + error.message);
    }
};

console.log('📦 App module loaded');

// Print Excel function - opens export popup
window.printExcel = function() {
    console.log('🖨️ Opening export popup...');
    
    // שמור נתונים ל-localStorage כדי שה-popup יוכל לגשת
    try {
        localStorage.setItem('feedbackAppData', JSON.stringify(window.app.data));
        
        // פתח popup
        window.open('export-popup.html', '_blank', 'width=500,height=600');
    } catch (error) {
        console.error('Export popup error:', error);
        alert('❌ שגיאה בפתיחת חלון ייצוא:\n' + error.message);
    }
};

// Open preview with Android share
window.openExcelPreview = function() {
    console.log('👁️ Opening preview with share...');
    
    try {
        localStorage.setItem('feedbackAppData', JSON.stringify(window.app.data));
        
        // פתח preview.html (תצוגה מקדימה + שיתוף אנדרואיד)
        const preview = window.open('preview.html', '_blank');
        
        if (!preview) {
            alert('⚠️ לא ניתן לפתוח חלון.\n\nאפשר פופאפים בדפדפן!');
        }
    } catch (error) {
        console.error('Preview error:', error);
        alert('❌ שגיאה: ' + error.message);
    }
};

// Test Social Sharing Plugin with organized CSV by trainee
// Test Social Sharing Plugin with XLSX tabular format
window.testSocialSharing = function() {
    console.log('🧪 Testing Social Sharing Plugin...');
    
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        
        // יצירת Excel בפורמט טבלאי
        const excelBuffer = window.generateTabularExcel(data);
        
        if (!excelBuffer) {
            alert('❌ שגיאה ביצירת קובץ Excel');
            return;
        }
        
        // המרה ל-Base64
        const bytes = new Uint8Array(excelBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;
        
        // שיתוף - השם כ-subject (עובד ב-Android)
        window.plugins.socialsharing.shareWithOptions({
            message: 'משוב סדנת אימפרוביזציה',
            subject: filename,  // זה השם של הקובץ ב-Android!
            files: [dataUrl],
            chooserTitle: 'שתף קובץ Excel'
        }, function(result) {
            console.log('✅ Share success:', result);
        }, function(error) {
            console.error('❌ Share failed:', error);
            alert('❌ שיתוף נכשל:\n' + JSON.stringify(error));
        });
        
    } catch (error) {
        console.error('Test error:', error);
        alert('❌ שגיאה:\n' + error.message);
    }
};

// Test File Plugin - Save XLSX to Downloads
window.testFilePlugin = function() {
    console.log('🧪 Testing File Plugin...');
    
    if (!window.cordova || !window.cordova.file) {
        alert('❌ File Plugin לא זמין!');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        
        // יצירת Excel בפורמט טבלאי
        const excelBuffer = window.generateTabularExcel(data);
        
        if (!excelBuffer) {
            alert('❌ שגיאה ביצירת קובץ Excel');
            return;
        }
        
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // שמור לתיקיית Downloads
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Download/', function(dir) {
            dir.getFile(filename, { create: true }, function(file) {
                file.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        alert('✅ הקובץ נשמר ב-Downloads!\n\n' + filename);
                    };
                    fileWriter.onerror = function(e) {
                        alert('❌ שגיאת כתיבה:\n' + e.toString());
                    };
                    
                    fileWriter.write(blob);
                }, function(error) {
                    alert('❌ שגיאה ביצירת writer:\n' + error);
                });
            }, function(error) {
                alert('❌ שגיאה ביצירת קובץ:\n' + error);
            });
        }, function(error) {
            alert('❌ לא ניתן לגשת ל-Downloads:\n' + error);
        });
        
    } catch (error) {
        alert('❌ שגיאה:\n' + error.message);
    }
};

// Export admin JSON with social sharing
window.exportAdminJSON = function() {
    console.log('📄 Exporting admin JSON...');
    
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!');
        return;
    }
    
    try {
        const jsonStr = JSON.stringify(window.app.data, null, 2);
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `settings_${dateStr}.json`;  // שם אנגלי פשוט יותר
        
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        // כתיבה ל-cache תחילה
        const cacheDir = window.cordova && window.cordova.file ? window.cordova.file.cacheDirectory : null;
        
        if (!cacheDir) {
            // Fallback - נסה עם base64 ישירות
            const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
            const dataUrl = 'data:application/json;base64,' + base64;
            
            window.plugins.socialsharing.shareWithOptions({
                message: 'הגדרות מנהל - סדנת אימפרוביזציה',
                subject: filename,
                files: [dataUrl],
                chooserTitle: 'שתף קובץ JSON'
            }, function(result) {
                console.log('✅ JSON export success (base64):', result);
                alert('✅ ייצוא JSON הצליח!');
            }, function(error) {
                console.error('❌ JSON export failed:', error);
                alert('❌ ייצוא נכשל:\n' + JSON.stringify(error));
            });
            return;
        }
        
        // שמירת קובץ ל-cache
        window.resolveLocalFileSystemURL(cacheDir, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        console.log('✅ File written:', fileEntry.nativeURL);
                        
                        // עכשיו שתף את הקובץ
                        window.plugins.socialsharing.shareWithOptions({
                            message: 'הגדרות מנהל - סדנת אימפרוביזציה',
                            subject: 'הגדרות מנהל',
                            files: [fileEntry.nativeURL],  // שתף את ה-path
                            chooserTitle: 'שתף קובץ JSON'
                        }, function(result) {
                            console.log('✅ JSON export success (file):', result);
                            alert('✅ ייצוא JSON הצליח!');
                        }, function(error) {
                            console.error('❌ Share failed:', error);
                            alert('❌ שיתוף נכשל:\n' + JSON.stringify(error));
                        });
                    };
                    
                    fileWriter.onerror = function(e) {
                        console.error('❌ Write failed:', e);
                        alert('❌ כתיבה נכשלה:\n' + e.toString());
                    };
                    
                    fileWriter.write(blob);
                }, function(error) {
                    console.error('❌ createWriter failed:', error);
                    alert('❌ שגיאה:\n' + JSON.stringify(error));
                });
            }, function(error) {
                console.error('❌ getFile failed:', error);
                alert('❌ שגיאה ביצירת קובץ:\n' + JSON.stringify(error));
            });
        }, function(error) {
            console.error('❌ resolveLocalFileSystemURL failed:', error);
            alert('❌ שגיאה בגישה למערכת קבצים:\n' + JSON.stringify(error));
        });
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ שגיאה:\n' + error.message);
    }
};


