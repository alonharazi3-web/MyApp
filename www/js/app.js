/**
 * Main Application Entry Point
 * Handles routing, initialization, and page management
 */

import { Storage } from './storage.js';
import { Router } from './router.js';
import { ExportManager } from './export.js';
import { DocScanner } from './doc-scanner.js';
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
        hotelHistory: [],
        scannedDocs: {}
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
window.docScanner = new DocScanner();

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
    console.log('🚀 App initializing...');
    
    // Load saved data
    window.storage.loadData();
    
    // Navigate to landing page
    window.router.navigate('landing');
    
    // Setup auto-save every 30 seconds
    setInterval(() => {
        if (window.app.currentPage !== 'landing' && !window._clearingData) {
            window.storage.saveData();
            console.log('💾 Auto-saved');
        }
    }, 30000);
    
    // Keep screen awake while app is open (prevent screen lock during work)
    initWakeLock();
    
    console.log('✅ App initialized');
});

/**
 * Screen Wake Lock - prevents Android screen from turning off
 * Uses Web Wake Lock API (Android WebView Chrome 84+)
 * Falls back to hidden video trick for older devices
 */
function initWakeLock() {
    let wakeLock = null;
    
    async function requestWakeLock() {
        // Method 1: Web Wake Lock API (preferred, modern Android)
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔆 Screen wake lock active (Wake Lock API)');
                wakeLock.addEventListener('release', () => {
                    console.log('🔆 Wake lock released');
                });
                return true;
            } catch (err) {
                console.warn('Wake Lock API failed:', err.message);
            }
        }
        
        // Method 2: Hidden video trick (fallback for older WebViews)
        try {
            if (!document.getElementById('wakeLockVideo')) {
                const video = document.createElement('video');
                video.id = 'wakeLockVideo';
                video.setAttribute('playsinline', '');
                video.setAttribute('muted', '');
                video.muted = true;
                video.loop = true;
                video.style.cssText = 'position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0.01;pointer-events:none;';
                // Minimal silent MP4 (base64)
                video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAChtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAACAAIASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAADFhdmNDAWQAFf/hABhnZAAVrNlBsJaEAAADAAQAAAMACDxYtlgBAAZo6+PLIsAAAAAbU1QAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAB8HN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjgzLjEwMA==';
                document.body.appendChild(video);
                video.play().then(() => {
                    console.log('🔆 Screen wake lock active (video fallback)');
                }).catch(() => {
                    console.warn('Video wake lock failed');
                });
            }
            return true;
        } catch(e) {
            console.warn('Video fallback failed:', e);
        }
        return false;
    }
    
    // Request wake lock now
    requestWakeLock();
    
    // Re-acquire wake lock when user returns to app (visibility change)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        }
    });
    
    // Re-acquire on Cordova resume event
    document.addEventListener('resume', () => {
        requestWakeLock();
    }, false);
}

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

// Document Scanner - global functions for exercise pages
window.startDocScan = function() {
    const traineeIndex = window.app.currentTrainee;
    const exerciseIndex = window.app.currentExercise;
    window.docScanner.startScan(traineeIndex, exerciseIndex);
};

// Document Scanner - global function for summary page
window.startDocScanSummary = function() {
    const traineeIndex = window.app.currentSummaryTrainee;
    window.docScanner.startScan(traineeIndex, 'summary');
};

// Document Scanner - export functions (with trainee picker)
window.exportDocsZip = function() {
    window.docScanner.exportDocsZipWithPicker();
};

window.exportDocsLocal = function() {
    window.docScanner.exportDocsLocalWithPicker();
};

window.showDocsList = function() {
    window.docScanner.showDocsListWithPicker();
};

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
    console.log('👁️ Opening preview...');
    window.goToPage('preview');
};

// Test Social Sharing Plugin with organized CSV by trainee
// Test Social Sharing Plugin with XLSX tabular format - WRITE FILE FIRST
window.testSocialSharing = function() {
    console.log('🧪 Testing Social Sharing Plugin...');
    
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!');
        return;
    }
    
    if (!window.cordova || !window.cordova.file) {
        alert('❌ File Plugin לא זמין!');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        
        // יצירת Excel
        const excelBuffer = window.generateTabularExcel(data);
        if (!excelBuffer) {
            alert('❌ שגיאה ביצירת Excel');
            return;
        }
        
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // כתיבה ל-cache
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        // שתף את הקובץ
                        window.plugins.socialsharing.shareWithOptions({
                            message: 'משוב סדנת אימפרוביזציה',
                            files: [fileEntry.nativeURL],
                            chooserTitle: 'שתף Excel'
                        }, function() {
                            console.log('✅ Share success');
                        }, function(error) {
                            console.error('❌ Share failed:', error);
                            alert('❌ שיתוף נכשל');
                        });
                    };
                    
                    fileWriter.onerror = function(e) {
                        alert('❌ כתיבה נכשלה');
                    };
                    
                    fileWriter.write(blob);
                });
            });
        }, function(error) {
            alert('❌ גישה למערכת קבצים נכשלה');
        });
        
    } catch (error) {
        alert('❌ שגיאה: ' + error.message);
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

// Export admin JSON with 3 methods
window.exportAdminJSON = function() {
    console.log('📄 Exporting JSON via Social Share');
    
    // Save current admin fields first
    const assessmentInput = document.getElementById('assessmentName');
    if (assessmentInput) window.app.data.assessmentName = assessmentInput.value;
    for (let i = 1; i <= 4; i++) {
        const traineeInput = document.getElementById(`trainee${i}`);
        if (traineeInput) window.app.data[`trainee${i}`] = traineeInput.value;
    }
    const highlightsInput = document.getElementById('highlights');
    if (highlightsInput) window.app.data.highlights = highlightsInput.value;
    window.storage.saveData();
    
    // Build structured export (same format as loadFromJSON expects)
    const exportData = {
        metadata: {
            assessmentName: window.app.data.assessmentName,
            evaluatorName: window.app.data.evaluatorName,
            exportDate: new Date().toISOString(),
            appVersion: '5.4'
        },
        trainees: [],
        highlights: window.app.data.highlights,
        storeHistory: window.app.data.storeHistory,
        hotelHistory: window.app.data.hotelHistory
    };
    
    for (let t = 0; t < 4; t++) {
        exportData.trainees.push({
            id: t,
            name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`
        });
    }
    
    if (!window.cordova || !window.cordova.file || !window.plugins || !window.plugins.socialsharing) {
        // Fallback: download via blob
        try {
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `settings_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ קובץ הגדרות יוצא!');
        } catch (e) {
            alert('❌ שגיאה: ' + e.message);
        }
        return;
    }
    
    try {
        const jsonStr = JSON.stringify(exportData, null, 2);
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `settings_${dateStr}.json`;
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        window.plugins.socialsharing.shareWithOptions({
                            files: [fileEntry.nativeURL],
                            chooserTitle: 'שתף קובץ הגדרות'
                        }, function() {
                            console.log('✅ Share success');
                        }, function(error) {
                            console.error('❌ Share failed:', error);
                        });
                    };
                    
                    fileWriter.onerror = function(e) {
                        console.error('❌ Write failed:', e);
                    };
                    
                    fileWriter.write(blob);
                });
            }, function(error) {
                console.error('❌ getFile failed:', error);
            });
        }, function(error) {
            console.error('❌ File system access failed:', error);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};




