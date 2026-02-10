export class LailaExercise {
    constructor() {
        this.name = 'Laila';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `<div class="info-box"><strong>מסגרת זמנים:</strong> שעתיים וחצי לשני המתרגלים עד ליציאה<br><strong>תיאור התרגיל:</strong> ביצוע סיור שטח והתמקמות לזמן בינוני בלילה</div>`;
        
        html += `<div class="exercise-goals"><h4>🎯 מטרת התרגיל:</h4>ביצוע תהליך מבצעי מלא, יכולת תכנון, הטמעת לקחים בתחום הבטחון מול יעילות, חשיבה על מקתגים, יצירתיות, יכולות משחק, כניסה לדמות ובעיקר יציאה מאזור הנוחות.</div>`;
        
        html += `<div class="info-box"><strong>שלבי התרגיל:</strong><br>א. תדריך וביצוע סיוש<br>ב. כתיבת תוכנית פעולה ואישורה<br>ג. ביצוע<br>ד. ביצוע תחקירים</div>`;
        
        
        html += `<div class="info-box"><strong>סיפור המעשה לחניך:</strong><br>לוחמי היחידה ביצעו מעצר סמוי של מנהל החנות בו שהית בצהריים. בחקירתו סיפר כי העביר לפעיל הארד דיסק מוצפן ובו מידע חשוב לפעילות התשתית. השליח/פעיל אינו מודע למידע שנמצא על הכונן וציין בפניו כשנפגש עימו שידאג להעביר את הכונן לידי שאר הפעילים בתשתית לטובת תכנון הפעולה. הוא אינו מודע למהות הפעולה המתוכננת.<br>אנו מבינים שבנקודה האמורה עתיד להתקיים פגישה אשר עליה אנו מעוניינים לפקח מבלי לעורר את חשד הסביבה או הנפגשים.<br>עלייך לקיים תצפית רציפה, אפקטיבית, סטטית ולא בהסתר לעבר היעד שנמצא ב-_______ למשך פרק זמן של עד שעתיים.<br>בסיום התצפית עלייך לדווח בצורה מדוייקת ומפורטת את כל אשר ראית והתרחש סביבך ובנקודת המפגש האמורה.<br>לרשותך 70 דק מרגע סיום התדריך עמ לממש את סיור השטח ולהגיע חזרה למלון, לשרטט את האזור ולחשוב על 2 דפאות לביצוע. עלייך לאכול א. ערב בפרק הזמן הנל. שימוש במונית לחזרה למלון אפשרי באישור טלפוני מהמדריך.</div>`;

        html += `<div class="section-title">הבהרת משימה</div>`;
        html += `<div class="info-box">יש לתת למועמד 5 דק להתזהות על מפה ולשאלות הבהרה.</div>`;
        html += this.renderQuestion(key, 'שאלות הבהרה ששאל החניך', 'clarify_questions', 'textarea');

        html += `<div class="section-title">תחקיר סיור - יש להגיע עם שרטוט</div>`;
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'recon_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם המועמד זכר ושרטט נכון את סביבת היעד - רחובות, פריטים בולטים?', 'recon_sketch');
        html += this.renderYesNoQuestion(key, 'האם ניכר שהמועמד ביצע את הסיוש עם אוריינטציה למשימה? (התחשב בתאורה, הסתרות, נק כניסה לכיסוי, שימוש בסביבה)', 'recon_orientation');
        html += this.renderQuestion(key, 'מה עשית מרגע שעזבת ועד החזרה למלון - תאר במדוייק את מסלול ההליכה', 'recon_route', 'textarea');
        html += this.renderMultiChoiceQuestion(key, 'מימוש סיוש - האם ביצע נק תצפית מרוחקת?', 'recon_remote_observation', ['כן', 'לא']);
        html += this.renderMultiChoiceQuestion(key, 'מימוש סיוש - חיכוך בנקודה?', 'recon_friction', ['חלף', 'עמד והתרשם']);
        html += this.renderQuestion(key, 'מה היו השיקולים לבחירת אופן מימוש זה?', 'recon_considerations', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם היה לך סיפור כיסוי בסיור השטח?', 'recon_cover_story');
        html += this.renderQuestion(key, 'תאר את המלמ שאספת (ללא הכוונה 5 ד - תל לעיקר וטפל, מיקוד, חשיבה מודיעינית)', 'recon_intel', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם סיור השטח השיג את מטרותיו?', 'recon_achieved');
        html += this.renderYesNoQuestion(key, 'האם היית עושה משהו אחרת?', 'recon_differently');
        html += this.renderQuestion(key, 'התרשמות חופשית', 'recon_impression', 'textarea');

        html += `<div class="section-title">לרשות המועמד 15 דק לחשיבה על 2 דפאות ופירוט יתרונות וחסרונות</div>`;
        html += `<div class="info-box">מטרת השלב לבחון יצירתיות ולכן יש לזרום עם הרעיונות במידה והן רלוונטיות - בסיום ההצגה יש להכווין לדפא המתבקשת בהתאם למאפיינים המודיעיניים של התרחיש.</div>`;

        html += this.renderQuestion(key, 'מה הדפא הראשונה?', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא השניה?', 'plan_b', 'textarea');
        html += this.renderMultiChoiceQuestion(key, 'מה הדפא הרלוונטית להבנתך?', 'plan_relevant', ['דפא א', 'דפא ב', 'לא יודע']);
        html += this.renderQuestion(key, 'דפאות נוספות שחשבת עליהן?', 'plan_additional', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא א</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_a_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_a_cons', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא ב</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_b_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_b_cons', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למדריך:</strong> יש לוודא שהמועמד מציג דפאות ריאליות שיכול לממש בפרק הזמן ועומדות להגדרת המשימה ולאיום המודיעיני ולהישג הנדרש. בשלב זה יש להדגיש למועמד שאסור שהסביבה כולל המלון תחשוד או תחשוף את התרגיל ולכן יש לתכנן גם עליה/ירידה מכיסוי.</div>`;

        html += `<div class="section-title">לרשות המועמד 20 דק לכתיבת תוכנית פעולה</div>`;

        html += `<div class="section-title">הצגת דפא ואישור תוכניות (30 ד)</div>`;
        html += this.renderPlanQuestion(key, 'הצגת סיפור כיסוי', 'presentation_cover');
        html += this.renderPlanQuestion(key, 'צירי תנועה ונסיגה', 'presentation_movement');
        html += this.renderPlanQuestion(key, 'נק עליה על כיסוי', 'presentation_entry');
        html += this.renderPlanQuestion(key, 'הגעה לעמדה והתמקמות', 'presentation_positioning');
        html += this.renderPlanQuestion(key, 'מתי מקפל מהעמדה?', 'presentation_exit_timing');

        html += `<div class="section-title">מקתגים</div>`;
        html += this.renderContingencyQuestion(key, 'הנקודה תפוסה עי דר בית אחר', 'cont_occupied_resident');
        html += this.renderContingencyQuestion(key, 'הנקודה תפוסה עי אירוע תמים', 'cont_occupied_event');
        html += this.renderContingencyQuestion(key, 'ישנה הסתרה/נדרש לשנות מקום', 'cont_concealment');
        html += this.renderContingencyQuestion(key, 'פגש מכר', 'cont_acquaintance');
        html += this.renderContingencyQuestion(key, 'קבלת עזרה מעוברי אורח כמו מזון, לינה וכו', 'cont_help_offered');
        html += this.renderContingencyQuestion(key, 'אזרח ברע שדורש לעזוב את המקום', 'cont_hostile_citizen');
        html += this.renderContingencyQuestion(key, 'דר בית עויין', 'cont_hostile_resident');
        html += this.renderContingencyQuestion(key, 'אלימות מצד בני נוער/שיכורים', 'cont_violence');
        html += this.renderContingencyQuestion(key, 'כוח בטחון', 'cont_security');
        html += this.renderQuestion(key, 'מקתגים נוספים', 'cont_additional', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למדריך:</strong> יש לבצע עם המועמד סימולציה תוך תשומת לב לאופן ההתמקמות ביחס לנקודה ומידול 2-3 מקתגים שכולל פגש מכר וכוח בטחון.</div>`;

        html += this.renderQuestion(key, 'התרשמות כללית', 'simulation_impression', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם ביקש עזרים?', 'simulation_aids');
        html += this.renderQuestion(key, 'איך מרגיש עם הכיסוי?', 'simulation_cover_feeling', 'textarea');
        html += this.renderStressLevel(key, 'מה מידת הלחץ מ-1 עד 10', 'simulation_stress');

        html += `<div class="section-title">תחקיר לאחר ביצוע (10 ד)</div>`;
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'execution_incidents', 'textarea');
        html += this.renderQuestion(key, 'תאר לי בפירוט איך הייתה לך החוויה?', 'execution_experience', 'textarea');
        html += this.renderQuestion(key, 'איך הרגשת?', 'execution_feeling', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם פעלת עפי תכנון?', 'execution_as_planned');
        html += this.renderYesNoQuestion(key, 'האם הייתה פגישה?', 'execution_meeting');
        html += this.renderYesNoQuestion(key, 'האם הייתה הפרעה? אם כן תאר מה היא, מי הבן אדם והאם חשד בך?', 'execution_interference');
        html += this.renderQuestion(key, 'כמה אחוז מהזמן ציפית?', 'execution_observation_percent', 'textarea');
        html += this.renderMemoryQuestion(key, 'מה המלמ שאספת על האוביקט והמפגש? מאין הגיעו, לאן הלכו? תיאור לבוש', 'execution_intel');
        html += this.renderYesNoQuestion(key, 'האם היה קיפול עפי תכנון? כולל נק יציאה מהכיסוי', 'execution_exit');

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'summary', 'textarea');

        html += '<div class="section-title">ציונים</div>';
        const scores = ['יכולות למידה ויישום','גמישות מחשבתית','יכולות תכנון','בטחון מול יעילות','יכולת דיווח','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','ציון מסכם'];
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += `<div class="question-block"><div class="question-title">התייחסות חופשית</div><textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea></div>`;

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `<div class="question-block"><div class="question-title">${title}</div><textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea></div>`;
        }
        return `<div class="question-block"><div class="question-title">${title}</div><input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)"></div>`;
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="display: flex; gap: 10px; margin-bottom: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_yesno_${key}" value="כן" ${yesNo === 'כן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_yesno', this.value)">כן</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_yesno_${key}" value="לא" ${yesNo === 'לא' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_yesno', this.value)">לא</label></div><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderMultiChoiceQuestion(key, title, field, options) {
        const value = this.getData(key, field) || '';
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר...</option>${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></div>`;
    }

    renderMemoryQuestion(key, title, field) {
        const memory = this.getData(key, `${field}_memory`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        const options = ['מדוייק', 'לא מדוייק'];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}_memory', this.value)" style="margin-bottom: 10px;"><option value="">בחר...</option>${options.map(opt => `<option value="${opt}" ${memory === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderPlanQuestion(key, title, field) {
        const status = this.getData(key, `${field}_status`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="display: flex; gap: 10px; margin-bottom: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_status_${key}" value="תכנן" ${status === 'תכנן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_status', this.value)">תכנן</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_status_${key}" value="לא תכנן" ${status === 'לא תכנן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_status', this.value)">לא תכנן</label></div><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderContingencyQuestion(key, title, field) {
        const thought = this.getData(key, `${field}_thought`) || '';
        const solution = this.getData(key, `${field}_solution`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="margin-bottom: 10px;"><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה א:</label><div style="display: flex; gap: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_thought_${key}" value="העלה את המקתג בעצמו" ${thought === 'העלה את המקתג בעצמו' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_thought', this.value)">העלה את המקתג בעצמו</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_thought_${key}" value="לא חשב על המקתג" ${thought === 'לא חשב על המקתג' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_thought', this.value)">לא חשב על המקתג</label></div></div><div style="margin-bottom: 10px;"><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה ב:</label><div style="display: flex; gap: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_solution_${key}" value="נתן פתרון מספק" ${solution === 'נתן פתרון מספק' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_solution', this.value)">נתן פתרון מספק</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_solution_${key}" value="לא נתן פתרון מספק" ${solution === 'לא נתן פתרון מספק' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_solution', this.value)">לא נתן פתרון מספק</label></div></div><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה ג - פירוט:</label><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderStressLevel(key, title, field) {
        const value = this.getData(key, field) || '5';
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)">${[1,2,3,4,5,6,7,8,9,10].map(i => `<option value="${i}" ${value == i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>`;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
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
