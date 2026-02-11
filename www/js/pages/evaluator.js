/**
 * Evaluator Page Module
 * Evaluator name and primary trainee selection
 */

export class EvaluatorPage {
    render() {
        return `
            <div class="container">
                <h2>דף מעריך</h2>
                
                <div class="import-box">
                    <label style="margin-bottom: 8px;">ייבוא הגדרות מנהל (קובץ JSON)</label>
                    <input type="file" id="jsonFileInput" accept=".json" style="display: none;" data-folder="whatsapp"">
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-add" onclick="triggerJSONImport()" style="flex: 1;">📥 טען קובץ הגדרות</button>
                        <button class="btn-delete" onclick="resetExerciseData()" style="flex: 1;">🔄 איפוס נתונים</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>שם המעריך</label>
                    <input type="text" id="evaluatorName" value="${window.escapeHtml(window.app.data.evaluatorName)}">
                </div>
                
                <div>
                    <label>בחירת חניכים ראשיים (בחר 2)</label>
                    <div class="primary-selection" id="primaryBtns"></div>
                </div>
                
                <div id="highlightsDisplay" class="highlights-box" style="display: none;">
                    <h3 style="font-size: 16px; margin-bottom: 8px;">דגשים כלליים:</h3>
                    <p id="highlightsText" style="white-space: pre-wrap;"></p>
                </div>
                
                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('landing')">⬅ אחורה</button>
                    <button class="btn btn-forward" onclick="goToPage('assessment')">קדימה ➡</button>
                </div>
            </div>
            
            <!-- Easter Egg -->
            <div id="easterEgg" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 99999; justify-content: center; align-items: center;">
                <img src="easter-egg.png" style="max-width: 80%; max-height: 80%; border-radius: 20px; box-shadow: 0 0 50px rgba(255,255,255,0.3);">
            </div>
            <audio id="easterEggAudio" src="easter-egg.mp3" loop></audio>
        `;
    }

    onEnter() {
        this.renderPrimaryButtons();
        this.updateHighlights();
        this.attachEventListeners();
        this.initEasterEgg();
    }

