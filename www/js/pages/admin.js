/**
 * Admin Page Module
 * Configuration and history management
 */

export class AdminPage {
    render() {
        return `
            <div class="container">
                <h2>דף מנהל</h2>
                
                <div style="margin-bottom: 15px;">
                    <label>שם ההערכה</label>
                    <input type="text" id="assessmentName" value="${window.escapeHtml(window.app.data.assessmentName)}">
                </div>
                
                <div class="grid-2">
                    <div>
                        <label>חניך 1</label>
                        <input type="text" id="trainee1" value="${window.escapeHtml(window.app.data.trainee1)}">
                    </div>
                    <div>
                        <label>חניך 2</label>
                        <input type="text" id="trainee2" value="${window.escapeHtml(window.app.data.trainee2)}">
                    </div>
                    <div>
                        <label>חניך 3</label>
                        <input type="text" id="trainee3" value="${window.escapeHtml(window.app.data.trainee3)}">
                    </div>
                    <div>
                        <label>חניך 4</label>
                        <input type="text" id="trainee4" value="${window.escapeHtml(window.app.data.trainee4)}">
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <label>דגשים</label>
                    <textarea id="highlights" rows="4">${window.escapeHtml(window.app.data.highlights)}</textarea>
                </div>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית חנויות (טיח)
                </h3>
                <div id="storeHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addStoreToAdmin()">הוסף חנות</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית מלונות (יומינט)
                </h3>
                <div id="hotelHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addHotelToAdmin()">הוסף מלון</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    📊 ייצוא הגדרות
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                    <button class="btn btn-save" onclick="exportAdminJSON('share')" style="background: #3b82f6;">
                        📤 שיתוף (Social Share)
                    </button>
                    <button class="btn btn-save" onclick="exportAdminJSON('external')" style="background: #10b981;">
                        💾 שמירה (External Storage)
                    </button>
                    <button class="btn btn-save" onclick="exportAdminJSON('dialog')" style="background: #f59e0b;">
                        📁 בחר מיקום (Save Dialog)
                    </button>
                </div>
                
                <div class="nav-buttons">
                    <button class="btn btn-save" onclick="saveAdminAndBack()">💾 שמור וחזור</button>
                    <button class="btn btn-save" onclick="loadAdminJSON()">📤 טען הגדרות</button>
                </div>
                <input type="file" id="jsonFileInput" accept=".json,.txt" style="display: none;" onchange="handleJSONFile(event)">
            </div>
        `;
    }

    onEnter() {
        this.renderStoreHistory();
        this.renderHotelHistory();
        this.attachEventListeners();
    }

    renderStoreHistory() {
        const container = document.getElementById('storeHistoryList');
        if (!container) return;

        container.innerHTML = '';
        
        window.app.data.storeHistory.forEach((store, index) => {
            const div = document.createElement('div');
            div.className = 'history-edit-item';
            div.innerHTML = `
                <input type="text" value="${window.escapeHtml(store.name)}" 
                    onchange="updateStoreHistory(${index}, 'name', this.value)" 
                    placeholder="שם חנות">
                <input type="text" value="${window.escapeHtml(store.address)}" 
                    onchange="updateStoreHistory(${index}, 'address', this.value)" 
                    placeholder="כתובת">
                <input type="text" value="${window.escapeHtml(store.notes || '')}" 
                    onchange="updateStoreHistory(${index}, 'notes', this.value)" 
                    placeholder="הערות">
                <div style="font-size: 11px; color: #666; margin: 5px 0;">
                    תאריך: ${store.date}
                </div>
                <button class="btn-delete" onclick="deleteStore(${index})">מחק</button>
            `;
            container.appendChild(div);
        });
    }

    renderHotelHistory() {
        const container = document.getElementById('hotelHistoryList');
        if (!container) return;

        container.innerHTML = '';
        
        window.app.data.hotelHistory.forEach((hotel, index) => {
            const div = document.createElement('div');
            div.className = 'history-edit-item';
            div.innerHTML = `
                <input type="text" value="${window.escapeHtml(hotel.name)}" 
                    onchange="updateHotelHistory(${index}, 'name', this.value)" 
                    placeholder="שם מלון">
                <input type="text" value="${window.escapeHtml(hotel.address)}" 
                    onchange="updateHotelHistory(${index}, 'address', this.value)" 
                    placeholder="כתובת">
                <input type="text" value="${window.escapeHtml(hotel.notes || '')}" 
                    onchange="updateHotelHistory(${index}, 'notes', this.value)" 
                    placeholder="הערות">
                <div style="font-size: 11px; color: #666; margin: 5px 0;">
                    תאריך: ${hotel.date}
                </div>
                <button class="btn-delete" onclick="deleteHotel(${index})">מחק</button>
            `;
            container.appendChild(div);
        });
    }

