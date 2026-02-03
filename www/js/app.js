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

// Test Social Sharing Plugin
window.testSocialSharing = function() {
    console.log('🧪 Testing Social Sharing Plugin...');
    
    // בדוק אם ה-plugin קיים
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!\n\n' +
              'ייתכן שהאפליקציה לא נבנתה עם ה-plugin.\n\n' +
              'בדוק שה-APK נבנה ב-GitHub Actions.');
        return;
    }
    
    try {
        const data = window.app.data;
        
        // צור CSV מלא
        let csv = '\uFEFF'; // UTF-8 BOM
        
        csv += '=== נתוני הערכה ===\n\n';
        csv += 'שאלה: שם ההערכה\nתשובה: ' + (data.assessmentName || 'לא מולא') + '\n\n';
        csv += 'שאלה: שם המעריך\nתשובה: ' + (data.evaluatorName || 'לא מולא') + '\n\n';
        csv += 'תאריך: ' + new Date().toLocaleDateString('he-IL') + '\n\n';
        
        // חניכים
        csv += '=== חניכים ===\n\n';
        for (let i = 1; i <= 4; i++) {
            csv += 'שאלה: חניך ' + i + '\nתשובה: ' + (data['trainee' + i] || 'לא מולא') + '\n\n';
        }
        
        csv += 'שאלה: דגשים כלליים\nתשובה: ' + (data.highlights || 'לא מולא') + '\n\n';
        
        // כל 7 התרגילים
        const exercises = [
            {name: 'בלון', prefix: 'balloon', fields: [{key: 'גמישות', label: 'גמישות מחשבתית'}, {key: 'תכנון', label: 'תכנון'}, {key: 'לחץ', label: 'לחץ ועמימות'}, {key: 'notes', label: 'הערות'}]},
            {name: 'טיח', prefix: 'tiach', fields: [{key: 'store', label: 'חנות'}, {key: 'score', label: 'ציון'}, {key: 'notes', label: 'הערות'}]},
            {name: 'דולירה', prefix: 'dolira', fields: [{key: 'time', label: 'זמן'}, {key: 'quality', label: 'איכות'}]},
            {name: 'דוד', prefix: 'david', fields: [{key: 'score', label: 'ציון'}, {key: 'notes', label: 'הערות'}]},
            {name: 'לילה', prefix: 'laila', fields: [{key: 'hotel', label: 'מלון'}, {key: 'score', label: 'ציון'}, {key: 'notes', label: 'הערות'}]},
            {name: 'מכתב', prefix: 'michtav', fields: [{key: 'score', label: 'ציון'}, {key: 'notes', label: 'הערות'}]},
            {name: 'יומינט', prefix: 'yominet', fields: [{key: 'hotel', label: 'מלון'}, {key: 'score', label: 'ציון'}, {key: 'notes', label: 'הערות'}]}
        ];
        
        exercises.forEach(ex => {
            csv += `=== תרגיל ${ex.name} ===\n\n`;
            for (let t = 0; t < 4; t++) {
                const traineeName = data['trainee' + (t + 1)] || `חניך ${t + 1}`;
                csv += `חניך: ${traineeName}\n`;
                
                ex.fields.forEach(field => {
                    const key = `${ex.prefix}-${t}-${field.key}`;
                    csv += `  שאלה: ${field.label}\n`;
                    csv += `  תשובה: ${data[key] || 'לא מולא'}\n`;
                });
                csv += '\n';
            }
        });
        
        // היסטוריית חנויות
        csv += '=== היסטוריית חנויות ===\n\n';
        if (data.storeHistory && data.storeHistory.length > 0) {
            data.storeHistory.forEach((s, i) => {
                csv += `חנות ${i + 1}:\n  שם: ${s.name || 'לא מולא'}\n  כתובת: ${s.address || 'לא מולא'}\n  תאריך: ${s.date || 'לא מולא'}\n  הערות: ${s.notes || 'לא מולא'}\n\n`;
            });
        } else {
            csv += 'אין נתונים\n\n';
        }
        
        // היסטוריית מלונות
        csv += '=== היסטוריית מלונות ===\n\n';
        if (data.hotelHistory && data.hotelHistory.length > 0) {
            data.hotelHistory.forEach((h, i) => {
                csv += `מלון ${i + 1}:\n  שם: ${h.name || 'לא מולא'}\n  כתובת: ${h.address || 'לא מולא'}\n  תאריך: ${h.date || 'לא מולא'}\n  הערות: ${h.notes || 'לא מולא'}\n\n`;
            });
        } else {
            csv += 'אין נתונים\n\n';
        }
        
        const filename = 'משוב-סדנה_' + new Date().toISOString().slice(0, 10) + '.csv';
        
        // המר ל-Base64 (Social Sharing צריך Base64)
        const base64 = 'data:text/csv;base64,' + btoa(unescape(encodeURIComponent(csv)));
        
        // שתף עם Social Sharing Plugin
        window.plugins.socialsharing.shareWithOptions({
            message: 'משוב סדנת אימפרוביזציה - נתוני הערכה',
            subject: 'משוב סדנה',
            files: [base64],
            chooserTitle: 'שתף קובץ Excel'
        }, function(result) {
            console.log('✅ Share success:', result);
            alert('✅ שיתוף הצליח!');
        }, function(error) {
            console.error('❌ Share failed:', error);
            alert('❌ שיתוף נכשל:\n' + error);
        });
        
    } catch (error) {
        console.error('Test error:', error);
        alert('❌ שגיאה:\n' + error.message);
    }
};

// Open export popup with data transfer method selection
window.openExportPopup = function(type) {
    console.log('📊 Opening export:', type);
    
    // הצג בחירת שיטה
    const choice = confirm(
        '📊 איך להעביר נתונים לפופאפ?\n\n' +
        'לחץ אישור (OK) = localStorage (מומלץ)\n' +
        'לחץ ביטול (Cancel) = URL Parameters\n\n' +
        '(postMessage עובד אוטומטי)'
    );
    
    try {
        const data = window.app.data;
        
        if (choice) {
            // שיטה 1: localStorage
            localStorage.setItem('feedbackAppData', JSON.stringify(data));
            localStorage.setItem('exportType', type);
            console.log('✅ Using localStorage');
            
            window.open('export-popup.html', '_blank');
        } else {
            // שיטה 2: URL Parameters
            const dataStr = encodeURIComponent(JSON.stringify(data));
            const url = `export-popup.html?data=${dataStr}&type=${type}`;
            console.log('✅ Using URL params');
            
            window.open(url, '_blank');
        }
        
        // שיטה 3: postMessage - נשלח בנוסף
        setTimeout(() => {
            const allWindows = window.open('', '_blank');
            if (allWindows) {
                allWindows.postMessage({
                    feedbackAppData: data,
                    exportType: type
                }, '*');
            }
        }, 500);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ שגיאה: ' + error.message);
    }
};
