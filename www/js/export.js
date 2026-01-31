/**
 * Export Manager Module
 * Handles JSON, Excel, and WhatsApp exports
 */

export class ExportManager {
    /**
     * Add completed exercises to history
     */
    addToHistory() {
        for (let t = 0; t < 4; t++) {
            // Add stores from Tiach exercise
            const tiachKey = `${t}-1`;
            const tiachData = window.app.data.exerciseData[tiachKey];
            if (tiachData) {
                // Tiach 1 store
                if (tiachData.tiach1_store_name_input && tiachData.tiach1_address_input) {
                    this.addUniqueStore(
                        tiachData.tiach1_store_name_input, 
                        tiachData.tiach1_address_input,
                        tiachData.tiach1_date || ''
                    );
                }
                // Tiach 2 store
                if (tiachData.tiach2_store_name_input && tiachData.tiach2_address_input) {
                    this.addUniqueStore(
                        tiachData.tiach2_store_name_input, 
                        tiachData.tiach2_address_input,
                        tiachData.tiach2_date || ''
                    );
                }
            }

            // Add hotels from Laila exercise
            const lailaKey = `${t}-4`;
            const lailaData = window.app.data.exerciseData[lailaKey];
            if (lailaData) {
                if (lailaData.hotel_name_input && lailaData.hotel_address_input) {
                    this.addUniqueHotel(
                        lailaData.hotel_name_input, 
                        lailaData.hotel_address_input,
                        lailaData.hotel_date || ''
                    );
                }
            }

            // Add hotels from Yominet exercise
            const yominetKey = `${t}-6`;
            const yominetData = window.app.data.exerciseData[yominetKey];
            if (yominetData) {
                // New hotel input field
                if (yominetData.hotel_name_input && yominetData.hotel_address_input) {
                    this.addUniqueHotel(
                        yominetData.hotel_name_input, 
                        yominetData.hotel_address_input,
                        yominetData.hotel_date || ''
                    );
                }
                // Old fields (keeping for backwards compatibility)
                if (yominetData.hotel1_name && yominetData.hotel1_address) {
                    this.addUniqueHotel(yominetData.hotel1_name, yominetData.hotel1_address);
                }
                if (yominetData.hotel2_name && yominetData.hotel2_address) {
                    this.addUniqueHotel(yominetData.hotel2_name, yominetData.hotel2_address);
                }
            }
        }
        window.storage.saveData();
    }

    addUniqueStore(name, address, date = '') {
        const exists = window.app.data.storeHistory.some(
            s => s.name === name && s.address === address
        );
        if (!exists) {
            window.storage.addStore(name, address, date);
        }
    }

    addUniqueHotel(name, address, date = '') {
        const exists = window.app.data.hotelHistory.some(
            h => h.name === name && h.address === address
        );
        if (!exists) {
            window.storage.addHotel(name, address, date);
        }
    }