    renderPrimaryButtons() {
        const container = document.getElementById('primaryBtns');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const btn = document.createElement('button');
            const isPrimary = window.app.primaryTrainees.indexOf(i) >= 0;
            btn.className = isPrimary ? 'primary-btn selected' : 'primary-btn';
            
            if (isPrimary) {
                btn.innerHTML = '⭐ ' + window.getTraineeName(i) + ' ⭐';
            } else {
                btn.textContent = window.getTraineeName(i);
            }
            
            btn.onclick = () => this.togglePrimary(i);
            container.appendChild(btn);
        }
    }

    togglePrimary(index) {
        const idx = window.app.primaryTrainees.indexOf(index);
        
        if (idx >= 0) {
            // Remove from primary
            window.app.primaryTrainees.splice(idx, 1);
        } else {
            // Add to primary (max 2)
            if (window.app.primaryTrainees.length < 2) {
                window.app.primaryTrainees.push(index);
            } else {
                alert('ניתן לבחור עד 2 חניכים ראשיים בלבד');
                return;
            }
        }
        
        this.renderPrimaryButtons();
        window.storage.saveData();
    }

    updateHighlights() {
        const highlightsDisplay = document.getElementById('highlightsDisplay');
        const highlightsText = document.getElementById('highlightsText');
        
        if (window.app.data.highlights) {
            highlightsDisplay.style.display = 'block';
            highlightsText.textContent = window.app.data.highlights;
        } else {
            highlightsDisplay.style.display = 'none';
        }
    }

    attachEventListeners() {
        window.triggerJSONImport = async () => {
            const input = document.getElementById('jsonFileInput');
            
            // ניסיון לפתוח ישירות את תיקיית WhatsApp (עובד רק ב-Chrome מודרני)
            if (window.cordova && window.cordova.file) {
                try {
                    // נסה לגשת לתיקיית WhatsApp
                    const whatsappPath = '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents/';
                    console.log('Attempting to open WhatsApp folder:', whatsappPath);
                } catch (e) {
                    console.log('Could not pre-navigate to WhatsApp folder');
                }
            }
            
            input.click();
        };
        
        // פונקציה לאיפוס נתונים
        window.resetExerciseData = () => {
            if (confirm('⚠️ האם אתה בטוח שברצונך למחוק את כל נתוני התרגילים, הסיכום והמסמכים הסרוקים?\n\nפעולה זו תמחק:\n✓ כל התשובות בתרגילים\n✓ כל הציונים והערות בסיכום ההערכה\n✓ כל המסמכים הסרוקים\n\nהנתונים האחרים (שמות חניכים, דגשים, חנויות ומלונות) לא יושפעו.')) {
                // מחיקת נתוני תרגילים
                window.app.data.exerciseData = {};
                // מחיקת נתוני סיכום
                window.app.data.summaryData = {};
                // מחיקת מסמכים סרוקים מהזיכרון
                window.app.data.scannedDocs = {};
                
                // ניקוי קבצים זמניים מהcache (לא מ-Downloads)
                if (window.cordova && window.cordova.file) {
                    try {
                        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(cacheDir) {
                            var reader = cacheDir.createReader();
                            reader.readEntries(function(entries) {
                                entries.forEach(function(entry) {
                                    if (entry.isDirectory && (entry.name.includes('_docs_') || entry.name.includes('מסמכים'))) {
                                        entry.removeRecursively(function() { console.log('🗑️ Cache dir removed:', entry.name); }, function() {});
                                    } else if (entry.isFile && entry.name.endsWith('.pdf')) {
                                        entry.remove(function() { console.log('🗑️ Cache file removed:', entry.name); }, function() {});
                                    }
                                });
                            }, function() {});
                        }, function() {});
                    } catch(e) { console.warn('Cache cleanup error:', e); }
                }
                
                window.storage.saveData(true);
                alert('✅ נתוני התרגילים, הסיכום והמסמכים הסרוקים נמחקו בהצלחה!');
            }
        };

        const fileInput = document.getElementById('jsonFileInput');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    // שאלה אם למחוק נתונים לפני ייבוא
                    const shouldReset = confirm('❓ האם ברצונך למחוק את נתוני התרגילים והסיכום לפני הייבוא?\n\n✓ כן - מחק נתונים קיימים ואז טען את ההגדרות\n✗ לא - רק טען הגדרות (שמות, דגשים, היסטוריה)');
                    
                    if (shouldReset) {
                        window.app.data.exerciseData = {};
                        window.app.data.summaryData = {};
                    }
                    
                    await window.exportManager.loadFromJSON(file);
                    this.renderPrimaryButtons();
                    this.updateHighlights();
                    alert('✅ הגדרות נטענו בהצלחה!\n\nשם ההערכה, חניכים, דגשים, חנויות ומלונות עודכנו.');
                } catch (error) {
                    alert('❌ שגיאה בקריאת קובץ JSON:\n' + error.message);
                    console.error(error);
                }
                
                // Reset file input
                e.target.value = '';
            };
        }
    }

    initEasterEgg() {
        let clickCount = 0;
        let clickTimer = null;
        
        const evaluatorInput = document.getElementById('evaluatorName');
        const easterEgg = document.getElementById('easterEgg');
        const audio = document.getElementById('easterEggAudio');
        
        if (!evaluatorInput || !easterEgg || !audio) return;
        
        // לחיצה על תיבת טקסט
        evaluatorInput.addEventListener('click', () => {
            clickCount++;
            
            // איפוס אחרי 2 שניות
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
            
            // אם לחצו 10 פעמים
            if (clickCount >= 10) {
                clickCount = 0;
                easterEgg.style.display = 'flex';
                audio.play().catch(err => console.log('Audio play failed:', err));
            }
        });
        
        // סגירה בלחיצה על הרקע
        easterEgg.addEventListener('click', (e) => {
            if (e.target === easterEgg) {
                easterEgg.style.display = 'none';
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    onLeave() {
        // Save evaluator name
        const evaluatorInput = document.getElementById('evaluatorName');
        if (evaluatorInput) {
            window.app.data.evaluatorName = evaluatorInput.value;
        }
        window.storage.saveData();
    }
}
