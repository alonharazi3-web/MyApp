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
window.testSocialSharing = function() {
    console.log('🧪 Testing Social Sharing Plugin...');
    
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!\n\nייתכן שהאפליקציה לא נבנתה עם ה-plugin.');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.csv`;
        
        // צור CSV מסודר לפי חניכים
        let csv = '\uFEFF'; // UTF-8 BOM
        
        // כותרת ראשית
        csv += `הערכת סדנה,${data.assessmentName || 'לא מולא'}\n`;
        csv += `מעריך,${evaluator}\n`;
        csv += `תאריך,${dateStr}\n`;
        csv += `דגשים כלליים,${data.highlights || 'לא מולא'}\n`;
        csv += '\n\n';
        
        // לכל חניך - כל המידע שלו
        for (let t = 0; t < 4; t++) {
            const traineeName = data['trainee' + (t + 1)] || `חניך ${t + 1}`;
            
            csv += `========================================\n`;
            csv += `חניך מס' ${t + 1}: ${traineeName}\n`;
            csv += `========================================\n\n`;
            
            // תרגיל בלון
            csv += `תרגיל: בלון\n`;
            csv += `גמישות מחשבתית,${data[`${t}-גמישות`] || 'לא מולא'}\n`;
            csv += `תכנון,${data[`${t}-תכנון`] || 'לא מולא'}\n`;
            csv += `לחץ ועמימות,${data[`${t}-לחץ`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`balloon-${t}-notes`] || 'לא מולא'}\n\n`;
            
            // תרגיל טיח
            csv += `תרגיל: טיח (חנות)\n`;
            csv += `חנות,${data[`tiach-${t}-store`] || 'לא מולא'}\n`;
            csv += `ציון,${data[`tiach-${t}-score`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`tiach-${t}-notes`] || 'לא מולא'}\n\n`;
            
            // תרגיל דולירה
            csv += `תרגיל: דולירה\n`;
            csv += `זמן,${data[`dolira-${t}-time`] || 'לא מולא'}\n`;
            csv += `איכות,${data[`dolira-${t}-quality`] || 'לא מולא'}\n\n`;
            
            // תרגיל דוד
            csv += `תרגיל: דוד\n`;
            csv += `ציון,${data[`david-${t}-score`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`david-${t}-notes`] || 'לא מולא'}\n\n`;
            
            // תרגיל לילה
            csv += `תרגיל: לילה (מלון)\n`;
            csv += `מלון,${data[`laila-${t}-hotel`] || 'לא מולא'}\n`;
            csv += `ציון,${data[`laila-${t}-score`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`laila-${t}-notes`] || 'לא מולא'}\n\n`;
            
            // תרגיל מכתב
            csv += `תרגיל: מכתב\n`;
            csv += `ציון,${data[`michtav-${t}-score`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`michtav-${t}-notes`] || 'לא מולא'}\n\n`;
            
            // תרגיל יומינט
            csv += `תרגיל: יומינט (מלון)\n`;
            csv += `מלון,${data[`yominet-${t}-hotel`] || 'לא מולא'}\n`;
            csv += `ציון,${data[`yominet-${t}-score`] || 'לא מולא'}\n`;
            csv += `הערות,${data[`yominet-${t}-notes`] || 'לא מולא'}\n\n\n`;
        }
        
        // היסטוריות בסוף
        csv += `========================================\n`;
        csv += `היסטוריית חנויות (טיח)\n`;
        csv += `========================================\n`;
        csv += `שם,כתובת,תאריך,הערות\n`;
        if (data.storeHistory && data.storeHistory.length > 0) {
            data.storeHistory.forEach(s => {
                csv += `${s.name || 'לא מולא'},${s.address || 'לא מולא'},${s.date || 'לא מולא'},${s.notes || 'לא מולא'}\n`;
            });
        } else {
            csv += `אין נתונים,,,\n`;
        }
        csv += '\n';
        
        csv += `========================================\n`;
        csv += `היסטוריית מלונות (לילה/יומינט)\n`;
        csv += `========================================\n`;
        csv += `שם,כתובת,תאריך,הערות\n`;
        if (data.hotelHistory && data.hotelHistory.length > 0) {
            data.hotelHistory.forEach(h => {
                csv += `${h.name || 'לא מולא'},${h.address || 'לא מולא'},${h.date || 'לא מולא'},${h.notes || 'לא מולא'}\n`;
            });
        } else {
            csv += `אין נתונים,,,\n`;
        }
        
        const base64 = 'data:text/csv;base64,' + btoa(unescape(encodeURIComponent(csv)));
        
        window.plugins.socialsharing.shareWithOptions({
            message: 'משוב סדנת אימפרוביזציה',
            subject: 'משוב סדנה - ' + evaluator,
            files: [base64],
            chooserTitle: 'שתף קובץ Excel'
        }, function(result) {
            console.log('✅ Share success');
        }, function(error) {
            console.error('❌ Share failed:', error);
            alert('❌ שיתוף נכשל:\n' + error);
        });
        
    } catch (error) {
        console.error('Test error:', error);
        alert('❌ שגיאה:\n' + error.message);
    }
};

// Test File Plugin
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
        const filename = `${evaluator}_${dateStr}.csv`;
        
        // צור CSV
        let csv = '\uFEFF';
        csv += `הערכת סדנה,${data.assessmentName || 'לא מולא'}\n`;
        csv += `מעריך,${evaluator}\n`;
        csv += `תאריך,${dateStr}\n\n`;
        csv += 'בדיקת File Plugin - הקובץ נשמר!\n';
        
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
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
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
        const filename = `הגדרות-מנהל_${dateStr}.json`;
        
        const base64 = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(jsonStr)));
        
        window.plugins.socialsharing.shareWithOptions({
            message: 'הגדרות מנהל - סדנת אימפרוביזציה',
            subject: 'הגדרות מנהל',
            files: [base64],
            chooserTitle: 'שתף קובץ JSON'
        }, function(result) {
            console.log('✅ JSON export success');
        }, function(error) {
            console.error('❌ JSON export failed:', error);
            alert('❌ ייצוא נכשל:\n' + error);
        });
        
    } catch (error) {
        alert('❌ שגיאה:\n' + error.message);
    }
};


