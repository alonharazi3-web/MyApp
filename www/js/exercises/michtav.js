/**
 * Michtav Exercise Module - תרגיל מכתב
 */

export class MichtavExercise {
    constructor() {
        this.name = 'מכתב';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים לשני המועמדים:</strong> 3.5 שעות
            </div>
        `;
        
        html += this.renderQuestion(key, 'לקחים מיום קודם', 'lessons_previous_day', 'textarea');
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                ביצוע תהליך מבצעי מלא, הבנה ויישום של העקרונות שהועברו עד כה - יש לבחון את גרף הלמידה האישי של כל מועמד.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה לחניך:</strong><br>
                עקב מעצרו של אחד המחברים בהתארגנות החליטו חברי התשתית לנקוט במשנה זהירות ולשנות את דרכי פעולתם. המודיעין העדכני מצביע על כך שהפעילות נמצאת בבשלות וברמת מוכנות גבוהה וכי הכוח המבצע עתיד לקבל או לשלוח את פרטי התוכנית לפעילות.<br>
                היחידה קיבלה מידע כי הפעילות, על כל פרטיה תועבר לראש היעד ע"ג DOK אשר יונח במעטפה בתיבת דואר בכתובת __________.<br>
                עלייך לשלוף את המעטפה מתיבת הדואר, לקרוא את המידע ע"ג ה-DOK. במסמך יופיע מידע על הפעילות, מידע על השולח ופרטים נוספים.<br>
                מטרתך - להביא את מקסימום הפרטים הרלוונטיים לטובת איתור השולח ועל הפעילות עצמה.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>תנאים ומגבלות:</strong><br>
                1. על המעטפה לחזור לתיבה בדיוק 15 דק' מרגע ההוצאה שלה מהתיבה.<br>
                2. ה-DOK יוכל לשהות מחובר למחשב 10 דק' לכל היותר.<br>
                3. אין להשאיר סימנים על ה-DOK או על המעטפה.<br>
                4. אין לעורר את חשד הסביבה.<br>
                5. חל איסור לרשום או לצלם במהלך הפעילות באופן גורף.
            </div>
        `;

        // הבהרת משימה
        html += `<div class="section-title">הבהרת משימה (10 ד')</div>`;
        html += `
            <div class="info-box">
                <strong>הערה למדריך:</strong> יש לראות אם חושב קדימה על הביצוע כבר בהבהרת המשימה לקראת הסיוש.
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'האם שאל כתובת?', 'clarify_address');
        html += this.renderYesNoQuestion(key, 'האם ביקש ת"ד?', 'clarify_target_file');
        html += this.renderYesNoQuestion(key, 'האם ביקש סוג מעטפה?', 'clarify_envelope_type');
        
        html += `
            <div class="info-box">
                במידה וביקש - יש לראות לו את הדמה, במידה ולא אז להכווין לנקודה.
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'שאל על שם בעל הדירה?', 'clarify_apartment_owner');
        html += this.renderYesNoQuestion(key, 'ביקש מפה?', 'clarify_map');
        html += this.renderQuestion(key, 'נקודות נוספות שהתייחס אליהן בהבהרה?', 'clarify_additional', 'textarea');

        html += `
            <div class="info-box">
                <strong>הערה למדריך:</strong> להלן תשובות לגבי המחשב - במידה ויעלו בשלב הבהרת המשימה או לאחר הסיוש:<br>
                1. ה-DOK אינו מוצפן.<br>
                2. המסמך האמור נמצא בתיקיית מתכונים>עוגות> שם הקובץ הוא "מתכון לעוגה".<br>
                3. במידה והמחשב או המסמך מוצפנים - סיסמא תמיד תהיה 13579.
            </div>
        `;

