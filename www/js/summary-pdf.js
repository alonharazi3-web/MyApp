/**
 * PDF Summary Report Generator v5.7
 * Generates a trainee summary with all exercise scores + summary criteria
 * Uses HTML-to-print approach for reliable PDF generation
 */

window.generatePDFSummary = function() {
    const data = window.app.data;
    
    // Build trainee selection dialog
    const ordered = [];
    const primary = window.app.primaryTrainees || [];
    primary.forEach(p => ordered.push(p));
    [0,1,2,3].forEach(i => { if (!ordered.includes(i)) ordered.push(i); });
    
    let choices = ordered.map(i => {
        const name = data['trainee' + (i+1)] || ('חניך ' + (i+1));
        const star = primary.includes(i) ? ' ★' : '';
        return `${i}: ${name}${star}`;
    }).join('\n');
    
    const input = prompt('בחר חניך לסיכום PDF:\n\n' + choices + '\n\nהקלד מספר (0-3):', ordered[0].toString());
    if (input === null) return;
    
    const traineeIdx = parseInt(input);
    if (isNaN(traineeIdx) || traineeIdx < 0 || traineeIdx > 3) {
        alert('מספר חניך לא תקין');
        return;
    }
    
    const traineeName = data['trainee' + (traineeIdx+1)] || ('חניך ' + (traineeIdx+1));
    
    // Collect all exercise scores
    const exerciseScores = {
        'בלון': {
            labels: ['גמישות מחשבתית','יכולת תכנון','תמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','עבודה בצוות','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 0,
            freeComment: 'free_comment'
        },
        'טיח': {
            labels: ['גמישות מחשבתית','יכולת תכנון','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','יכולת דיווח','ציון מסכם'],
            prefix: 'tiach2_score_',
            exerciseId: 1,
            freeComment: 'free_comment'
        },
        'דולירה': {
            labels: ['יכולת למידה ויישום','גמישות מחשבתית','יכולת תכנון','תמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','גמישות ביצועית','בטחון מול יעילות','יכולת דיווח','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 2,
            freeComment: 'free_comment'
        },
        'דויד': {
            labels: ['גמישות מחשבתית','מיומנות - התמצאות במרחב','תמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','כישורי שטח בינאישיים','יכולת דיווח','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 3,
            freeComment: 'free_comment'
        },
        'לילה': {
            labels: ['יכולות למידה ויישום','גמישות מחשבתית','יכולות תכנון','בטחון מול יעילות','יכולת דיווח','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 4,
            freeComment: 'free_comment'
        },
        'מכתב': {
            labels: ['יכולות למידה ויישום','גמישות מחשבתית','יכולת תכנון','בטחון מול יעילות','מיומנות - ניווט, זיכרון','יכולת דיווח','התמודדות במצבי לחץ','בטחון עצמי','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 5,
            freeComment: 'free_comment'
        },
        'יומינט': {
            labels: ['גמישות מחשבתית','גמישות ביצועית','כישורי שטח בינאישיים','התמודדות עם מצבי לחץ','התמקמות כלומד','בטחון עצמי','ציון מסכם'],
            prefix: 'score_',
            exerciseId: 6,
            freeComment: 'free_notes'
        }
    };
    
    function exd(exerciseId, field) {
        const key = traineeIdx + '-' + exerciseId;
        if (data.exerciseData && data.exerciseData[key] && data.exerciseData[key][field] !== undefined) {
            return data.exerciseData[key][field] || '';
        }
        return '';
    }
    
    function scoreColor(val) {
        const n = parseFloat(val);
        if (isNaN(n)) return '#6b7280';
        if (n >= 6) return '#059669';
        if (n >= 4.5) return '#2563eb';
        if (n >= 3) return '#d97706';
        return '#dc2626';
    }
    
    function scoreBar(val) {
        const n = parseFloat(val);
        if (isNaN(n)) return '';
        const pct = Math.round((n / 7) * 100);
        const color = scoreColor(val);
        return `<div style="background:#e5e7eb;border-radius:4px;height:8px;width:100%;margin-top:3px;">
            <div style="background:${color};border-radius:4px;height:8px;width:${pct}%;"></div>
        </div>`;
    }
    
    // Build exercise sections
    let exerciseHTML = '';
    for (const [name, config] of Object.entries(exerciseScores)) {
        let rows = '';
        let summaryScore = '';
        
        config.labels.forEach((label, i) => {
            const val = exd(config.exerciseId, config.prefix + i);
            const isSum = label.includes('מסכם');
            if (isSum) summaryScore = val;
            rows += `
                <tr style="${isSum ? 'font-weight:700;background:#f0f4f8;' : ''}">
                    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${label}</td>
                    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:${scoreColor(val)};font-weight:700;">${val || '—'}</td>
                    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;width:120px;">${scoreBar(val)}</td>
                </tr>`;
        });
        
        const comment = exd(config.exerciseId, config.freeComment);
        
        exerciseHTML += `
            <div style="margin-bottom:16px;break-inside:avoid;">
                <div style="display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#1e3a5f,#2d6a9f);color:white;padding:8px 14px;border-radius:8px 8px 0 0;">
                    <span style="font-weight:700;font-size:15px;">${name}</span>
                    <span style="font-size:20px;font-weight:800;">${summaryScore || '—'}</span>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    ${rows}
                </table>
                ${comment ? `<div style="padding:6px 10px;font-size:12px;color:#4b5563;background:#f9fafb;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">💬 ${comment.replace(/</g,'&lt;')}</div>` : ''}
            </div>`;
    }
    
    // Summary criteria section
    let summaryRows = '';
    let overallScore = '';
    window.app.criteria.forEach(criterion => {
        const key = traineeIdx + '-' + criterion;
        const sd = data.summaryData && data.summaryData[key] ? data.summaryData[key] : {};
        const val = sd.score || '';
        const isOverall = criterion.includes('סיכום');
        if (isOverall) overallScore = val;
        
        summaryRows += `
            <tr style="${isOverall ? 'font-weight:700;background:#f0f4f8;' : ''}">
                <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${criterion}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:${scoreColor(val)};font-weight:700;">${val || '—'}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;width:120px;">${scoreBar(val)}</td>
            </tr>`;
        
        if (sd.text) {
            summaryRows += `<tr><td colspan="3" style="padding:4px 10px 8px;font-size:11px;color:#6b7280;border-bottom:1px solid #e5e7eb;">📝 ${sd.text.replace(/</g,'&lt;')}${sd.examples ? ' | דוגמאות: ' + sd.examples.replace(/</g,'&lt;') : ''}</td></tr>`;
        }
    });
    
    const dateStr = new Date().toLocaleDateString('he-IL');
    const traineeColor = window.app.traineeColors[traineeIdx];
    
    const fullHTML = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>סיכום הערכה - ${traineeName}</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; direction:rtl; padding:20px; color:#1e293b; background:#fff; }
        @media print { body { padding:10px; } }
    </style>
</head>
<body>
    <div style="border-bottom:4px solid ${traineeColor};padding-bottom:12px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
                <h1 style="font-size:22px;color:#1e3a5f;margin-bottom:4px;">סיכום הערכה</h1>
                <div style="font-size:18px;font-weight:700;color:${traineeColor};">${traineeName}</div>
            </div>
            <div style="text-align:left;font-size:12px;color:#6b7280;">
                <div>${data.assessmentName || ''}</div>
                <div>מעריך: ${data.evaluatorName || ''}</div>
                <div>${dateStr}</div>
            </div>
        </div>
        ${overallScore ? `<div style="margin-top:8px;display:inline-block;background:${scoreColor(overallScore)};color:white;padding:4px 16px;border-radius:20px;font-size:18px;font-weight:800;">ציון סופי: ${overallScore}</div>` : ''}
    </div>
    
    <div style="margin-bottom:20px;">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);color:white;padding:10px 14px;border-radius:8px 8px 0 0;font-weight:700;font-size:16px;">סיכום הערכה כללי</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
            ${summaryRows}
        </table>
    </div>
    
    <h2 style="font-size:16px;color:#1e3a5f;margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">ציונים לפי תרגילים</h2>
    ${exerciseHTML}
    
    <div style="margin-top:20px;text-align:center;font-size:10px;color:#9ca3af;">
        נוצר ב-${dateStr} | MyApp v5.7
    </div>
</body>
</html>`;
    
    // Open in new window for print/save as PDF
    if (window.cordova) {
        // On device: write to cache and share
        try {
            const fileName = `סיכום_${traineeName}_${dateStr.replace(/\//g,'-')}.html`;
            window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dir) {
                dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
                    fileEntry.createWriter(function(writer) {
                        writer.onwriteend = function() {
                            // Try to open/share the file
                            if (window.plugins && window.plugins.socialsharing) {
                                window.plugins.socialsharing.share(
                                    'סיכום הערכה - ' + traineeName,
                                    'סיכום הערכה',
                                    [fileEntry.nativeURL],
                                    null,
                                    function() { console.log('Shared OK'); },
                                    function(err) { 
                                        // Fallback: open in browser
                                        window.open(fileEntry.toURL(), '_blank', 'location=no');
                                    }
                                );
                            } else {
                                window.open(fileEntry.toURL(), '_blank', 'location=no');
                            }
                        };
                        writer.write(new Blob([fullHTML], {type: 'text/html'}));
                    });
                }, function(err) { alert('שגיאה ביצירת קובץ: ' + err); });
            }, function(err) { 
                // Fallback for no filesystem
                const blob = new Blob([fullHTML], {type: 'text/html'});
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            });
        } catch(e) {
            const blob = new Blob([fullHTML], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    } else {
        // Browser: open in new tab
        const blob = new Blob([fullHTML], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.addEventListener('load', () => {
                // Auto-trigger print dialog for PDF save
                setTimeout(() => win.print(), 500);
            });
        }
    }
};
