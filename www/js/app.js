/**
 * Main Application Entry Point v5.4
 * Handles routing, initialization, and page management
 */

import { Storage } from './storage.js';
import { Router } from './router.js';
import { ExportManager } from './export.js';
import { DocumentScanner } from './document-scanner.js';
import { LandingPage } from './pages/landing.js';
import { AdminPage } from './pages/admin.js';
import { EvaluatorPage } from './pages/evaluator.js';
import { AssessmentPage } from './pages/assessment.js';
import { SummaryPage } from './pages/summary.js';
import { PreviewPage } from './pages/preview.js';

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

// Initialize document scanner
window.documentScanner = new DocumentScanner();

// Initialize router
window.router = new Router();

// Register pages
window.router.register('landing', new LandingPage());
window.router.register('admin', new AdminPage());
window.router.register('evaluator', new EvaluatorPage());
window.router.register('assessment', new AssessmentPage());
window.router.register('summary', new SummaryPage());
window.router.register('preview', new PreviewPage());

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App v5.4 initializing...');
    window.storage.loadData();
    window.router.navigate('landing');
    setInterval(() => {
        if (window.app.currentPage !== 'landing') {
            window.storage.saveData();
            console.log('💾 Auto-saved');
        }
    }, 30000);
    console.log('✅ App v5.4 initialized');
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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
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

window.goToPage = function(pageId) {
    window.storage.saveData();
    window.router.navigate(pageId);
};

window.exportToExcel = async function() {
    try { await window.exportManager.exportToExcel(); }
    catch (error) { alert('❌ שגיאה בייצוא Excel:\n' + error.message); }
};

window.shareToWhatsApp = function() {
    try { window.exportManager.shareToWhatsApp(); }
    catch (error) { alert('❌ שגיאה בשיתוף:\n' + error.message); }
};

console.log('📦 App module v5.4 loaded');

window.printExcel = function() {
    try {
        localStorage.setItem('feedbackAppData', JSON.stringify(window.app.data));
        window.open('export-popup.html', '_blank', 'width=500,height=600');
    } catch (error) { alert('❌ שגיאה בפתיחת חלון ייצוא:\n' + error.message); }
};

window.openExcelPreview = function() { window.goToPage('preview'); };

// Social Sharing - XLSX
window.testSocialSharing = function() {
    if (!window.plugins || !window.plugins.socialsharing) { alert('❌ Social Sharing Plugin לא זמין!'); return; }
    if (!window.cordova || !window.cordova.file) { alert('❌ File Plugin לא זמין!'); return; }
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        const excelBuffer = window.generateTabularExcel(data);
        if (!excelBuffer) { alert('❌ שגיאה ביצירת Excel'); return; }
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        window.plugins.socialsharing.shareWithOptions({
                            message: 'משוב סדנת אימפרוביזציה', files: [fileEntry.nativeURL], chooserTitle: 'שתף Excel'
                        }, () => {}, (error) => alert('❌ שיתוף נכשל'));
                    };
                    fileWriter.onerror = () => alert('❌ כתיבה נכשלה');
                    fileWriter.write(blob);
                });
            });
        }, () => alert('❌ גישה למערכת קבצים נכשלה'));
    } catch (error) { alert('❌ שגיאה: ' + error.message); }
};

// Save XLSX to Downloads
window.testFilePlugin = function() {
    if (!window.cordova || !window.cordova.file) { alert('❌ File Plugin לא זמין!'); return; }
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        const excelBuffer = window.generateTabularExcel(data);
        if (!excelBuffer) { alert('❌ שגיאה ביצירת קובץ Excel'); return; }
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Download/', function(dir) {
            dir.getFile(filename, { create: true }, function(file) {
                file.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = () => alert('✅ הקובץ נשמר ב-Downloads!\n\n' + filename);
                    fileWriter.onerror = (e) => alert('❌ שגיאת כתיבה:\n' + e.toString());
                    fileWriter.write(blob);
                }, (error) => alert('❌ שגיאה ביצירת writer:\n' + error));
            }, (error) => alert('❌ שגיאה ביצירת קובץ:\n' + error));
        }, (error) => alert('❌ לא ניתן לגשת ל-Downloads:\n' + error));
    } catch (error) { alert('❌ שגיאה:\n' + error.message); }
};

// Export admin JSON
window.exportAdminJSON = function() {
    if (!window.cordova || !window.cordova.file || !window.plugins || !window.plugins.socialsharing) return;
    try {
        const jsonStr = JSON.stringify(window.app.data, null, 2);
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `settings_${dateStr}.json`;
        const blob = new Blob([jsonStr], { type: 'application/json' });
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        window.plugins.socialsharing.shareWithOptions({
                            files: [fileEntry.nativeURL], chooserTitle: 'שתף קובץ הגדרות'
                        }, () => {}, (error) => console.error('Share failed:', error));
                    };
                    fileWriter.write(blob);
                });
            });
        });
    } catch (error) { console.error('❌ Error:', error); }
};