        // סיוש
        html += `<div class="section-title">יש לתת למועמד 20 דק' לטובת חשיבה על 2 דפ"אות</div>`;
        
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'recon_incidents', 'textarea');
        html += this.renderQuestion(key, 'תיאור מסלול ההליכה', 'recon_route', 'textarea');
        html += this.renderYesNoQuestion(key, 'מימוש סיוש - אם ביצע תצפית מרוחקת?', 'recon_remote_observation');
        html += this.renderYesNoQuestion(key, 'מימוש הסיוש - חלף או עמד והתרשם בסמיכות ליעד?', 'recon_proximity');
        html += this.renderYesNoQuestion(key, 'מימוש סיוש - האם נכנס לחצר האיתור?', 'recon_entered_yard');
        html += this.renderQuestion(key, 'מה השיקולים שעמדו לנגד עינך במימוש הסיוש באופן זה?', 'recon_considerations', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם למועמד היה סיפור כיסוי?', 'recon_cover_story');
        html += this.renderQuestion(key, 'מה המל"מ שאספת? (ללא הכוונה ותשומת לב לחשיבה מודיעינית, עיקר וטפל, ביטחון מול יעילות)', 'recon_intel', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">נקודות נוספות להתייחסות</div>`;
        
        html += this.renderYesNoQuestion(key, 'זיהוי המעטפה?', 'recon_envelope_id');
        html += this.renderYesNoQuestion(key, 'כמות תיבות דואר?', 'recon_mailbox_count');
        html += this.renderYesNoQuestion(key, 'שביל גישה?', 'recon_access_path');
        html += this.renderYesNoQuestion(key, 'גורמים מפריעים?', 'recon_obstacles');
        html += this.renderYesNoQuestion(key, 'מצלמות?', 'recon_cameras');
        html += this.renderQuestion(key, 'כיצד שירת סיור השטח את המשימה העתידית?', 'recon_mission_support', 'textarea');
        html += this.renderQuestion(key, 'אם חישב זמנים?', 'recon_timing', 'textarea');
        html += this.renderQuestion(key, 'האם חשב על מקום לקריאה?', 'recon_reading_location', 'textarea');
        html += this.renderQuestion(key, 'האם חשב על דפאות ראשוניות? (הצפייה שבשלב זה יחזור עם כיווני פעולה)', 'recon_initial_plans', 'textarea');

        // דפאות
        html += `<div class="section-title">לרשותך 10 דק' לפיתוח ופירוט 2 דפ"אות שהצגת (במידה ולא הציג לאפשר לו מספר דק' לחשוב על כאלו)</div>`;
        
        html += this.renderQuestion(key, 'מה דפ"א א\'?', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מהי דפ"א ב\'?', 'plan_b', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא שאתה בוחר ומהן השיקולים?', 'plan_choice', 'textarea');
        html += this.renderQuestion(key, 'דפ"אות נוספות שחשבת עליהן?', 'plan_additional', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">עבור דפ"א א'</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_a_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_a_cons', 'textarea');
        html += this.renderQuestion(key, 'התייחסות לנקודת קריאה וס"כ לחזרה לתיבה?', 'plan_a_return', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">עבור דפ"א ב'</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_b_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_b_cons', 'textarea');
        html += this.renderQuestion(key, 'התייחסות לנקודת קריאה וס"כ לחזרה לתיבה?', 'plan_b_return', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למועמד:</strong> לרשותך 15 דק' לכתיבת תוכנית פעולה.</div>`;

        // אישור תוכניות
        html += `<div class="section-title">אישור תוכניות (25 דק')</div>`;
        
        html += this.renderPlanQuestion(key, 'צירי תנועה וחזרה', 'approval_movement');
        html += this.renderPlanQuestion(key, 'ביסוס ס"כ לפני ואחרי', 'approval_cover_establish');
        html += this.renderQuestion(key, 'נק\' קריאה וכיסוי לחזרה לתיבה', 'approval_reading_return', 'textarea');
        html += this.renderQuestion(key, 'טיפול במחשב', 'approval_computer', 'textarea');

        // מקתגים
        html += `<div class="section-title">מקתגים</div>`;
        
        html += this.renderPlanQuestion(key, 'תיבת דואר סגורה', 'cont_mailbox_closed');
        html += this.renderPlanQuestion(key, 'שכן ראה מוציא/מחזיר מכתב?', 'cont_neighbor_saw');
        html += this.renderPlanQuestion(key, 'מעטפה סגורה?', 'cont_envelope_sealed');
        html += this.renderPlanQuestion(key, 'מחשב לא עובד', 'cont_computer_broken');
        html += this.renderPlanQuestion(key, 'DOK מוצפן', 'cont_dok_encrypted');
        html += this.renderPlanQuestion(key, 'ניזוק ה-DOK', 'cont_dok_damaged');
        html += this.renderPlanQuestion(key, 'לא זוכר את הסיסמא', 'cont_forgot_password');
        html += this.renderPlanQuestion(key, 'קושי למצוא את הקובץ הרלוונטי', 'cont_file_not_found');
        html += this.renderPlanQuestion(key, 'המעטפה נפגעה או נקרעה', 'cont_envelope_damaged');

        html += `
            <div class="info-box">
                <strong>הנחייה למדריך:</strong> החניך חייב לצאת עם: סוג המעטפה, סיסמא למחשב, מיקום הקובץ בתיקייה.<br>
                ניתן לתת למועמד לבצע מודל.<br>
                יש לתת 25-30 דק' למימוש כולל.<br>
                בסיום התרגיל יש לוודא שהמחשב חזר למצב אפס והקובץ אינו מוקרן.
            </div>
        `;

        // תחקיר מכתב
        html += `<div class="section-title">תחקיר מכתב</div>`;
        html += `<div class="section-title" style="font-size: 16px;">1. מידע על הפעולה</div>`;
        
        html += this.renderMemoryQuestion(key, 'תאריך האירוע 4.11.23', 'letter_date');
        html += this.renderMemoryQuestion(key, 'שעת פעילות 19:00', 'letter_time');
        html += this.renderMemoryQuestion(key, 'האנשים המשתתפים ותפקידיהם - הנפח יבצע, היהלום יאבטח והוקרא בקלפים ינהג', 'letter_participants');
        html += this.renderMemoryQuestion(key, 'רכב המשמש לפעילות - הונדה כחולה', 'letter_vehicle');
        html += this.renderMemoryQuestion(key, 'כיוון הגעת הרכב - יגיע ליעד מכיון מזרח', 'letter_direction');

        html += `<div class="section-title" style="font-size: 16px;">2. מידע ישיר על השולח</div>`;
        
        html += this.renderMemoryQuestion(key, 'מיקום הטמנת המעטפה - מעטפה אדומה אשר תוטמן עד הערב בשעה 21:45 מאחורי תיבת התקשורת המסומנת במפה המצורפת', 'letter_envelope_location');
        html += this.renderMemoryQuestion(key, 'כתובת מייל - TESA5812@GMAIL.COM', 'letter_email');
        html += this.renderMemoryQuestion(key, 'מועד ההתקשרות בין הצדדים - יום שלישי הרביעי בכל חודש, בין השעות 17:26-19:52', 'letter_communication_time');
        html += this.renderMemoryQuestion(key, 'פרטי חשבון בנק - דיסקונט, סניף 972, חשבון 774219', 'letter_bank');
        html += this.renderMemoryQuestion(key, 'בעל החשבון - LTD בע"מ', 'letter_account_owner');

        html += `<div class="section-title" style="font-size: 16px;">3. מידע עקיף על השולח</div>`;
        
        html += this.renderMemoryQuestion(key, 'התפקידים אותם יש לסדר לחמותו - אחראית על התקציב או אחראית על שניים מבין 5 סניפים של רשת הבגדים האופנתית', 'letter_mother_in_law_role');
        html += this.renderMemoryQuestion(key, 'מיקום הסניפים - דיזינגוף סנטר, גן העיר, קניון איילון, רמת אביב, תחנה מרכזית החדשה', 'letter_branches');
        html += this.renderMemoryQuestion(key, 'מועד הגעת החמות למשרדו של המכותב - בתחילת חודש הבא', 'letter_mother_in_law_arrival');
        html += this.renderMemoryQuestion(key, 'פריטי לבוש החמות - מעיל כתום ותיק עור שחור בידה', 'letter_mother_in_law_clothes');
        html += this.renderMemoryQuestion(key, 'פרטי הפגישה וקידוד - החמות תבקש לדבר עם אדון ביירנברג בקשר למודעה בעיתון', 'letter_meeting_code');

        html += `<div class="section-title" style="font-size: 16px;">4. מידע נוסף</div>`;
        
        html += this.renderMemoryQuestion(key, 'שער האירו - 3.9 שח', 'letter_euro_rate');
        html += this.renderMemoryQuestion(key, 'מועד הפגישה הקודמת - ד\' באייר תשפ"ג', 'letter_previous_meeting');
        html += this.renderMemoryQuestion(key, 'מיקום הפגישה האחרונה - ליד חנות המוזיקה הקלאסית', 'letter_previous_location');

        html += `<div class="section-title" style="font-size: 16px;">איתור וזכירת המידע הקריטי במשימה</div>`;
        
        html += this.renderMultiChoiceQuestion(key, 'האם העביר את המידע הקריטי במכתב על הפעולה? תאריך, שעה ורכב?', 'letter_critical_operation', ['כן', 'לא', 'חלקית']);
        html += this.renderMultiChoiceQuestion(key, 'האם הביא את המידע הקריטי על השולח? מייל, פרטי חשבון בנק?', 'letter_critical_sender', ['כן', 'לא', 'חלקית']);
        html += this.renderMultiChoiceQuestion(key, 'האם מבין מה המידע הקריטי במכתב?', 'letter_critical_understanding', ['כן', 'לא']);

        // כפתור תמונה
        html += `
            <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #4ECDC4;">
                <button class="btn btn-save" onclick="showLetterImage()" style="width: 100%; font-size: 16px;">
                    📄 הצג הוראות תרגיל מכתב
                </button>
            </div>
        `;

        // תחקיר אחרי ביצוע
        html += `<div class="section-title">תחקיר אחרי ביצוע</div>`;
        
        html += this.renderYesNoQuestion(key, 'חריגים או תקלות או חשדות?', 'execution_incidents');
        html += this.renderQuestion(key, 'תיאור חופשי של החוויה בפירוט, תאר לאן הלכת ומה עשית מרגע עזיבת הבית קפה ועד לחזרה. תיאור של 3 דק\'', 'execution_description', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם הצלחת במשימה?', 'execution_success');
        html += this.renderYesNoQuestion(key, 'האם עמדת בזמנים?', 'execution_timing');
        html += this.renderMultiChoiceWithText(key, 'איך נמדדו הזמנים?', 'execution_time_measurement', ['בוצע', 'לא בוצע']);
        html += this.renderYesNoQuestion(key, 'האם המעטפה חזרה בדיוק כפי שהייתה?', 'execution_envelope_returned');
        html += this.renderQuestion(key, 'מה הלקח המרכזי שלך מהתהליך המבצעי?', 'execution_lesson', 'textarea');

        html += this.renderQuestion(key, 'סיכום תרגיל', 'summary', 'textarea');

        // ציונים
        html += '<div class="section-title">ציונים</div>';
        const scores = [
            'יכולות למידה ויישום',
            'גמישות מחשבתית',
            'יכולת תכנון',
            'בטחון מול יעילות',
            'מיומנות - ניווט, זיכרון',
            'יכולת דיווח',
            'התמודדות במצבי לחץ, עמימות וחוסר וודאות',
            'בטחון עצמי',
            'ציון מסכם לתרגיל'
        ];
        
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += this.renderQuestion(key, 'התייחסות חופשית', 'free_comment', 'textarea');

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

    renderMemoryQuestion(key, title, field) {
        const memory = this.getData(key, `${field}_memory`) || '';
        
        const options = ['זכר', 'לא זכר', 'זכר חלקית'];
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}_memory', this.value)">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${memory === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
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
                        <input type="radio" name="${field}_status_${key}" value="חשב" 
                            ${status === 'חשב' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        חשב
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="לא חשב" 
                            ${status === 'לא חשב' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        לא חשב
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderMultiChoiceQuestion(key, title, field, options) {
        const value = this.getData(key, field) || '';
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderMultiChoiceWithText(key, title, field, options) {
        const value = this.getData(key, field) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)" style="margin-bottom: 10px;">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
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

// Global image viewer function
window.showLetterImage = function() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ סגור';
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const container = document.createElement('div');
    container.style.cssText = `
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 20px 20px 20px;
    `;
    
    const img = document.createElement('img');
    img.src = 'letter.jpg';
    img.style.cssText = `
        max-width: 100%;
        width: 100%;
        height: auto;
        cursor: zoom-in;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
    `;
    
    // Pinch-to-zoom support
    let initialDistance = 0;
    let currentScale = 1;
    let panning = false;
    let start = {x: 0, y: 0};
    let translate = {x: 0, y: 0};
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch start
            initialDistance = getDistance(e.touches);
            e.preventDefault();
        } else if (e.touches.length === 1 && currentScale > 1) {
            // Pan start
            panning = true;
            start = {x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y};
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance > 0) {
            // Pinch zoom
            const currentDistance = getDistance(e.touches);
            currentScale = Math.min(Math.max(1, (currentDistance / initialDistance) * currentScale), 5);
            img.style.transform = `scale(${currentScale}) translate(${translate.x/currentScale}px, ${translate.y/currentScale}px)`;
            e.preventDefault();
        } else if (e.touches.length === 1 && panning && currentScale > 1) {
            // Pan
            translate.x = e.touches[0].clientX - start.x;
            translate.y = e.touches[0].clientY - start.y;
            img.style.transform = `scale(${currentScale}) translate(${translate.x/currentScale}px, ${translate.y/currentScale}px)`;
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
        if (e.touches.length === 0) {
            panning = false;
            if (currentScale <= 1) {
                currentScale = 1;
                translate = {x: 0, y: 0};
                img.style.transform = '';
            }
        }
    });
    
    function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Click to toggle zoom
    let zoomed = false;
    img.onclick = () => {
        if (!zoomed) {
            img.style.width = 'auto';
            img.style.maxWidth = 'none';
            img.style.cursor = 'zoom-out';
            zoomed = true;
        } else {
            img.style.width = '100%';
            img.style.maxWidth = '100%';
            img.style.cursor = 'zoom-in';
            currentScale = 1;
            translate = {x: 0, y: 0};
            img.style.transform = '';
            zoomed = false;
        }
    };
    
    img.onerror = () => {
        img.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: white;
            text-align: center;
            font-size: 18px;
            padding: 20px;
        `;
        errorMsg.innerHTML = `
            <p style="margin-bottom: 20px;">❌ לא ניתן להציג את התמונה</p>
            <a href="letter.jpg" download style="color: #4ECDC4; text-decoration: underline;">לחץ כאן להורדה</a>
        `;
        container.appendChild(errorMsg);
    };
    
    container.appendChild(img);
    modal.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal || e.target === container) {
            document.body.removeChild(modal);
        }
    };
};
