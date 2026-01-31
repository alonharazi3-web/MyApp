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
                    <input type="file" id="jsonFileInput" accept=".json" style="display: none;">
                    <button class="btn-add" onclick="triggerJSONImport()">📥 טען קובץ הגדרות</button>
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
        `;
    }

    onEnter() {
        this.renderPrimaryButtons();
        this.updateHighlights();
        this.attachEventListeners();
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
        window.triggerJSONImport = () => {
            document.getElementById('jsonFileInput').click();
        };

        const fileInput = document.getElementById('jsonFileInput');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
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

    onLeave() {
        // Save evaluator name
        const evaluatorInput = document.getElementById('evaluatorName');
        if (evaluatorInput) {
            window.app.data.evaluatorName = evaluatorInput.value;
        }
        window.storage.saveData();
    }
}
