/**
 * Tiach Exercise Module - תרגיל טיח
 */

export class TiachExercise {
    constructor() {
        this.name = 'טיח';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        // מטרות
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                מסגרת זמנים של שעה וחצי.<br>
                מדובר בתרגיל חימום להקניית מושגי יסוד.<br>
                למידה על בטחון עצמי, זיכרון, קשר בינאישי, בסיס להבנה מודיעינית.
            </div>
        `;
        
        // הנחיות למדריך
        html += `
            <div class="info-box">
                <strong>הנחיות למדריך:</strong><br>
                • בתדריך הראשון אין לפרט את המודיעין הנדרש, יש לאפשר למועמד לבחור את המידע הרלוונטי בעיניו.<br>
                • לא להכניס לחלפנים, חנויות תכשיטים או חנויות גדולות מידי/קטנות מידי.<br>
                • בכל אירוע חריג לעדכן את מנהל הסדנה.<br>
                • יש לחדד למועמד את הנהלים בדגש על שימוש בנייד, פנקס, ס"כ בפגישת מכר, שימוש בכסף, בטיחות.<br>
                • אין לאפשר חשיבה מחוץ לחנות.<br>
                • אין לענות על שאלות ספציפיות לגבי המידע הנדרש.
            </div>
        `;

        // היסטוריית חנויות
        html += `<div class="section-title">היסטוריית חנויות</div>`;
        html += `<div class="info-box">`;
        if (window.app.data.storeHistory && window.app.data.storeHistory.length > 0) {
            html += `<table style="width:100%; border-collapse: collapse;">`;
            html += `<tr><th style="border:1px solid #ddd; padding:5px;">שם</th><th style="border:1px solid #ddd; padding:5px;">כתובת</th><th style="border:1px solid #ddd; padding:5px;">תאריך</th></tr>`;
            window.app.data.storeHistory.forEach(store => {
                html += `<tr>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${window.escapeHtml(store.name)}</td>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${window.escapeHtml(store.address)}</td>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${store.date || ''}</td>`;
                html += `</tr>`;
            });
            html += `</table>`;
        } else {
            html += `אין חנויות שמורות בהיסטוריה`;
        }
        html += `</div>`;

        // טיח 1
        html += `<div class="section-title">טיח 1 - פרטי חנות</div>`;
        html += this.renderQuestion(key, 'שם חנות', 'tiach1_store_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת חנות', 'tiach1_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'tiach1_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += `<div class="section-title">טיח 1</div>`;
        
        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                עלייך לשהות בחנות בדיוק 8 דקות ובסיום לצאת ולהגיע לנק' הפגישה. בחנות ישנם כל מיני פרמטרים מודיעיניים שמעניינים את היחידה, עלייך לאסוף מקסימום מידע רלוונטי עבורנו. עלייך לחשוב לבד מה נחשב רלוונטי ומדוע.
            </div>
        `;

        html += this.renderQuestion(key, 'האם היו אירועים חריגים/תקלות', 'tiach1_incidents', 'textarea');
        
        html += `
            <div class="info-box">
                <strong>דגשים לתרגיל:</strong><br>
                • הנחיות שרטוט - רחובות, מיקום במרחב, חנויות סמוכות, חץ שמיים, שמות רחובות ואיתורים + שירטוט פנימי מדוייק.<br>
                • יש להסביר את העקרונות הבאים תו"כ התחקיר: הערכה מול עובדה, סיפור כיסוי, בטחון מול יעילות.
            </div>
        `;

        html += this.renderQuestion(key, 'איך היה לך (תחושות)', 'tiach1_feeling', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי', 'tiach1_cover_story', 'textarea');
        html += this.renderQuestion(key, 'איך היה האינטרקציה עם המוכר', 'tiach1_interaction', 'textarea');
        html += this.renderQuestion(key, 'מי יזם את השיחה', 'tiach1_initiator', 'textarea');
        html += this.renderQuestion(key, 'כמה זמן הית בחנות ואיך מדדת?', 'tiach1_time', 'textarea');
        html += this.renderQuestion(key, 'פרט את המל"מ שאספת, האם התמקד בעיקר ויש חשיבה מודיעינית?', 'tiach1_intel', 'textarea');
        
        html += this.renderYesNoQuestion(key, 'תיאור מדויק של המוכר', 'tiach1_seller_desc');
        html += this.renderYesNoQuestion(key, 'שם החנות', 'tiach1_store_name');
        html += this.renderYesNoQuestion(key, 'כתובת', 'tiach1_address');
        html += this.renderYesNoQuestion(key, 'יציאות נוספות', 'tiach1_exits');
        html += this.renderYesNoQuestion(key, 'כיוון פתיחת דלת', 'tiach1_door');
        html += this.renderYesNoQuestion(key, 'סורגים', 'tiach1_bars');
        html += this.renderYesNoQuestion(key, 'מנעולים', 'tiach1_locks');
        html += this.renderYesNoQuestion(key, 'מצלמות', 'tiach1_cameras');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach1_alarm');
        html += this.renderYesNoQuestion(key, 'קופה/מחשב', 'tiach1_register');
        html += this.renderYesNoQuestion(key, 'כרטיס ביקור', 'tiach1_card');
        html += this.renderYesNoQuestion(key, 'פתח לחזרה', 'tiach1_return_option');

        html += this.renderQuestion(key, 'מה אמרת כשיצאת מהחנות', 'tiach1_exit_words', 'textarea');
        html += this.renderQuestion(key, 'מדוע נראה לך שהחנות מעניינת אותנו', 'tiach1_why_interesting', 'textarea');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                לאחר מעקב מודיעיני ממושך - עולה תובנה כי באזור תל אביב קיימת התארגנות חשאית של קבוצה אשר זהותם ומטרת התארגנותם לא ידועה.
                מידיעה סיגינטית עולה שחברי ההתארגנות מביעים עניין במספר אתרים בתל אביב. חלק מההתייחסויות נוגעת לחנות בלב תל אביב. לא ידוע בשלב זה מה הסיבה שהפעילים מתעניינים דווקא בחנות. כמו כן לא ידוע האם בעל החנות חלק מהתשתית, מודע לפעילות ו/או לזהות הפעילים.
            </div>
        `;

        html += this.renderQuestion(key, 'יש לנו עדיין פערים מודיעיניים, מה אפשר לעשות?', 'tiach1_gaps', 'textarea');
        html += this.renderQuestion(key, 'אם הוצע סיבוב נוסף להשלמת הפערים, מה השיקולים', 'tiach1_another_round', 'textarea');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                משימתך - לחזור לחנות לעוד 8 דק' להשלמת המודיעין, לחלק מהשאלות לא היו תשובות וישנן עוד שאלות מודיעיניות שלא שאלנו. עלייך לחזור לחנות ולחשוב על מודיעין נוסף רלוונטי על החנות והמוכרים.
            </div>
        `;

        // כניסה שניה לחנות 1
        html += `<div class="section-title">כניסה שניה לחנות 1</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות?', 'tiach1_2_incidents', 'textarea');
        html += this.renderQuestion(key, 'איך היה לך?', 'tiach1_2_feeling', 'textarea');
        html += this.renderQuestion(key, 'איך הצגת את החזרה לחנות?', 'tiach1_2_return_presentation', 'textarea');
        html += this.renderQuestion(key, 'מה קרה כשנכנסת?', 'tiach1_2_entry', 'textarea');
        html += this.renderQuestion(key, 'איך הייתה האינטרקציה עם המוכר והסביבה?', 'tiach1_2_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה אמרת כשחזרת?', 'tiach1_2_exit_words', 'textarea');
        html += this.renderQuestion(key, 'מה עידכנת בשרטוט (מעבר על שרטוט)', 'tiach1_2_sketch_update', 'textarea');
        html += this.renderQuestion(key, 'פרטים נוספים על המוכר?', 'tiach1_2_seller_details', 'textarea');

        html += this.renderYesNoQuestion(key, 'תיאור מדויק של המוכר', 'tiach1_2_seller_desc');
        html += this.renderYesNoQuestion(key, 'שם החנות', 'tiach1_2_store_name');
        html += this.renderYesNoQuestion(key, 'כתובת', 'tiach1_2_address');
        html += this.renderYesNoQuestion(key, 'יציאות נוספות', 'tiach1_2_exits');
        html += this.renderYesNoQuestion(key, 'כיוון פתיחת דלת', 'tiach1_2_door');
        html += this.renderYesNoQuestion(key, 'סורגים', 'tiach1_2_bars');
        html += this.renderYesNoQuestion(key, 'מנעולים', 'tiach1_2_locks');
        html += this.renderYesNoQuestion(key, 'מצלמות', 'tiach1_2_cameras');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach1_2_alarm');
        html += this.renderYesNoQuestion(key, 'קופה/מחשב', 'tiach1_2_register');
        html += this.renderYesNoQuestion(key, 'כרטיס ביקור', 'tiach1_2_card');
        html += this.renderYesNoQuestion(key, 'האם תיקן דיווחי טעות (הפרדה בין עובדה להערכה)', 'tiach1_2_corrections');
        
        html += this.renderQuestion(key, 'מדוע לא הבאת מל"מ נוסף?', 'tiach1_2_why_no_intel', 'textarea');
        html += this.renderQuestion(key, 'האם אפשר ונכון לחזור פעם שלישית? באיזה כיסוי?', 'tiach1_2_third_time', 'textarea');

        html += `
            <div class="info-box">
                <strong>דגשים למעריך:</strong><br>
                • לברר שהמועמד הפנים את העקרונות.<br>
                • להסביר מונחים של: הערכה/עובדה, סיפור כיסוי ומניעים, בטחון/יעילות.<br>
                • להסביר למועמד שאם ישנם שינויים מהדיווח הראשוני עליו לדווח על כך בתחילה.
            </div>
        `;

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'tiach1_summary', 'textarea');

        // טיח 2 - זמן בינוני + יומינט
        html += `<div class="section-title">טיח 2 - זמן בינוני + יומינט</div>`;
        
        html += `<div class="section-title">טיח 2 - פרטי חנות</div>`;
        html += this.renderQuestion(key, 'שם חנות', 'tiach2_store_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת חנות', 'tiach2_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'tiach2_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים:</strong> עד שעה<br>
                <strong>תיאור התרגיל:</strong> כניסה לחנות למשך 30 דק' (10 ד' הצגת ס"כ ומל"מ ו-20 ד' תצפית למדרכה הצמודה)
            </div>
        `;

        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                הפקת לקחים, שימוש סיפור כיסוי, זיכרון, קשר בינאישי, בסיס לחשיבה מבצעית, בטחון/יעילות, חלוקת קשב, יכולות משחק, אילתור וניצול הזדמנות.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                אנשי היחידה מתארגנים למהלך בחנות שביקרת. המידע שהבאת - סייע מאוד. ממודיעין עדכני עולה חנות נוספת שמעניינת את הפעילים ויתכן שהחנות מהווה מקום מפגש וחסות לפעילותיהם. בכוונת היחידה לממש מהלך טכנולוגי לפיקוח על הנעשה בחנות (ניתן לשאול את המועמד אילו מהלכים חושב שיתבצעו). עלייך לשהות בחנות 30 דק'.<br>
                ב-10 הדק' הראשונות הצג את סיפור הכיסוי ובצע איסוף מל"מ כפי שלמדת. ב-20 הדק' הנוספות עלייך לבצע תצפית מתוך החנות החוצה על המדרכה הצמודה ולזהות את מדריכי הקבוצה (זמן וכיוון).<br>
                בסיום הזמן או אם סומן לך ע"י מדריך ע"י גירוד בראש שלו - עלייך להוציא את המוכר החוצה מהחנות ששני רגליו יעברו את סף הדלת. אין שימוש במגע פיסי כלשהו!<br>
                בסיום הזמן עלייך לחזור לנק' המפגש.<br>
                לאחר ההוצאה עלייך לחזור לנק' המפגש.<br>
                מעתה והלאה עלייך לפתוח בכל תחקיר בהתייחסות לחריגים/חשדות/תקלות.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>הנחיות למעריך:</strong><br>
                1. ניתן לקצר עפ"י שיקולים לוגיסטיים או במידה וזוהה חשש לבטחון באינטרקציה.<br>
                2. יש לבחור חנות אחרת אך מאפשרת - מעט גדולה עם חלון ראווה.<br>
                3. לעדכן בכל חריג את מנהל הסדנה.
            </div>
        `;

        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות?', 'tiach2_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'קיבל קלסר לשירטוט?', 'tiach2_folder');
        html += this.renderQuestion(key, 'תיאור החוויה (2-3 ד)', 'tiach2_experience', 'textarea');
        html += this.renderQuestion(key, 'איך הייתה האינטרקציה?', 'tiach2_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי לכניסה לחנות?', 'tiach2_cover_entry', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי לתצפית למדרכה?', 'tiach2_cover_observation', 'textarea');
        html += this.renderQuestion(key, 'האם היו לך רעיונות נוספים לכיסויים?', 'tiach2_other_covers', 'textarea');
        html += this.renderQuestion(key, 'פרט את המל"מ שאספת (1-2 ד\' והאם ממוקד בפרטים מודיעיניים ובעיקר)', 'tiach2_intel', 'textarea');

        html += this.renderYesNoQuestion(key, 'מספר טלפון של החנות', 'tiach2_phone');
        html += this.renderYesNoQuestion(key, 'כתובת מדוייקת', 'tiach2_address');
        html += this.renderYesNoQuestion(key, 'שעות פתיחה', 'tiach2_hours');
        html += this.renderYesNoQuestion(key, 'כמה מוכרים', 'tiach2_sellers_count');
        
        html += `<div class="section-title" style="font-size: 16px; margin-top: 15px;">שאלות נוספות</div>`;
        
        html += this.renderYesNoQuestion(key, 'סוגי מצלמות', 'tiach2_camera_types');
        html += this.renderYesNoQuestion(key, 'פתחי יציאה', 'tiach2_exits');
        html += this.renderYesNoQuestion(key, 'מחשב/קופה', 'tiach2_computer');
        html += this.renderYesNoQuestion(key, 'טלפון קווי', 'tiach2_landline');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach2_alarm');
        html += this.renderYesNoQuestion(key, 'פרטים על המוכר או בעלים', 'tiach2_seller_details');
        html += this.renderYesNoQuestion(key, 'האם השארת פתח לחזרה?', 'tiach2_return_option');
        
        html += this.renderQuestion(key, 'כמה זמן ציפית?', 'tiach2_observation_time', 'textarea');
        html += this.renderQuestion(key, 'פרט את החליפות שבוצעו ע"י המדריכים', 'tiach2_instructors_passes', 'textarea');
        html += this.renderQuestion(key, 'האם יתכן שפיספסת?', 'tiach2_missed', 'textarea');
        html += this.renderQuestion(key, 'כמה % מהזמן ציפית ולמה?', 'tiach2_observation_percent', 'textarea');
        html += this.renderQuestion(key, 'האם הוצאת את המוכר?', 'tiach2_removal', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי להוצאה?', 'tiach2_removal_cover', 'textarea');
        html += this.renderQuestion(key, 'מתי תכננת את הסיפור כיסוי? (אילתר/תכנן/ניצל הזדמנות)', 'tiach2_cover_planning', 'textarea');
        html += this.renderQuestion(key, 'האם עלו לדעתך חשדות?', 'tiach2_suspicions', 'textarea');

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'tiach2_summary', 'textarea');
        
        // ציונים טיח 2
        html += '<div class="section-title">ציונים</div>';
        const scores2 = [
            'גמישות מחשבתית',
            'יכולת תכנון',
            'התמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'יכולת דיווח',
            'ציון מסכם'
        ];
        scores2.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `tiach2_score_${i}`);
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
                        <input type="radio" name="${field}_yesno_${key}" value="יש" 
                            ${yesNo === 'יש' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        יש
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="אין" 
                            ${yesNo === 'אין' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        אין
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <input type="number" min="1" max="7" step="0.5" value="${value}" 
                    onchange="setExerciseData('${key}', '${field}', this.value)">
            </div>
        `;
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
