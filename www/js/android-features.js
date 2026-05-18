/**
 * improvSTAGE Android — Feature module (slim)
 * Stripped of PC-only UI: sidebar, floating notes panel, font controls,
 * dark-mode toggle, density controls. Keeps: email + note utilities + hooks.
 */
(function () {
  'use strict';

  // ═══ Utilities ═══════════════════════════════════════════════════════
  function fmtTime(iso){if(!iso)return '';var d=new Date(iso);return d.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})+' '+d.toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit'});}

  function currentTraineeIdx(){
    if(!window.app) return null;
    var p=window.app.currentPage;
    if(p==='summary'&&window.app.currentSummaryTrainee!=null) return window.app.currentSummaryTrainee;
    if(p==='review' &&window.app.currentReviewTrainee!=null)  return window.app.currentReviewTrainee;
    if(window.app.currentTrainee!=null) return window.app.currentTrainee;
    for(var i=0;i<4;i++){var t=document.getElementById('traineeTab'+i);if(t&&t.classList.contains('active'))return i;}
    var a=document.querySelector('#reviewSwitchBar .quick-switch-btn.active');
    if(a){var m=a.id.match(/rqs(\d)/);if(m)return parseInt(m[1]);}
    return null;
  }

  // ═══ Floor notes (data only — no floating panel UI) ═════════════════
  function ensureGlobalNotes() {
    if (window.app && window.app.data && !window.app.data.globalNotes)
      window.app.data.globalNotes = [];
  }

  function saveNote(text) {
    if (!text||!text.trim()) return null;
    ensureGlobalNotes();
    var tidx=currentTraineeIdx();
    var note={
      id:Date.now()+'_'+Math.random().toString(36).substr(2,4),
      text:text.trim(), timestamp:new Date().toISOString(),
      page:(window.app&&window.app.currentPage)||'unknown',
      exerciseIdx:(window.app&&window.app.currentExercise!=null)?window.app.currentExercise:null,
      traineeIdx:tidx,
      exerciseName:(window.app&&window.app.exercises&&window.app.currentExercise!=null)?window.app.exercises[window.app.currentExercise]:null,
      traineeName:window.getTraineeName?window.getTraineeName(tidx):null
    };
    window.app.data.globalNotes.push(note);
    if(window.storage) window.storage.saveData(true);
    return note;
  }

  window.getGlobalNotesForExercise=function(exIdx){
    if(!window.app||!window.app.data.globalNotes) return [];
    var tidx=currentTraineeIdx();
    return window.app.data.globalNotes.filter(function(n){
      return n.exerciseIdx===exIdx&&(tidx===null||n.traineeIdx===tidx);
    });
  }

  function injectNotes(tid){
    if(!window.app||!window.app.data.globalNotes)return;
    (window.app.exercises||[]).forEach(function(_,ei){
      var notes=window.app.data.globalNotes.filter(function(n){return n.exerciseIdx===ei&&(n.traineeIdx===null||n.traineeIdx===tid);});
      if(!notes.length)return;
      var k=tid+'-'+ei;
      if(!window.app.data.exerciseData[k])window.app.data.exerciseData[k]={};
      if(window.app.data.exerciseData[k]['_pcInj'])return;
      window.app.data.exerciseData[k]['הערות שטח']=notes.map(function(n){return '['+fmtTime(n.timestamp)+'] '+n.text;}).join('\n');
      window.app.data.exerciseData[k]['_pcInj']=true;
    });
  }

  function cleanNotes(tid){
    (window.app&&window.app.exercises||[]).forEach(function(_,ei){
      var k=tid+'-'+ei;
      if(window.app.data.exerciseData[k]){delete window.app.data.exerciseData[k]['הערות שטח'];delete window.app.data.exerciseData[k]['_pcInj'];}
    });
  }

  // ═══ Page hooks ══════════════════════════════════════════════════════
  function hookPageChanges(){
    var origGo=window.goToPage;
    if(origGo){
      window.goToPage=function(pageId){
        origGo.call(this,pageId);
        setTimeout(function(){
          _appReady=true;
          /* applyBodyMargins removed (PC-only) */
        },180);
      };
    }
    setInterval(function(){
      if (!window.supabaseSync || !window.app) return;
      var page = window.app.currentPage;
      var tid  = currentTraineeIdx();
      if (tid === null) return;
      if (page === 'review' && window.supabaseSync.renderDocLinksInReview)
        window.supabaseSync.renderDocLinksInReview(tid);
      if (page === 'assessment' && window.supabaseSync.injectDocLinksIntoExercise)
        window.supabaseSync.injectDocLinksIntoExercise();
    },1000);
    setTimeout(function(){
      _appReady=true;
      /* applyBodyMargins removed (PC-only) */
    },1500);
  }

  function hookExports(){
    var origDocx=window.exportTraineeDocx;
    if(origDocx) window.exportTraineeDocx=function(tid){
      injectNotes(tid); origDocx.call(this,tid);
      setTimeout(function(){cleanNotes(tid);},2000);
    };
    var origText=window.showTextOnlySummary;
    if(origText) window.showTextOnlySummary=function(tid){
      origText.call(this,tid);
      setTimeout(function(){injectIntoOverlay(tid);},200);
    };
  }

  // ═══ Email — comprehensive text body + dispatcher ════════════════════
  function showEmailDialog() {
    var tid  = currentTraineeIdx()||0;
    var name = window.getTraineeName ? window.getTraineeName(tid) : ('חניך '+(tid+1));
    // Remove old dialog if exists
    var old = document.getElementById('pcEmailDialog');
    if (old) old.remove();

    var dialog = document.createElement('div');
    dialog.id = 'pcEmailDialog';
    dialog.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;';
    dialog.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:28px;width:420px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:Assistant,sans-serif;direction:rtl;">'+
        '<h3 style="margin:0 0 16px;font-family:Rubik,sans-serif;color:#1e293b;">📧 שלח סיכום במייל</h3>'+
        '<p style="font-size:.9em;color:#64748b;margin-bottom:12px;">הזן כתובת אימייל — ייפתח לקוח המייל שלך עם הסיכום המלא.</p>'+
        '<label style="font-weight:700;font-size:.9em;display:block;margin-bottom:6px;">אימייל:</label>'+
        '<input id="pcEmailInput" type="email" placeholder="name@example.com" '+
          'style="width:100%;padding:10px 14px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:1em;margin-bottom:8px;box-sizing:border-box;" '+
          'onkeydown="if(event.key===\'Enter\')window.doSendEmail()">'+
        '<label style="font-weight:700;font-size:.9em;display:block;margin-bottom:6px;">נושא:</label>'+
        '<input id="pcEmailSubject" type="text" value="סיכום הערכה — '+name+'" '+
          'style="width:100%;padding:10px 14px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:1em;margin-bottom:16px;box-sizing:border-box;">'+
        '<div style="display:flex;gap:10px;justify-content:flex-start;">'+
          '<button onclick="window.doSendEmail()" style="background:#2563eb;color:white;border:none;padding:10px 20px;border-radius:7px;font-weight:700;cursor:pointer;font-size:.95em;">📤 שלח</button>'+
          '<button id="pcEmailCancelBtn" style="background:#f1f5f9;color:#475569;border:1px solid #e2e6ed;padding:10px 20px;border-radius:7px;font-weight:700;cursor:pointer;font-size:.95em;">ביטול</button>'+
        '</div>'+
        '<p style="font-size:.78em;color:#94a3b8;margin-top:12px;margin-bottom:0;">קובץ Word יורד אוטומטית — יש לצרפו לאימייל ידנית.</p>'+
      '</div>';
    document.body.appendChild(dialog);
    // Wire cancel button properly (inline onclick had broken escaping)
    var cancelBtn = document.getElementById('pcEmailCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', function(){
      var d = document.getElementById('pcEmailDialog');
      if (d) d.remove();
    });
    // Focus email input
    setTimeout(function(){ var inp=document.getElementById('pcEmailInput'); if(inp) inp.focus(); }, 50);
  }

  window.doSendEmail = function() {
    var emailEl   = document.getElementById('pcEmailInput');
    var subjectEl = document.getElementById('pcEmailSubject');
    var toEmail   = emailEl   ? emailEl.value.trim()   : '';
    var subject   = subjectEl ? subjectEl.value.trim() : 'סיכום הערכה';
    if (!toEmail) { emailEl && emailEl.focus(); return; }

    var tid  = currentTraineeIdx()||0;
    var name = window.getTraineeName ? window.getTraineeName(tid) : ('חניך '+(tid+1));

    // Build body text
    var body = buildEmailBody(tid, name);

    // Close dialog
    var dlg = document.getElementById('pcEmailDialog');
    if (dlg) dlg.remove();

    console.log('📧 Sending email to:', toEmail, 'subject:', subject);

    // No attachments — everything is in the comprehensive text body
    console.log('📧 Email body length:', body.length, 'chars');
    if (window.supabaseSync && window.supabaseSync._sendEmail) {
      window.supabaseSync._sendEmail(toEmail, subject, body);
    } else {
      // Direct mailto fallback if supabaseSync unavailable
      var a = document.createElement('a');
      a.href = 'mailto:' + encodeURIComponent(toEmail) +
               '?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(body);
      document.body.appendChild(a); a.click();
      setTimeout(function(){ document.body.removeChild(a); }, 300);
      alert('✅ נפתח לקוח המייל.');
    }
  }

  function buildEmailBody(tid, name) {
    var date = new Date().toLocaleDateString('he-IL');
    var lines = [];
    var sep = '═══════════════════════════════════════';

    // Header
    lines.push('סיכום הערכת חניך');
    lines.push(sep);
    lines.push('שם חניך: ' + name);
    lines.push('תאריך: ' + date);
    lines.push('הערכה: ' + ((window.app && window.app.data.assessmentName) || ''));
    lines.push('מעריך: ' + ((window.app && window.app.data.evaluatorName) || ''));
    lines.push('');

    // Exercises — use EXERCISE_ALL_FIELDS labels for proper text
    var EAF = window.EXERCISE_ALL_FIELDS || [];
    var YC  = window.YOMINET_CHALLENGES || [];
    (window.app && window.app.exercises || []).forEach(function(exName, exIdx) {
      var hasContent = false;
      var exLines = ['── ' + exName + ' ──'];

      // Yominet tasks (exercise 6)
      if (exIdx === 6 && YC.length) {
        YC.forEach(function(ch, i) {
          var v = window.storage && window.storage.getExerciseData(tid, exIdx, 'task_'+i);
          var n = window.storage && window.storage.getExerciseData(tid, exIdx, 'task_'+i+'_notes');
          if (v) { exLines.push(ch + ': ' + v); hasContent = true; }
          if (n) { exLines.push('  הערה: ' + n); }
        });
      }

      // All fields with labels (from EXERCISE_ALL_FIELDS)
      var fields = EAF[exIdx] || [];
      fields.forEach(function(spec) {
        var field = spec[0], label = spec[1], type = spec[2];
        if (type === 'r') {
          var baseField = field.endsWith('_yesno') ? field.slice(0,-6) : field;
          var yv = (window.storage && window.storage.getExerciseData(tid, exIdx, baseField + '_yesno')) ||
                   (window.storage && window.storage.getExerciseData(tid, exIdx, field)) || '';
          var tv = (window.storage && window.storage.getExerciseData(tid, exIdx, baseField + '_text')) || '';
          if (yv || tv) { exLines.push(label + ': ' + yv + (tv ? ' — ' + tv : '')); hasContent = true; }
        } else {
          var v = (window.storage && window.storage.getExerciseData(tid, exIdx, field)) || '';
          if (v) { exLines.push(label + ': ' + v); hasContent = true; }
        }
      });

      // Floor notes for this exercise
      var exNotes = (window.app && window.app.data.globalNotes || []).filter(function(n) {
        return n.exerciseIdx === exIdx && (n.traineeIdx === null || n.traineeIdx === tid);
      });
      if (exNotes.length) {
        exLines.push('— הערות שטח:');
        exNotes.forEach(function(n) {
          exLines.push('  [' + fmtTime(n.timestamp) + '] ' + n.text);
        });
        hasContent = true;
      }

      if (hasContent) {
        lines.push.apply(lines, exLines);
        lines.push('');
      }
    });

    // Interview data
    var interviewLabels = {
      q1:'שאלה 1 — היכרות עם התרגילים', q2:'שאלה 2 — חוויה כללית', q3:'שאלה 3 — ביטוי יכולות',
      q4:'שאלה 4 — למידה עצמית', q5:'שאלה 5 — תרגיל מצליח/פחות', q6:'שאלה 6 — (אופציונלי)',
      q7:'שאלה 7 — רצון ביחידה', q8:'שאלה 8 — עמידה בלחץ', q9:'שאלה 9 — עבודת צוות',
      q10:'שאלה 10 — הוספות', summary:'סיכום התרשמות המאבחנת'
    };
    var idata = (window.app && window.app.data.interviewData || {})[tid] || {};
    var hasInterview = Object.keys(interviewLabels).some(function(k){ return idata[k]; });
    if (hasInterview) {
      lines.push('── טופס ראיון מסכם ──');
      Object.keys(interviewLabels).forEach(function(k) {
        if (idata[k]) {
          lines.push(interviewLabels[k] + ':');
          lines.push('  ' + idata[k]);
        }
      });
      lines.push('');
    }

    // Verbal summary (strengths / improvements / recommendation)
    var strengths      = window.storage && window.storage.getReviewData(tid, 'strengths') || '';
    var improvements   = window.storage && window.storage.getReviewData(tid, 'improvements') || '';
    var recommendation = window.storage && window.storage.getReviewData(tid, 'recommendation') || '';
    if (strengths || improvements || recommendation) {
      lines.push('── סיכום כללי ──');
      if (strengths)      { lines.push('נקודות חוזק:');   lines.push('  ' + strengths);      lines.push(''); }
      if (improvements)   { lines.push('נקודות לשיפור:'); lines.push('  ' + improvements);   lines.push(''); }
      if (recommendation) { lines.push('המלצה כללית:');   lines.push('  ' + recommendation); lines.push(''); }
    }

    // Tagged documents
    var docLinks = (window.app && window.app.data.docLinks) || {};
    var traineeDocs = Object.keys(docLinks).filter(function(sid){
      return docLinks[sid] && docLinks[sid].traineeIdx === tid;
    });
    if (traineeDocs.length) {
      lines.push('── מסמכים מתויגים (' + traineeDocs.length + ') ──');
      traineeDocs.forEach(function(sid) {
        var d = docLinks[sid];
        lines.push('• ' + (d.exerciseName || '') + ' (' + sid + ')');
        if (d.taggedAt) lines.push('  תויג: ' + d.taggedAt.substring(0,10));
      });
      lines.push('');
    }

    lines.push(sep);
    lines.push('נשלח מ-improvSTAGE');
    return lines.join(String.fromCharCode(10));
  }

  // ═══ Bootstrap on deviceready ════════════════════════════════════════
  document.addEventListener('deviceready', function() {
    try { ensureGlobalNotes(); } catch(e) { console.warn('ensureGlobalNotes failed:', e); }
    try { hookPageChanges(); }  catch(e) { console.warn('hookPageChanges failed:', e); }
    try { hookExports(); }      catch(e) { console.warn('hookExports failed:', e); }
    console.log('📱 Android features ready');
  }, false);
})();
