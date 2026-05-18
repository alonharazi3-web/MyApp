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
    if (window._exportsHooked) return;
    window._exportsHooked = true;
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

  // ═══════════════════════════════════════════════════════════════════
  // EMAIL BUTTON INJECTION — adds 📧 שלח מייל to review page
  // ═══════════════════════════════════════════════════════════════════
  function addEmailBtn() {
    var bar = document.querySelector('.review-export-bar');
    if (bar && !bar.dataset.em) {
      bar.dataset.em = '1';
      var btn = document.createElement('button');
      btn.className = 'btn-review-export';
      btn.style.cssText = 'background:linear-gradient(135deg,#0284c7,#0ea5e9);color:white;border:none;padding:10px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-family:Rubik,sans-serif;margin:4px;';
      btn.textContent = '📧 שלח מייל';
      btn.onclick = showEmailDialog;
      bar.appendChild(btn);
      console.log('📧 Email button injected into review page');
    }
  }
  function hookEmailButtons() {
    if (window._emailBtnObserverActive) { addEmailBtn(); return; }
    window._emailBtnObserverActive = true;
    var target = document.getElementById('app') || document.body;
    new MutationObserver(addEmailBtn).observe(target, {childList: true, subtree: true});
    addEmailBtn();
  }

  // ═══════════════════════════════════════════════════════════════════
  // DOC LINKS DISPLAY — drives renderDocLinksInReview + injectDocLinksIntoExercise
  // Without this interval, imported documents don't appear in review/exercise
  // ═══════════════════════════════════════════════════════════════════
  function startDocLinksDriver() {
    if (window._docLinksDriverActive) return;
    window._docLinksDriverActive = true;
    setInterval(function() {
      if (!window.app || !window.supabaseSync) return;
      var page = window.app.currentPage;
      var tid  = (typeof window.app.currentReviewTrainee !== 'undefined') ? window.app.currentReviewTrainee : currentTraineeIdx();
      try {
        if (page === 'review' && window.supabaseSync.renderDocLinksInReview)
          window.supabaseSync.renderDocLinksInReview(tid);
        if (page === 'assessment' && window.supabaseSync.injectDocLinksIntoExercise)
          window.supabaseSync.injectDocLinksIntoExercise();
      } catch(e) { /* silent */ }
    }, 1000);
    console.log('📎 DocLinks driver started (interval 1s)');
  }

  // ═══════════════════════════════════════════════════════════════════
  // ANDROID BACK BUTTON — close image viewer / overlays instead of nav back
  // ═══════════════════════════════════════════════════════════════════
  function hookBackButton() {
    if (window._backbuttonHooked) return;
    window._backbuttonHooked = true;
    document.addEventListener('backbutton', function(e) {
      // Priority order — close topmost overlay
      var candidates = [
        '#letterImageModal',     // Letter image (exercise 4)
        '#imgViewerOverlay',     // Fullscreen image viewer
        '[id^="av_"]',           // assessment view overlay (history → צפה)
        '[id^="sb"]',            // ALL supabase overlays (sb_, sbView_)
        '[id^="fsTest_"]',       // diagnostic test overlays
        '#pcEmailDialog',        // email send dialog
        '#textSummaryOverlay',   // text-only summary
        '#sb_admin_panel'        // main admin panel (defensive)
      ];
      for (var i = 0; i < candidates.length; i++) {
        var el = document.querySelector(candidates[i]);
        if (el && el.offsetParent !== null) {  // visible
          e.preventDefault();
          el.remove();
          console.log('🔙 backbutton: closed', candidates[i]);
          return;
        }
      }
      // No overlay open — let default back behavior happen (Cordova navigates)
    }, false);
    console.log('🔙 Backbutton handler hooked');
  }

  // ═══════════════════════════════════════════════════════════════════
  // CORDOVA FILE SAVE — robust save to user's Downloads folder
  // Falls back: externalRoot/Download → externalData → cache → alert
  // ═══════════════════════════════════════════════════════════════════
  window.saveBlobToDownload = function(blob, filename, mimeType) {
    return new Promise(function(resolve, reject) {
      if (!window.cordova || !window.cordova.file || !window.resolveLocalFileSystemURL) {
        // Web/Electron fallback: FileSaver or anchor download
        try {
          if (window.saveAs) { window.saveAs(blob, filename); resolve('saveAs'); return; }
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = filename; a.click();
          setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
          resolve('anchor'); return;
        } catch(e) { reject(e); return; }
      }
      var tried = [];
      function tryDir(label, dirUrl, next) {
        if (!dirUrl) { next(); return; }
        tried.push(label);
        window.resolveLocalFileSystemURL(dirUrl, function(dir) {
          dir.getFile(filename, {create: true, exclusive: false}, function(fe) {
            fe.createWriter(function(w) {
              w.onwriteend = function() {
                console.log('💾 Saved to', label, ':', fe.nativeURL);
                resolve({ label: label, url: fe.nativeURL, path: dirUrl + filename });
              };
              w.onerror = function(e) {
                console.warn('write failed at', label, e);
                next();
              };
              w.write(blob);
            }, next);
          }, next);
        }, next);
      }
      var cf = window.cordova.file;
      // Order: externalRoot/Download/ (user-visible) → externalData → cache
      var downloadDir = cf.externalRootDirectory ? cf.externalRootDirectory + 'Download/' : null;
      tryDir('Downloads', downloadDir, function() {
        tryDir('externalData', cf.externalDataDirectory, function() {
          tryDir('cache', cf.cacheDirectory, function() {
            reject(new Error('All save paths failed: ' + tried.join(', ')));
          });
        });
      });
    });
  };

  // Override exportTraineeDocx to use saveBlobToDownload (with user-visible alert)
  function overrideWordExport() {
    var orig = window.exportTraineeDocx;
    if (!orig || orig.__androidWrapped) return;
    window.exportTraineeDocx = function(traineeId) {
      // Inject notes (same as original wrapper from hookExports)
      try { injectNotes(traineeId); } catch(e){}

      try {
        var data = window.app.data;
        var name = window.getTraineeName(traineeId);
        var date = new Date().toLocaleDateString('he-IL');

        // Build sections same as original (we hijack BEFORE calling original)
        // Easier: call original then intercept the blob via overriding window.saveAs
        var capturedBlob = null, capturedFilename = null;
        var originalSaveAs = window.saveAs;
        window.saveAs = function(blob, fn) { capturedBlob = blob; capturedFilename = fn; };
        // Also disable Cordova path in original by temporarily nulling plugins
        var savedPlugins = window.plugins;
        window.plugins = undefined;
        try {
          orig.call(this, traineeId);
        } finally {
          window.saveAs = originalSaveAs;
          window.plugins = savedPlugins;
        }

        if (!capturedBlob) {
          alert('❌ לא הצליח להפיק קובץ Word. נסה הורדה כטקסט פשוט.');
          return;
        }
        window.saveBlobToDownload(capturedBlob, capturedFilename || ('סקירה_' + name + '.docx'),
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
          .then(function(r) {
            alert('✅ קובץ Word נשמר ב-' + r.label + ':\n' + capturedFilename + '\n\nניתן למצוא אותו בתיקיית Download של המכשיר.');
          })
          .catch(function(err) {
            // Final fallback — save as plain text
            console.error('Word save failed, falling back to text:', err);
            saveAsPlainText(traineeId);
          })
          .then(function(){ setTimeout(function(){ try{ cleanNotes(traineeId); }catch(e){} }, 1000); });
      } catch(e) {
        alert('❌ שגיאה: ' + e.message);
      }
    };
    window.exportTraineeDocx.__androidWrapped = true;
    console.log('📄 exportTraineeDocx wrapped for Android (Downloads/ + text fallback)');
  }

  // Plain text fallback — uses the existing comprehensive buildEmailBody output
  function saveAsPlainText(traineeId) {
    var name = window.getTraineeName(traineeId);
    var body = buildEmailBody(traineeId, name);
    var blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    var date = new Date().toISOString().substring(0,10);
    var fn = 'סקירה_' + name + '_' + date + '.txt';
    window.saveBlobToDownload(blob, fn, 'text/plain').then(function(r){
      alert('💾 נשמר כקובץ טקסט (Word נכשל):\n' + fn + '\nמיקום: ' + r.label);
    }).catch(function(e){
      alert('❌ שמירה נכשלה לחלוטין: ' + e.message);
    });
  }

  // Override generatePDFSummary similarly (PDF — write HTML, alert user)
  function overridePDFExport() {
    var orig = window.generatePDFSummary;
    if (!orig || orig.__androidWrapped) return;
    window.generatePDFSummary = function() {
      var capturedBlob = null;

      // Force browser path inside original by hiding cordova temporarily
      var savedCordova = window.cordova;
      var savedOpen    = window.open;
      window.cordova = undefined;
      window.open = function(url) {
        if (typeof url === 'string' && url.indexOf('blob:') === 0) {
          fetch(url).then(function(r){ return r.blob(); }).then(function(b){
            capturedBlob = b;
            saveCaptured();
          }).catch(function(e){
            alert('❌ קבלת blob נכשלה: ' + e.message);
          });
          // Return null — original code does `if (win)` guard
          return null;
        }
        return savedOpen.apply(window, arguments);
      };

      try {
        orig.call(this);
      } finally {
        // Restore (Promise-style fetch above resolves later but we restored already — that's fine)
        window.cordova = savedCordova;
        window.open    = savedOpen;
      }

      function saveCaptured() {
        if (!capturedBlob) { alert('❌ לא נוצר קובץ PDF'); return; }
        var date = new Date().toISOString().substring(0,10);
        var fn = 'סיכום_' + date + '.html';
        window.saveBlobToDownload(capturedBlob, fn, 'text/html').then(function(r){
          alert('✅ סיכום נשמר:\n' + fn + '\n\n📁 ' + r.label + '\n\nפתח ב-Chrome → תפריט → "הדפס" → "שמור כ-PDF"');
        }).catch(function(e){
          alert('❌ שמירה נכשלה: ' + e.message);
        });
      }
    };
    window.generatePDFSummary.__androidWrapped = true;
    console.log('📋 generatePDFSummary wrapped for Android (forced browser path)');
  }

  // ═══ ROBUST Bootstrap — runs regardless of deviceready ════════════════
  // (deviceready may never fire on Cordova WebView if a plugin is missing/broken;
  //  we fall back to DOMContentLoaded + multiple setTimeouts to ensure setup.)
  var _bootstrapped = false;
  function runBootstrap(trigger) {
    if (_bootstrapped) return;
    _bootstrapped = true;
    console.log('📱 Android bootstrap STARTING via:', trigger);
    var ok = 0, fail = 0;
    function step(name, fn) {
      try { fn(); console.log('  ✓', name); ok++; }
      catch(e) { console.error('  ✗', name, ':', e.message); fail++; }
    }
    step('ensureGlobalNotes',  function(){ ensureGlobalNotes(); });
    step('hookPageChanges',    function(){ hookPageChanges(); });
    step('hookExports',        function(){ hookExports(); });
    step('overrideWordExport', function(){ overrideWordExport(); });
    step('overridePDFExport',  function(){ overridePDFExport(); });
    step('hookEmailButtons',   function(){ hookEmailButtons(); });
    step('startDocLinksDriver',function(){ startDocLinksDriver(); });
    step('hookBackButton',     function(){ hookBackButton(); });
    console.log('📱 Bootstrap DONE: ' + ok + ' ok, ' + fail + ' failed');
  }
  // Expose for manual debug from console: window.runAndroidBootstrap()
  window.runAndroidBootstrap = function(){ _bootstrapped = false; runBootstrap('manual'); };

  // Trigger 1: deviceready (preferred if Cordova works)
  document.addEventListener('deviceready', function(){ runBootstrap('deviceready'); }, false);

  // Trigger 2: DOMContentLoaded (always fires in WebView)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){ runBootstrap('DOMContentLoaded'); }, 300);
    });
  } else {
    setTimeout(function(){ runBootstrap('immediate-ready'); }, 300);
  }

  // Trigger 3: last-resort timeout (in case both above silently fail)
  setTimeout(function(){ runBootstrap('timeout-2s'); }, 2000);
})();
