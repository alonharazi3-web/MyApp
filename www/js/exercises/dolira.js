/**
 * Dolira Exercise Module - תרגיל דולירה
 */

export class DoliraExercise {
    constructor() {
        this.name = 'דולירה';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">🛴 תרגיל 3: ${this.name}</h4>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים:</strong> עד 3 שעות ל-2 מועמדים<br>
                <strong>תיאור:</strong> ביצוע סיור שטח והתקנת אמצעי בתחתית הדולירה
            </div>
        `;
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                הטמעת התהליך המבצעי המלא, יכולת תכנון בסיסית, הטמעת לקחים, בטחון מול יעילות, מקתגים, יצירתיות, יכולות משחק ונכונות של המועמד "להתלכלך".
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>שלבי התרגיל:</strong><br>
                1. תדריך וסיוש<br>
                2. כתיבת תוכנית<br>
                3. ביצוע<br>
                4. עמידה בתחקירים
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                לוחמי היחידה ביצעו מעצר סמוי של החנות בה שהית בצהריים. בחקירה סיפר כי העביר לפעיל דיסאונקי מוצפן ובו מידע חשוב. הפעיל אינו מודע למידע על הכונן. הפעיל עתיד להחנות את הקורקינט בכתובת _______ בזמן שהוא יוצא לשייט במרינה בין 15 ל-19. מטרת היחידה למתקן את הקורקינט באמצעי איתור. עלייך להדביק את האמצעי בתחתית הקורקינט בצורה חשאית מבלי להשאיר סימן. יש להצמיד את האמצעי למשך 20 שניות. לרשותך 10 דק' להבהרת משימה.
            </div>
        `;

        // שלב הבהרת משימה
        html += `<div class="section-title">שלב הבהרת משימה</div>`;
        html += `<div style="margin-bottom: 10px; font-weight: bold;">האם המועמד שאל את השאלות הבאות:</div>`;
        
        html += this.renderYesNoQuestion(key, 'מיקום הקורקינט', 'clarify_location');
        html += this.renderYesNoQuestion(key, 'סוג/תיאור הקורקינט (אם שאל להציג תמונה)', 'clarify_scooter_type');
        html += this.renderYesNoQuestion(key, 'סוג האמצעי ואיך מדביקים (אם שאל אז לתת)', 'clarify_device');
        html += this.renderYesNoQuestion(key, 'תיאור האוביקט', 'clarify_object_desc');
        html += this.renderYesNoQuestion(key, 'חלון זמן לביצוע', 'clarify_time_window');
        html += this.renderQuestion(key, 'שאלות נוספות ששאל', 'clarify_other', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> יש לשלוח את המועמד לסיוש של 20 דק' + 10 דק' לשרטוט ודפאות.<br>
                <strong>סיפור מעשה:</strong> עלייך לבצע סיוש לקראת ביצוע התרגיל. בסיום הסיור תתבקש להציג שרטוט וכן 2 דפאות רלוונטיות לביצוע. לרשותך 30 דק'.
            </div>
        `;

        // תחקיר לאחר סיוש
        html += `<div class="section-title">תחקיר לאחר סיוש</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות', 'recon_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם המועמד זכר ושרטט נכון את סביבת היעד', 'recon_sketch');
        html += this.renderQuestion(key, 'מה עשית ממתי שעזבת ועד ההגעה למלון? תאר מסלול הליכה, רחובות, פרטים, תאורה, כיוונים', 'recon_route', 'textarea');
        html += this.renderQuestion(key, 'חיכוך מול בן אדם ברחוב (חלף/עמד והתרשם)', 'recon_street_interaction', 'textarea');
        html += this.renderQuestion(key, 'חיכוך מול הבית (נכנס/תצפית מרחוק)', 'recon_building_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה השיקולים לנגד עינך בבחירות', 'recon_considerations', 'textarea');
        html += this.renderQuestion(key, 'האם היה לך סיפור כיסוי בסיור שטח', 'recon_cover_story', 'textarea');
        html += this.renderQuestion(key, 'פירוט המל"מ שנאסף בדגש על עיקר וטפל, מיקוד, חשיבה מודיעינית', 'recon_intel', 'textarea');
        html += this.renderQuestion(key, 'האם סיור השטח והמל"מ שאספת שיאת את ביצוע המשימה? האם היית נוהג אחרת', 'recon_sufficient', 'textarea');
        
        html += this.renderQuestion(key, 'מה הדפא הראשונה', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא השניה', 'plan_b', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא שאתה מעדיף, ומהם השיקולים', 'plan_preference', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא 1</div>`;
        html += this.renderQuestion(key, 'מה היתרונות', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות', 'plan_a_cons', 'textarea');
        html += this.renderQuestion(key, 'מה הציוד הנדרש', 'plan_a_equipment', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא 2</div>`;
        html += this.renderQuestion(key, 'מה היתרונות', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות', 'plan_b_cons', 'textarea');
        html += this.renderQuestion(key, 'מה הציוד הנדרש', 'plan_b_equipment', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> לרשותך 25 דק' לכתיבת תוכנית פעולה
            </div>
        `;

        // הצגת דפא ואישור תוכניות
        html += `<div class="section-title">הצגת דפא ואישור תוכניות (30 דק')</div>`;
        
        html += this.renderPlanQuestion(key, 'הצגת סיפור כיסוי', 'presentation_cover');
        html += this.renderPlanQuestion(key, 'שיטה - צירי תנועה ונסיגה', 'presentation_movement');
        html += this.renderPlanQuestion(key, 'מבצע תצפית מרחוק', 'presentation_observation');
        html += this.renderPlanQuestion(key, 'מתחשב במצב הרחוב או מתזמן את הביצוע', 'presentation_timing');
        html += this.renderPlanQuestion(key, 'מהם התנאים והמגבלות לביצוע', 'presentation_conditions');
        
        html += `<div class="section-title" style="font-size: 16px;">מקתגים</div>`;
        
        html += this.renderContingencyQuestion(key, 'קורקינט לא נעול', 'cont_unlocked');
        html += this.renderContingencyQuestion(key, 'יש אנשים ליד הקורקינט', 'cont_people_nearby');
        html += this.renderContingencyQuestion(key, 'שינוי מקום של הקורקינט', 'cont_location_change');
        html += this.renderContingencyQuestion(key, 'פגש מכר', 'cont_acquaintance');
        html += this.renderContingencyQuestion(key, 'פנה עובר אורח', 'cont_passerby');
        html += this.renderContingencyQuestion(key, 'הפלת את הקורקינט', 'cont_dropped');
        html += this.renderContingencyQuestion(key, 'כוח בטחון או משטרה', 'cont_security');
        html += this.renderQuestion(key, 'מקתגים נוספים', 'cont_additional', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> יש לבצע עם המועמד סימולציות בחדר
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'האם ביקש עזרים הנדרשים לכיסוי ולמשימה', 'simulation_aids');
        html += this.renderQuestion(key, 'איך אתה מרגיש עם הכיסוי', 'simulation_feeling', 'textarea');
        html += this.renderStressLevel(key, 'מה מידת הלחץ', 'simulation_stress');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong> לרשותך 20 דק' לביצוע מרגע היציאה מהמלון ועד לחזרה אליו
            </div>
        `;

        // תחקיר אחרי ביצוע
        html += `<div class="section-title">תחקיר אחרי ביצוע (15 דק')</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות', 'execution_incidents', 'textarea');
        html += this.renderQuestion(key, 'תיאור חופשי של הביצוע בפירוט, תאר לאן הלכת ומה עשית מרגע עזיבת הבית קפה ועד לחזרה. תיאור של 3 דק\'', 'execution_description', 'textarea');
        html += this.renderQuestion(key, 'איך הרגשת', 'execution_feeling', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם פעלת עפ"י תכנון', 'execution_as_planned');
        html += this.renderYesNoQuestion(key, 'האם הייתה הפרעה', 'execution_interference');

        html += this.renderQuestion(key, 'סיכום תרגיל - התרשמות כללית', 'summary_general', 'textarea');

        // ציונים
        html += '<div class="section-title">ציונים (1-7)</div>';
        const scores = [
            'יכולת למידה ויישום',
            'גמישות מחשבתית',
            'יכולת תכנון',
            'תמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'גמישות ביצועית',
            'בטחון מול יעילות',
            'יכולת דיווח',
            'ציון מסכם'
        ];
        
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)">
                </div>
            `;
        }
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="כן" 
                            ${yesNo === 'כן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        כן
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="לא" 
                            ${yesNo === 'לא' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        לא
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderPlanQuestion(key, title, field) {
        const status = this.getData(key, `${field}_status`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="תכנן" 
                            ${status === 'תכנן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        תכנן
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="לא תכנן" 
                            ${status === 'לא תכנן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        לא תכנן
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderContingencyQuestion(key, title, field) {
        const thought = this.getData(key, `${field}_thought`) || '';
        const solution = this.getData(key, `${field}_solution`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_thought_${key}" value="העלה את המקתג בעצמו" 
                            ${thought === 'העלה את המקתג בעצמו' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_thought', this.value)">
                        העלה את המקתג בעצמו
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_thought_${key}" value="לא חשב על המקתג" 
                            ${thought === 'לא חשב על המקתג' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_thought', this.value)">
                        לא חשב על המקתג
                    </label>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_solution_${key}" value="נתן פתרון מספק" 
                            ${solution === 'נתן פתרון מספק' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_solution', this.value)">
                        נתן פתרון מספק
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_solution_${key}" value="לא נתן פתרון מספק" 
                            ${solution === 'לא נתן פתרון מספק' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_solution', this.value)">
                        לא נתן פתרון מספק
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderStressLevel(key, title, field) {
        const value = this.getData(key, field) || '5';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)" style="margin-bottom: 10px;">
                    ${[1,2,3,4,5,6,7,8,9,10].map(i => 
                        `<option value="${i}" ${value == i ? 'selected' : ''}>${i}</option>`
                    ).join('')}
                </select>
                <input type="text" placeholder="הערות..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        let btns = vals.map(v => 
            `<button type="button" class="score-btn ${value == v ? 'selected' : ''}" onclick="this.parentElement.querySelectorAll('.score-btn').forEach(b=>b.classList.remove('selected')); this.classList.add('selected'); setExerciseData('${key}', '${field}', '${v}')">${v}</button>`
        ).join('');
        return `<div class="question-block"><div class="question-title">${title}</div><div class="score-bar">${btns}</div></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}
