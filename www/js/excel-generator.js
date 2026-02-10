// Excel Generator - Complete rewrite v5.6
// Reads ALL data from exerciseData correctly

window.generateTabularExcel = function(data) {
    console.log('📊 Generating tabular Excel...');
    
    if (typeof XLSX === 'undefined') {
        console.error('❌ XLSX library not loaded!');
        return null;
    }
    
    const evaluator = data.evaluatorName || 'מעריך';
    const dateStr = new Date().toLocaleDateString('he-IL');
    const rows = [];
    
    rows.push(['משוב סדנת אימפרוביזציה', '', '', '', '', '', '']);
    rows.push([]);
    rows.push(['שם ההערכה:', data.assessmentName || 'לא מולא', '', 'מעריך:', evaluator, '', 'תאריך: ' + dateStr]);
    rows.push(['דגשים:', data.highlights || 'לא מולא', '', '', '', '', '']);
    rows.push([]);
    rows.push(['שם חניך', 'תרגיל', 'מס\'', 'שאלה', 'תשובה (בחירה)', 'תשובה (מספר)', 'תשובה (טקסט חופשי)']);
    
    function exd(t, e, field) {
        const key = t + '-' + e;
        if (data.exerciseData && data.exerciseData[key] && data.exerciseData[key][field] !== undefined) {
            return data.exerciseData[key][field] || '';
        }
        return '';
    }
    
    function addRow(trainee, exercise, qNum, question, choice, number, text) {
        rows.push([trainee, exercise, qNum, question, choice || '', number || '', text || '']);
    }
    
    for (var t = 0; t < 4; t++) {
        var traineeName = data['trainee' + (t + 1)] || ('חניך ' + (t + 1));
        var q = 1;
        
        // ========== בלון (exercise 0) ==========
        addRow(traineeName, 'בלון', q++, 'התרשמות חופשית', '', '', exd(t, 0, 'impression'));
        var balloonScores = ['גמישות מחשבתית', 'יכולת תכנון', 'תמודדות עם לחץ ועמימות', 'התמקמות כלומד', 'בטחון עצמי', 'עבודה בצוות', 'ציון מסכם'];
        balloonScores.forEach(function(s, i) { addRow(traineeName, 'בלון', q++, s, '', exd(t, 0, 'score_' + i), ''); });
        addRow(traineeName, 'בלון', q++, 'התייחסות חופשית', '', '', exd(t, 0, 'free_comment'));
        
        // ========== טיח 1 (exercise 1) ==========
        addRow(traineeName, 'טיח 1', q++, 'שם חנות', '', '', exd(t, 1, 'tiach1_store_name_input'));
        addRow(traineeName, 'טיח 1', q++, 'כתובת חנות', '', '', exd(t, 1, 'tiach1_address_input'));
        addRow(traineeName, 'טיח 1', q++, 'תאריך', '', '', exd(t, 1, 'tiach1_date'));
        addRow(traineeName, 'טיח 1', q++, 'חריגים/תקלות', '', '', exd(t, 1, 'tiach1_incidents'));
        addRow(traineeName, 'טיח 1', q++, 'תחושות', '', '', exd(t, 1, 'tiach1_feeling'));
        addRow(traineeName, 'טיח 1', q++, 'סיפור כיסוי', '', '', exd(t, 1, 'tiach1_cover_story'));
        addRow(traineeName, 'טיח 1', q++, 'אינטרקציה עם המוכר', '', '', exd(t, 1, 'tiach1_interaction'));
        addRow(traineeName, 'טיח 1', q++, 'מי יזם את השיחה', '', '', exd(t, 1, 'tiach1_initiator'));
        addRow(traineeName, 'טיח 1', q++, 'כמה זמן בחנות', '', '', exd(t, 1, 'tiach1_time'));
        addRow(traineeName, 'טיח 1', q++, 'מל"מ שאסף', '', '', exd(t, 1, 'tiach1_intel'));
        var t1yn = [['tiach1_seller_desc','תיאור מדויק של המוכר'],['tiach1_store_name','שם החנות'],['tiach1_address','כתובת'],['tiach1_exits','יציאות נוספות'],['tiach1_door','כיוון פתיחת דלת'],['tiach1_bars','סורגים'],['tiach1_locks','מנעולים'],['tiach1_cameras','מצלמות'],['tiach1_alarm','אזעקה'],['tiach1_register','קופה/מחשב'],['tiach1_card','כרטיס ביקור'],['tiach1_return_option','פתח לחזרה']];
        t1yn.forEach(function(p) { addRow(traineeName, 'טיח 1', q++, p[1], exd(t, 1, p[0]+'_yesno'), '', exd(t, 1, p[0]+'_text')); });
        addRow(traineeName, 'טיח 1', q++, 'מה אמרת כשיצאת', '', '', exd(t, 1, 'tiach1_exit_words'));
        addRow(traineeName, 'טיח 1', q++, 'מדוע החנות מעניינת', '', '', exd(t, 1, 'tiach1_why_interesting'));
        addRow(traineeName, 'טיח 1', q++, 'פערים מודיעיניים', '', '', exd(t, 1, 'tiach1_gaps'));
        addRow(traineeName, 'טיח 1', q++, 'סיבוב נוסף - שיקולים', '', '', exd(t, 1, 'tiach1_another_round'));
        
        // טיח 1.2
        addRow(traineeName, 'טיח 1.2', q++, 'חריגים/תקלות', '', '', exd(t, 1, 'tiach1_2_incidents'));
        addRow(traineeName, 'טיח 1.2', q++, 'תחושות', '', '', exd(t, 1, 'tiach1_2_feeling'));
        addRow(traineeName, 'טיח 1.2', q++, 'הצגת חזרה', '', '', exd(t, 1, 'tiach1_2_return_presentation'));
        addRow(traineeName, 'טיח 1.2', q++, 'כניסה לחנות', '', '', exd(t, 1, 'tiach1_2_entry'));
        addRow(traineeName, 'טיח 1.2', q++, 'אינטרקציה', '', '', exd(t, 1, 'tiach1_2_interaction'));
        addRow(traineeName, 'טיח 1.2', q++, 'מה אמרת כשחזרת', '', '', exd(t, 1, 'tiach1_2_exit_words'));
        addRow(traineeName, 'טיח 1.2', q++, 'עדכון שרטוט', '', '', exd(t, 1, 'tiach1_2_sketch_update'));
        addRow(traineeName, 'טיח 1.2', q++, 'פרטים על המוכר', '', '', exd(t, 1, 'tiach1_2_seller_details'));
        var t12yn = [['tiach1_2_seller_desc','תיאור מדויק של המוכר'],['tiach1_2_store_name','שם החנות'],['tiach1_2_address','כתובת'],['tiach1_2_exits','יציאות נוספות'],['tiach1_2_door','כיוון פתיחת דלת'],['tiach1_2_bars','סורגים'],['tiach1_2_locks','מנעולים'],['tiach1_2_cameras','מצלמות'],['tiach1_2_alarm','אזעקה'],['tiach1_2_register','קופה/מחשב'],['tiach1_2_card','כרטיס ביקור'],['tiach1_2_corrections','תיקן דיווחי טעות']];
        t12yn.forEach(function(p) { addRow(traineeName, 'טיח 1.2', q++, p[1], exd(t, 1, p[0]+'_yesno'), '', exd(t, 1, p[0]+'_text')); });
        addRow(traineeName, 'טיח 1.2', q++, 'מדוע לא הבאת מל"מ נוסף', '', '', exd(t, 1, 'tiach1_2_why_no_intel'));
        addRow(traineeName, 'טיח 1.2', q++, 'חזרה פעם שלישית', '', '', exd(t, 1, 'tiach1_2_third_time'));
        addRow(traineeName, 'טיח 1', q++, 'סיכום תרגיל', '', '', exd(t, 1, 'tiach1_summary'));
        
        // טיח 2
        addRow(traineeName, 'טיח 2', q++, 'שם חנות', '', '', exd(t, 1, 'tiach2_store_name_input'));
        addRow(traineeName, 'טיח 2', q++, 'כתובת חנות', '', '', exd(t, 1, 'tiach2_address_input'));
        addRow(traineeName, 'טיח 2', q++, 'תאריך', '', '', exd(t, 1, 'tiach2_date'));
        addRow(traineeName, 'טיח 2', q++, 'חריגים/תקלות', '', '', exd(t, 1, 'tiach2_incidents'));
        addRow(traineeName, 'טיח 2', q++, 'קלסר לשירטוט', exd(t, 1, 'tiach2_folder_yesno'), '', exd(t, 1, 'tiach2_folder_text'));
        addRow(traineeName, 'טיח 2', q++, 'תיאור החוויה', '', '', exd(t, 1, 'tiach2_experience'));
        addRow(traineeName, 'טיח 2', q++, 'אינטרקציה', '', '', exd(t, 1, 'tiach2_interaction'));
        addRow(traineeName, 'טיח 2', q++, 'סיפור כיסוי לכניסה', '', '', exd(t, 1, 'tiach2_cover_entry'));
        addRow(traineeName, 'טיח 2', q++, 'סיפור כיסוי לתצפית', '', '', exd(t, 1, 'tiach2_cover_observation'));
        addRow(traineeName, 'טיח 2', q++, 'כיסויים נוספים', '', '', exd(t, 1, 'tiach2_other_covers'));
        var t2yn = [['tiach2_phone','מספר טלפון'],['tiach2_address','כתובת מדוייקת'],['tiach2_hours','שעות פתיחה'],['tiach2_sellers_count','כמה מוכרים'],['tiach2_camera_types','סוגי מצלמות'],['tiach2_exits','פתחי יציאה'],['tiach2_computer','מחשב/קופה'],['tiach2_landline','טלפון קווי'],['tiach2_alarm','אזעקה'],['tiach2_seller_details','פרטים על המוכר'],['tiach2_return_option','פתח לחזרה']];
        t2yn.forEach(function(p) { addRow(traineeName, 'טיח 2', q++, p[1], exd(t, 1, p[0]+'_yesno'), '', exd(t, 1, p[0]+'_text')); });
        addRow(traineeName, 'טיח 2', q++, 'זמן תצפית', '', '', exd(t, 1, 'tiach2_observation_time'));
        addRow(traineeName, 'טיח 2', q++, 'חליפות מדריכים', '', '', exd(t, 1, 'tiach2_instructors_passes'));
        addRow(traineeName, 'טיח 2', q++, 'פיספוסים', '', '', exd(t, 1, 'tiach2_missed'));
        addRow(traineeName, 'טיח 2', q++, '% זמן תצפית', '', '', exd(t, 1, 'tiach2_observation_percent'));
        addRow(traineeName, 'טיח 2', q++, 'הוצאת המוכר', '', '', exd(t, 1, 'tiach2_removal'));
        addRow(traineeName, 'טיח 2', q++, 'סיפור כיסוי להוצאה', '', '', exd(t, 1, 'tiach2_removal_cover'));
        addRow(traineeName, 'טיח 2', q++, 'תכנון סיפור כיסוי', '', '', exd(t, 1, 'tiach2_cover_planning'));
        addRow(traineeName, 'טיח 2', q++, 'חשדות', '', '', exd(t, 1, 'tiach2_suspicions'));
        addRow(traineeName, 'טיח 2', q++, 'מל"מ שנאסף', '', '', exd(t, 1, 'tiach2_intel'));
        addRow(traineeName, 'טיח 2', q++, 'סיכום תרגיל', '', '', exd(t, 1, 'tiach2_summary'));
        var tiach2Scores = ['גמישות מחשבתית','יכולת תכנון','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','יכולת דיווח','ציון מסכם'];
        tiach2Scores.forEach(function(s, i) { addRow(traineeName, 'טיח 2', q++, s, '', exd(t, 1, 'tiach2_score_' + i), ''); });
        addRow(traineeName, 'טיח', q++, 'התייחסות חופשית', '', '', exd(t, 1, 'free_comment'));
        
        // ========== דולירה (exercise 2) ==========
        addRow(traineeName, 'דולירה', q++, 'התקן', exd(t, 2, 'clarify_device'), '', '');
        addRow(traineeName, 'דולירה', q++, 'מיקום', exd(t, 2, 'clarify_location'), '', '');
        addRow(traineeName, 'דולירה', q++, 'תיאור אובייקט', exd(t, 2, 'clarify_object_desc'), '', '');
        addRow(traineeName, 'דולירה', q++, 'סוג קורקינט', exd(t, 2, 'clarify_scooter_type'), '', '');
        addRow(traineeName, 'דולירה', q++, 'חלון זמנים', exd(t, 2, 'clarify_time_window'), '', '');
        addRow(traineeName, 'דולירה', q++, 'שאלות נוספות', '', '', exd(t, 2, 'clarify_other'));
        addRow(traineeName, 'דולירה', q++, 'חריגים (סיור)', '', '', exd(t, 2, 'recon_incidents'));
        addRow(traineeName, 'דולירה', q++, 'שרטוט סביבת היעד', exd(t, 2, 'recon_sketch_yesno'), '', exd(t, 2, 'recon_sketch_text'));
        addRow(traineeName, 'דולירה', q++, 'מסלול הליכה', '', '', exd(t, 2, 'recon_route'));
        addRow(traineeName, 'דולירה', q++, 'חיכוך ברחוב', '', '', exd(t, 2, 'recon_street_interaction'));
        addRow(traineeName, 'דולירה', q++, 'חיכוך מול הבית', '', '', exd(t, 2, 'recon_building_interaction'));
        addRow(traineeName, 'דולירה', q++, 'שיקולים', '', '', exd(t, 2, 'recon_considerations'));
        addRow(traineeName, 'דולירה', q++, 'סיפור כיסוי', '', '', exd(t, 2, 'recon_cover_story'));
        addRow(traineeName, 'דולירה', q++, 'מל"מ שנאסף', '', '', exd(t, 2, 'recon_intel'));
        addRow(traineeName, 'דולירה', q++, 'סיור מספק', exd(t, 2, 'recon_sufficient_yesno'), '', exd(t, 2, 'recon_sufficient_text'));
        addRow(traineeName, 'דולירה', q++, 'דפא א', '', '', exd(t, 2, 'plan_a'));
        addRow(traineeName, 'דולירה', q++, 'דפא ב', '', '', exd(t, 2, 'plan_b'));
        addRow(traineeName, 'דולירה', q++, 'דפא מועדפת', exd(t, 2, 'plan_preference'), '', '');
        addRow(traineeName, 'דולירה', q++, 'יתרונות א', '', '', exd(t, 2, 'plan_a_pros'));
        addRow(traineeName, 'דולירה', q++, 'חסרונות א', '', '', exd(t, 2, 'plan_a_cons'));
        addRow(traineeName, 'דולירה', q++, 'ציוד א', '', '', exd(t, 2, 'plan_a_equipment'));
        addRow(traineeName, 'דולירה', q++, 'יתרונות ב', '', '', exd(t, 2, 'plan_b_pros'));
        addRow(traineeName, 'דולירה', q++, 'חסרונות ב', '', '', exd(t, 2, 'plan_b_cons'));
        addRow(traineeName, 'דולירה', q++, 'ציוד ב', '', '', exd(t, 2, 'plan_b_equipment'));
        var dolPlan = [['presentation_cover','הצגת כיסוי'],['presentation_movement','צירי תנועה'],['presentation_timing','תזמון'],['presentation_observation','עמדת תצפית'],['presentation_conditions','תנאים']];
        dolPlan.forEach(function(p) { addRow(traineeName, 'דולירה', q++, p[1], exd(t, 2, p[0]+'_status'), '', exd(t, 2, p[0]+'_text')); });
        var dolCont = [['cont_people_nearby','אנשים בסביבה'],['cont_passerby','עובר אורח'],['cont_security','כוח בטחון'],['cont_unlocked','לא נעול'],['cont_dropped','נפל/שבר'],['cont_location_change','שינוי מיקום'],['cont_acquaintance','פגש מכר']];
        dolCont.forEach(function(p) {
            addRow(traineeName, 'דולירה', q++, p[1]+' - חשב', exd(t, 2, p[0]+'_thought'), '', '');
            addRow(traineeName, 'דולירה', q++, p[1]+' - פתרון', exd(t, 2, p[0]+'_solution'), '', '');
            addRow(traineeName, 'דולירה', q++, p[1]+' - פירוט', '', '', exd(t, 2, p[0]+'_text'));
        });
        addRow(traineeName, 'דולירה', q++, 'מקתגים נוספים', '', '', exd(t, 2, 'cont_additional'));
        addRow(traineeName, 'דולירה', q++, 'התרשמות סימולציה', '', '', exd(t, 2, 'simulation_feeling'));
        addRow(traineeName, 'דולירה', q++, 'ביקש עזרים', exd(t, 2, 'simulation_aids_yesno'), '', exd(t, 2, 'simulation_aids_text'));
        addRow(traineeName, 'דולירה', q++, 'מידת לחץ', '', exd(t, 2, 'simulation_stress'), '');
        addRow(traineeName, 'דולירה', q++, 'חריגים (ביצוע)', '', '', exd(t, 2, 'execution_incidents'));
        addRow(traineeName, 'דולירה', q++, 'תיאור ביצוע', '', '', exd(t, 2, 'execution_description'));
        addRow(traineeName, 'דולירה', q++, 'תחושות ביצוע', '', '', exd(t, 2, 'execution_feeling'));
        addRow(traineeName, 'דולירה', q++, 'פעל עפי תכנון', exd(t, 2, 'execution_as_planned_yesno'), '', exd(t, 2, 'execution_as_planned_text'));
        addRow(traineeName, 'דולירה', q++, 'הפרעה', exd(t, 2, 'execution_interference_yesno'), '', exd(t, 2, 'execution_interference_text'));
        addRow(traineeName, 'דולירה', q++, 'סיכום כללי', '', '', exd(t, 2, 'summary_general'));
        var dolScores = ['יכולת למידה ויישום','גמישות מחשבתית','יכולת תכנון','תמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','גמישות ביצועית','בטחון מול יעילות','יכולת דיווח','ציון מסכם'];
        dolScores.forEach(function(s, i) { addRow(traineeName, 'דולירה', q++, s, '', exd(t, 2, 'score_' + i), ''); });
        addRow(traineeName, 'דולירה', q++, 'התייחסות חופשית', '', '', exd(t, 2, 'free_comment'));
        
        // ========== דויד (exercise 3) ==========
        var davidMem = [['follower_address','כתובת (עוקב)'],['follower_streets','רחובות'],['follower_directions','כיוונים'],['follower_plates','לוחיות רישוי'],['follower_red_cars','מכוניות אדומות'],['follower_stopped','עצירות'],['follower_sidewalk','מדרכה'],['follower_reports','דיווחים'],['object_address','כתובת (אובייקט)'],['object_streets','רחובות (אובייקט)'],['object_directions','כיוונים (אובייקט)']];
        davidMem.forEach(function(p) { addRow(traineeName, 'דויד', q++, p[1], exd(t, 3, p[0]+'_memory'), '', exd(t, 3, p[0]+'_text')); });
        addRow(traineeName, 'דויד', q++, 'תחושות כעוקב', '', '', exd(t, 3, 'follower_feeling'));
        addRow(traineeName, 'דויד', q++, 'מה היית עושה אחרת', '', '', exd(t, 3, 'follower_differently'));
        addRow(traineeName, 'דויד', q++, 'התנהלות ברחוב (עוקב)', '', '', exd(t, 3, 'follower_behavior'));
        addRow(traineeName, 'דויד', q++, 'תחושות כאובייקט', '', '', exd(t, 3, 'object_feeling'));
        addRow(traineeName, 'דויד', q++, 'התנהלות ברחוב (אובייקט)', '', '', exd(t, 3, 'object_behavior'));
        addRow(traineeName, 'דויד', q++, 'סיכום תרגיל', '', '', exd(t, 3, 'summary'));
        var davidScores = ['גמישות מחשבתית','מיומנות - התמצאות במרחב','תמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','כישורי שטח בינאישיים','יכולת דיווח','ציון מסכם'];
        davidScores.forEach(function(s, i) { addRow(traineeName, 'דויד', q++, s, '', exd(t, 3, 'score_' + i), ''); });
        addRow(traineeName, 'דויד', q++, 'התייחסות חופשית', '', '', exd(t, 3, 'free_comment'));
        
        // ========== לילה (exercise 4) ==========
        addRow(traineeName, 'לילה', q++, 'שאלות הבהרה', '', '', exd(t, 4, 'clarify_questions'));
        addRow(traineeName, 'לילה', q++, 'חריגים (סיור)', '', '', exd(t, 4, 'recon_incidents'));
        addRow(traineeName, 'לילה', q++, 'שרטוט', exd(t, 4, 'recon_sketch_yesno'), '', exd(t, 4, 'recon_sketch_text'));
        addRow(traineeName, 'לילה', q++, 'אוריינטציה', exd(t, 4, 'recon_orientation_yesno'), '', exd(t, 4, 'recon_orientation_text'));
        addRow(traineeName, 'לילה', q++, 'מסלול הליכה', '', '', exd(t, 4, 'recon_route'));
        addRow(traineeName, 'לילה', q++, 'נק תצפית מרוחקת', exd(t, 4, 'recon_remote_observation'), '', '');
        addRow(traineeName, 'לילה', q++, 'חיכוך בנקודה', exd(t, 4, 'recon_friction'), '', '');
        addRow(traineeName, 'לילה', q++, 'שיקולים', '', '', exd(t, 4, 'recon_considerations'));
        addRow(traineeName, 'לילה', q++, 'סיפור כיסוי (סיור)', exd(t, 4, 'recon_cover_story_yesno'), '', exd(t, 4, 'recon_cover_story_text'));
        addRow(traineeName, 'לילה', q++, 'מל"מ שנאסף', '', '', exd(t, 4, 'recon_intel'));
        addRow(traineeName, 'לילה', q++, 'סיור השיג מטרות', exd(t, 4, 'recon_achieved_yesno'), '', exd(t, 4, 'recon_achieved_text'));
        addRow(traineeName, 'לילה', q++, 'היית עושה אחרת', exd(t, 4, 'recon_differently_yesno'), '', exd(t, 4, 'recon_differently_text'));
        addRow(traineeName, 'לילה', q++, 'התרשמות (סיור)', '', '', exd(t, 4, 'recon_impression'));
        addRow(traineeName, 'לילה', q++, 'דפא א', '', '', exd(t, 4, 'plan_a'));
        addRow(traineeName, 'לילה', q++, 'דפא ב', '', '', exd(t, 4, 'plan_b'));
        addRow(traineeName, 'לילה', q++, 'דפא רלוונטית', exd(t, 4, 'plan_relevant'), '', '');
        addRow(traineeName, 'לילה', q++, 'דפאות נוספות', '', '', exd(t, 4, 'plan_additional'));
        addRow(traineeName, 'לילה', q++, 'כיסוי (א)', '', '', exd(t, 4, 'plan_a_cover'));
        addRow(traineeName, 'לילה', q++, 'יתרונות (א)', '', '', exd(t, 4, 'plan_a_pros'));
        addRow(traineeName, 'לילה', q++, 'חסרונות (א)', '', '', exd(t, 4, 'plan_a_cons'));
        addRow(traineeName, 'לילה', q++, 'כיסוי (ב)', '', '', exd(t, 4, 'plan_b_cover'));
        addRow(traineeName, 'לילה', q++, 'יתרונות (ב)', '', '', exd(t, 4, 'plan_b_pros'));
        addRow(traineeName, 'לילה', q++, 'חסרונות (ב)', '', '', exd(t, 4, 'plan_b_cons'));
        var lailaPlan = [['presentation_cover','הצגת כיסוי'],['presentation_movement','צירי תנועה'],['presentation_entry','נק עליה'],['presentation_positioning','הגעה לעמדה'],['presentation_exit_timing','קיפול']];
        lailaPlan.forEach(function(p) { addRow(traineeName, 'לילה', q++, p[1], exd(t, 4, p[0]+'_status'), '', exd(t, 4, p[0]+'_text')); });
        var lailaCont = [['cont_occupied_resident','נקודה תפוסה - דייר'],['cont_occupied_event','נקודה תפוסה - אירוע'],['cont_concealment','הסתרה'],['cont_acquaintance','פגש מכר'],['cont_help_offered','קבלת עזרה'],['cont_hostile_citizen','אזרח עויין'],['cont_hostile_resident','דייר עויין'],['cont_violence','אלימות'],['cont_security','כוח בטחון']];
        lailaCont.forEach(function(p) {
            addRow(traineeName, 'לילה', q++, p[1]+' - חשב', exd(t, 4, p[0]+'_thought'), '', '');
            addRow(traineeName, 'לילה', q++, p[1]+' - פתרון', exd(t, 4, p[0]+'_solution'), '', '');
            addRow(traineeName, 'לילה', q++, p[1]+' - פירוט', '', '', exd(t, 4, p[0]+'_text'));
        });
        addRow(traineeName, 'לילה', q++, 'מקתגים נוספים', '', '', exd(t, 4, 'cont_additional'));
        addRow(traineeName, 'לילה', q++, 'התרשמות סימולציה', '', '', exd(t, 4, 'simulation_impression'));
        addRow(traineeName, 'לילה', q++, 'ביקש עזרים', exd(t, 4, 'simulation_aids_yesno'), '', exd(t, 4, 'simulation_aids_text'));
        addRow(traineeName, 'לילה', q++, 'תחושות כיסוי', '', '', exd(t, 4, 'simulation_cover_feeling'));
        addRow(traineeName, 'לילה', q++, 'מידת לחץ', '', exd(t, 4, 'simulation_stress'), '');
        addRow(traineeName, 'לילה', q++, 'חריגים (ביצוע)', '', '', exd(t, 4, 'execution_incidents'));
        addRow(traineeName, 'לילה', q++, 'חוויה', '', '', exd(t, 4, 'execution_experience'));
        addRow(traineeName, 'לילה', q++, 'הרגשה', '', '', exd(t, 4, 'execution_feeling'));
        addRow(traineeName, 'לילה', q++, 'פעל עפי תכנון', exd(t, 4, 'execution_as_planned_yesno'), '', exd(t, 4, 'execution_as_planned_text'));
        addRow(traineeName, 'לילה', q++, 'פגישה', exd(t, 4, 'execution_meeting_yesno'), '', exd(t, 4, 'execution_meeting_text'));
        addRow(traineeName, 'לילה', q++, 'הפרעה', exd(t, 4, 'execution_interference_yesno'), '', exd(t, 4, 'execution_interference_text'));
        addRow(traineeName, 'לילה', q++, '% זמן תצפית', '', '', exd(t, 4, 'execution_observation_percent'));
        addRow(traineeName, 'לילה', q++, 'מל"מ על המפגש', exd(t, 4, 'execution_intel_memory'), '', exd(t, 4, 'execution_intel_text'));
        addRow(traineeName, 'לילה', q++, 'קיפול עפי תכנון', exd(t, 4, 'execution_exit_yesno'), '', exd(t, 4, 'execution_exit_text'));
        addRow(traineeName, 'לילה', q++, 'סיכום תרגיל', '', '', exd(t, 4, 'summary'));
        var lailaScores = ['יכולות למידה ויישום','גמישות מחשבתית','יכולות תכנון','בטחון מול יעילות','יכולת דיווח','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','ציון מסכם'];
        lailaScores.forEach(function(s, i) { addRow(traineeName, 'לילה', q++, s, '', exd(t, 4, 'score_' + i), ''); });
        addRow(traineeName, 'לילה', q++, 'התייחסות חופשית', '', '', exd(t, 4, 'free_comment'));
        
        // ========== מכתב (exercise 5) ==========
        addRow(traineeName, 'מכתב', q++, 'לקחים מיום קודם', '', '', exd(t, 5, 'lessons_previous_day'));
        var mClarify = [['clarify_address','כתובת'],['clarify_apartment_owner','בעל הדירה'],['clarify_target_file','קובץ יעד'],['clarify_map','מפה'],['clarify_envelope_type','סוג מעטפה']];
        mClarify.forEach(function(p) { addRow(traineeName, 'מכתב', q++, 'הבהרה: '+p[1], exd(t, 5, p[0]+'_yesno'), '', exd(t, 5, p[0]+'_text')); });
        addRow(traineeName, 'מכתב', q++, 'שאלות נוספות', '', '', exd(t, 5, 'clarify_additional'));
        var mLetter = [['letter_date','תאריך'],['letter_bank','בנק'],['letter_branches','סניפים'],['letter_account_owner','בעל חשבון'],['letter_euro_rate','שער יורו'],['letter_meeting_code','קוד פגישה'],['letter_time','שעה'],['letter_direction','כיוון'],['letter_participants','משתתפים'],['letter_email','אימייל'],['letter_vehicle','רכב'],['letter_previous_meeting','פגישה קודמת'],['letter_previous_location','מיקום קודם'],['letter_communication_time','זמן תקשורת'],['letter_mother_in_law_arrival','הגעת חמות'],['letter_mother_in_law_clothes','לבוש חמות'],['letter_mother_in_law_role','תפקיד חמות'],['letter_envelope_location','מיקום מעטפה'],['letter_critical_sender','שולח קריטי'],['letter_critical_operation','פעולה קריטית'],['letter_critical_understanding','הבנה קריטית']];
        mLetter.forEach(function(p) { addRow(traineeName, 'מכתב', q++, p[1], exd(t, 5, p[0]+'_memory'), '', exd(t, 5, p[0]+'_text')); });
        addRow(traineeName, 'מכתב', q++, 'חריגים (סיור)', '', '', exd(t, 5, 'recon_incidents'));
        addRow(traineeName, 'מכתב', q++, 'מסלול הליכה', '', '', exd(t, 5, 'recon_route'));
        addRow(traineeName, 'מכתב', q++, 'שיקולים', '', '', exd(t, 5, 'recon_considerations'));
        addRow(traineeName, 'מכתב', q++, 'סיפור כיסוי', exd(t, 5, 'recon_cover_story_yesno'), '', exd(t, 5, 'recon_cover_story_text'));
        addRow(traineeName, 'מכתב', q++, 'מל"מ', '', '', exd(t, 5, 'recon_intel'));
        addRow(traineeName, 'מכתב', q++, 'שירות למשימה', '', '', exd(t, 5, 'recon_mission_support'));
        var mReconYN = [['recon_timing','חישב זמנים'],['recon_reading_location','מקום לקריאה'],['recon_initial_plans','דפאות ראשוניות'],['recon_remote_observation','נק תצפית מרוחקת'],['recon_cameras','מצלמות'],['recon_access_path','מסלול גישה'],['recon_obstacles','מכשולים'],['recon_proximity','קרבה ליעד'],['recon_envelope_id','זיהוי מעטפה'],['recon_mailbox_count','מספר תיבות'],['recon_entered_yard','נכנס לחצר']];
        mReconYN.forEach(function(p) { addRow(traineeName, 'מכתב', q++, p[1], exd(t, 5, p[0]+'_yesno'), '', exd(t, 5, p[0]+'_text')); });
        addRow(traineeName, 'מכתב', q++, 'דפא א', '', '', exd(t, 5, 'plan_a'));
        addRow(traineeName, 'מכתב', q++, 'דפא ב', '', '', exd(t, 5, 'plan_b'));
        addRow(traineeName, 'מכתב', q++, 'בחירת דפא', exd(t, 5, 'plan_choice'), '', '');
        addRow(traineeName, 'מכתב', q++, 'כיסוי (א)', '', '', exd(t, 5, 'plan_a_cover'));
        addRow(traineeName, 'מכתב', q++, 'יתרונות (א)', '', '', exd(t, 5, 'plan_a_pros'));
        addRow(traineeName, 'מכתב', q++, 'חסרונות (א)', '', '', exd(t, 5, 'plan_a_cons'));
        addRow(traineeName, 'מכתב', q++, 'חזרה (א)', '', '', exd(t, 5, 'plan_a_return'));
        addRow(traineeName, 'מכתב', q++, 'כיסוי (ב)', '', '', exd(t, 5, 'plan_b_cover'));
        addRow(traineeName, 'מכתב', q++, 'יתרונות (ב)', '', '', exd(t, 5, 'plan_b_pros'));
        addRow(traineeName, 'מכתב', q++, 'חסרונות (ב)', '', '', exd(t, 5, 'plan_b_cons'));
        addRow(traineeName, 'מכתב', q++, 'חזרה (ב)', '', '', exd(t, 5, 'plan_b_return'));
        addRow(traineeName, 'מכתב', q++, 'דפאות נוספות', '', '', exd(t, 5, 'plan_additional'));
        var mApproval = [['approval_cover_establish','הצגת כיסוי'],['approval_movement','צירי תנועה'],['approval_computer','מחשב'],['approval_reading_return','קריאה וחזרה']];
        mApproval.forEach(function(p) { addRow(traineeName, 'מכתב', q++, p[1], exd(t, 5, p[0]+'_status'), '', exd(t, 5, p[0]+'_text')); });
        var mCont = [['cont_mailbox_closed','תיבה סגורה'],['cont_neighbor_saw','שכן ראה'],['cont_envelope_sealed','מעטפה חתומה'],['cont_envelope_damaged','מעטפה פגומה'],['cont_file_not_found','קובץ לא נמצא'],['cont_computer_broken','מחשב תקול'],['cont_dok_encrypted','דיסק מוצפן'],['cont_dok_damaged','דיסק פגום'],['cont_forgot_password','שכח סיסמה']];
        mCont.forEach(function(p) {
            addRow(traineeName, 'מכתב', q++, p[1]+' - חשב', exd(t, 5, p[0]+'_thought'), '', '');
            addRow(traineeName, 'מכתב', q++, p[1]+' - פתרון', exd(t, 5, p[0]+'_solution'), '', '');
            addRow(traineeName, 'מכתב', q++, p[1]+' - פירוט', '', '', exd(t, 5, p[0]+'_text'));
        });
        addRow(traineeName, 'מכתב', q++, 'חריגים (ביצוע)', '', '', exd(t, 5, 'execution_incidents'));
        addRow(traineeName, 'מכתב', q++, 'תיאור ביצוע', '', '', exd(t, 5, 'execution_description'));
        addRow(traineeName, 'מכתב', q++, 'הצלחה', exd(t, 5, 'execution_success_yesno'), '', exd(t, 5, 'execution_success_text'));
        addRow(traineeName, 'מכתב', q++, 'תזמון', '', '', exd(t, 5, 'execution_timing'));
        addRow(traineeName, 'מכתב', q++, 'מדידת זמן', '', '', exd(t, 5, 'execution_time_measurement'));
        addRow(traineeName, 'מכתב', q++, 'החזרת מעטפה', exd(t, 5, 'execution_envelope_returned_yesno'), '', exd(t, 5, 'execution_envelope_returned_text'));
        addRow(traineeName, 'מכתב', q++, 'לקח', '', '', exd(t, 5, 'execution_lesson'));
        addRow(traineeName, 'מכתב', q++, 'הערה חופשית', '', '', exd(t, 5, 'free_comment'));
        addRow(traineeName, 'מכתב', q++, 'סיכום', '', '', exd(t, 5, 'summary'));
        var mScores = ['יכולות למידה ויישום','גמישות מחשבתית','יכולת תכנון','בטחון מול יעילות','מיומנות - ניווט, זיכרון','יכולת דיווח','התמודדות במצבי לחץ','בטחון עצמי','ציון מסכם'];
        mScores.forEach(function(s, i) { addRow(traineeName, 'מכתב', q++, s, '', exd(t, 5, 'score_' + i), ''); });
        
        // ========== יומינט (exercise 6) ==========
        for (var i = 0; i < 12; i++) {
            var taskVal = exd(t, 6, 'task_' + i);
            if (taskVal) {
                addRow(traineeName, 'יומינט', q++, 'משימה ' + (i+1), taskVal, '', '');
                addRow(traineeName, 'יומינט', q++, 'הערות משימה ' + (i+1), '', '', exd(t, 6, 'taskq_' + i));
                addRow(traineeName, 'יומינט', q++, 'תכנון משימה ' + (i+1), '', '', exd(t, 6, 'plan_' + i));
            }
        }
        addRow(traineeName, 'יומינט', q++, 'חריגים/תקלות', '', '', exd(t, 6, 'incidents'));
        addRow(traineeName, 'יומינט', q++, 'מל"מ', '', '', exd(t, 6, 'intel'));
        addRow(traineeName, 'יומינט', q++, 'סקירת תוצרים', exd(t, 6, 'reviewed'), '', '');
        addRow(traineeName, 'יומינט', q++, 'ביצוע עפי תוכנית', exd(t, 6, 'asplanned'), '', exd(t, 6, 'asplanned_notes'));
        addRow(traineeName, 'יומינט', q++, 'הצלחה', exd(t, 6, 'success'), '', exd(t, 6, 'success_notes'));
        addRow(traineeName, 'יומינט', q++, 'הערות חופשיות', '', '', exd(t, 6, 'free_notes'));
        var yScores = ['גמישות מחשבתית','גמישות ביצועית','כישורי שטח בינאישיים','התמודדות עם מצבי לחץ','התמקמות כלומד','בטחון עצמי','ציון מסכם'];
        yScores.forEach(function(s, i) { addRow(traineeName, 'יומינט', q++, s, '', exd(t, 6, 'score_' + i), ''); });
        
        // ========== סיכום הערכה ==========
        var criteria = ['כישורי חשיבה - יכולת למידה','כישורי חשיבה - גמישות מחשבתית','כישורי חשיבה - תכנון','טקטי - גמישות ביצועית','טקטי - בטחון מול יעילות','טקטי - מיומנויות','טקטי - יכולות דיווח','טקטי - שטח/בינאישי','אישיות - חוסן, עמימות ולחץ','אישיות - גמישות מחשבתית','אישיות - עבודה בצוות','סיכום כללי'];
        criteria.forEach(function(c) {
            var key = t + '-' + c;
            var score = data.summaryData && data.summaryData[key] ? data.summaryData[key].score || '' : '';
            var txt = data.summaryData && data.summaryData[key] ? data.summaryData[key].text || '' : '';
            var ex = data.summaryData && data.summaryData[key] ? data.summaryData[key].examples || '' : '';
            addRow(traineeName, 'סיכום הערכה', q++, c, '', score, txt + (ex ? ' | דוגמאות: ' + ex : ''));
        });
    }
    
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:15},{wch:12},{wch:6},{wch:45},{wch:22},{wch:10},{wch:60}];
    XLSX.utils.book_append_sheet(wb, ws, 'משוב מלא');
    return XLSX.write(wb, {bookType:'xlsx', type:'array'});
};
