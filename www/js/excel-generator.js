// Excel Generator - Tabular Format using SheetJS
// Generates XLSX with 7-column table format

window.generateTabularExcel = function(data) {
    console.log('📊 Generating tabular Excel...');
    
    if (typeof XLSX === 'undefined') {
        console.error('❌ XLSX library not loaded!');
        return null;
    }
    
    const evaluator = data.evaluatorName || 'מעריך';
    const dateStr = new Date().toLocaleDateString('he-IL');
    
    // יצירת מערך של שורות
    const rows = [];
    
    // כותרת ראשית
    rows.push(['משוב סדנת אימפרוביזציה', '', '', '', '', '', '']);
    rows.push([]);
    
    // מידע כללי
    rows.push(['מעריך:', evaluator, '', 'תאריך:', dateStr, '', '']);
    rows.push(['דגשים:', data.highlights || 'לא מולא', '', '', '', '', '']);
    rows.push([]);
    
    // כותרות עמודות
    rows.push([
        'שם חניך',
        'תרגיל',
        'מס\'',
        'שאלה',
        'תשובה (בחירה)',
        'תשובה (מספר)',
        'תשובה (טקסט חופשי)'
    ]);
    
    // פונקציה להוסיף שורה
    function addRow(trainee, exercise, qNum, question, choice = '', number = '', text = '') {
        rows.push([trainee, exercise, qNum, question, choice, number, text]);
    }
    
    // לכל חניך
    for (let t = 0; t < 4; t++) {
        const traineeName = data['trainee' + (t + 1)] || `חניך ${t + 1}`;
        let qCounter = 1;
        
        // תרגיל בלון
        const balloonPrefix = `${t}`;
        addRow(traineeName, 'בלון', qCounter++, 'התרשמות חופשית:', '', '', data[`${balloonPrefix}-impression`] || '');
        addRow(traineeName, 'בלון', qCounter++, 'גמישות מחשבתית:', '', data[`${balloonPrefix}-score_0`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'יכולת תכנון:', '', data[`${balloonPrefix}-score_1`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'תמודדות עם לחץ ועמימות:', '', data[`${balloonPrefix}-score_2`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'התמקמות כלומד:', '', data[`${balloonPrefix}-score_3`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'בטחון עצמי:', '', data[`${balloonPrefix}-score_4`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'עבודה בצוות:', '', data[`${balloonPrefix}-score_5`] || '', '');
        addRow(traineeName, 'בלון', qCounter++, 'ציון מסכם:', '', data[`${balloonPrefix}-score_6`] || '', '');
        
        // תרגיל טיח
        const tiachPrefix = `tiach-${t}`;
        addRow(traineeName, 'טיח', qCounter++, 'תאריך:', '', '', data[`${tiachPrefix}-tiach1_date`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'האם היו אירועים חריגים/תקלות?', '', '', data[`${tiachPrefix}-tiach1_incidents`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'איך היה לך (תחושות)?', '', '', data[`${tiachPrefix}-tiach1_feeling`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'מה היה סיפור הכיסוי?', '', '', data[`${tiachPrefix}-tiach1_cover_story`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'איך היה האינטרקציה עם המוכר?', '', '', data[`${tiachPrefix}-tiach1_interaction`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'מי יזם את השיחה?', '', '', data[`${tiachPrefix}-tiach1_initiator`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'כמה זמן היית בחנות ואיך מדדת?', '', '', data[`${tiachPrefix}-tiach1_time`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'פרט את המלמ שאספת:', '', '', data[`${tiachPrefix}-tiach1_intel`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'מה אמרת כשיצאת מהחנות?', '', '', data[`${tiachPrefix}-tiach1_exit_words`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'מדוע נראה לך שהחנות מעניינת?', '', '', data[`${tiachPrefix}-tiach1_why_interesting`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'יש פערים מודיעיניים - מה אפשר לעשות?', '', '', data[`${tiachPrefix}-tiach1_gaps`] || '');
        addRow(traineeName, 'טיח', qCounter++, 'אם הוצע סיבוב נוסף - מה השיקולים?', '', '', data[`${tiachPrefix}-tiach1_another_round`] || '');
        
        // תרגיל דולירה
        const doliraPrefix = `dolira-${t}`;
        addRow(traineeName, 'דולירה', qCounter++, 'שאלות נוספות ששאל:', '', '', data[`${doliraPrefix}-clarify_other`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'חריגים/תקלות/חשדות:', '', '', data[`${doliraPrefix}-recon_incidents`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'מה עשית ממתי שעזבת ועד המלון?', '', '', data[`${doliraPrefix}-recon_route`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'חיכוך מול בן אדם ברחוב:', '', '', data[`${doliraPrefix}-recon_street_interaction`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'חיכוך מול הבית:', '', '', data[`${doliraPrefix}-recon_building_interaction`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'מה השיקולים לנגד עינך?', '', '', data[`${doliraPrefix}-recon_considerations`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'האם היה לך סיפור כיסוי?', '', '', data[`${doliraPrefix}-recon_cover_story`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'פירוט המלמ שנאסף:', '', '', data[`${doliraPrefix}-recon_intel`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'האם סיור השטח שיאת את המשימה?', '', '', data[`${doliraPrefix}-recon_sufficient`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'מה הדפא הראשונה?', '', '', data[`${doliraPrefix}-plan_a`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'מה הדפא השניה?', '', '', data[`${doliraPrefix}-plan_b`] || '');
        addRow(traineeName, 'דולירה', qCounter++, 'מה הדפא שאתה מעדיף?', '', '', data[`${doliraPrefix}-plan_preference`] || '');
        
        // תרגיל דוד
        const davidPrefix = `david-${t}`;
        addRow(traineeName, 'דוד', qCounter++, 'איך היה לך כעוקב?', '', '', data[`${davidPrefix}-follower_feeling`] || '');
        addRow(traineeName, 'דוד', qCounter++, 'מה היית עושה אחרת?', '', '', data[`${davidPrefix}-follower_differently`] || '');
        addRow(traineeName, 'דוד', qCounter++, 'תיאור התנהלות החניך ברחוב (עוקב):', '', '', data[`${davidPrefix}-follower_behavior`] || '');
        addRow(traineeName, 'דוד', qCounter++, 'איך היה לך כאובייקט?', '', '', data[`${davidPrefix}-object_feeling`] || '');
        addRow(traineeName, 'דוד', qCounter++, 'תיאור התנהלות החניך ברחוב (אובייקט):', '', '', data[`${davidPrefix}-object_behavior`] || '');
        addRow(traineeName, 'דוד', qCounter++, 'סיכום תרגיל:', '', '', data[`${davidPrefix}-summary`] || '');
        
        // תרגיל לילה
        const lailaPrefix = `laila-${t}`;
        addRow(traineeName, 'לילה', qCounter++, 'תאריך:', '', '', data[`${lailaPrefix}-hotel_date`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'שאלות הבהרה ששאל החניך:', '', '', data[`${lailaPrefix}-clarify_questions`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'חריגים או תקלות או חשדות?', '', '', data[`${lailaPrefix}-recon_incidents`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה עשית מרגע שעזבת ועד החזרה למלון?', '', '', data[`${lailaPrefix}-recon_route`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה היו השיקולים לבחירת המימוש?', '', '', data[`${lailaPrefix}-recon_considerations`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'תאר את המלמ שאספת:', '', '', data[`${lailaPrefix}-recon_intel`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'התרשמות חופשית:', '', '', data[`${lailaPrefix}-recon_impression`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה הדפא הראשונה?', '', '', data[`${lailaPrefix}-plan_a`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה הדפא השניה?', '', '', data[`${lailaPrefix}-plan_b`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'דפאות נוספות שחשבת עליהן?', '', '', data[`${lailaPrefix}-plan_additional`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה הסיפור כיסוי (דפא א)?', '', '', data[`${lailaPrefix}-plan_a_cover`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה היתרונות (דפא א)?', '', '', data[`${lailaPrefix}-plan_a_pros`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה החסרונות (דפא א)?', '', '', data[`${lailaPrefix}-plan_a_cons`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה הסיפור כיסוי (דפא ב)?', '', '', data[`${lailaPrefix}-plan_b_cover`] || '');
        addRow(traineeName, 'לילה', qCounter++, 'מה היתרונות (דפא ב)?', '', '', data[`${lailaPrefix}-plan_b_pros`] || '');
        
        // תרגיל מכתב
        const michtavPrefix = `michtav-${t}`;
        addRow(traineeName, 'מכתב', qCounter++, 'לקחים מיום קודם:', '', '', data[`${michtavPrefix}-lessons_previous_day`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'נקודות נוספות בהבהרה?', '', '', data[`${michtavPrefix}-clarify_additional`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'חריגים או תקלות?', '', '', data[`${michtavPrefix}-recon_incidents`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'תיאור מסלול ההליכה:', '', '', data[`${michtavPrefix}-recon_route`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'מה השיקולים במימוש?', '', '', data[`${michtavPrefix}-recon_considerations`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'מה המלמ שאספת?', '', '', data[`${michtavPrefix}-recon_intel`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'כיצד שירת סיור השטח את המשימה?', '', '', data[`${michtavPrefix}-recon_mission_support`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'אם חישב זמנים?', '', '', data[`${michtavPrefix}-recon_timing`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'האם חשב על מקום לקריאה?', '', '', data[`${michtavPrefix}-recon_reading_location`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'האם חשב על דפאות ראשוניות?', '', '', data[`${michtavPrefix}-recon_initial_plans`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'מה דפא א?', '', '', data[`${michtavPrefix}-plan_a`] || '');
        addRow(traineeName, 'מכתב', qCounter++, 'מה דפא ב?', '', '', data[`${michtavPrefix}-plan_b`] || '');
        
        // תרגיל יומינט
        const yominetPrefix = `yominet-${t}`;
        addRow(traineeName, 'יומינט', qCounter++, 'תאריך:', '', '', data[`${yominetPrefix}-hotel_date`] || '');
        
        for (let i = 0; i < 7; i++) {
            const taskValue = data[`${yominetPrefix}-task_${i}`];
            if (taskValue) {
                addRow(traineeName, 'יומינט', qCounter++, `משימה ${i + 1}:`, taskValue, '', '');
                addRow(traineeName, 'יומינט', qCounter++, `הערות למשימה ${i + 1}:`, '', '', data[`${yominetPrefix}-taskq_${i}`] || '');
            }
        }
        
        addRow(traineeName, 'יומינט', qCounter++, 'חריגים או תקלות?', '', '', data[`${yominetPrefix}-incidents`] || '');
        addRow(traineeName, 'יומינט', qCounter++, 'סקירת תוצרים מהנייד:', data[`${yominetPrefix}-reviewed`] || '', '', '');
        addRow(traineeName, 'יומינט', qCounter++, 'ביצוע עפי תוכנית:', data[`${yominetPrefix}-according_to_plan`] || '', '', '');
    }
    
    // יצירת workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // הגדרת רוחב עמודות
    ws['!cols'] = [
        {wch: 15},  // שם חניך
        {wch: 12},  // תרגיל
        {wch: 6},   // מס'
        {wch: 50},  // שאלה
        {wch: 20},  // בחירה
        {wch: 12},  // מספר
        {wch: 60}   // טקסט חופשי
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'משוב מלא');
    
    // ייצוא ל-buffer
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    
    return wbout;
};
