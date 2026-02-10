/**
 * Yominet Exercise Module - תרגיל יומינט
 * Humintactic street challenges + hotel room infiltration
 */

export class YominetExercise {
    constructor() {
        this.name = 'יומינט';
        
        // Bank of street challenges
        this.challenges = [
            'עצירת אדם ל2 דק\'',
            'עצירת בנאדם והוצאת פרטים אישיים',
            'השאלת פריט לבוש מאדם',
            'להצטלם עם אדם ברחוב',
            'החזרת אדם אחורה מספר צעדים ברחוב',
            'החזרת אדם אחורה במעבר חצייה',
            'עלייה על מונית ונסיעה מספר מטרים',
            'כניסה מאחורי דוכן אוכל',
            'קבלת אוכל/שתיה ללא תשלום',
            'קבלת שירות ללא תמורה - לק/לבוש ייחודי/תספורת',
            'הקמת מגע',
            'סיור שטח וצילום חדר מלון'
        ];
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4>${this.name}</h4>`;
        
        html += `
            <div class="info-box">מסגרת זמנים: שעה וחצי לשני המועמדים</div>
            
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                כישורי יומינטקטי, גמישות מחשבתית, תעוזה ובטחון עצמי, יציאה מאזור הנוחות
            </div>
            
            <div class="guidelines-box">
                <strong>הנחיות ודגשים לתרגיל:</strong><br>
                1. זמן התכנון הוא קצר ותו"כ תנועה<br>
                2. מתחילים בעיכוב אדם למס דק<br>
                3. יש לתת אוביקטים שונים לתרגיל<br>
                4. יש לבצע הפקת לקחים קצרה בין תרגילים<br>
                5. בפעם השניה יש "לזרוק למים" ללא הכוונה על אופן הפניה ולדרוש הוצאת יותר פרטים אישיים
            </div>
            
            <div class="story-box">
                <h4>📖 הנחיות לחניך:</h4>
                עלייך לעכב בנאדם למשך 2-3 דק'. יש לחשוב על סיפור גנרי המתאים לרוב סוגי האנשים 
                וניתן לבצע התאמות תו"כ.
            </div>
            
            <div class="section-title">בנק תרגילים</div>
        `;
        
        // Render all challenges with status
        this.challenges.forEach((challenge, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${challenge}</div>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="ביצע" 
                                ${this.getData(key, `task_${i}`) === 'ביצע' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">ביצע
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="לא הצליח לבצע" 
                                ${this.getData(key, `task_${i}`) === 'לא הצליח לבצע' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">לא הצליח לבצע
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="לא הועבר לחניך" 
                                ${this.getData(key, `task_${i}`) === 'לא הועבר לחניך' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">לא הועבר לחניך
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += '<div class="section-title">בנק שאלות לתרגילים</div>';
        
        const taskQuestions = [
            'איך היה לך?',
            'מה היה הסיפור כיסוי?',
            'האם האמינו לסיפור כיסוי שלך?',
            'כמה זמן הצלחת לעכב/לשהות/לבצע?',
            'למה לדעתך הצלחת או לא הצלחת במשימה?',
            'מה היית עושה אחרת?'
        ];
        
        taskQuestions.forEach((q, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${q}</div>
                    <textarea onchange="setExerciseData('${key}', 'taskq_${i}', this.value)">${window.escapeHtml(this.getData(key, `taskq_${i}`))}</textarea>
                </div>
            `;
        });
        
        html += `
            <div class="section-title">משימת מלון - סיפור מעשה</div>
            
            <div class="story-box">
                <h4>📖 סיפור מעשה לחניך:</h4>
                היחידה קיבלה משימה לפקד אחר אדם שאמור להגיע לאזור. בסבירות גבוהה הוא ישהה במלון _____. 
                כחלק מהפיקוח ייתכן ונידרש לבצע פעולות במלון זה.<br><br>
                
                <strong>המשימה שלך:</strong><br>
                להגיע לחדר אקראי במלון בידיעת ואישור פקיד הקבלה במלון ולבצע צילום גלוי בעזרת הטלפון הנייד 
                של כל מה שנראה לך שעשוי לעניין אותנו.
            </div>
            
            <div class="guidelines-box">
                <strong>דגשים למדריך:</strong><br>
                1. לא מלון קטן מדי<br>
                2. עדיפות למלון ללא אבטחה<br>
                3. לא מלון מפואר מידי<br>
                4. המשימה היא כניסה לחדר סטנדרטי וצילום<br>
                5. הכניסה באישור פקיד הקבלה<br>
                6. החשיבה והתכנון יעשו בע"פ בלבד<br>
                7. אין להשאיר פרטים אישיים בקבלה<br>
                8. אם המועמד מרגיש שיש חשד או לא עובד עליו לנתק ולחזור למעריך
            </div>
            
            <div class="info-box">
                <strong>לוחות זמנים:</strong><br>
                • חשיבה על דפאות: 5 דק'<br>
                • תכנון ואישור תוכניות: 10 דק'<br>
                • ביצוע: 20 דק'<br>
                • תחקיר: 10 דק'
            </div>
            
            <button class="history-btn" onclick="toggleHotelHistory()">📜 היסטוריית מלונות</button>
            <div id="hotelHistoryPopup" class="history-popup">
        `;
        
        if (window.app.data.hotelHistory.length === 0) {
            html += '<p style="font-size: 13px; color: #666;">אין היסטוריה</p>';
        } else {
            window.app.data.hotelHistory.forEach(h => {
                html += `
                    <div class="history-item">
                        <div style="font-weight: 600;">${window.escapeHtml(h.name)}</div>
                        <div style="color: #666;">${window.escapeHtml(h.address)}</div>
                        <div style="font-size: 11px; color: #999;">${h.date}</div>
                        ${h.notes ? `<div style="font-size: 11px; color: #666;">${window.escapeHtml(h.notes)}</div>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        
        // Hotel input fields
        html += `<div class="section-title">פרטי מלון</div>`;
        html += this.renderQuestion(key, 'שם מלון', 'hotel_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת מלון', 'hotel_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'hotel_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += '<div class="section-title">הצגת דפאות ותכנון</div>';
        
        const planningQuestions = [
            'הצג את דפא א\'',
            'הצג את דפא ב\'',
            'בדפא א\' איך הסיפור מביא אותך לחדר? האם יש משהו מהסביבה שישמש אותך דווקא לחדר זה?',
            'בדפא ב\' איך הסיפור מביא אותך לחדר? האם יש משהו מהסביבה שישמש אותך דווקא לחדר זה?',
            'בדפא א\' - האם הס"כ בדיק?',
            'בדפא ב\' - האם הס"כ בדיק?',
            'בדפא א\' - מה הפקיד יחשוב על הסיפור ואיזה מנוף אתה מפעיל מולו?',
            'בדפא ב\' - מה הפקיד יחשוב על הסיפור ואיזה מנוף אתה מפעיל מולו?'
        ];
        
        planningQuestions.forEach((q, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${q}</div>
                    <textarea onchange="setExerciseData('${key}', 'plan_${i}', this.value)">${window.escapeHtml(this.getData(key, `plan_${i}`))}</textarea>
                </div>
            `;
        });
        
        html += '<div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">יש לתת זמן למועמד לתכנן, לאשר בע"פ ולצאת לביצוע</div>';
        
        html += '<div class="section-title">תחקיר אחרי ביצוע</div>';
        
        html += `
            <div class="question-block">
                <div class="question-title">חריגים או תקלות או חשדות?</div>
                <textarea onchange="setExerciseData('${key}', 'incidents', this.value)">${window.escapeHtml(this.getData(key, 'incidents'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">סקירת תוצרים מהנייד</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_reviewed" value="בוצע" 
                            ${this.getData(key, 'reviewed') === 'בוצע' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'reviewed', this.value)">בוצע
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_reviewed" value="לא בוצע" 
                            ${this.getData(key, 'reviewed') === 'לא בוצע' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'reviewed', this.value)">לא בוצע
                    </label>
                </div>
            </div>
            
            <div class="question-block">
                <div class="question-title">האם ביצעת עפ"י תוכנית?</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_asplanned" value="כן" 
                            ${this.getData(key, 'asplanned') === 'כן' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'asplanned', this.value)">כן
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_asplanned" value="לא" 
                            ${this.getData(key, 'asplanned') === 'לא' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'asplanned', this.value)">לא
                    </label>
                </div>
                <textarea onchange="setExerciseData('${key}', 'asplanned_notes', this.value)">${window.escapeHtml(this.getData(key, 'asplanned_notes'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">האם הצלחת להגיע לחדר? מה עזר או הכשיל?</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_success" value="כן" 
                            ${this.getData(key, 'success') === 'כן' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'success', this.value)">כן
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_success" value="לא" 
                            ${this.getData(key, 'success') === 'לא' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'success', this.value)">לא
                    </label>
                </div>
                <textarea onchange="setExerciseData('${key}', 'success_notes', this.value)">${window.escapeHtml(this.getData(key, 'success_notes'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">מה המל"מ שאספת? ניתן להסתייע בסרטון. האם אספת מידע על פריסת חדרים? מעליות? אמצעים בחדר? זויות תצפית מבחוץ? פריסת לובי? אבטחה? מפתחות?</div>
                <textarea onchange="setExerciseData('${key}', 'intel', this.value)">${window.escapeHtml(this.getData(key, 'intel'))}</textarea>
            </div>
        `;
        
        html += '<div class="section-title">תחקיר תרגילי יומינט - ציונים</div>';
        
        const scores = [
            'גמישות מחשבתית',
            'גמישות ביצועית',
            'כישורי שטח בינאישיים',
            'התמודדות עם מצבי לחץ, עמימות וחוסר וודאות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'ציון מסכם לתרגיל'
        ];
        
        scores.forEach((score, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${score}</div>
                    <div class="score-bar">\${[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7].map(v => \`<button type="button" class="score-btn \${this.getData(key, \`score_\${i}\`) == v ? 'selected' : ''}" onclick="this.parentElement.querySelectorAll('.score-btn').forEach(b=>b.classList.remove('selected')); this.classList.add('selected'); setExerciseData('\${key}', 'score_\${i}', '\${v}')">\${v}</button>\`).join('')}</div>
                </div>
            `;
        });
        
        html += `
            <div class="question-block">
                <div class="question-title">התייחסות חופשית</div>
                <textarea onchange="setExerciseData('${key}', 'free_notes', this.value)">${window.escapeHtml(this.getData(key, 'free_notes'))}</textarea>
            </div>
        `;
        
        return html;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field);
    }
    
    renderQuestion(key, title, field, type = 'text') {
        const value = this.getData(key, field) || '';
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                ${type === 'textarea' 
                    ? `<textarea onchange="setExerciseData('${key}', '${field}', this.value)">${window.escapeHtml(value)}</textarea>`
                    : `<input type="${type}" value="${window.escapeHtml(value)}" onchange="setExerciseData('${key}', '${field}', this.value)">`
                }
            </div>
        `;
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
        
        window.toggleHotelHistory = () => {
            const popup = document.getElementById('hotelHistoryPopup');
            if (popup) {
                popup.classList.toggle('show');
            }
        };
    }
}
