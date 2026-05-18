/**
 * improvSTAGE — Supabase Sync Module v1.0
 * Send/receive assessments (text + images) via Supabase
 * Works from file:// — Supabase supports CORS for anon key
 */
(function () {
  'use strict';
  window._closeOv = function(id){ var e=document.getElementById(id); if(e) e.remove(); };

  // ═══════════════════════════════════════════════════════════════════════
  // 🔬 DIAGNOSTIC FETCH WRAPPER — logs every Supabase request
  // Enable via admin button or: localStorage.setItem('sbDiagFetch','1'); reload
  // ═══════════════════════════════════════════════════════════════════════
  if (localStorage.getItem('sbDiagFetch') === '1' && !window._sbFetchWrapped) {
    window._sbFetchWrapped = true;
    var _origFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var method = (init && init.method) || (input && input.method) || 'GET';
      if (url.indexOf('supabase.co') === -1) return _origFetch(input, init);

      var shortUrl = url.replace(/https?:\/\/[^/]+/, '').substring(0, 140);
      var t0 = Date.now();
      console.log('🌐 →', method, shortUrl);

      return _origFetch(input, init).then(function(resp) {
        var ms = Date.now() - t0;
        var icon = resp.ok ? '✅' : '❌';
        return resp.clone().text().then(function(body) {
          var preview = body.length > 250 ? body.substring(0,250)+'…' : body;
          console.log('🌐 ←', icon, resp.status, method, shortUrl, '(' + ms + 'ms)\n  body:', preview || '(empty)');
          if (method === 'DELETE' && resp.ok && (body === '' || body === '[]' || body === '{}')) {
            console.warn('⚠️ DELETE returned empty body — likely RLS blocked. Add policy:');
            console.warn('   create policy "anon delete" on assessments for delete to anon using (true);');
            console.warn('   create policy "anon storage delete" on storage.objects for delete to anon using (bucket_id=\'assessment-images\');');
          }
          return resp;
        }).catch(function() {
          console.log('🌐 ←', icon, resp.status, method, shortUrl, '(' + ms + 'ms)');
          return resp;
        });
      }).catch(function(err) {
        console.error('🌐 ✗', method, shortUrl, 'NETWORK FAIL:', err.message);
        throw err;
      });
    };
    console.log('🔬 Fetch wrapper ACTIVE — all Supabase requests will be logged');
  }


  // ── Document labels — same as "צרף מסמך" ─────────────────────────────
  var DOC_LABELS = [
    'שרטוטים ותוכניות מכתב',
    'סיכום מכתב',
    'סיכום רחוב',
    'יום עבודתי',
    'החלטות',
    'משוב עמיתים',
    'סיכום כללי',
    'אחר'
  ];

  // ── Config — HARDCODED, no localStorage dependency ───────────────────
  var SB_URL = 'https://tuijkzboadjtmlorknla.supabase.co';
  var SB_KEY = 'sb_publishable_ESjEVl_DtyjHjx8g04gllw_tdsLvfCS';

  function cfg() { return { url: SB_URL, key: SB_KEY }; }

  // ═══════════════════════════════════════════════════════════════════════
  // LOCAL STORE — IndexedDB for offline document + image copies
  // ═══════════════════════════════════════════════════════════════════════
  var IDB_NAME = 'improvLocalDocs';
  var IDB_VERSION = 1;
  function openLocalDB() {
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('docs'))   db.createObjectStore('docs');
        if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
      };
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function() { reject(req.error); };
    });
  }
  function idbPut(store, key, value) {
    return openLocalDB().then(function(db) { return new Promise(function(res, rej) {
      var tx = db.transaction([store], 'readwrite');
      tx.objectStore(store).put(value, key);
      tx.oncomplete = function(){ res(); };
      tx.onerror    = function(){ rej(tx.error); };
    });});
  }
  function idbGet(store, key) {
    return openLocalDB().then(function(db) { return new Promise(function(res, rej) {
      var tx = db.transaction([store], 'readonly');
      var rq = tx.objectStore(store).get(key);
      rq.onsuccess = function(){ res(rq.result); };
      rq.onerror   = function(){ rej(rq.error); };
    });});
  }
  function idbClear() {
    return openLocalDB().then(function(db) { return new Promise(function(res, rej) {
      var tx = db.transaction(['docs','images'], 'readwrite');
      tx.objectStore('docs').clear();
      tx.objectStore('images').clear();
      tx.oncomplete = function(){ console.log('🗑️ IndexedDB cleared (local docs + images)'); res(); };
      tx.onerror    = function(){ rej(tx.error); };
    });});
  }
  function idbCount() {
    return openLocalDB().then(function(db) { return new Promise(function(res) {
      var tx = db.transaction(['docs','images'], 'readonly');
      var dC = tx.objectStore('docs').count();
      var iC = tx.objectStore('images').count();
      tx.oncomplete = function(){ res({docs: dC.result, images: iC.result}); };
    });});
  }
  // Expose for app-bundle.js (reset) and viewer
  window.improvLocalStore = {
    saveDoc:   function(sid, row)        { return idbPut('docs', sid, row); },
    getDoc:    function(sid)             { return idbGet('docs', sid); },
    saveImage: function(filename, blob)  { return idbPut('images', filename, blob); },
    getImage:  function(filename)        { return idbGet('images', filename); },
    clearAll:  function()                { return idbClear(); },
    count:     function()                { return idbCount(); }
  };

  function ready() { return true; }

  function hdrs(extra) {
    var c = cfg();
    var h = {
      'Content-Type':  'application/json',
      'apikey':        c.key,
      'Authorization': 'Bearer ' + c.key
    };
    if (extra) Object.keys(extra).forEach(function(k){ h[k] = extra[k]; });
    return h;
  }

  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function san(s){ return (s||'').replace(/\s+/g,'_').replace(/[^\w\u0590-\u05FF_-]/g,''); }

  // ── Build JSON payload for one trainee ──────────────────────────────
  function buildPayload(tidx) {
    var app  = window.app;
    var data = app.data;
    var name = window.getTraineeName ? window.getTraineeName(tidx) : ('חניך '+(tidx+1));
    var now  = new Date();
    var date = now.toISOString().slice(0,10);
    var sid  = date+'_'+san(name)+'_'+san(data.evaluatorName)+'_'+now.getTime();

    var exercises = (app.exercises||[]).map(function(exName, ei){
      var key    = tidx+'-'+ei;
      var fields = (data.exerciseData||{})[key] || {};
      var notes  = (data.globalNotes||[])
        .filter(function(n){ return n.exerciseIdx===ei && (n.traineeIdx===null||n.traineeIdx===tidx); })
        .map(function(n){ return {time:n.timestamp, text:n.text}; });
      return {name:exName, index:ei, fields:fields, notes:notes};
    }).filter(function(e){
      return Object.keys(e.fields).filter(function(k){ return !k.startsWith('_') && e.fields[k]; }).length > 0 || e.notes.length > 0;
    });

    var summary = (app.criteria||[]).map(function(crit){
      var sd = ((data.summaryData||{})[tidx+'-'+crit]) || {};
      return {criterion:crit, score:sd.score||'', notes:sd.text||'', examples:sd.examples||''};
    });

    var interview = ((data.interviewData||{})[tidx]) || {};

    var imageMeta = []
      .filter(function(d){ return d.traineeIndex === tidx; })
      .map(function(d,i){
        var ex = (app.exercises||[])[d.exerciseIndex] || 'doc';
        return {
          id:       d.id,
          exercise: ex,
          filename: date+'_'+san(name)+'_'+san(ex)+'_'+String(i+1).padStart(3,'0')+'.jpg',
          mimeType: d.mimeType || 'image/jpeg'
        };
      });

    return {
      submissionId: sid,
      version: '1.0',
      meta: {
        trainee:    name,
        evaluator:  data.evaluatorName||'',
        assessment: data.assessmentName||'',
        date:       date,
        timestamp:  now.toISOString()
      },
      exercises:  exercises,
      summary:    summary,
      interview:  interview,
      images:     imageMeta
    };
  }

  // ── Send text row to Supabase DB ─────────────────────────────────────
  function sendRow(tidx) {
    var payload = buildPayload(tidx);
    var imgDocs = [].filter(function(d){ return d.traineeIndex===tidx; });
    var expiresAt = new Date(Date.now() + 14*24*60*60*1000).toISOString();
    var row = {
      submission_id:   payload.submissionId,
      trainee:         payload.meta.trainee,
      evaluator:       payload.meta.evaluator,
      assessment_name: payload.meta.assessment,
      assessment_date: payload.meta.date,
      json_data:       JSON.stringify(payload),
      image_count:     imgDocs.length,
      expires_at:      expiresAt
    };
    return fetch(cfg().url+'/rest/v1/assessments', {
      method:  'POST',
      headers: hdrs({'Prefer':'return=minimal'}),
      body:    JSON.stringify(row)
    }).then(function(res){
      if (!res.ok) return res.text().then(function(t){ throw new Error('DB: '+t); });
      return {success:true, submissionId:payload.submissionId, payload:payload};
    });
  }

  // ── Upload one image to Supabase Storage ─────────────────────────────
  function uploadImage(docId, filename, mimeType) {
    var doc = null;
    if (!doc || !doc.imageBase64) return Promise.resolve({skipped:true});
    var bin = atob(doc.imageBase64);
    var bytes = new Uint8Array(bin.length);
    for (var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    var blob = new Blob([bytes], {type: mimeType||'image/jpeg'});
    var c = cfg();
    return fetch(c.url+'/storage/v1/object/assessment-images/'+encodeURIComponent(filename), {
      method: 'POST',
      headers: {'apikey':c.key,'Authorization':'Bearer '+c.key,'Content-Type':mimeType||'image/jpeg'},
      body: blob
    }).then(function(res){
      if (!res.ok) return res.text().then(function(t){ throw new Error('Storage: '+t); });
      return {success:true, filename:filename};
    });
  }

  // ── PUBLIC: send assessment + images ─────────────────────────────────
  window.supabaseSync = {

    send: function(tidx) {
      if (!ready()) { alert('הגדר Supabase URL ו-Key ב-Admin'); return Promise.resolve(); }
      var name = window.getTraineeName ? window.getTraineeName(tidx) : 'חניך '+(tidx+1);
      var savedPayload;

      return sendRow(tidx)
        .then(function(result){
          savedPayload = result.payload;
          // Upload images sequentially
          var p = Promise.resolve();
          (result.payload.images||[]).forEach(function(img){
            p = p.then(function(){ return uploadImage(img.id, img.filename, img.mimeType); });
          });
          return p;
        })
        .then(function(){
          alert('✅ נשלח בהצלחה!\nחניך: '+name+'\nמזהה: '+savedPayload.submissionId);
          return {success:true};
        })
        .catch(function(err){
          alert('❌ שגיאה: '+err.message);
          return {success:false, error:err.message};
        });
    },

    // ── List submissions ───────────────────────────────────────────────
    list: function(filter) {
      if (!ready()) return Promise.reject(new Error('not configured'));
      var c = cfg();
      // Don't filter by expires_at server-side — filler rows may have NULL
      var url = c.url+'/rest/v1/assessments?select=id,submission_id,trainee,evaluator,assessment_name,assessment_date,image_count,created_at,expires_at&order=created_at.desc&limit=200';
      if (filter && filter.trim()) url += '&trainee=ilike.*'+encodeURIComponent(filter.trim())+'*';
      return fetch(url, {headers:{'apikey':c.key,'Authorization':'Bearer '+c.key}})
        .then(function(r){ return r.json(); });
    },

    // ── Get full detail ────────────────────────────────────────────────
    getDetail: function(submissionId) {
      if (!ready()) return Promise.reject(new Error('not configured'));
      var c = cfg();
      return fetch(c.url+'/rest/v1/assessments?submission_id=eq.'+encodeURIComponent(submissionId)+'&select=*',
        {headers:{'apikey':c.key,'Authorization':'Bearer '+c.key}})
        .then(function(r){ return r.json(); })
        .then(function(rows){ return rows[0]||null; });
    },

    // ── Show history panel ─────────────────────────────────────────────
    showPanel: function(tagMode) {
      if (!ready()) { alert('הגדר Supabase ב-Admin תחילה'); return; }
      var old = document.getElementById('sbModal');
      if (old) old.remove();

      var modal = document.createElement('div');
      modal.id = 'sbModal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:25000;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;direction:rtl;font-family:Assistant,sans-serif;';
      modal.innerHTML =
        '<div style="background:#fff;border-radius:12px;width:100%;max-width:920px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.2);">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'+
      (tagMode
          ? '<h2 style="margin:0;font-family:Rubik,sans-serif;color:#1e293b;">📎 בחר מסמך לצירוף</h2>'+
            '<p style="margin:0;font-size:.85em;color:#64748b;">'+
              (window.supabaseSync._tagMode ? 'חניך: '+esc(window.supabaseSync._tagMode.traineeName || '')+
                (window.supabaseSync._tagMode.exerciseName ? ' | תרגיל: '+esc(window.supabaseSync._tagMode.exerciseName) : '') : '')+
            '</p>'
          : '<h2 style="margin:0;font-family:Rubik,sans-serif;color:#1e293b;">📡 היסטוריית הגשות</h2>')+
            '<button onclick="document.getElementById(\'sbModal\').remove()" style="background:none;border:none;font-size:1.5em;cursor:pointer;color:#64748b;">✕</button>'+
          '</div>'+
          '<div style="display:flex;gap:10px;margin-bottom:16px;">'+
            '<input id="sbFilter" type="text" placeholder="סנן לפי שם חניך..." '+
              'style="flex:1;padding:9px 13px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:.93em;">'+
            '<button onclick="window.supabaseSync._load()" '+
              'style="background:#2563eb;color:white;border:none;padding:9px 16px;border-radius:7px;font-weight:700;cursor:pointer;">🔄 רענן</button>'+
          '<button onclick="window.supabaseSync._cleanupExpired()" '+
              'style="background:#ef4444;color:white;border:none;padding:9px 16px;border-radius:7px;font-weight:700;cursor:pointer;">🗑 מחק פגי תוקף</button>'+
          '<button onclick="window.supabaseSync.runDeleteDiagnostic()" '+
              'style="background:#8b5cf6;color:white;border:none;padding:9px 16px;border-radius:7px;font-weight:700;cursor:pointer;" title="יוצר רשומה דמה, מנסה למחוק, ובודק אם הצליח. הדוח בconsole.">🔬 בדיקת DELETE</button>'+
          '<button onclick="window.supabaseSync.toggleFetchLog()" '+
              'style="background:#0891b2;color:white;border:none;padding:9px 16px;border-radius:7px;font-weight:700;cursor:pointer;" title="מפעיל/מכבה לוגינג מלא של כל בקשות Supabase לconsole.">🌐 לוג Fetch</button>'+
          '</div>'+
          '<div id="sbContent"><p style="color:#94a3b8;text-align:center;padding:30px;">טוען...</p></div>'+
        '</div>';
      document.body.appendChild(modal);
      document.getElementById('sbFilter').addEventListener('input', function(){
        clearTimeout(this._t);
        this._t = setTimeout(function(){ window.supabaseSync._load(); }, 400);
      });
      this._load();
    },

    // ── Tag a document to current trainee+exercise ──────────────────────
    _tagDoc: function(sid, docTrainee) {
      var tm = window.supabaseSync._tagMode;
      if (!tm) return;

      // Check trainee name match (fuzzy)
      var appName = (tm.traineeName||'').replace(/ /g,'').toLowerCase();
      var docName = (docTrainee||'').replace(/ /g,'').toLowerCase();
      if (appName && docName && appName !== docName) {
        var msg='שמות חניכים שונים. לצרף בכל זאת?'; if(!confirm(msg)) return;
      }

      // Save tag in app.data.docLinks
      if (!window.app.data.docLinks) window.app.data.docLinks = {};
      window.app.data.docLinks[sid] = {
        traineeIdx:   tm.traineeIdx,
        exerciseIdx:  tm.exerciseIdx,
        traineeName:  tm.traineeName,
        exerciseName: tm.exerciseName,
        taggedAt:     new Date().toISOString()
      };
      if (window.storage) window.storage.saveData(true);

      // Close panel + reset tag mode
      window.supabaseSync._tagMode = null;
      var modal = document.getElementById('sbModal');
      if (modal) modal.remove();

      alert('✅ המסמך צורף! ' + tm.traineeName + (tm.exerciseName ? ' | ' + tm.exerciseName : ''));
    },

    _load: function() {
      var cont = document.getElementById('sbContent');
      if (!cont) return;
      cont.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:30px;">טוען...</p>';
      var filter = document.getElementById('sbFilter');
      window.supabaseSync.list(filter ? filter.value : '')
        .then(function(rows){
          // Client-side filter: hide expired rows (keep NULL expires_at — filler rows)
          var now2 = new Date();
          rows = (rows||[]).filter(function(r){
            if (!r.expires_at) return true;
            return new Date(r.expires_at) > now2;
          });
          if (!rows.length) {
            cont.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:30px;">אין הגשות</p>';
            return;
          }
          var html = '<table style="width:100%;border-collapse:collapse;font-size:.87em;">';
          html += '<thead><tr style="background:#f1f5f9;">';
          ['חניך','מעריך','הערכה','תאריך','📷','תפוגה','פעולות'].forEach(function(h){
            html += '<th style="padding:8px 12px;text-align:right;border:1px solid #e2e6ed;font-family:Rubik,sans-serif;">'+h+'</th>';
          });
          html += '</tr></thead><tbody>';
          rows.forEach(function(r, idx){
            html += '<tr style="'+(idx%2===0?'':'background:#f8fafc')+'">';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;font-weight:600;">'+esc(r.trainee)+'</td>';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;color:#64748b;">'+esc(r.evaluator)+'</td>';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;color:#64748b;">'+esc(r.assessment_name)+'</td>';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;color:#64748b;white-space:nowrap;">'+esc(r.assessment_date)+'</td>';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;text-align:center;color:'+(r.image_count>0?'#2563eb':'#94a3b8')+';">'+esc(String(r.image_count||0))+'</td>';
            html += '<td style="padding:8px 12px;border:1px solid #e2e6ed;white-space:nowrap;">';
            html += '<button data-action="view"   data-sid="'+esc(r.submission_id)+'" style="background:#0284c7;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:.8em;cursor:pointer;margin-left:4px;">👁 צפה</button>';
            html += '<button data-action="import" data-sid="'+esc(r.submission_id)+'" style="background:#7c3aed;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:.8em;cursor:pointer;margin-left:4px;">📥 ייבא</button>';
            html += '<button data-action="del"    data-rid="'+esc(r.id)+'" data-tname="'+esc(r.trainee||'')+'" style="background:#dc2626;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:.8em;cursor:pointer;">🗑 מחק</button>';
            html += '</td></tr>';
          });
          html += '</tbody></table>';
          cont.innerHTML = html;
          // Event delegation — attach ONCE only (previously piled up on each _load() call)
          if (!cont._delegationAttached) {
            cont._delegationAttached = true;
            cont.addEventListener('click', function(e){
              var btn = e.target.closest('button[data-action]');
              if (!btn) return;
              var act = btn.getAttribute('data-action');
              console.log('🖱️ History action:', act, 'sid:', btn.getAttribute('data-sid'), 'rid:', btn.getAttribute('data-rid'));
              if (act==='view')   window.supabaseSync._view(btn.getAttribute('data-sid'));
              if (act==='import') window.supabaseSync._import(btn.getAttribute('data-sid'));
              if (act==='del')    window.supabaseSync._delete(btn.getAttribute('data-rid'));
              if (act==='tag')    window.supabaseSync._tagDoc(btn.getAttribute('data-sid'), btn.getAttribute('data-trainee'));
            });
          }
        })
        .catch(function(err){ cont.innerHTML = '<p style="color:#ef4444;padding:20px;">שגיאה: '+esc(err.message)+'</p>'; });
    },

    _view: function(sid) {
      window.supabaseSync.getDetail(sid).then(function(row){
        if (!row) { alert('לא נמצא'); return; }
        var data;
        try { data = JSON.parse(row.json_data); } catch(e) { data = {}; }

        var lines = ['📊 סיכום הגשה','═'.repeat(40),
          'חניך: '+(row.trainee||'')+'   מעריך: '+(row.evaluator||'')+'   תאריך: '+(row.assessment_date||''),
          'הערכה: '+(row.assessment_name||''), ''];

        (data.exercises||[]).forEach(function(ex){
          lines.push('── '+ex.name+' ──');
          Object.keys(ex.fields||{}).forEach(function(f){
            if (!f.startsWith('_') && ex.fields[f]) lines.push('  '+f+': '+ex.fields[f]);
          });
          (ex.notes||[]).forEach(function(n){ lines.push('  📋 '+n.text); });
          lines.push('');
        });

        (data.summary||[]).forEach(function(s){
          if (s.score || s.notes) lines.push(s.criterion+': '+s.score+(s.notes?' — '+s.notes:''));
        });
        if (data.interview && data.interview.summary) {
          lines.push('');
          lines.push('📝 סיכום ראיון: '+data.interview.summary);
        }

        var ovId = 'sbView_' + Date.now();
        var parsedData; try{parsedData=JSON.parse(row.json_data||'{}');}catch(e){parsedData={};}
        var imgs = parsedData.images || [];
        var ov = document.createElement('div');
        ov.id = ovId;
        ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:28px 40px;direction:rtl;font-family:Assistant,sans-serif;';
        ov.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">'+
            '<h2 style="font-family:Rubik,sans-serif;margin:0;color:#1e293b;">'+esc(row.trainee)+'</h2>'+
            '<div style="display:flex;gap:8px;">'+
              '<button onclick="window.print()" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">🖨 PDF</button>'+
              '<button onclick="window._closeOv(\''+ovId+'\')" style="background:#64748b;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">✕ סגור</button>'+
            '</div>'+
          '</div>'+
          '<pre style="white-space:pre-wrap;font-family:Assistant,sans-serif;font-size:.9em;color:#1e293b;background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e6ed;line-height:1.7;">'+esc(lines.join('\n'))+'</pre>'+
          (imgs.length ? '<h3 style="font-family:Rubik,sans-serif;margin:14px 0 8px;color:#1e3a5f;">📷 תמונות ('+imgs.length+')</h3><div id="'+ovId+'_vimgs">⏳ טוען...</div>' : '');
        document.body.appendChild(ov);
        ov.addEventListener('click', function(e){ if(e.target.getAttribute('data-close')) window._closeOv(ovId); });
        if (imgs.length) setTimeout(function(){ loadImgsInto(imgs, ovId+'_vimgs'); }, 150);
      });
    },

    // ── Delete single row + its storage images ────────────────────────────
    _delete: function(id) {
      console.log('🗑️ ═══ _delete called ═══');
      console.log('🗑️ id:', id);
      if (!id) { console.error('🗑️ ❌ id is empty/null — aborting'); alert('❌ מזהה ריק'); return; }
      if (!confirm('מחק רשומה זו לצמיתות? (כולל תמונות)')) { console.log('🗑️ User cancelled'); return; }

      var c = cfg();
      var deletedImages = 0, totalImages = 0;
      var rowDeleted = false;

      console.log('🗑️ Step 1: fetching row to get image list...');
      fetch(c.url+'/rest/v1/assessments?id=eq.'+encodeURIComponent(id)+'&select=json_data,submission_id', {
        headers: {'apikey':c.key,'Authorization':'Bearer '+c.key}
      })
      .then(function(r){
        console.log('🗑️   GET row response status:', r.status);
        return r.json();
      })
      .then(function(rows){
        console.log('🗑️   rows received:', rows ? rows.length : 0);
        var row = rows && rows[0];
        var images = [];
        if (row && row.json_data) {
          try { images = JSON.parse(row.json_data).images || []; } catch(e){ console.warn('🗑️ json_data parse failed:', e); }
        }
        totalImages = images.length;
        console.log('🗑️ Step 2: row has', totalImages, 'images to delete');
        if (totalImages === 0) {
          console.log('🗑️   (no images, skipping storage delete)');
          return Promise.resolve([]);
        }

        console.log('🗑️ Step 3: DELETE storage files...');
        var delPromises = images.map(function(img, i){
          return fetch(c.url+'/storage/v1/object/assessment-images/'+encodeURIComponent(img.filename), {
            method: 'DELETE',
            headers: {'apikey':c.key,'Authorization':'Bearer '+c.key}
          }).then(function(r){
            return r.text().then(function(t){
              console.log('🗑️   img '+(i+1)+'/'+totalImages+':', img.filename, '→ status:', r.status, 'body:', t.substring(0,100) || '(empty)');
              if (r.ok && (t === '' || t === '{}')) console.warn('🗑️   ⚠️ Storage DELETE returned empty body — RLS may be blocking');
              if (r.ok) deletedImages++;
              return r;
            });
          });
        });
        return Promise.all(delPromises);
      })
      .then(function(){
        console.log('🗑️ Step 4: DELETE DB row...');
        return fetch(c.url+'/rest/v1/assessments?id=eq.'+encodeURIComponent(id), {
          method: 'DELETE',
          headers: {'apikey':c.key,'Authorization':'Bearer '+c.key,'Prefer':'return=representation'}
        });
      })
      .then(function(r){
        return r.text().then(function(t){
          console.log('🗑️   DB DELETE status:', r.status, 'body:', t.substring(0,200) || '(empty)');
          var deletedRows = 0;
          try { var arr = JSON.parse(t); if (Array.isArray(arr)) deletedRows = arr.length; } catch(e){}
          rowDeleted = r.ok && deletedRows > 0;
          if (r.ok && deletedRows === 0) console.warn('🗑️ ⚠️ DELETE succeeded BUT 0 rows affected — RLS likely blocking');
          return r;
        });
      })
      .then(function(r){
        console.log('🗑️ Step 5: VERIFY — re-fetch row...');
        return fetch(c.url+'/rest/v1/assessments?id=eq.'+encodeURIComponent(id)+'&select=id', {
          headers: {'apikey':c.key,'Authorization':'Bearer '+c.key}
        }).then(function(rr){ return rr.json(); }).then(function(rows){
          var stillExists = rows && rows.length > 0;
          console.log('🗑️   verify: row stillExists =', stillExists);
          console.log('🗑️ ═══ SUMMARY ═══');
          console.log('🗑️   images: ' + deletedImages + '/' + totalImages + ' deleted');
          console.log('🗑️   DB row: ' + (rowDeleted ? 'deleted ✅' : 'NOT deleted ❌'));
          console.log('🗑️   verify: ' + (stillExists ? 'STILL EXISTS ❌' : 'gone ✅'));

          if (stillExists) {
            alert('❌ הרשומה לא נמחקה.\n\nבדוק את הconsole — סביר שחסר DELETE policy ב-RLS.\n\nתיקון: ב-Supabase SQL Editor הרץ:\ncreate policy "anon delete" on assessments for delete to anon using (true);\ncreate policy "anon storage delete" on storage.objects for delete to anon using (bucket_id=\'assessment-images\');');
          } else {
            alert('✅ נמחק (' + deletedImages + '/' + totalImages + ' תמונות)');
            window.supabaseSync._load();
          }
        });
      })
      .catch(function(e){
        console.error('🗑️ ❌ ERROR:', e);
        alert('❌ שגיאה: '+e.message);
      });
    },

    // ── Delete all expired rows + their storage images ────────────────────
    _cleanupExpired: function() {
      if (!confirm('מחק את כל הרשומות שפג תוקפן + תמונות?')) return;
      var c = cfg();
      var now = new Date().toISOString();
      // First get expired rows to extract image filenames
      fetch(c.url+'/rest/v1/assessments?expires_at=lt.'+encodeURIComponent(now)+'&select=id,json_data', {
        headers: {'apikey':c.key,'Authorization':'Bearer '+c.key}
      })
      .then(function(r){ return r.json(); })
      .then(function(rows){
        var allImages = [];
        (rows||[]).forEach(function(row){
          try {
            var imgs = JSON.parse(row.json_data||'{}').images || [];
            imgs.forEach(function(img){ allImages.push(img.filename); });
          } catch(e){}
        });
        // Delete storage files
        var delP = allImages.map(function(fn){
          return fetch(c.url+'/storage/v1/object/assessment-images/'+encodeURIComponent(fn),{
            method:'DELETE', headers:{'apikey':c.key,'Authorization':'Bearer '+c.key}
          });
        });
        return Promise.all(delP);
      })
      .then(function(){
        return fetch(c.url+'/rest/v1/assessments?expires_at=lt.'+encodeURIComponent(now), {
          method:'DELETE',
          headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Prefer':'return=minimal'}
        });
      })
      .then(function(r){
        if (r.ok) { alert('✅ ניקוי הושלם — שורות ותמונות נמחקו'); window.supabaseSync._load(); }
        else r.text().then(function(t){ alert('❌ '+t); });
      })
      .catch(function(e){ alert('❌ '+e.message); });
    },

    _import: function(sid) {
      window.supabaseSync.getDetail(sid).then(function(row){
        if (!row) { alert('לא נמצא'); return; }
        var data;
        try { data = JSON.parse(row.json_data); } catch(e){ alert('שגיאת JSON'); return; }

        // Show edit dialog before importing
        var exOptions = '<option value="">כללי</option>';
        (window.app.exercises||[]).forEach(function(ex,i){
          exOptions += '<option value="'+i+'">'+esc(ex)+'</option>';
        });

        var old2 = document.getElementById('sbImportDlg'); if(old2) old2.remove();
        var dlg = document.createElement('div');
        dlg.id = 'sbImportDlg';
        dlg.style.cssText = 'position:fixed;inset:0;z-index:35000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;direction:rtl;font-family:Assistant,sans-serif;';

        var box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:12px;padding:24px;width:440px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,.25);';

        var h3 = document.createElement('h3');
        h3.style.cssText = 'margin:0 0 16px;font-family:Rubik,sans-serif;color:#1e293b;';
        h3.textContent = '📥 ייבא הגשה';

        function field(label, id, value) {
          var wrap = document.createElement('div');
          wrap.style.cssText = 'margin-bottom:10px;';
          var lbl = document.createElement('label');
          lbl.style.cssText = 'display:block;font-weight:700;font-size:.88em;margin-bottom:4px;';
          lbl.textContent = label;
          var inp = document.createElement('input');
          inp.type = 'text'; inp.id = id; inp.value = value||'';
          inp.style.cssText = 'width:100%;padding:8px 12px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:.95em;box-sizing:border-box;';
          wrap.appendChild(lbl); wrap.appendChild(inp);
          return wrap;
        }

        var exWrap = document.createElement('div');
        exWrap.style.cssText = 'margin-bottom:10px;';
        var exLbl = document.createElement('label');
        exLbl.style.cssText = 'display:block;font-weight:700;font-size:.88em;margin-bottom:4px;';
        exLbl.textContent = 'שיוך לתרגיל:';
        var exSel = document.createElement('select');
        exSel.id = 'sbImportEx';
        exSel.style.cssText = 'width:100%;padding:8px 12px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:.95em;';
        exSel.innerHTML = exOptions;
        exWrap.appendChild(exLbl); exWrap.appendChild(exSel);

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:10px;margin-top:16px;';

        var confirmBtn = document.createElement('button');
        confirmBtn.style.cssText = 'background:#2563eb;color:white;border:none;padding:10px 20px;border-radius:7px;font-weight:700;cursor:pointer;';
        confirmBtn.textContent = '✅ ייבא';

        var cancelBtn2 = document.createElement('button');
        cancelBtn2.style.cssText = 'background:#f1f5f9;color:#475569;border:1px solid #e2e6ed;padding:10px 20px;border-radius:7px;cursor:pointer;font-weight:700;';
        cancelBtn2.textContent = 'ביטול';
        cancelBtn2.addEventListener('click', function(){ dlg.remove(); });

        confirmBtn.addEventListener('click', function(){
          var _tnSel    = document.getElementById('sbImportTrainee');
          var _tnCustom = document.getElementById('sbImportTraineeCustom');
          var traineeName = (_tnSel && _tnSel.value === '__other__')
            ? (_tnCustom && _tnCustom.value.trim() || '')
            : (_tnSel && _tnSel.value.trim() || '');
          var exIdxVal = document.getElementById('sbImportEx').value;
          var exIdx    = exIdxVal !== '' ? parseInt(exIdxVal) : null;
          var exName   = (exIdx !== null && window.app.exercises) ? window.app.exercises[exIdx] : 'כללי';

          // Find traineeIdx by matching name to app's current trainees
          var traineeIdx = null;
          for (var ti = 0; ti < 4; ti++) {
            var tn = window.getTraineeName ? window.getTraineeName(ti) : '';
            if (tn && tn.trim() === traineeName.trim()) { traineeIdx = ti; break; }
          }
          // If no exact match — use first trainee
          if (traineeIdx === null) traineeIdx = 0;

          // Save to docLinks — same structure as _tagDoc
          if (!window.app.data.docLinks) window.app.data.docLinks = {};
          window.app.data.docLinks[sid] = {
            traineeIdx:   traineeIdx,
            exerciseIdx:  exIdx,
            traineeName:  traineeName,
            exerciseName: exName,
            taggedAt:     new Date().toISOString(),
            source:       'import',
            submissionId: sid
          };
          console.log('📎 docLinks saved:', sid, '→ traineeIdx:', traineeIdx, 'exIdx:', exIdx);
          console.log('📎 all docLinks:', JSON.stringify(window.app.data.docLinks));
          if (window.storage) window.storage.saveData(true);
          dlg.remove();

          // ★ Save local copy (row + images) to IndexedDB for offline access
          (function(savedRow, savedSid, savedTrainee, savedExName){
            console.log('💾 Saving local copy for', savedSid);
            window.improvLocalStore.saveDoc(savedSid, savedRow).then(function(){
              var imgs = [];
              try { imgs = JSON.parse(savedRow.json_data||'{}').images || []; } catch(e){}
              if (!imgs.length) {
                alert('✅ המסמך תוייג לחניך "' + savedTrainee + '"' + (savedExName !== 'כללי' ? ' — תרגיל: ' + savedExName : '') + '\n💾 נשמר עותק מקומי.');
                return;
              }
              // Fetch images via signed URLs and save blobs locally
              window.supabaseSync.loadSignedUrls(imgs.map(function(i){return i.filename;}), function(urlMap){
                var promises = imgs.map(function(img){
                  var u = urlMap[img.filename];
                  if (!u) { console.warn('💾 No signed URL for', img.filename); return Promise.resolve(0); }
                  return fetch(u).then(function(r){
                    return r.ok ? r.blob() : null;
                  }).then(function(blob){
                    if (blob) return window.improvLocalStore.saveImage(img.filename, blob).then(function(){return 1;});
                    return 0;
                  }).catch(function(e){ console.warn('💾 Local image fetch failed:', img.filename, e); return 0; });
                });
                Promise.all(promises).then(function(results){
                  var savedCount = results.reduce(function(a,b){return a+b;}, 0);
                  console.log('✅ Local copy saved: 1 doc + ' + savedCount + '/' + imgs.length + ' images');
                  alert('✅ המסמך תוייג לחניך "' + savedTrainee + '"' + (savedExName !== 'כללי' ? ' — תרגיל: ' + savedExName : '') + '\n💾 נשמר עותק מקומי (' + savedCount + '/' + imgs.length + ' תמונות).');
                });
              });
            }).catch(function(e){
              console.error('💾 Local save error:', e);
              alert('✅ תוייג, אבל שגיאה בשמירה מקומית: ' + e.message);
            });
          })(row, sid, traineeName, exName);
        });

        btnRow.appendChild(confirmBtn); btnRow.appendChild(cancelBtn2);
        box.appendChild(h3);
        // Trainee dropdown from app's current trainees
        var tnWrap = document.createElement('div'); tnWrap.style.cssText='margin-bottom:10px;';
        var tnLbl  = document.createElement('label'); tnLbl.style.cssText='display:block;font-weight:700;font-size:.88em;margin-bottom:4px;'; tnLbl.textContent='שם חניך:';
        var tnSel  = document.createElement('select'); tnSel.id='sbImportTrainee';
        tnSel.style.cssText='width:100%;padding:8px 12px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:.95em;box-sizing:border-box;';
        var rowTrainee = row.trainee || (data.meta&&data.meta.trainee)||'';
        var appTrainees = []; for(var ti=0;ti<4;ti++){var tn=window.getTraineeName?window.getTraineeName(ti):''; if(tn&&tn.trim()) appTrainees.push(tn);}
        if (!appTrainees.length) appTrainees.push(rowTrainee);
        appTrainees.forEach(function(tn){
          var opt=document.createElement('option'); opt.value=tn; opt.textContent=tn;
          if(tn===rowTrainee||tn.replace(/ /g,'')===rowTrainee.replace(/ /g,'')) opt.selected=true;
          tnSel.appendChild(opt);
        });
        // Also allow typing a custom name
        var tnOther=document.createElement('option'); tnOther.value='__other__'; tnOther.textContent='אחר (הקלד ידנית)...'; tnSel.appendChild(tnOther);
        tnWrap.appendChild(tnLbl); tnWrap.appendChild(tnSel);
        var tnCustom=document.createElement('input'); tnCustom.type='text'; tnCustom.id='sbImportTraineeCustom';
        tnCustom.placeholder='הקלד שם חניך'; tnCustom.style.cssText='display:none;width:100%;padding:8px 12px;border:1.5px solid #e2e6ed;border-radius:7px;font-size:.95em;margin-top:4px;box-sizing:border-box;';
        tnSel.addEventListener('change',function(){ tnCustom.style.display=this.value==='__other__'?'block':'none'; });
        tnWrap.appendChild(tnCustom);
        box.appendChild(tnWrap);
        box.appendChild(field('מעריך:', 'sbImportEval', row.evaluator || (data.meta&&data.meta.evaluator)||''));
        box.appendChild(field('שם הערכה:', 'sbImportAssess', row.assessment_name || (data.meta&&data.meta.assessment)||''));
        box.appendChild(exWrap);
        box.appendChild(btnRow);
        dlg.appendChild(box);
        document.body.appendChild(dlg);
      });
    }
  };

  // ── "צרף מסמך" → shows history panel for tagging ──────────────────────
  window.supabaseSync.attachDoc = function(traineeIdx) {
    window.supabaseSync._tagMode = {
      traineeIdx:   traineeIdx,
      exerciseIdx:  window.app && window.app.currentExercise != null ? window.app.currentExercise : null,
      traineeName:  window.getTraineeName ? window.getTraineeName(traineeIdx) : 'חניך '+(traineeIdx+1),
      exerciseName: window.app && window.app.exercises && window.app.currentExercise != null
        ? window.app.exercises[window.app.currentExercise] : null
    };
    window.supabaseSync.showPanel(true);
  };

  window.supabaseSync._DEAD_PLACEHOLDER = function(traineeIdx) {
    var dlg = document.createElement('div');  // placeholder — never called
    dlg.id = 'sbDocDialog';
    dlg.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;direction:rtl;font-family:Assistant,sans-serif;';

    var labelBtns = DOC_LABELS.map(function(label, idx){
      return '<button data-ti="'+String(traineeIdx)+'" data-li="'+String(idx)+
        '" style="width:100%;padding:12px;margin-bottom:8px;border:1.5px solid #e2e6ed;'+
        'border-radius:8px;background:#fff;cursor:pointer;font-size:.95em;'+
        'font-family:Assistant,sans-serif;text-align:right;">'+esc(label)+'</button>';
    }).join('');

    dlg.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:24px;width:340px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,.2);">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'+
          '<h3 style="margin:0;font-family:Rubik,sans-serif;color:#1e293b;">📎 צרף מסמך לענן</h3>'+
          '<button data-close="sbDocDialog" style="background:none;border:none;font-size:1.4em;cursor:pointer;color:#64748b;">✕</button>'+
        '</div>'+
        '<p style="font-size:.85em;color:#64748b;margin-bottom:12px;">בחר סוג מסמך:</p>'+
        labelBtns+
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-ti]');
      if (!btn) return;
      var ti  = parseInt(btn.getAttribute('data-ti'));
      var lbl = DOC_LABELS[parseInt(btn.getAttribute('data-li'))];
      window.supabaseSync._pickFileForLabel(ti, lbl);
    });
  };

  window.supabaseSync._pickFileForLabel = function(traineeIdx, label) {
    var sd=document.getElementById('sbDocDialog');if(sd)sd.remove();
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.multiple = false;
    input.onchange = function(e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var base64 = ev.target.result.split(',')[1] || ev.target.result;
        var name = window.getTraineeName ? window.getTraineeName(traineeIdx) : 'חניך'+(traineeIdx+1);
        var date = new Date().toISOString().slice(0,10);
        var san  = function(s){ return (s||'').replace(/\s+/g,'_').replace(/[^\w֐-׿_-]/g,''); };
        var filename = date+'_'+san(name)+'_'+san(label)+'_001.'+file.name.split('.').pop();
        var c = cfg();

        // Upload to storage
        var bin = atob(base64); var bytes = new Uint8Array(bin.length);
        for (var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        var blob = new Blob([bytes], {type:file.type});

        fetch(c.url+'/storage/v1/object/assessment-images/'+encodeURIComponent(filename), {
          method:'POST', body:blob,
          headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Content-Type':file.type}
        }).then(function(r){
          if (r.ok) {
            // Also save a row in assessments table
            var sid  = date+'_'+san(name)+'_doc_'+Date.now();
            var expiresAt = new Date(Date.now()+14*24*60*60*1000).toISOString();
            var payload = JSON.stringify({
              version:'1.0', source:'improvSTAGE',
              meta:{trainee:name, evaluator:window.app.data.evaluatorName||'', assessment:window.app.data.assessmentName||'', date:date},
              images:[{filename:filename, label:label}],
              fields:{תווית:label, קובץ:filename}
            });
            return fetch(c.url+'/rest/v1/assessments', {
              method:'POST', body:JSON.stringify({
                submission_id:sid, trainee:name,
                evaluator:window.app.data.evaluatorName||'',
                assessment_name:window.app.data.assessmentName||'',
                assessment_date:date, json_data:payload,
                image_count:1, expires_at:expiresAt
              }),
              headers:hdrs({'Prefer':'return=minimal'})
            });
          }
          throw new Error('שגיאת העלאה: '+r.status);
        }).then(function(){
          alert('✅ הקובץ "'+label+'" הועלה לענן בהצלחה!');
        }).catch(function(err){ alert('❌ '+err.message); });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ── Full diagnostic panel — no filters, raw data ───────────────────────
  window.supabaseSync.debug = function() {
    var c = cfg();
    console.group('📡 Supabase Debug');
    console.log('URL:', c.url);
    console.log('Key:', c.key.substring(0,25)+'...');
    // Raw fetch all rows
    fetch(c.url+'/rest/v1/assessments?select=*&order=created_at.desc&limit=50', {
      headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Accept':'application/json'}
    }).then(function(r){
      console.log('HTTP status:', r.status, r.ok?'✅':'❌');
      return r.json();
    }).then(function(rows){
      console.log('Total rows (no filter):', rows.length);
      rows.forEach(function(r,i){
        console.log('Row '+i+':', {
          submission_id: r.submission_id,
          trainee: r.trainee,
          evaluator: r.evaluator,
          date: r.assessment_date,
          expires_at: r.expires_at,
          image_count: r.image_count,
          has_json: !!r.json_data
        });
      });
    }).catch(function(e){ console.error('Error:', e); })
    .finally(function(){ console.groupEnd(); });
  };

  // ═══════════════════════════════════════════════════════════════════════
// 🔬 COMPONENT 3: Auto delete-test — creates dummy row, deletes, verifies
// ═══════════════════════════════════════════════════════════════════════
window.supabaseSync.runDeleteDiagnostic = function() {
  console.log('🔬 ═══════════════════════════════════════');
  console.log('🔬 AUTO DELETE TEST — START');
  console.log('🔬 ═══════════════════════════════════════');

  var c = cfg();
  var testId = 'diag_' + Date.now();
  var testPayload = {
    submission_id: testId,
    trainee: '__diag_test__',
    evaluator: 'diagnostic',
    assessment_name: 'DELETE TEST',
    assessment_date: new Date().toISOString().substring(0,10),
    json_data: JSON.stringify({test: true}),
    image_count: 0
  };
  var createdRowId = null;

  console.log('🔬 Step 1: INSERT dummy row...');
  fetch(c.url + '/rest/v1/assessments', {
    method: 'POST',
    headers: {
      'apikey': c.key,
      'Authorization': 'Bearer ' + c.key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(testPayload)
  })
  .then(function(r){ return r.text().then(function(t){ return {ok:r.ok, status:r.status, body:t}; }); })
  .then(function(resp){
    console.log('🔬   INSERT status:', resp.status, 'body:', resp.body.substring(0,200));
    if (!resp.ok) throw new Error('INSERT failed — RLS may block INSERT too');
    try {
      var arr = JSON.parse(resp.body);
      createdRowId = arr[0] && arr[0].id;
      console.log('🔬   ✅ created row id:', createdRowId);
    } catch(e){ throw new Error('INSERT response not parseable'); }
    if (!createdRowId) throw new Error('No id returned from INSERT');

    console.log('🔬 Step 2: DELETE the row...');
    return fetch(c.url + '/rest/v1/assessments?id=eq.' + encodeURIComponent(createdRowId), {
      method: 'DELETE',
      headers: {
        'apikey': c.key,
        'Authorization': 'Bearer ' + c.key,
        'Prefer': 'return=representation'
      }
    });
  })
  .then(function(r){ return r.text().then(function(t){ return {ok:r.ok, status:r.status, body:t}; }); })
  .then(function(resp){
    console.log('🔬   DELETE status:', resp.status, 'body:', resp.body.substring(0,200));
    var rowsAffected = 0;
    try { var arr = JSON.parse(resp.body); if (Array.isArray(arr)) rowsAffected = arr.length; } catch(e){}
    console.log('🔬   rows affected:', rowsAffected);

    console.log('🔬 Step 3: VERIFY — re-fetch row...');
    return fetch(c.url + '/rest/v1/assessments?id=eq.' + encodeURIComponent(createdRowId) + '&select=id', {
      headers: {'apikey': c.key, 'Authorization': 'Bearer ' + c.key}
    }).then(function(rr){ return rr.json(); });
  })
  .then(function(rows){
    var stillExists = rows && rows.length > 0;
    console.log('🔬   verify: stillExists =', stillExists);
    console.log('🔬 ═══════════════════════════════════════');
    console.log('🔬 RESULT:');
    if (stillExists) {
      console.error('🔬 ❌ DELETE NOT WORKING');
      console.error('🔬 Diagnosis: RLS policy missing for DELETE.');
      console.error('🔬 Fix: Run in Supabase SQL Editor:');
      console.error('🔬   create policy "anon delete" on assessments for delete to anon using (true);');
      console.error('🔬   create policy "anon storage delete" on storage.objects for delete to anon using (bucket_id=\'assessment-images\');');
      alert('❌ DELETE לא עובד\n\nאבחנה: חסר RLS policy ל-DELETE.\n\nתיקון ב-Supabase SQL Editor:\n\ncreate policy "anon delete" on assessments for delete to anon using (true);\ncreate policy "anon storage delete" on storage.objects for delete to anon using (bucket_id=\'assessment-images\');');
    } else {
      console.log('🔬 ✅ DELETE WORKS — RLS allows DELETE');
      alert('✅ DELETE עובד תקין.\n\nאם מחיקה רגילה עדיין נכשלת, בדוק את הconsole לראות בדיוק איפה.');
    }
    console.log('🔬 ═══════════════════════════════════════');
  })
  .catch(function(e){
    console.error('🔬 ❌ TEST ERROR:', e.message);
    alert('❌ שגיאת בדיקה: ' + e.message);
  });
};

window.supabaseSync.toggleFetchLog = function() {
  var cur = localStorage.getItem('sbDiagFetch');
  if (cur === '1') {
    localStorage.removeItem('sbDiagFetch');
    alert('🔬 Fetch wrapper OFF — צריך reload');
  } else {
    localStorage.setItem('sbDiagFetch', '1');
    alert('🔬 Fetch wrapper ON — צריך reload כדי שיתחיל');
  }
};

window.supabaseSync.showDiagnostic = function() {
    var c = cfg();
    var old = document.getElementById('sbDiagModal');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'sbDiagModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;direction:rtl;font-family:monospace;';

    var box = document.createElement('div');
    box.style.cssText = 'background:#1e293b;color:#e2e8f0;border-radius:12px;width:100%;max-width:960px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.4);';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = '<span style="font-size:1.1em;font-weight:700;color:#38bdf8;">🔬 Supabase Diagnostic — ללא פילטור</span>';

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:#94a3b8;font-size:1.3em;cursor:pointer;';
    closeBtn.onclick = function(){ modal.remove(); };
    header.appendChild(closeBtn);

    var info = document.createElement('div');
    info.style.cssText = 'font-size:.82em;color:#94a3b8;margin-bottom:12px;padding:8px;background:#0f172a;border-radius:6px;';
    info.innerHTML = 'URL: <span style="color:#38bdf8">'+c.url+'</span><br>Key: <span style="color:#38bdf8">'+c.key.substring(0,25)+'...</span>';

    var pre = document.createElement('pre');
    pre.style.cssText = 'background:#0f172a;padding:14px;border-radius:8px;font-size:.78em;overflow-x:auto;white-space:pre-wrap;word-break:break-all;color:#e2e8f0;max-height:70vh;overflow-y:auto;';
    pre.textContent = 'טוען...';

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;';

    function makeBtn(label, color, fn) {
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = 'background:'+color+';color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:.85em;font-family:monospace;';
      b.onclick = fn;
      btnRow.appendChild(b);
    }

    // Fetch all rows — no filter
    function fetchAll() {
      pre.textContent = 'מושך הכל...';
      fetch(c.url+'/rest/v1/assessments?select=submission_id,trainee,evaluator,assessment_name,assessment_date,expires_at,image_count,created_at&order=created_at.desc&limit=100', {
        headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Accept':'application/json'}
      }).then(function(r){
        return r.json().then(function(d){ return {status:r.status, data:d}; });
      }).then(function(res){
        var lines = ['HTTP: '+res.status+' — '+res.data.length+' שורות (ללא פילטור)', ''];
        var now = new Date();
        res.data.forEach(function(r,i){
          var exp = r.expires_at ? new Date(r.expires_at) : null;
          var expStr = exp ? (exp > now ? '✅ '+Math.ceil((exp-now)/86400000)+'d' : '❌ פג') : '⚠️ NULL';
          lines.push('['+i+'] '+r.submission_id);
          lines.push('     trainee: "'+r.trainee+'" | evaluator: "'+r.evaluator+'"');
          lines.push('     date: '+r.assessment_date+' | images: '+r.image_count+' | expires: '+expStr);
          lines.push('');
        });
        pre.textContent = lines.join('\n');
      }).catch(function(e){ pre.textContent = '❌ שגיאה: '+e.message; });
    }

    // Fetch with current filters (as the app does)
    function fetchFiltered() {
      pre.textContent = 'מושך עם פילטרים...';
      var now = new Date().toISOString();
      fetch(c.url+'/rest/v1/assessments?select=submission_id,trainee,expires_at&order=created_at.desc&limit=100', {
        headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Accept':'application/json'}
      }).then(function(r){ return r.json(); })
      .then(function(rows){
        var nowD = new Date();
        var visible = rows.filter(function(r){ return !r.expires_at || new Date(r.expires_at)>nowD; });
        var hidden  = rows.filter(function(r){ return r.expires_at && new Date(r.expires_at)<=nowD; });
        var lines = [
          'סה"כ בטבלה: '+rows.length,
          'נראים (אחרי פילטר): '+visible.length,
          'מוסתרים (פגו תוקף): '+hidden.length,
          '',
          'נראים:'
        ];
        visible.forEach(function(r){ lines.push('  ✅ '+r.trainee+' — '+r.submission_id); });
        if (hidden.length) {
          lines.push('', 'מוסתרים:');
          hidden.forEach(function(r){ lines.push('  ❌ '+r.trainee+' — '+r.expires_at); });
        }
        pre.textContent = lines.join('\n');
      }).catch(function(e){ pre.textContent = '❌ '+e.message; });
    }

    // Show raw JSON of first row
    function fetchFirstRaw() {
      pre.textContent = 'מושך שורה ראשונה...';
      fetch(c.url+'/rest/v1/assessments?select=*&order=created_at.desc&limit=1', {
        headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Accept':'application/json'}
      }).then(function(r){ return r.json(); })
      .then(function(rows){
        if (!rows.length){ pre.textContent='טבלה ריקה'; return; }
        var r = rows[0]; var parsed;
        try { parsed = JSON.parse(r.json_data||'{}'); } catch(e){ parsed = r.json_data; }
        var nl='\n'; var out='submission_id: '+r.submission_id+nl+'trainee: '+r.trainee+nl+'evaluator: '+r.evaluator+nl+'date: '+r.assessment_date+nl+'expires: '+r.expires_at+nl+'images: '+r.image_count+nl+nl+'json_data:'+nl+JSON.stringify(parsed,null,2).substring(0,2000);
        pre.textContent = out;
      }).catch(function(e){ pre.textContent = '❌ '+e.message; });
    }

    // Connection test
    function testConn() {
      pre.textContent = 'בודק חיבור...';
      fetch(c.url+'/rest/v1/', {
        headers:{'apikey':c.key,'Authorization':'Bearer '+c.key}
      }).then(function(r){
        pre.textContent = 'HTTP: '+r.status+(r.ok?' OK':'ERROR')+'\nURL: '+c.url;
      }).catch(function(e){ pre.textContent = '❌ שגיאת רשת: '+e.message; });
    }

    makeBtn('🔍 כל השורות', '#0284c7', fetchAll);
    makeBtn('🔎 עם פילטר', '#7c3aed', fetchFiltered);
    makeBtn('📄 שורה ראשונה RAW', '#059669', fetchFirstRaw);
    makeBtn('📡 בדיקת חיבור', '#475569', testConn);

    box.appendChild(header);
    box.appendChild(info);
    box.appendChild(pre);
    box.appendChild(btnRow);
    modal.appendChild(box);
    document.body.appendChild(modal);

    // Auto-run on open
    fetchAll();
  };

  // Expose _sendEmail for pc-features.js
  // ── Render linked cloud docs in review screen ───────────────────────────
  function renderDocLinksInReview(traineeIdx) {
    var el = document.getElementById('reviewDocLinks');
    if (!el || !window.app) return;
    console.log('🔍 renderDocLinksInReview: tid='+traineeIdx+' docLinks='+JSON.stringify(window.app.data.docLinks||{}));
    var links = window.app.data.docLinks || {};
    var relevant = Object.keys(links).filter(function(sid){
      return links[sid].traineeIdx === traineeIdx;
    });
    if (!relevant.length) { el.innerHTML = ''; return; }

    var html = '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:10px 14px;margin-bottom:8px;">';
    html += '<div style="font-weight:700;font-size:.85em;color:#0284c7;margin-bottom:6px;">📎 מסמכים מצורפים</div>';
    relevant.forEach(function(sid){
      var lnk = links[sid];
      html += '<div style="display:flex;align-items:center;gap:8px;font-size:.82em;padding:3px 0;">';
      html += '<span style="color:#0284c7;">📄</span>';
      html += '<span style="color:#1e293b;">'+(lnk.exerciseName||'כללי')+'</span>';
      html += '<span style="color:#64748b;font-size:.9em;">— '+esc(sid.substring(0,30))+'</span>';
      html += '<button data-view-sid="'+esc(sid)+'" style="background:#0284c7;color:white;border:none;padding:2px 8px;border-radius:4px;font-size:.78em;cursor:pointer;">👁 צפה</button>';
      html += '<button data-sid="'+esc(sid)+'" data-ti="'+traineeIdx+'" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:.9em;" title="בטל צירוף">✕</button>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;

    // Event delegation — attached ONCE, survives innerHTML replacements
    if (!el._delegationAttached) {
      el._delegationAttached = true;
      el.addEventListener('click', function(e){
        // View button
        var viewBtn = e.target.closest('button[data-view-sid]');
        if (viewBtn) {
          var sid = viewBtn.getAttribute('data-view-sid');
          console.log('👁 View clicked, sid:', sid);
          window.supabaseSync.getDetail(sid).then(function(row){
            console.log('📄 getDetail result:', row ? 'found' : 'null');
            if (!row) { alert('לא נמצא בענן'); return; }
            var data; try { data=JSON.parse(row.json_data||'{}'); } catch(e){ data={}; }
            console.log('🎬 calling viewAssessmentData, images:', (data.images||[]).length);
            window.supabaseSync.viewAssessmentData(data, row.trainee+' — '+row.assessment_name);
          }).catch(function(e){ console.error('getDetail error:', e); alert('שגיאה: '+e.message); });
          return;
        }
        // Delete button
        var delBtn = e.target.closest('button[data-sid]');
        if (delBtn) {
          var sid2 = delBtn.getAttribute('data-sid');
          if (window.app.data.docLinks) {
            delete window.app.data.docLinks[sid2];
            if (window.storage) window.storage.saveData(true);
          }
          return;
        }
      });
    }
  }
  // ── Inject linked docs into exercise view on assessment page ────────────
  var _lastExerciseInjected = -1;

  function injectDocLinksIntoExercise() {
    if (!window.app || window.app.currentPage !== 'assessment') return;
    var tidx = window.app.currentTrainee;
    if (tidx === null || tidx === undefined) return;
    var exIdx = window.app.currentExercise;
    if (exIdx === undefined || exIdx === null) return;

    var container = document.getElementById('exerciseContent');
    if (!container) return;

    var links  = window.app.data.docLinks || {};
    var relIds = Object.keys(links).filter(function(sid){
      var lnk = links[sid];
      return lnk.traineeIdx === tidx && lnk.exerciseIdx === exIdx;
    });

    // Remove old panel
    var old = document.getElementById('pcExerciseDocs');
    if (old) old.remove();

    if (!relIds.length) return;

    var panel = document.createElement('div');
    panel.id = 'pcExerciseDocs';
    panel.style.cssText = 'margin:12px 0;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;direction:rtl;';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;font-size:.85em;color:#1d4ed8;margin-bottom:8px;';
    title.textContent = '📎 מסמכים מצורפים לתרגיל זה ('+relIds.length+')';
    panel.appendChild(title);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';
    panel.appendChild(row);

    relIds.forEach(function(sid){
      var lnk = links[sid];
      var card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:1px solid #bfdbfe;border-radius:7px;padding:7px 10px;cursor:pointer;font-size:.82em;color:#1e40af;display:flex;align-items:center;gap:6px;';
      card.innerHTML = '📄 <span>'+esc(lnk.exerciseName||'מסמך')+'</span>';
      card.title = 'לחץ לצפייה';
      (function(captSid, captLnk){
        card.addEventListener('click', function(){
          console.log('👁 Card clicked (exercise), sid:', captSid);
          window.supabaseSync.getDetail(captSid).then(function(r){
            console.log('📄 getDetail (exercise):', r ? 'found' : 'null');
            if (!r) { alert('לא נמצא'); return; }
            var d; try { d=JSON.parse(r.json_data||'{}'); } catch(e){ d={}; }
            console.log('🎬 calling viewAssessmentData from exercise, images:', (d.images||[]).length);
            window.supabaseSync.viewAssessmentData(d, r.trainee+' — '+(captLnk.exerciseName||''));
          }).catch(function(e){ console.error(e); alert('שגיאה: '+e.message); });
        });
      })(sid, lnk);
      row.appendChild(card);
    });

    // Append at bottom of exerciseContent
    container.appendChild(panel);
  }
  window.supabaseSync.injectDocLinksIntoExercise = injectDocLinksIntoExercise;

  window.supabaseSync.renderDocLinksInReview = renderDocLinksInReview;


  // ════════════════════════════════════════════════════════
  // SIGNED URLS — private bucket image loading
  // ════════════════════════════════════════════════════════
  var _urlCache = {};

  window.supabaseSync.loadSignedUrls = function(filenames, callback) {
    if (!filenames || !filenames.length) { callback({}); return; }
    var c = cfg(), result = {}, toFetch = [];
    filenames.forEach(function(f){
      if (_urlCache[f] && _urlCache[f].exp > Date.now()) result[f] = _urlCache[f].url;
      else toFetch.push(f);
    });
    if (!toFetch.length) { callback(result); return; }

    fetch(c.url+'/storage/v1/object/sign/assessment-images', {
      method: 'POST',
      headers: {'apikey':c.key,'Content-Type':'application/json'},
      body: JSON.stringify({ expiresIn: 3600, paths: toFetch })
    })
    .then(function(r){ return r.json(); })
    .then(function(arr){
      console.log('🔑 Signed URL response:', JSON.stringify(arr));
      (arr||[]).forEach(function(item, i){
        if (item && item.signedURL) {
          var url = c.url + (item.signedURL.indexOf('/storage/v1')===0 ? '' : '/storage/v1') + item.signedURL;
          var fn  = item.path || toFetch[i];
          _urlCache[fn] = { url: url, exp: Date.now() + 3500000 };
          result[fn] = url;
        }
      });
      callback(result);
    })
    .catch(function(e){ console.error('Signed URL error:', e); callback(result); });
  };

  function loadImgsInto(imgs, containerId) {
    if (!imgs || !imgs.length) return;
    var fns = imgs.map(function(i){ return i.filename; });
    window.supabaseSync.loadSignedUrls(fns, function(urlMap){
      var cnt = document.getElementById(containerId); if (!cnt) return;
      cnt.innerHTML = '';
      cnt.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';
      imgs.forEach(function(img){
        var url = urlMap[img.filename];
        var w = document.createElement('div'); w.style.cssText='text-align:center;';
        if (url) {
          var im = document.createElement('img');
          im.src = url; im.alt = img.filename;
          im.style.cssText='max-width:280px;max-height:200px;border-radius:8px;border:1px solid #e2e6ed;object-fit:contain;display:block;cursor:zoom-in;';
          im.classList.add('printable-img');
          im.title='לחץ לפתיחה במסך מלא';
          im.addEventListener('click', function(){ window._openImageViewer(this.src, img.exercise||img.label||''); });
          im.onerror = function(){ this.style.display='none'; };
          w.appendChild(im);
        } else {
          w.innerHTML = '<div style="background:#fee2e2;padding:8px;border-radius:6px;font-size:.8em;color:#ef4444;width:120px;">⚠ לא נטען</div>';
        }
        var lbl = document.createElement('p'); lbl.style.cssText='font-size:.75em;color:#64748b;margin:4px 0 0;';
        lbl.textContent = img.exercise || img.label || '';
        w.appendChild(lbl); cnt.appendChild(w);
      });
    });
  }

  // Full viewer: form fields + images (private bucket)
  window.supabaseSync.viewAssessmentData = function(data, title) {
    var ovId = 'av_' + Date.now();
    var ov   = document.createElement('div');
    ov.id    = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:24px 36px;direction:rtl;font-family:Assistant,sans-serif;';

    var m = data.meta || {};
    var header = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #e2e6ed;padding-bottom:12px;">' +
      '<div><h2 style="font-family:Rubik,sans-serif;margin:0 0 4px;">' + esc(title||m.trainee||'') + '</h2>' +
      '<span style="font-size:.85em;color:#64748b;">' + esc(m.evaluator||'') + ' | ' + esc(m.date||'') + ' | ' + esc(m.assessment||'') + '</span></div>' +
      '<div style="display:flex;gap:8px;">' +
      '<button onclick="window.print()" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">🖨 PDF</button>' +
          '<button data-ov-close style="background:#64748b;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">✕ סגור</button>'+
      '</div></div>';

    // Fields (filler format: data.fields, improvSTAGE format: data.exercises)
    var bodyHtml = '';
    if (data.fields && typeof data.fields === 'object') {
      bodyHtml += '<h3 style="font-family:Rubik,sans-serif;margin:0 0 10px;color:#1e3a5f;">פרטי הטופס</h3>';
      Object.keys(data.fields).forEach(function(k){
        if (!data.fields[k]) return;
        bodyHtml += '<div style="display:flex;gap:8px;margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-radius:7px;font-size:.88em;">';
        bodyHtml += '<span style="font-weight:700;color:#475569;min-width:140px;">' + esc(k) + ':</span>';
        bodyHtml += '<span style="color:#1e293b;white-space:pre-wrap;">' + esc(String(data.fields[k])) + '</span></div>';
      });
    }
    (data.exercises||[]).forEach(function(ex){
      var fields = Object.keys(ex.fields||{}).filter(function(f){ return !f.startsWith('_')&&ex.fields[f]; });
      if (!fields.length && !(ex.notes||[]).length) return;
      bodyHtml += '<div style="margin-bottom:14px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e6ed;">';
      bodyHtml += '<h3 style="font-family:Rubik,sans-serif;margin:0 0 8px;font-size:.95em;color:#1e3a5f;">' + esc(ex.name) + '</h3>';
      fields.forEach(function(f){
        bodyHtml += '<div style="font-size:.87em;margin-bottom:4px;"><span style="font-weight:700;color:#475569;">' + esc(f) + ':</span> <span>' + esc(String(ex.fields[f])) + '</span></div>';
      });
      (ex.notes||[]).forEach(function(n){ bodyHtml += '<div style="font-size:.82em;color:#64748b;background:#e0f2fe;padding:3px 8px;border-radius:4px;margin-top:4px;">📋 '+esc(n.text)+'</div>'; });
      bodyHtml += '</div>';
    });

    var imgs = data.images || [];
    var imgPlaceholder = imgs.length ? '<h3 style="font-family:Rubik,sans-serif;margin:14px 0 8px;color:#1e3a5f;">📷 תמונות ('+imgs.length+')</h3><div id="'+ovId+'_imgs">⏳ טוען...</div>' : '';

    ov.innerHTML = header + bodyHtml + imgPlaceholder;
    document.body.appendChild(ov);

    if (imgs.length) {
      setTimeout(function(){ loadImgsInto(imgs, ovId+'_imgs'); }, 150);
    }
  };

  // ════════════════════════════════════════════════════════
  // EMAIL — Edge Function proxy
  // ════════════════════════════════════════════════════════
  function _sendViaFormSubmit(toEmail, subject, body, onSuccess, onError) {
    fetch(SB_URL + '/functions/v1/send-email', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+SB_KEY,'apikey':SB_KEY},
      body: JSON.stringify({ to:toEmail, subject:subject, message:body.length>5000?body.substring(0,5000)+'...':body })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      console.log('📧 Email:', d);
      if (d.success) { if(onSuccess) onSuccess(); }
      else { if(onError) onError(d.hint||d.error||JSON.stringify(d)); }
    })
    .catch(function(e){ if(onError) onError(e.message||String(e)); });
  }

// ═══ ADDITIONS TO supabase-sync.js ═══

// Global close helper
window._closeOv = function(id) {
  var e = document.getElementById(id);
  if (e) e.remove();
};

// ── Signed URLs for private bucket ────────────────────────────────────────
var _urlCache = {};

window.supabaseSync.loadSignedUrls = function(filenames, callback) {
  if (!filenames || !filenames.length) { callback({}); return; }
  var c = cfg(), result = {}, toFetch = [];
  filenames.forEach(function(f) {
    var cached = _urlCache[f];
    if (cached && cached.exp > Date.now()) result[f] = cached.url;
    else toFetch.push(f);
  });
  if (!toFetch.length) { callback(result); return; }

  fetch(c.url + '/storage/v1/object/sign/assessment-images', {
    method: 'POST',
    headers: {
      'apikey': c.key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 3600, paths: toFetch })
  })
  .then(function(r) { return r.json(); })
  .then(function(arr) {
    (arr || []).forEach(function(item, i) {
      if (item && item.signedURL) {
        var url  = c.url + (item.signedURL.indexOf('/storage/v1')===0 ? '' : '/storage/v1') + item.signedURL;
        var name = item.path || toFetch[i];
        _urlCache[name] = { url: url, exp: Date.now() + 3500000 };
        result[name] = url;
      }
    });
    callback(result);
  })
  .catch(function(e) { console.error('Signed URL error:', e); callback(result); });
};

function loadImgsInto(imgs, containerId) {
  if (!imgs || !imgs.length) return;
  var cnt = document.getElementById(containerId);
  if (!cnt) return;
  cnt.innerHTML = '';
  cnt.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';

  imgs.forEach(function(img) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var im = document.createElement('img');
    im.alt = img.filename;
    im.style.cssText = 'max-width:280px;max-height:200px;border-radius:8px;border:1px solid #e2e6ed;object-fit:contain;display:block;cursor:zoom-in;';
    im.classList.add('printable-img');
    im.title = 'לחץ לפתיחה במסך מלא';
    im.addEventListener('click', function(){ window._openImageViewer(this.src, img.exercise || img.label || ''); });

    var lbl = document.createElement('p');
    lbl.textContent = img.label || img.exercise || img.filename;
    lbl.style.cssText = 'font-size:.78em;color:#64748b;margin:4px 0 0;text-align:center;';

    wrap.appendChild(im);
    wrap.appendChild(lbl);
    cnt.appendChild(wrap);

    // Step 1: try IndexedDB (offline copy)
    var localPromise = (window.improvLocalStore && window.improvLocalStore.getImage)
      ? window.improvLocalStore.getImage(img.filename)
      : Promise.resolve(null);
    localPromise.then(function(blob){
      if (blob) {
        console.log('📁 Loaded local:', img.filename);
        im.src = URL.createObjectURL(blob);
        im.dataset.source = 'local';
        return;
      }
      // Step 2: fallback to Supabase signed URL
      console.log('☁️ Local not found, fetching signed URL:', img.filename);
      window.supabaseSync.loadSignedUrls([img.filename], function(urlMap){
        var u = urlMap[img.filename];
        if (u) {
          im.src = u;
          im.dataset.source = 'cloud';
          im.onerror = function(){
            console.warn('☁️ Cloud image failed:', img.filename);
            this.outerHTML = '<div style="background:#fee2e2;padding:8px;border-radius:6px;font-size:.8em;color:#ef4444;width:280px;text-align:center;">⚠ תמונה לא נטענת<br>(' + img.filename + ')</div>';
          };
        } else {
          im.outerHTML = '<div style="background:#fee2e2;padding:8px;border-radius:6px;font-size:.8em;color:#ef4444;width:280px;text-align:center;">⚠ תמונה לא נמצאה<br>(' + img.filename + ')</div>';
        }
      });
    }).catch(function(e){
      console.warn('IDB get error:', e);
    });
  });
}

// ── Full viewer: form + images ─────────────────────────────────────────────
window.supabaseSync.viewAssessmentData = function(data, title) {
  console.log('🎬 viewAssessmentData called — title:', title, 'images:', (data.images||[]).length);
  var ovId = 'av_' + Date.now();
  var ov   = document.createElement('div');
  ov.id    = ovId;
  ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:24px 36px;direction:rtl;font-family:Assistant,sans-serif;';

  var m = data.meta || {};

  // Header with buttons (built via DOM to avoid quote issues)
  var headerDiv = document.createElement('div');
  headerDiv.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #e2e6ed;padding-bottom:12px;';

  var titleDiv = document.createElement('div');
  var h2 = document.createElement('h2');
  h2.style.cssText  = 'font-family:Rubik,sans-serif;margin:0 0 4px;color:#1e293b;';
  h2.textContent    = title || m.trainee || '';
  var metaSpan = document.createElement('span');
  metaSpan.style.cssText = 'font-size:.85em;color:#64748b;';
  metaSpan.textContent   = (m.evaluator || '') + ' | ' + (m.date || '') + ' | ' + (m.assessment || '');
  titleDiv.appendChild(h2);
  titleDiv.appendChild(metaSpan);

  var btnDiv = document.createElement('div');
  btnDiv.style.cssText = 'display:flex;gap:8px;';

  var printBtn = document.createElement('button');
  printBtn.style.cssText = 'background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;';
  printBtn.textContent   = '🖨 PDF';
  printBtn.addEventListener('click', function() { window.print(); });

  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:#475569;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;';
  closeBtn.textContent   = '✕ סגור';
  closeBtn.addEventListener('click', function() { window._closeOv(ovId); });

  btnDiv.appendChild(printBtn);
  btnDiv.appendChild(closeBtn);
  headerDiv.appendChild(titleDiv);
  headerDiv.appendChild(btnDiv);
  ov.appendChild(headerDiv);

  // Fields (filler: data.fields, improvSTAGE: data.exercises)
  if (data.fields && typeof data.fields === 'object') {
    var fieldsTitle = document.createElement('h3');
    fieldsTitle.style.cssText  = 'font-family:Rubik,sans-serif;margin:0 0 10px;color:#1e3a5f;';
    fieldsTitle.textContent    = 'פרטי הטופס';
    ov.appendChild(fieldsTitle);
    Object.keys(data.fields).forEach(function(k) {
      if (!data.fields[k]) return;
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-radius:7px;font-size:.88em;';
      var label = document.createElement('span');
      label.style.cssText = 'font-weight:700;color:#475569;min-width:140px;flex-shrink:0;';
      label.textContent   = k + ':';
      var val = document.createElement('span');
      val.style.cssText   = 'color:#1e293b;white-space:pre-wrap;';
      val.textContent     = String(data.fields[k]);
      row.appendChild(label);
      row.appendChild(val);
      ov.appendChild(row);
    });
  }

  (data.exercises || []).forEach(function(ex) {
    var fields = Object.keys(ex.fields || {}).filter(function(f) { return !f.startsWith('_') && ex.fields[f]; });
    if (!fields.length && !(ex.notes || []).length) return;
    var exDiv = document.createElement('div');
    exDiv.style.cssText = 'margin-bottom:14px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e6ed;';
    var exTitle = document.createElement('h3');
    exTitle.style.cssText  = 'font-family:Rubik,sans-serif;margin:0 0 8px;font-size:.95em;color:#1e3a5f;';
    exTitle.textContent    = ex.name || '';
    exDiv.appendChild(exTitle);
    fields.forEach(function(f) {
      var row = document.createElement('div');
      row.style.cssText   = 'font-size:.87em;margin-bottom:4px;';
      row.innerHTML       = '<strong style="color:#475569">' + f + ':</strong> ' + String(ex.fields[f]);
      exDiv.appendChild(row);
    });
    (ex.notes || []).forEach(function(n) {
      var note = document.createElement('div');
      note.style.cssText = 'font-size:.82em;color:#64748b;background:#e0f2fe;padding:3px 8px;border-radius:4px;margin-top:4px;';
      note.textContent   = '📋 ' + (n.text || '');
      exDiv.appendChild(note);
    });
    ov.appendChild(exDiv);
  });

  // Images section
  var imgs = data.images || [];
  if (imgs.length) {
    var imgTitle = document.createElement('h3');
    imgTitle.style.cssText = 'font-family:Rubik,sans-serif;margin:14px 0 8px;color:#1e3a5f;';
    imgTitle.textContent   = '📷 תמונות (' + imgs.length + ')';
    ov.appendChild(imgTitle);

    var imgContainer = document.createElement('div');
    imgContainer.id = ovId + '_imgs';
    imgContainer.textContent = '⏳ טוען...';
    ov.appendChild(imgContainer);
  }

  document.body.appendChild(ov);

  if (imgs.length) {
    setTimeout(function() { loadImgsInto(imgs, ovId + '_imgs'); }, 150);
  }
};

// ── Email via Edge Function proxy ─────────────────────────────────────────
function _sendViaFormSubmit(toEmail, subject, body, onSuccess, onError) {
  fetch(SB_URL + '/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + SB_KEY,
      'apikey':        SB_KEY
    },
    body: JSON.stringify({
      to:      toEmail,
      subject: subject,
      message: body.length > 5000 ? body.substring(0, 5000) + '...' : body
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    console.log('📧 Email result:', d);
    if (d.success) {
      if (onSuccess) onSuccess();
    } else {
      var hint = d.hint || d.error || JSON.stringify(d);
      if (onError) onError(hint);
    }
  })
  .catch(function(e) {
    if (onError) onError(e.message || String(e));
  });
}

window.supabaseSync._sendEmail = function(toEmail, subject, body, onSuccess, onError) {
  _sendViaFormSubmit(toEmail, subject, body,
    onSuccess || function() { alert('✅ המייל נשלח!'); },
    onError   || function(err) { alert('❌ ' + err); }
  );
};


  // ── Email retry queue (survives 521 outages) ─────────────────────────
  var EMAIL_QUEUE_KEY = 'improvSTAGE_emailQueue';
  var _retryTimer = null;

  function loadQueue() {
    try { return JSON.parse(localStorage.getItem(EMAIL_QUEUE_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveQueue(q) {
    try { localStorage.setItem(EMAIL_QUEUE_KEY, JSON.stringify(q)); } catch(e){}
  }

  function queueEmail(toEmail, subject, body) {
    var q = loadQueue();
    q.push({ to: toEmail, subject: subject, body: body, addedAt: Date.now(), attempts: 0 });
    saveQueue(q);
    startRetryTimer();
    alert('⏳ השרת זמנית לא זמין (521).\nהמייל נשמר בתור — ינסה שוב אוטומטית כל 10 דקות.\nתור: ' + q.length + ' מייל/ים ממתין/ים.');
  }

  function processQueue() {
    var q = loadQueue();
    if (!q.length) { stopRetryTimer(); return; }

    var item = q[0]; // Try first in queue
    item.attempts = (item.attempts || 0) + 1;

    // Give up after 48 attempts (8 hours)
    if (item.attempts > 48) {
      q.shift();
      saveQueue(q);
      alert('❌ המייל ל-' + item.to + ' לא נשלח לאחר 8 שעות ניסיונות. הוסר מהתור.');
      processQueue();
      return;
    }

    saveQueue(q);

    fetch(SB_URL + '/functions/v1/send-email', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+SB_KEY,'apikey':SB_KEY},
      body: JSON.stringify({ to: item.to, subject: item.subject, message: item.body.length > 5000 ? item.body.substring(0,5000)+'...' : item.body })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.success) {
        q = loadQueue();
        q.shift(); // Remove sent item
        saveQueue(q);
        console.log('✅ Email queue: sent to ' + item.to + ' (attempt ' + item.attempts + ')');
        if (q.length === 0) {
          stopRetryTimer();
          alert('✅ המייל ל-' + item.to + ' נשלח בהצלחה (ניסיון ' + item.attempts + ').');
        } else {
          setTimeout(processQueue, 2000); // Process next item
        }
      } else {
        var is521 = d.status === 521 || (d.hint && d.hint.indexOf('521') !== -1);
        console.warn('📧 Queue retry ' + item.attempts + '/48 — ' + (is521 ? 'שרת 521' : d.hint));
      }
    })
    .catch(function(e){ console.warn('📧 Queue error:', e.message); });
  }

  function startRetryTimer() {
    if (_retryTimer) return; // Already running
    _retryTimer = setInterval(processQueue, 10 * 60 * 1000); // Every 10 minutes
    console.log('⏰ Email retry timer started (every 10 min)');
  }

  function stopRetryTimer() {
    if (_retryTimer) { clearInterval(_retryTimer); _retryTimer = null; }
  }

  // Resume queue on load if items exist
  (function() {
    var q = loadQueue();
    if (q.length > 0) {
      console.log('📧 Resuming email queue: ' + q.length + ' item(s) pending');
      startRetryTimer();
    }
  })();

  // Override _sendViaFormSubmit to use queue on 521
  var _origSend = _sendViaFormSubmit;
  _sendViaFormSubmit = function(toEmail, subject, body, onSuccess, onError) {
    fetch(SB_URL + '/functions/v1/send-email', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+SB_KEY,'apikey':SB_KEY},
      body: JSON.stringify({ to: toEmail, subject: subject, message: body.length > 5000 ? body.substring(0,5000)+'...' : body })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      console.log('📧 Email result:', d);
      if (d.success) {
        if (onSuccess) onSuccess();
      } else {
        var is521 = d.status === 521 || (d.hint && d.hint.indexOf('521') > -1) || (d.hint && d.hint.indexOf('DOCTYPE') > -1);
        if (is521) {
          queueEmail(toEmail, subject, body);
        } else {
          if (onError) onError(d.hint || d.error || JSON.stringify(d));
        }
      }
    })
    .catch(function(e){
      // Network error — also queue
      queueEmail(toEmail, subject, body);
    });
  };

  // Expose queue status for Admin
  window.supabaseSync.getEmailQueue = function() { return loadQueue(); };
  window.supabaseSync.clearEmailQueue = function() {
    saveQueue([]);
    stopRetryTimer();
    alert('תור המיילים נוקה.');
  };
  window.supabaseSync.retryNow = function() {
    var q = loadQueue();
    if (!q.length) { alert('התור ריק.'); return; }
    alert('מנסה לשלוח ' + q.length + ' מייל/ים...');
    processQueue();
  };


  // ════════════════════════════════════════════════════════
  // STORAGE BROWSER — list, view signed URL, delete files
  // ════════════════════════════════════════════════════════
  window.supabaseSync.listStorageFiles = function(callback) {
    var c = cfg();
    fetch(c.url + '/storage/v1/object/list/assessment-images', {
      method: 'POST',
      headers: {'apikey': c.key, 'Content-Type': 'application/json'},
      body: JSON.stringify({ prefix: '', limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' } })
    })
    .then(function(r){ return r.json(); })
    .then(function(arr){
      console.log('📁 Storage files:', arr);
      callback(Array.isArray(arr) ? arr : []);
    })
    .catch(function(e){ console.error('list error:', e); callback([]); });
  };

  window.supabaseSync.deleteStorageFile = function(filename, callback) {
    var c = cfg();
    fetch(c.url + '/storage/v1/object/assessment-images/' + encodeURIComponent(filename), {
      method: 'DELETE',
      headers: {'apikey': c.key, 'Authorization': 'Bearer ' + c.key}
    })
    .then(function(r){ callback(r.ok); })
    .catch(function(){ callback(false); });
  };

  window.supabaseSync.showStorageBrowser = function() {
    var ovId = 'sb_storage_' + Date.now();
    var ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:24px 36px;direction:rtl;font-family:Assistant,sans-serif;';

    ov.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:16px;border-bottom:2px solid #e2e6ed;padding-bottom:12px;">'+
      '<h2 style="margin:0;color:#1e293b;">📁 דפדפן Storage</h2>'+
      '<button data-close="1" style="background:#475569;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">✕ סגור</button>'+
      '</div>'+
      '<div id="'+ovId+'_list">⏳ טוען רשימת קבצים...</div>';

    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){
      if (e.target.getAttribute('data-close')) window._closeOv(ovId);
    });

    window.supabaseSync.listStorageFiles(function(files){
      var listEl = document.getElementById(ovId + '_list');
      if (!files.length) { listEl.innerHTML = '<p>אין קבצים ב-Storage.</p>'; return; }

      var html = '<p style="color:#64748b;">סך הכל: '+files.length+' קבצים</p>';
      html += '<table style="width:100%;border-collapse:collapse;font-size:.88em;">';
      html += '<thead><tr style="background:#f1f5f9;"><th style="padding:8px;text-align:right;">שם קובץ</th><th style="padding:8px;">גודל</th><th style="padding:8px;">נוצר</th><th style="padding:8px;">פעולות</th></tr></thead><tbody>';
      files.forEach(function(f){
        var name = f.name;
        var sizeKb = f.metadata && f.metadata.size ? (f.metadata.size/1024).toFixed(1)+' KB' : '?';
        var created = f.created_at ? f.created_at.substring(0,16).replace('T',' ') : '';
        html += '<tr style="border-bottom:1px solid #e2e6ed;">';
        html += '<td style="padding:6px;font-family:monospace;font-size:.85em;word-break:break-all;">'+esc(name)+'</td>';
        html += '<td style="padding:6px;">'+sizeKb+'</td>';
        html += '<td style="padding:6px;font-size:.8em;">'+esc(created)+'</td>';
        html += '<td style="padding:6px;white-space:nowrap;">';
        html += '<button data-test-url="'+esc(name)+'" style="background:#3b82f6;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:.78em;cursor:pointer;margin-left:4px;">🔑 URL</button>';
        html += '<button data-view-img="'+esc(name)+'" style="background:#10b981;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:.78em;cursor:pointer;margin-left:4px;">👁 הצג</button>';
        html += '<button data-del-file="'+esc(name)+'" style="background:#ef4444;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:.78em;cursor:pointer;">🗑 מחק</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      html += '<div id="'+ovId+'_preview" style="margin-top:20px;"></div>';
      listEl.innerHTML = html;

      // Event delegation for actions
      listEl.addEventListener('click', function(e){
        var t = e.target;
        var preview = document.getElementById(ovId+'_preview');

        var testBtn = t.closest('[data-test-url]');
        if (testBtn) {
          var fn = testBtn.getAttribute('data-test-url');
          window.supabaseSync.loadSignedUrls([fn], function(urlMap){
            var url = urlMap[fn];
            preview.innerHTML = '<h3>🔑 Signed URL ל-'+esc(fn)+':</h3>'+
              '<textarea readonly style="width:100%;height:80px;font-family:monospace;font-size:.75em;">'+esc(url||'(ריק - שגיאה)')+'</textarea>'+
              (url ? '<p><a href="'+esc(url)+'" target="_blank" style="color:#3b82f6;">פתח בכרטיסיה חדשה ←</a></p>' : '');
          });
          return;
        }

        var viewBtn = t.closest('[data-view-img]');
        if (viewBtn) {
          var fn2 = viewBtn.getAttribute('data-view-img');
          preview.innerHTML = '<h3>👁 תצוגה מקדימה: '+esc(fn2)+'</h3><div id="'+ovId+'_img_test">⏳</div>';
          window.supabaseSync.loadSignedUrls([fn2], function(urlMap){
            var url = urlMap[fn2];
            var cnt = document.getElementById(ovId+'_img_test');
            if (url) {
              cnt.innerHTML = '<img src="'+esc(url)+'" style="max-width:500px;max-height:400px;border:2px solid #3b82f6;border-radius:8px;" onerror="this.outerHTML=\'<p style=color:red>שגיאה בטעינת תמונה. URL: '+esc(url)+'\'">';
            } else {
              cnt.innerHTML = '<p style="color:red;">לא הצלחנו ליצור signed URL</p>';
            }
          });
          return;
        }

        var delBtn = t.closest('[data-del-file]');
        if (delBtn) {
          var fn3 = delBtn.getAttribute('data-del-file');
          if (!confirm('למחוק לצמיתות את: '+fn3+'?')) return;
          window.supabaseSync.deleteStorageFile(fn3, function(ok){
            if (ok) { alert('✅ נמחק'); window.supabaseSync.showStorageBrowser(); ov.remove(); }
            else alert('❌ שגיאה במחיקה');
          });
        }
      });
    });
  };

  // ════════════════════════════════════════════════════════
  // EMAIL PROVIDER — FormSubmit (via Edge Fn) or Web3Forms (direct)
  // ════════════════════════════════════════════════════════
  // ── Mailto: open user's default email client ──────────────────────────
  function _sendViaMailto(toEmail, subject, body, onSuccess, onError) {
    try {
      // mailto URL length limit (~2000 chars in most clients)
      var b = body.length > 1800 ? body.substring(0, 1800) + '\n\n[...נחתך — שלח בנפרד את החלק הנוסף]' : body;
      var url = 'mailto:' + encodeURIComponent(toEmail) +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(b);
      window.location.href = url;
      // mailto: doesn't give feedback — assume success after slight delay
      setTimeout(function(){
        if (onSuccess) onSuccess();
      }, 500);
    } catch(e) {
      if (onError) onError('שגיאת mailto: '+e.message);
    }
  }

  // Build .eml file with MIME multipart attachments
  // ── Brevo (Sendinblue) — 300 emails/day free, any recipient ──────────
  // Brevo hardcoded credentials (v7.6+)
  var BREVO_API_KEY = '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';
  var BREVO_SENDER  = 'alonharazi3@gmail.com';

  function _sendViaBrevo(toEmail, subject, body, onSuccess, onError) {
    // Use localStorage overrides if set; otherwise hardcoded defaults
    var apiKey      = localStorage.getItem('brevoApiKey')      || BREVO_API_KEY;
    var senderEmail = localStorage.getItem('brevoSenderEmail') || BREVO_SENDER;
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'improvSTAGE', email: senderEmail },
        to: [{ email: toEmail }],
        subject: subject,
        textContent: body
      })
    })
    .then(function(r){ return r.text().then(function(t){ return {status: r.status, body: t}; }); })
    .then(function(d){
      console.log('📧 Brevo:', d.status, d.body.substring(0,200));
      if (d.status >= 200 && d.status < 300) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError('Brevo HTTP '+d.status+': '+d.body.substring(0,150));
      }
    })
    .catch(function(e){ if (onError) onError('Brevo network: '+e.message); });
  }

  // Override _sendEmail to route by provider
  var _origSendEmail = window.supabaseSync._sendEmail;
  window.supabaseSync._sendEmail = function(toEmail, subject, body, onSuccess, onError) {
    var provider = localStorage.getItem('emailProvider') || 'brevo';
    console.log('📧 Sending via provider:', provider, '— body length:', body.length);
    var defSuc = onSuccess || function(){ alert('✅ המייל נשלח!'); };
    var defErr = onError   || function(err){ alert('❌ ' + err); };
    if (provider === 'brevo')          _sendViaBrevo(toEmail, subject, body, defSuc, defErr);
    else if (provider === 'mailto')    _sendViaMailto(toEmail, subject, body, defSuc, defErr);
    else if (provider === 'formsubmit')_origSendEmail.call(this, toEmail, subject, body, defSuc, defErr);
    else                                _origSendEmail.call(this, toEmail, subject, body, defSuc, defErr);
  };

  // Admin settings dialog
  window.supabaseSync.showEmailSettings = function() {
    var ovId = 'sb_email_' + Date.now();
    var ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;direction:rtl;';

    var box = document.createElement('div');
    box.style.cssText = 'background:white;padding:24px 28px;border-radius:14px;max-width:560px;width:95%;font-family:Assistant,sans-serif;max-height:90vh;overflow-y:auto;';
    var currentProvider     = localStorage.getItem('emailProvider')    || 'brevo';
    var currentBrevoKey     = localStorage.getItem('brevoApiKey')      || '';
    var currentBrevoSender  = localStorage.getItem('brevoSenderEmail') || '';

    function makeOpt(val, title, desc, recommended) {
      var sel = currentProvider === val;
      return '<label style="display:flex;align-items:flex-start;padding:12px;background:'+(sel?'#dbeafe':'#f8fafc')+';border:2px solid '+(sel?'#3b82f6':'#e2e6ed')+';border-radius:8px;cursor:pointer;margin-bottom:8px;">'+
        '<input type="radio" name="emProv" value="'+val+'" '+(sel?'checked':'')+' style="margin-left:10px;margin-top:3px;">'+
        '<div style="flex:1;"><strong>'+title+'</strong>'+(recommended?' <span style="background:#10b981;color:white;padding:1px 7px;border-radius:10px;font-size:.7em;">מומלץ</span>':'')+'<br><span style="font-size:.82em;color:#64748b;">'+desc+'</span></div>'+
        '</label>';
    }

    box.innerHTML =
      '<h2 style="margin:0 0 8px;color:#1e293b;">⚙️ הגדרות מייל</h2>'+
      '<p style="font-size:.85em;color:#64748b;margin:0 0 14px;">3 אופציות. הכל נשלח כטקסט מלא (ללא קבצים מצורפים).</p>'+
      makeOpt('brevo', '💎 Brevo (אוטומטי)', 'שולח לכל כתובת בלי שהמקבל צריך להירשם. דרוש API Key + Sender מאומת (חד-פעמי).', true) +
      makeOpt('formsubmit', '⚙️ FormSubmit (אוטומטי, חינמי)', 'ללא הרשמה. כל מקבל חדש מאשר פעם אחת. ⚠️ לפעמים שרת down (522).', false) +
      makeOpt('mailto', '📨 mailto (ידני)', 'פותח באפליקציית המייל המוגדרת עם כל הטקסט בגוף. ✅ עובד תמיד.', false) +

      // Brevo config
      '<div id="'+ovId+'_brevoWrap" style="margin-top:10px;'+(currentProvider==='brevo'?'':'display:none;')+';background:#eff6ff;padding:12px;border-radius:8px;border:1px solid #93c5fd;">'+
        '<h4 style="margin:0 0 8px;color:#1e40af;">🔑 הגדרת Brevo</h4>'+
        '<label style="display:block;font-size:.85em;font-weight:700;margin-bottom:4px;">API Key:</label>'+
        '<input type="text" id="'+ovId+'_brevoKey" value="'+esc(currentBrevoKey)+'" placeholder="xkeysib-..." style="width:100%;padding:8px;border:1.5px solid #93c5fd;border-radius:6px;font-family:monospace;font-size:.78em;box-sizing:border-box;margin-bottom:8px;">'+
        '<label style="display:block;font-size:.85em;font-weight:700;margin-bottom:4px;">Sender Email (מאומת ב-Brevo):</label>'+
        '<input type="email" id="'+ovId+'_brevoSender" value="'+esc(currentBrevoSender)+'" placeholder="your@email.com" style="width:100%;padding:8px;border:1.5px solid #93c5fd;border-radius:6px;font-size:.85em;box-sizing:border-box;">'+
      '</div>'+

      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">'+
        '<button data-cancel="1" style="background:#64748b;color:white;border:none;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;">ביטול</button>'+
        '<button data-save="1" style="background:#10b981;color:white;border:none;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;">💾 שמור</button>'+
      '</div>';

    ov.appendChild(box);
    document.body.appendChild(ov);

    box.querySelectorAll('input[name="emProv"]').forEach(function(r){
      r.addEventListener('change', function(){
        document.getElementById(ovId+'_brevoWrap').style.display = (this.value==='brevo') ? 'block' : 'none';
      });
    });

    box.querySelector('[data-cancel]').addEventListener('click', function(){ ov.remove(); });
    box.querySelector('[data-save]').addEventListener('click', function(){
      var prov = box.querySelector('input[name="emProv"]:checked').value;
      localStorage.setItem('emailProvider', prov);
      var brKey = document.getElementById(ovId+'_brevoKey').value.trim();
      if (brKey) localStorage.setItem('brevoApiKey', brKey);
      var brSender = document.getElementById(ovId+'_brevoSender').value.trim();
      if (brSender) localStorage.setItem('brevoSenderEmail', brSender);
      alert('✅ נשמר. ספק: ' + prov);
      ov.remove();
    });
  };


  // ════════════════════════════════════════════════════════
  // SUPABASE FULL DIAGNOSTICS — runs 8 tests, returns log
  // ════════════════════════════════════════════════════════
  window.supabaseSync.runFullDiagnostics = function() {
    var ovId = 'sb_diag_' + Date.now();
    var ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:24px 36px;direction:rtl;font-family:Assistant,sans-serif;';
    ov.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:16px;border-bottom:2px solid #e2e6ed;padding-bottom:12px;">'+
      '<h2 style="margin:0;color:#1e293b;">🧪 בדיקות Supabase</h2>'+
      '<div><button data-copy="1" style="background:#3b82f6;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;margin-left:6px;">📋 העתק לוג</button>'+
      '<button data-close="1" style="background:#475569;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">✕ סגור</button></div>'+
      '</div>'+
      '<pre id="'+ovId+'_log" style="background:#0f172a;color:#cbd5e1;padding:14px;border-radius:8px;font-family:monospace;font-size:.82em;line-height:1.5;direction:ltr;text-align:left;white-space:pre-wrap;min-height:400px;max-height:600px;overflow-y:auto;">🧪 Running diagnostics...\n</pre>';
    document.body.appendChild(ov);

    var logEl = document.getElementById(ovId+'_log');
    var fullLog = '🧪 SUPABASE DIAGNOSTICS — ' + new Date().toISOString() + '\n';
    fullLog += '═══════════════════════════════════════════\n\n';

    function log(msg) {
      fullLog += msg + '\n';
      logEl.textContent = fullLog;
      logEl.scrollTop = logEl.scrollHeight;
    }

    ov.addEventListener('click', function(e){
      if (e.target.getAttribute('data-close')) window._closeOv(ovId);
      if (e.target.getAttribute('data-copy')) {
        navigator.clipboard.writeText(fullLog).then(function(){ alert('✅ הועתק'); });
      }
    });

    var c = cfg();
    var key = c.key;
    var keyPrefix = key.substring(0, 20) + '...';

    log('CONFIG:');
    log('  URL:    ' + c.url);
    log('  Key:    ' + keyPrefix);
    log('  Format: ' + (key.indexOf('sb_publishable_') === 0 ? 'NEW (publishable)' : key.indexOf('eyJ') === 0 ? 'OLD (JWT)' : 'UNKNOWN'));
    log('');

    // Test chain
    var tests = [];

    // 1. REST API connectivity
    tests.push(function(next) {
      log('TEST 1: REST API connectivity (/rest/v1/assessments?limit=1)');
      fetch(c.url + '/rest/v1/assessments?limit=1', {
        headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + c.key }
      })
      .then(function(r){ return r.text().then(function(t){ return {status:r.status, body:t}; }); })
      .then(function(d){
        log('  Status: ' + d.status);
        log('  Body:   ' + d.body.substring(0,200));
        log(d.status === 200 ? '  ✅ PASS' : '  ❌ FAIL');
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ NETWORK ERROR: '+e.message); log(''); next(); });
    });

    // 2. Count assessments
    tests.push(function(next) {
      log('TEST 2: Count assessments (HEAD /rest/v1/assessments)');
      fetch(c.url + '/rest/v1/assessments?select=count', {
        headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + c.key, 'Prefer': 'count=exact' }
      })
      .then(function(r){
        log('  Status: ' + r.status);
        log('  Count:  ' + (r.headers.get('content-range') || 'unknown'));
        log(r.ok ? '  ✅ PASS' : '  ❌ FAIL');
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 3. List storage files (Storage API)
    var firstFile = null;
    tests.push(function(next) {
      log('TEST 3: Storage list files (POST /storage/v1/object/list/assessment-images)');
      fetch(c.url + '/storage/v1/object/list/assessment-images', {
        method: 'POST',
        headers: { 'apikey': c.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: '', limit: 10 })
      })
      .then(function(r){ return r.text().then(function(t){ return {status:r.status,body:t}; }); })
      .then(function(d){
        log('  Status: ' + d.status);
        try {
          var arr = JSON.parse(d.body);
          if (Array.isArray(arr)) {
            log('  Files:  ' + arr.length);
            arr.slice(0,3).forEach(function(f){ log('    - ' + f.name + (f.metadata ? ' ('+f.metadata.size+'b)' : '')); });
            if (arr.length > 0) firstFile = arr[0].name;
            log('  ✅ PASS');
          } else {
            log('  Body: ' + d.body.substring(0,300));
            log('  ❌ FAIL (not array)');
          }
        } catch(e) {
          log('  Body: ' + d.body.substring(0,300));
          log('  ❌ FAIL (parse error)');
        }
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 4. Generate signed URL (apikey only — no Authorization)
    var signedUrl = null;
    tests.push(function(next) {
      if (!firstFile) { log('TEST 4: SKIPPED (no files)\n'); next(); return; }
      log('TEST 4: Signed URL (POST /storage/v1/object/sign/assessment-images, apikey ONLY)');
      fetch(c.url + '/storage/v1/object/sign/assessment-images', {
        method: 'POST',
        headers: { 'apikey': c.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 3600, paths: [firstFile] })
      })
      .then(function(r){ return r.text().then(function(t){ return {status:r.status,body:t}; }); })
      .then(function(d){
        log('  Status: ' + d.status);
        log('  Body:   ' + d.body.substring(0,300));
        try {
          var arr = JSON.parse(d.body);
          if (Array.isArray(arr) && arr[0] && arr[0].signedURL) {
            signedUrl = c.url + (arr[0].signedURL.indexOf('/storage/v1')===0 ? '' : '/storage/v1') + arr[0].signedURL;
            log('  Signed URL: ' + signedUrl.substring(0,100) + '...');
            log('  ✅ PASS (no JWT needed)');
          } else {
            log('  ❌ FAIL — no signedURL in response');
          }
        } catch(e) { log('  ❌ parse error'); }
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 5. Same with Authorization (sb_publishable_)
    tests.push(function(next) {
      if (!firstFile) { log('TEST 5: SKIPPED (no files)\n'); next(); return; }
      log('TEST 5: Signed URL WITH Authorization: Bearer sb_publishable_ (expect FAIL for new keys)');
      fetch(c.url + '/storage/v1/object/sign/assessment-images', {
        method: 'POST',
        headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + c.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 3600, paths: [firstFile] })
      })
      .then(function(r){ return r.text().then(function(t){ return {status:r.status,body:t}; }); })
      .then(function(d){
        log('  Status: ' + d.status);
        log('  Body:   ' + d.body.substring(0,300));
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 6. Fetch the signed URL (verify image is reachable)
    tests.push(function(next) {
      if (!signedUrl) { log('TEST 6: SKIPPED (no signed URL)\n'); next(); return; }
      log('TEST 6: GET signed URL (verify image is reachable)');
      fetch(signedUrl, { method: 'GET' })
      .then(function(r){
        log('  Status:       ' + r.status);
        log('  Content-Type: ' + r.headers.get('content-type'));
        log('  Size:         ' + r.headers.get('content-length') + ' bytes');
        log(r.ok ? '  ✅ PASS — image is reachable' : '  ❌ FAIL');
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 7. Edge Function (send-email)
    tests.push(function(next) {
      log('TEST 7: Edge Function exists (POST /functions/v1/send-email with OPTIONS)');
      fetch(c.url + '/functions/v1/send-email', {
        method: 'OPTIONS',
        headers: { 'apikey': c.key }
      })
      .then(function(r){
        log('  Status: ' + r.status);
        log('  CORS:   ' + (r.headers.get('access-control-allow-origin') || 'none'));
        log(r.status < 500 ? '  ✅ Function deployed' : '  ❌ Function not deployed');
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // 8. Bucket info
    tests.push(function(next) {
      log('TEST 8: Bucket info (GET /storage/v1/bucket/assessment-images)');
      fetch(c.url + '/storage/v1/bucket/assessment-images', {
        headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + c.key }
      })
      .then(function(r){ return r.text().then(function(t){ return {status:r.status,body:t}; }); })
      .then(function(d){
        log('  Status: ' + d.status);
        try {
          var b = JSON.parse(d.body);
          log('  Name:   ' + b.name);
          log('  Public: ' + b.public);
          log('  Size:   ' + (b.file_size_limit || 'unlimited'));
          log(d.status === 200 ? '  ✅ PASS' : '  ❌ FAIL');
        } catch(e) {
          log('  Body: ' + d.body.substring(0,200));
          log('  ❌ parse error');
        }
        log('');
        next();
      })
      .catch(function(e){ log('  ❌ '+e.message); log(''); next(); });
    });

    // Run sequentially
    function runNext() {
      if (!tests.length) {
        log('═══════════════════════════════════════════');
        log('✅ DIAGNOSTICS COMPLETE — copy log with 📋 button');
        return;
      }
      var t = tests.shift();
      t(runNext);
    }
    runNext();
  };


  // ════════════════════════════════════════════════════════
  // FULLSCREEN IMAGE VIEWER — zoom in/out, pan
  // ════════════════════════════════════════════════════════
  window._openImageViewer = function(src, caption) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:50000;background:rgba(0,0,0,.92);display:flex;flex-direction:column;direction:rtl;font-family:Assistant,sans-serif;';

    // Toolbar
    var tb = document.createElement('div');
    tb.style.cssText = 'background:#1e293b;color:white;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;';
    tb.innerHTML =
      '<div style="flex:1;font-size:.9em;color:#cbd5e1;">'+(caption?'📷 '+caption:'')+'</div>'+
      '<div style="display:flex;gap:6px;">'+
        '<button data-action="zoomout" style="background:#475569;color:white;border:none;width:36px;height:36px;border-radius:6px;font-size:1.2em;cursor:pointer;font-weight:700;">−</button>'+
        '<button data-action="reset"   style="background:#475569;color:white;border:none;padding:0 12px;height:36px;border-radius:6px;cursor:pointer;font-weight:700;">100%</button>'+
        '<button data-action="zoomin"  style="background:#475569;color:white;border:none;width:36px;height:36px;border-radius:6px;font-size:1.2em;cursor:pointer;font-weight:700;">+</button>'+
        '<button data-action="close"   style="background:#dc2626;color:white;border:none;padding:0 16px;height:36px;border-radius:6px;cursor:pointer;font-weight:700;margin-right:8px;">✕ סגור</button>'+
      '</div>';

    // Scroll container with image
    var scroll = document.createElement('div');
    scroll.style.cssText = 'flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;cursor:grab;';

    var imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'transform-origin:center center;transition:transform .15s ease-out;';

    var img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'display:block;max-width:none;user-select:none;-webkit-user-drag:none;';

    imgWrap.appendChild(img);
    scroll.appendChild(imgWrap);
    ov.appendChild(tb);
    ov.appendChild(scroll);
    document.body.appendChild(ov);

    var zoom = 1;
    var applyZoom = function(){ imgWrap.style.transform = 'scale('+zoom+')'; };

    // Buttons
    tb.addEventListener('click', function(e){
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var act = btn.getAttribute('data-action');
      if (act === 'close')   { ov.remove(); }
      if (act === 'zoomin')  { zoom = Math.min(zoom * 1.25, 6); applyZoom(); }
      if (act === 'zoomout') { zoom = Math.max(zoom / 1.25, 0.25); applyZoom(); }
      if (act === 'reset')   { zoom = 1; applyZoom(); scroll.scrollTo(0,0); }
    });

    // Wheel to zoom
    scroll.addEventListener('wheel', function(e){
      if (!e.ctrlKey && !e.metaKey) return;  // Ctrl+wheel for zoom
      e.preventDefault();
      if (e.deltaY < 0) zoom = Math.min(zoom * 1.1, 6);
      else              zoom = Math.max(zoom / 1.1, 0.25);
      applyZoom();
    }, { passive: false });

    // Drag to pan
    var isDown = false, startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0;
    scroll.addEventListener('mousedown', function(e){
      isDown = true; scroll.style.cursor = 'grabbing';
      startX = e.pageX - scroll.offsetLeft; startY = e.pageY - scroll.offsetTop;
      scrollLeft = scroll.scrollLeft; scrollTop = scroll.scrollTop;
    });
    scroll.addEventListener('mouseup',    function(){ isDown = false; scroll.style.cursor = 'grab'; });
    scroll.addEventListener('mouseleave', function(){ isDown = false; scroll.style.cursor = 'grab'; });
    scroll.addEventListener('mousemove', function(e){
      if (!isDown) return;
      e.preventDefault();
      scroll.scrollLeft = scrollLeft - (e.pageX - scroll.offsetLeft - startX);
      scroll.scrollTop  = scrollTop  - (e.pageY - scroll.offsetTop  - startY);
    });

    // Touch pinch zoom (simple)
    var lastTouchDist = null;
    scroll.addEventListener('touchstart', function(e){
      if (e.touches.length === 2) {
        var dx = e.touches[0].pageX - e.touches[1].pageX;
        var dy = e.touches[0].pageY - e.touches[1].pageY;
        lastTouchDist = Math.sqrt(dx*dx + dy*dy);
      }
    });
    scroll.addEventListener('touchmove', function(e){
      if (e.touches.length === 2 && lastTouchDist !== null) {
        e.preventDefault();
        var dx = e.touches[0].pageX - e.touches[1].pageX;
        var dy = e.touches[0].pageY - e.touches[1].pageY;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > lastTouchDist) zoom = Math.min(zoom * 1.02, 6);
        else                       zoom = Math.max(zoom / 1.02, 0.25);
        lastTouchDist = dist;
        applyZoom();
      }
    }, { passive: false });

    // ESC to close
    var escHandler = function(e){ if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
  };

  // Inject print CSS for full-page images
  if (!document.getElementById('printImageCSS')) {
    var st = document.createElement('style');
    st.id = 'printImageCSS';
    st.textContent = '@media print {' +
      // Hide siblings of body that are NOT the viewer modals
      '  body > *:not([id^="av_"]):not([id^="sbView_"]) { display: none !important; }' +
      // Reset modal positioning for normal flow during print
      '  [id^="av_"], [id^="sbView_"] { position: static !important; inset: auto !important; width: 100% !important; max-width: 100% !important; padding: 20px !important; margin: 0 !important; background: white !important; color: black !important; overflow: visible !important; }' +
      // Make all text inside modal visible and printable
      '  [id^="av_"] *, [id^="sbView_"] * { color: black !important; background: transparent !important; box-shadow: none !important; }' +
      // Images: fill page width, keep aspect ratio, avoid page splits
      '  .printable-img { max-width: 100% !important; width: 100% !important; height: auto !important; max-height: none !important; object-fit: contain !important; page-break-inside: avoid !important; display: block !important; margin: 10px 0 !important; }' +
      // Hide all UI buttons during print
      '  button { display: none !important; }' +
      // Better page settings
      '  @page { margin: 1.5cm; size: A4; }' +
      '}';
    document.head.appendChild(st);
  }


  // ════════════════════════════════════════════════════════
  // FORMSUBMIT COMPREHENSIVE DIAGNOSTICS — 8 configurations
  // ════════════════════════════════════════════════════════
  window.supabaseSync.runFormSubmitTests = function() {
    var email = prompt('הזן כתובת מייל לבדיקה:\n\n⚠️ אם הכתובת עוד לא אושרה ב-FormSubmit, יישלח אליה מייל אישור חד-פעמי בכל ניסיון.', 'alonharazi3@gmail.com');
    if (!email) return;

    var ovId = 'fsTest_' + Date.now();
    var ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:30000;background:#fff;overflow-y:auto;padding:24px 36px;direction:rtl;font-family:Assistant,sans-serif;';
    ov.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:16px;border-bottom:2px solid #e2e6ed;padding-bottom:12px;">'+
      '<h2 style="margin:0;color:#1e293b;">🔬 בדיקת FormSubmit מקיפה</h2>'+
      '<div><button data-copy="1" style="background:#3b82f6;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;margin-left:6px;">📋 העתק</button>'+
      '<button data-close="1" style="background:#475569;color:white;border:none;padding:8px 14px;border-radius:7px;font-weight:700;cursor:pointer;">✕ סגור</button></div>'+
      '</div>'+
      '<p style="background:#fef3c7;padding:10px;border-radius:6px;color:#92400e;font-size:.88em;">📧 כתובת: <strong>'+email+'</strong> — תקבל עד 8 מיילים (אחד מכל קונפיגורציה שמצליחה)</p>'+
      '<pre id="'+ovId+'_log" style="background:#0f172a;color:#cbd5e1;padding:14px;border-radius:8px;font-family:monospace;font-size:.78em;line-height:1.5;direction:ltr;text-align:left;white-space:pre-wrap;min-height:400px;max-height:65vh;overflow-y:auto;">🔬 Starting comprehensive FormSubmit tests...\n</pre>';
    document.body.appendChild(ov);

    var logEl = document.getElementById(ovId+'_log');
    var fullLog = '🔬 FORMSUBMIT COMPREHENSIVE TESTS — ' + new Date().toISOString() + '\n';
    fullLog += 'Target: ' + email + '\n';
    fullLog += 'Origin: ' + window.location.origin + '\n';
    fullLog += 'User-Agent: ' + navigator.userAgent.substring(0,80) + '\n';
    fullLog += '═══════════════════════════════════════════\n\n';
    var summary = [];

    function log(msg){ fullLog += msg + '\n'; logEl.textContent = fullLog; logEl.scrollTop = logEl.scrollHeight; }

    ov.addEventListener('click', function(e){
      if (e.target.getAttribute('data-close')) window._closeOv(ovId);
      if (e.target.getAttribute('data-copy')) navigator.clipboard.writeText(fullLog).then(function(){ alert('✅ הועתק'); });
    });

    function runTest(label, fn) {
      var t0 = Date.now();
      log('━━━ ' + label + ' ━━━');
      return fn().then(function(result){
        var ms = Date.now() - t0;
        log('  Status: ' + result.status + '  Time: ' + ms + 'ms');
        if (result.headers) log('  Headers: ' + result.headers);
        if (result.body)    log('  Body: ' + result.body.substring(0, 250));
        var ok = result.status >= 200 && result.status < 400;
        log(ok ? '  ✅ PASS' : '  ❌ FAIL');
        log('');
        summary.push({test:label, status:result.status, ok:ok, ms:ms});
        return null;
      }).catch(function(e){
        var ms = Date.now() - t0;
        log('  ❌ NETWORK ERROR: ' + e.message + ' (after ' + ms + 'ms)');
        log('');
        summary.push({test:label, status:'ERR', ok:false, ms:ms, err:e.message});
        return null;
      });
    }

    function parseResp(r) {
      return r.text().then(function(t){
        var ctype = r.headers.get('content-type') || '';
        return { status: r.status, headers: ctype, body: t };
      });
    }

    // Test A: AJAX endpoint with JSON (FormSubmit's recommended for JS)
    var testA = function(){
      return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({ name: 'improvSTAGE test A', message: 'AJAX endpoint test', _subject: '[TEST A] AJAX JSON' })
      }).then(parseResp);
    };

    // Test B: Standard endpoint with JSON
    var testB = function(){
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name: 'improvSTAGE test B', message: 'Standard endpoint, JSON body', _subject: '[TEST B] Standard JSON' })
      }).then(parseResp);
    };

    // Test C: Standard endpoint with x-www-form-urlencoded (current production)
    var testC = function(){
      var p = new URLSearchParams();
      p.append('name','improvSTAGE test C');
      p.append('message','URL-encoded form data');
      p.append('_subject','[TEST C] x-www-form-urlencoded');
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: p.toString()
      }).then(parseResp);
    };

    // Test D: multipart/form-data NO file
    var testD = function(){
      var fd = new FormData();
      fd.append('name','improvSTAGE test D');
      fd.append('message','multipart/form-data no file');
      fd.append('_subject','[TEST D] multipart no file');
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'POST', body: fd
      }).then(parseResp);
    };

    // Test E: multipart/form-data WITH small file attachment (1KB text)
    var testE = function(){
      var fd = new FormData();
      fd.append('name','improvSTAGE test E');
      fd.append('message','multipart with attachment <2MB');
      fd.append('_subject','[TEST E] multipart + small file');
      var blob = new Blob(['Test attachment content from improvSTAGE\nGenerated: '+new Date().toISOString()], {type:'text/plain'});
      fd.append('attachment', blob, 'test.txt');
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'POST', body: fd
      }).then(parseResp);
    };

    // Test F: Through Edge Function proxy (production path)
    var testF = function(){
      var c = cfg();
      return fetch(c.url + '/functions/v1/send-email', {
        method: 'POST',
        headers: {'apikey':c.key,'Content-Type':'application/json'},
        body: JSON.stringify({ to: email, subject:'[TEST F] Edge Function proxy', body:'Sent via Supabase Edge Function' })
      }).then(parseResp);
    };

    // Test G: HEAD to check service health
    var testG = function(){
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'HEAD'
      }).then(function(r){ return { status:r.status, headers:r.headers.get('server')||'', body:'' }; });
    };

    // Test H: OPTIONS preflight
    var testH = function(){
      return fetch('https://formsubmit.co/' + encodeURIComponent(email), {
        method: 'OPTIONS'
      }).then(parseResp);
    };

    log('Running 8 tests sequentially...\n');

    runTest('TEST A: AJAX endpoint + JSON (formsubmit.co/ajax/{email})', testA)
    .then(function(){ return runTest('TEST B: Standard endpoint + JSON', testB); })
    .then(function(){ return runTest('TEST C: Standard endpoint + x-www-form-urlencoded (production)', testC); })
    .then(function(){ return runTest('TEST D: multipart/form-data WITHOUT file', testD); })
    .then(function(){ return runTest('TEST E: multipart/form-data WITH 1KB file attachment', testE); })
    .then(function(){ return runTest('TEST F: Via Supabase Edge Function (production proxy)', testF); })
    .then(function(){ return runTest('TEST G: HEAD request — service availability', testG); })
    .then(function(){ return runTest('TEST H: OPTIONS preflight', testH); })
    .then(function(){
      log('═══════════════════════════════════════════');
      log('SUMMARY:');
      summary.forEach(function(r){
        log('  ' + (r.ok?'✅':'❌') + ' ' + r.test.substring(0,55).padEnd(55,' ') + ' | ' + r.status + ' | ' + r.ms + 'ms');
      });
      log('');
      var passed = summary.filter(function(r){return r.ok;}).length;
      log(passed + ' / ' + summary.length + ' tests passed');
      log('');
      if (passed === 0) {
        log('🚨 ALL FAILED — FormSubmit infrastructure is down right now.');
        log('   Recommendation: Use 📧 ידני or MailThis.to/MailSlurp from email settings.');
      } else {
        log('💡 Working configurations should be used for production.');
        log('   Highest priority: tests with lowest response time + 200 status.');
      }
    });
  };

  console.log('📡 Supabase Sync module loaded');
})();