    /**
     * Export complete data to JSON using File System Access API with fallback
     */
    async exportToJSON() {
        this.addToHistory();
        
        // Build complete export object
        const exportData = {
            metadata: {
                assessmentName: window.app.data.assessmentName,
                evaluatorName: window.app.data.evaluatorName,
                exportDate: new Date().toISOString(),
                appVersion: '1.0'
            },
            trainees: [],
            highlights: window.app.data.highlights,
            storeHistory: window.app.data.storeHistory,
            hotelHistory: window.app.data.hotelHistory
        };

        // Add each trainee with their complete data
        for (let t = 0; t < 4; t++) {
            const traineeData = {
                id: t,
                name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`,
                exercises: {},
                summary: {}
            };

            // Add exercise data
            window.app.exercises.forEach((exerciseName, e) => {
                const key = `${t}-${e}`;
                const exData = window.app.data.exerciseData[key] || {};
                if (Object.keys(exData).length > 0) {
                    traineeData.exercises[exerciseName] = exData;
                }
            });

            // Add summary data
            window.app.criteria.forEach(criterion => {
                const key = `${t}-${criterion}`;
                const score = window.storage.getSummaryData(key, 'score');
                const text = window.storage.getSummaryData(key, 'text');
                const examples = window.storage.getSummaryData(key, 'examples');
                
                if (score || text || examples) {
                    traineeData.summary[criterion] = {
                        score: score || 'לא מולא',
                        text: text || 'לא מולא',
                        examples: examples || 'לא מולא'
                    };
                }
            });

            exportData.trainees.push(traineeData);
        }

        const jsonStr = JSON.stringify(exportData, null, 2);
        const filename = `הגדרות-מנהל_${new Date().toISOString().slice(0, 10)}.json`;

        // Try Method 1: File System Access API
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON Files',
                        accept: {'application/json': ['.json']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(jsonStr);
                await writable.close();
                alert('✅ קובץ JSON נשמר בהצלחה!\n\nשם ההערכה, חניכים, דגשים, היסטוריית חנויות ומלונות נשמרו.');
                return;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('File System API failed:', error);
            }
        }

        // Fallback: Blob download
        try {
            const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
            
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, filename);
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
            alert('✅ קובץ JSON יוצא בהצלחה!\n\nשם ההערכה, חניכים, דגשים, היסטוריית חנויות ומלונות נשמרו.');
        } catch (error) {
            alert('❌ שגיאה בייצוא JSON:\n' + error.message);
        }
    }

    /**
     * Load data from JSON (for admin page)
     */
    async loadFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Update admin settings
                    if (data.metadata) {
                        window.app.data.assessmentName = data.metadata.assessmentName || '';
                        window.app.data.evaluatorName = data.metadata.evaluatorName || '';
                    }
                    
                    // Update trainees
                    if (data.trainees && data.trainees.length > 0) {
                        for (let i = 0; i < Math.min(4, data.trainees.length); i++) {
                            window.app.data[`trainee${i + 1}`] = data.trainees[i].name || '';
                        }
                    }
                    
                    // Update highlights
                    window.app.data.highlights = data.highlights || '';
                    
                    // Update histories
                    if (data.storeHistory) {
                        window.app.data.storeHistory = data.storeHistory;
                    }
                    if (data.hotelHistory) {
                        window.app.data.hotelHistory = data.hotelHistory;
                    }
                    
                    window.storage.saveData();
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Export to Excel (CSV format with UTF-8 BOM) using File System Access API with fallback
     * Includes ALL fields, marks empty fields as "לא מולא"
     */
    async exportToExcel() {
        this.addToHistory();

        let csv = '\uFEFF'; // UTF-8 BOM for Excel
        csv += 'שם ההערכה,' + window.csvEscape(window.app.data.assessmentName || 'לא מולא') + '\n';
        csv += 'מעריך,' + window.csvEscape(window.app.data.evaluatorName || 'לא מולא') + '\n';
        csv += 'תאריך,' + new Date().toLocaleDateString('he-IL') + '\n\n';

        // Trainees
        csv += 'חניכים,';
        for (let i = 1; i <= 4; i++) {
            csv += window.csvEscape(window.app.data[`trainee${i}`] || 'לא מולא');
            if (i < 4) csv += ',';
        }
        csv += '\n';
        csv += 'דגשים,' + window.csvEscape(window.app.data.highlights || 'לא מולא') + '\n\n';

        // Store history
        csv += 'היסטוריית חנויות (טיח)\n';
        csv += 'שם,כתובת,תאריך,הערות\n';
        if (window.app.data.storeHistory.length > 0) {
            window.app.data.storeHistory.forEach(s => {
                csv += window.csvEscape(s.name || 'לא מולא') + ',';
                csv += window.csvEscape(s.address || 'לא מולא') + ',';
                csv += (s.date || 'לא מולא') + ',';
                csv += window.csvEscape(s.notes || 'לא מולא') + '\n';
            });
        } else {
            csv += 'לא מולא,לא מולא,לא מולא,לא מולא\n';
        }
        csv += '\n';

        // Hotel history
        csv += 'היסטוריית מלונות (לילה)\n';
        csv += 'שם,כתובת,תאריך,הערות\n';
        if (window.app.data.hotelHistory.length > 0) {
            window.app.data.hotelHistory.forEach(h => {
                csv += window.csvEscape(h.name || 'לא מולא') + ',';
                csv += window.csvEscape(h.address || 'לא מולא') + ',';
                csv += (h.date || 'לא מולא') + ',';
                csv += window.csvEscape(h.notes || 'לא מולא') + '\n';
            });
        } else {
            csv += 'לא מולא,לא מולא,לא מולא,לא מולא\n';
        }
        csv += '\n';

        // Exercise data for each trainee
        for (let t = 0; t < 4; t++) {
            const traineeName = window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`;
            csv += `\n=== ${window.csvEscape(traineeName)} ===\n\n`;

            window.app.exercises.forEach((exerciseName, e) => {
                csv += `תרגיל: ${exerciseName}\n`;
                const key = `${t}-${e}`;
                const exData = window.app.data.exerciseData[key] || {};
                
                if (Object.keys(exData).length > 0) {
                    for (const field in exData) {
                        if (exData.hasOwnProperty(field)) {
                            const value = exData[field];
                            csv += `${field}:,${window.csvEscape(value || 'לא מולא')}\n`;
                        }
                    }
                } else {
                    csv += 'לא מולא\n';
                }
                csv += '\n';
            });
        }

        // Summary data
        csv += '\n=== סיכום הערכה ===\n\n';
        for (let t = 0; t < 4; t++) {
            const traineeName = window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`;
            csv += `\n${window.csvEscape(traineeName)}\n`;
            csv += 'קריטריון,ציון,הערות,דוגמאות\n';

            window.app.criteria.forEach(criterion => {
                const key = `${t}-${criterion}`;
                const score = window.storage.getSummaryData(key, 'score') || 'לא מולא';
                const text = window.storage.getSummaryData(key, 'text') || 'לא מולא';
                const examples = window.storage.getSummaryData(key, 'examples') || 'לא מולא';

                csv += window.csvEscape(criterion) + ',';
                csv += window.csvEscape(score) + ',';
                csv += window.csvEscape(text) + ',';
                csv += window.csvEscape(examples) + '\n';
            });
        }

        const filename = `משוב-סדנה_${new Date().toISOString().slice(0, 10)}.csv`;

        // Try Method 1: File System Access API
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'CSV Files',
                        accept: {'text/csv': ['.csv']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(csv);
                await writable.close();
                alert('✅ קובץ Excel נשמר בהצלחה!\n\nהקובץ נשמר במיקום שבחרת.');
                return;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('File System API failed:', error);
            }
        }

        // Fallback: Try iframe method (worked for CSV in tests)
        try {
            const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = dataUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                try {
                    document.body.removeChild(iframe);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }, 2000);
            
            alert('✅ קובץ Excel יוצא!\n\nאם הקובץ לא הורד, בדוק את תיקיית ההורדות.');
        } catch (error) {
            alert('❌ שגיאה בייצוא Excel:\n' + error.message);
        }
    }

    /**
     * Share Excel via WhatsApp
     * Exports Excel file first, then shares it
     */
    async shareToWhatsApp() {
        // Export Excel file
        this.exportToExcel();
        
        // Wait a moment for file to download
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show instructions
        alert('📤 קובץ ה-Excel יוצא!\n\n' +
              '📱 כעת תוכל לשתף אותו בWhatsApp:\n\n' +
              '1. פתח את WhatsApp\n' +
              '2. בחר שיחה\n' +
              '3. לחץ על 📎 (קליפ)\n' +
              '4. בחר "מסמך"\n' +
              '5. מצא את הקובץ בהורדות\n' +
              '6. שלח!');
    }
}