    attachEventListeners() {
        // Make functions global for onclick handlers
        window.updateStoreHistory = (idx, field, value) => {
            window.storage.updateStore(idx, field, value);
        };

        window.deleteStore = (idx) => {
            if (confirm('האם אתה בטוח שברצונך למחוק חנות זו?')) {
                window.storage.deleteStore(idx);
                this.renderStoreHistory();
            }
        };

        window.addStoreToAdmin = () => {
            window.storage.addStore('', '', '');
            this.renderStoreHistory();
        };

        window.updateHotelHistory = (idx, field, value) => {
            window.storage.updateHotel(idx, field, value);
        };

        window.deleteHotel = (idx) => {
            if (confirm('האם אתה בטוח שברצונך למחוק מלון זה?')) {
                window.storage.deleteHotel(idx);
                this.renderHotelHistory();
            }
        };

        window.addHotelToAdmin = () => {
            window.storage.addHotel('', '', '');
            this.renderHotelHistory();
        };

        window.saveAdminAndBack = () => {
            // Save all admin fields
            const assessmentInput = document.getElementById('assessmentName');
            if (assessmentInput) {
                window.app.data.assessmentName = assessmentInput.value;
            }
            
            for (let i = 1; i <= 4; i++) {
                const traineeInput = document.getElementById(`trainee${i}`);
                if (traineeInput) {
                    window.app.data[`trainee${i}`] = traineeInput.value;
                }
            }
            
            const highlightsInput = document.getElementById('highlights');
            if (highlightsInput) {
                window.app.data.highlights = highlightsInput.value;
            }
            
            window.storage.saveData();
            goToPage('landing');
        };

        window.exportAdminJSON = async () => {
            await window.exportManager.exportToJSON();
        };

        window.loadAdminJSON = () => {
            document.getElementById('jsonFileInput').click();
        };

        window.handleJSONFile = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                await window.exportManager.loadFromJSON(file);
                
                // Refresh the page
                this.onEnter();
                
                // Update input fields
                document.getElementById('assessmentName').value = window.app.data.assessmentName;
                document.getElementById('trainee1').value = window.app.data.trainee1;
                document.getElementById('trainee2').value = window.app.data.trainee2;
                document.getElementById('trainee3').value = window.app.data.trainee3;
                document.getElementById('trainee4').value = window.app.data.trainee4;
                document.getElementById('highlights').value = window.app.data.highlights;
                
                alert('✅ הגדרות נטענו בהצלחה!\n\nשם ההערכה, חניכים, דגשים, חנויות ומלונות עודכנו.');
            } catch (error) {
                alert('❌ שגיאה בטעינת קובץ JSON:\n' + error.message);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        // Test export functions for different methods
        window.testExportJSON = async (method) => {
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
            
            for (let t = 0; t < 4; t++) {
                exportData.trainees.push({
                    id: t,
                    name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`
                });
            }
            
            const jsonStr = JSON.stringify(exportData, null, 2);
            const filename = `בדיקה-JSON-שיטה${method}_${Date.now()}.json`;
            
            try {
                await this.executeExportMethod(method, jsonStr, filename, 'application/json');
            } catch (error) {
                alert(`❌ שיטה ${method} נכשלה:\n${error.message}`);
            }
        };
        
        window.testExportCSV = async (method) => {
            let csv = '\uFEFF'; // UTF-8 BOM
            csv += 'שם ההערכה,' + window.csvEscape(window.app.data.assessmentName || 'לא מולא') + '\n';
            csv += 'מעריך,' + window.csvEscape(window.app.data.evaluatorName || 'לא מולא') + '\n';
            csv += 'תאריך,' + new Date().toLocaleDateString('he-IL') + '\n\n';
            csv += 'חניכים,';
            for (let i = 1; i <= 4; i++) {
                csv += window.csvEscape(window.app.data[`trainee${i}`] || 'לא מולא');
                if (i < 4) csv += ',';
            }
            csv += '\n';
            csv += 'דגשים,' + window.csvEscape(window.app.data.highlights || 'לא מולא') + '\n';
            
            const filename = `בדיקה-CSV-שיטה${method}_${Date.now()}.csv`;
            
            try {
                await this.executeExportMethod(method, csv, filename, 'text/csv;charset=utf-8;');
            } catch (error) {
                alert(`❌ שיטה ${method} נכשלה:\n${error.message}`);
            }
        };
    }
    
    async executeExportMethod(method, content, filename, mimeType) {
        switch(method) {
            case 1: // File System API
                if (!('showSaveFilePicker' in window)) {
                    alert('❌ File System API לא נתמך במכשיר זה');
                    return;
                }
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: filename.endsWith('.json') ? 'JSON Files' : 'CSV Files',
                        accept: {[mimeType]: [filename.endsWith('.json') ? '.json' : '.csv']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                alert(`✅ שיטה ${method} הצליחה!\nהקובץ נשמר במיקום שבחרת.`);
                break;
                
            case 3: // Blob Download
                const blob3 = new Blob([content], {type: mimeType});
                const url3 = URL.createObjectURL(blob3);
                const a3 = document.createElement('a');
                a3.href = url3;
                a3.download = filename;
                a3.click();
                URL.revokeObjectURL(url3);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד לתיקיית ההורדות.`);
                break;
                
            case 4: // Data URI
                const dataUrl = `data:${mimeType},${encodeURIComponent(content)}`;
                const a4 = document.createElement('a');
                a4.href = dataUrl;
                a4.download = filename;
                a4.click();
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 5: // Window.open
                const blob5 = new Blob([content], {type: mimeType});
                const url5 = URL.createObjectURL(blob5);
                const newWindow = window.open(url5, '_blank');
                setTimeout(() => URL.revokeObjectURL(url5), 1000);
                if (newWindow) {
                    alert(`✅ שיטה ${method} הצליחה!\nהקובץ נפתח בחלון חדש.`);
                } else {
                    alert(`⚠️ שיטה ${method}: חלון נחסם.\nאפשר חלונות קופצים ונסה שוב.`);
                }
                break;
                
            case 6: // Force Download (octet-stream)
                const blob6 = new Blob([content], {type: 'application/octet-stream'});
                const url6 = URL.createObjectURL(blob6);
                const a6 = document.createElement('a');
                a6.href = url6;
                a6.download = filename;
                a6.click();
                URL.revokeObjectURL(url6);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 7: // iframe
                const dataUrl7 = `data:${mimeType},${encodeURIComponent(content)}`;
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = dataUrl7;
                document.body.appendChild(iframe);
                setTimeout(() => {
                    try {
                        document.body.removeChild(iframe);
                    } catch(e) {}
                }, 2000);
                alert(`✅ שיטה ${method} הופעלה!\nאם הקובץ הורד - השיטה עובדת!`);
                break;
                
            case 8: // Temporary Link
                const blob8 = new Blob([content], {type: mimeType});
                const url8 = URL.createObjectURL(blob8);
                const a8 = document.createElement('a');
                a8.style.display = 'none';
                a8.href = url8;
                a8.download = filename;
                document.body.appendChild(a8);
                a8.click();
                setTimeout(() => {
                    document.body.removeChild(a8);
                    URL.revokeObjectURL(url8);
                }, 100);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 10: // Smart Cascade
                let success = false;
                let usedMethod = '';
                
                // Try File System API
                if ('showSaveFilePicker' in window) {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: filename,
                            types: [{
                                description: filename.endsWith('.json') ? 'JSON' : 'CSV',
                                accept: {[mimeType]: [filename.endsWith('.json') ? '.json' : '.csv']}
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(content);
                        await writable.close();
                        usedMethod = 'File System API';
                        success = true;
                    } catch(e) {
                        if (e.name !== 'AbortError') console.log('FS failed:', e);
                    }
                }
                
                // Fallback to Blob
                if (!success) {
                    const blob = new Blob([content], {type: mimeType});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                    usedMethod = 'Blob Download';
                    success = true;
                }
                
                alert(`✅ מפל חכם הצליח!\nשיטה שעבדה: ${usedMethod}`);
                break;
                
            default:
                alert(`❌ שיטה ${method} לא נתמכת`);
        }
    }

    onLeave() {
        // Save all admin fields before leaving
        const assessmentInput = document.getElementById('assessmentName');
        if (assessmentInput) {
            window.app.data.assessmentName = assessmentInput.value;
        }
        
        for (let i = 1; i <= 4; i++) {
            const traineeInput = document.getElementById(`trainee${i}`);
            if (traineeInput) {
                window.app.data[`trainee${i}`] = traineeInput.value;
            }
        }
        
        const highlightsInput = document.getElementById('highlights');
        if (highlightsInput) {
            window.app.data.highlights = highlightsInput.value;
        }
        
        window.storage.saveData();
    }
}
