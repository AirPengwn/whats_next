/* ═════════════════════════════════════════════════════════════════
   Priority engine for index.html ("What to do this week" widget)
   ─────────────────────────────────────────────────────────────────
   Lives in a separate file so index.html stays small enough to
   avoid the ~21KB truncation issue on the Windows side.
   ═════════════════════════════════════════════════════════════════ */
(function(){
  var BIN='6a039aa4250b1311c33f2bac', KEY='$2a$10$zEyOgbH7E5.fBt9UlxHh8.yPbLUnHJKEhpY2z9WCQJ1fS/WLCOBpa';
  /* v2.1 emoji-sweep finish: every dashboard chrome glyph is a line icon now (single-weight, currentColor) */
  function _ico(name, fb, size){ return (window.WN_ICONS && WN_ICONS[name]) ? WN_ICONS[name](size||18) : fb; }
  var ICO_CLOCK = _ico('clock','⏳'),
      ICO_CAL   = _ico('calendar','📅'),
      ICO_CHECK = _ico('check','✅'),
      ICO_MAIL  = _ico('mail','📧'),
      ICO_WAVE  = _ico('wave','👋'),
      ICO_PEN   = _ico('pen','🖉'),
      ICO_BOLT  = _ico('bolt','🚀'),
      ICO_FILE  = _ico('file','📝'),
      ICO_ALERT = _ico('alert','⚠');
  function isPrimary(){ return localStorage.getItem('erin_primary_device')==='1'||localStorage.getItem('erin_primary_device_bak')==='1'; }
  var SL={notstarted:'Not started',gathering:'Gathering materials',submitted:'Submitted',review:'Under review',interview:'Interview / heard back',decision:'Decision received',accepted:'Accepted',declined:'Declined',waitlisted:'Waitlisted'};
  var DONE={submitted:1,review:1,interview:1,decision:1,accepted:1,declined:1,waitlisted:1};
  function lj(k,fb){ try{ return JSON.parse(localStorage.getItem(k)||fb); }catch(e){ return JSON.parse(fb); } }
  function dayDiff(s){
    if(!s||typeof s!=='string') return null;
    if(/rolling|verify|tbd|n\/?a|tba/i.test(s)) return null;
    var d=new Date(s);
    if(isNaN(d)){ var m=s.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/); if(m){ d=new Date(parseInt(m[3].length===2?'20'+m[3]:m[3]),parseInt(m[1])-1,parseInt(m[2])); } if(isNaN(d)) return null; }
    var t=new Date(); t.setHours(0,0,0,0); d.setHours(0,0,0,0); return Math.floor((d-t)/864e5);
  }
  function buildActions(){
    var A=[], ml=lj('erin_mylist_v1','{}'), mlv=Object.values(ml), apps=lj('erin_applications_v1','[]'), profs=lj('erin_prof_contacts','[]'), refs=lj('erin_ref_tracker_v1','[]'), ni=lj('erin_not_interested_v1','{}');
    function full(o){
      var p=[], u=[], app=o.app, it=o.item, pr=o.prof, rf=o.ref;
      if(app){ if(app.org)p.push({k:'Organization',v:app.org}); if(app.deadline)p.push({k:'Deadline',v:app.deadline}); if(app.notes)p.push({k:'Notes',v:app.notes}); if(app.decisionReason)p.push({k:'Decision',v:app.decisionReason}); var mm=ml[app.itemId]; if(mm) it=mm; }
      if(it){ if(it.body)p.push({k:'Description',v:it.body}); if(it.pay)p.push({k:'Pay',v:it.pay}); if(it.location)p.push({k:'Location',v:it.location}); if(it.contact)p.push({k:'How to apply',v:it.contact}); if(it._note)p.push({k:'Your note',v:it._note}); if(Array.isArray(it.pills)&&it.pills.length)p.push({k:'Tags',v:it.pills.join(' · ')}); }
      if(pr){ if(pr.email)p.push({k:'Email',v:pr.email}); if(pr.dateEmailed)p.push({k:'Emailed',v:pr.dateEmailed}); if(pr.notes)p.push({k:'Notes',v:pr.notes}); }
      if(rf){ if(rf.email)p.push({k:'Email',v:rf.email}); if(rf.dateAsked)p.push({k:'Asked',v:rf.dateAsked}); if(rf.notes)p.push({k:'Notes',v:rf.notes}); }
      if(app&&app.portalUrl)u.push({label:'Portal',href:app.portalUrl});
      if(app&&app.itemUrl)u.push({label:'Apply / posting',href:app.itemUrl});
      if(app&&app.itemSrc)u.push({label:'View on site',href:app.itemSrc});
      if(it&&it.url)u.push({label:it.url_label||'Apply',href:it.url});
      if(it&&it.url2)u.push({label:it.url2_label||'More info',href:it.url2});
      if(it&&it.src)u.push({label:'Source page',href:it.src});
      return {parts:p,urls:u};
    }
    // R1 deadlines
    apps.forEach(function(a){ var st=a.status||'notstarted'; if(DONE[st]) return; var d=dayDiff(a.deadline); if(d==null||d<0) return;
      if(d<=14) A.push({weight:200-d,klass:'pr-urgent',emoji:ICO_CLOCK,title:'URGENT — '+(a.programTitle||'application').split('—')[0].trim()+' deadline in '+d+'d',detail:(a.org?a.org+' · ':'')+'status: '+(SL[st]||st),cta:'Open application',link:'erin_applications.html#acard-'+a.id,full:full({app:a})});
      else if(d<=30) A.push({weight:120-d,klass:'pr-high',emoji:ICO_CAL,title:(a.programTitle||'application').split('—')[0].trim()+' deadline in '+d+'d',detail:(a.org?a.org+' · ':'')+'status: '+(SL[st]||st),cta:'Open application',link:'erin_applications.html#acard-'+a.id,full:full({app:a})});
    });
    // R2 stale prof follow-ups
    profs.forEach(function(p){ if(p.status!=='contacted'||!p.dateEmailed) return; var s=dayDiff(p.dateEmailed); if(s==null) return; s=-s; if(s>=14) A.push({weight:90+Math.min(s-14,40),klass:'pr-high',emoji:ICO_MAIL,title:'Follow up with '+(p.professor||'professor'),detail:'Emailed '+s+'d ago · '+(p.programTitle||'').split('—')[0].trim().slice(0,42)+' · no response logged',cta:'Open contact',link:'erin_proftracker.html#pcard-'+p.id,full:full({prof:p})}); });
    // R3 saved grad programs with no prof contacted yet
    mlv.filter(function(it){return it.type==='Graduate Program'&&!it._done&&!ni[it.id];}).forEach(function(it){ var m=profs.find(function(p){return p.programTitle===it.title;}); if(m&&m.status&&m.status!=='none') return; A.push({weight:60,klass:'pr-medium',emoji:ICO_WAVE,title:'No prof contacted for '+((it.title||'').split('—')[0].trim()).slice(0,45),detail:'Direct outreach is the highest-leverage activity in grad applications',cta:'Open prof tracker',link:'erin_proftracker.html'+(m?'#pcard-'+m.id:''),full:full({item:it,prof:m})}); });
    // R4 apps within 60d without ~2 secured recommenders. If refs are linked to
    // applications, count per-application; otherwise fall back to the global count.
    var refsHaveLinks=refs.some(function(r){return Array.isArray(r.applicationIds)&&r.applicationIds.length;});
    apps.forEach(function(a){ var st=a.status||'notstarted'; if(DONE[st]) return; var d=dayDiff(a.deadline); if(d==null||d<0||d>60) return;
      var pool = refsHaveLinks ? refs.filter(function(r){ return Array.isArray(r.applicationIds)&&r.applicationIds.indexOf(a.id)>-1; }) : refs;
      var secured=pool.filter(function(r){return /agreed|submitted/i.test(r.status||'');}).length;
      var asked=pool.filter(function(r){return /asked|agreed|submitted/i.test(r.status||'');}).length;
      if(secured>=2) return;
      A.push({weight:80+(60-d),klass:'pr-high',emoji:ICO_PEN,title:(asked===0?'Line up recommenders':'Only '+secured+' recommender'+(secured===1?'':'s')+' secured')+' for '+(a.programTitle||'application').split('—')[0].trim().slice(0,32),detail:'Deadline in '+d+'d · '+asked+' asked / '+secured+' agreed — aim for ~3 letters',cta:'Open references',link:'erin_reftracker.html',full:full({app:a})}); });
    // R5 "apply immediately" items not in app tracker
    mlv.forEach(function(it){ if(it._done||ni[it.id]) return; var t=((it.pills||[]).join(' ')+' '+(it.body||'')+' '+(it._note||'')+' '+(it.deadline||'')).toLowerCase(); if(!/apply immediately|apply now|rolling|first[- ]come|review begins/.test(t)) return; if(apps.some(function(a){return (a.itemId&&a.itemId===it.id)||(a.programTitle===it.title&&a.org===it.org);})) return; A.push({weight:95,klass:'pr-high',emoji:ICO_BOLT,title:'"Apply immediately" not yet in app tracker: '+((it.title||'').split('—')[0].trim()).slice(0,42),detail:(it.org||'')+(it.deadline?' · '+it.deadline:'')+(it.id?' · '+it.id:''),cta:'Open My List',link:'erin_mylist.html'+(it.id?'#card-'+it.id:''),full:full({item:it})}); });
    // R6 SOP not drafted within 45d
    apps.forEach(function(a){ var st=a.status||'notstarted'; if(DONE[st]) return; var d=dayDiff(a.deadline); if(d==null||d<0||d>45) return; if((a.materials||{})[0]) return; A.push({weight:70+(45-d),klass:'pr-high',emoji:ICO_FILE,title:'SOP not drafted for '+(a.programTitle||'application').split('—')[0].trim().slice(0,42),detail:'Deadline in '+d+'d · use the Outreach page SOP template',cta:'Open application',link:'erin_applications.html#acard-'+a.id,full:full({app:a})}); });
    // R7a passed-deadline apps still notstarted/gathering
    apps.forEach(function(a){ var st=a.status||'notstarted'; if(DONE[st]) return; var d=dayDiff(a.deadline); if(d==null||d>=0) return; var ago=-d; A.push({weight:150,klass:'pr-urgent',emoji:ICO_ALERT,title:'Deadline passed '+ago+'d ago — '+(a.programTitle||'application').split('—')[0].trim().slice(0,40),detail:'Status still "'+(SL[st]||st)+'" · archive (Declined/Missed) or push to next cycle',cta:'Open application',link:'erin_applications.html#acard-'+a.id,full:full({app:a})}); });
    // R7b My List items with passed deadline, never in apps
    Object.values(ml).forEach(function(it){ if(it._done||ni[it.id]) return; var d=dayDiff(it.deadline); if(d==null||d>=0) return; if(apps.some(function(a){return (a.itemId&&a.itemId===it.id)||(a.programTitle===it.title&&a.org===it.org);})) return; var ago=-d; A.push({weight:130,klass:'pr-urgent',emoji:ICO_ALERT,title:'Deadline passed '+ago+'d ago, never opened: '+((it.title||'').split('—')[0].trim()).slice(0,40),detail:(it.org||'')+(it.deadline?' · '+it.deadline:'')+' · remove with reason or move to next-cycle list',cta:'Open My List',link:'erin_mylist.html'+(it.id?'#card-'+it.id:''),full:full({item:it})}); });
    var s={}; A=A.filter(function(a){ if(s[a.link]) return false; s[a.link]=true; return true; });
    A.sort(function(a,b){return b.weight-a.weight;});
    return A;
  }
  function esc(s){ return (s+'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtCat(s){ if(!s) return ''; if(/grad/i.test(s)) return 'Grad Program'; if(/intern/i.test(s)) return 'Internship'; if(/career|job/i.test(s)) return 'Career'; if(/service|fellow/i.test(s)) return 'Service'; return s; }
  function buildDeadlines(){
    var ml=lj('erin_mylist_v1','{}'), apps=lj('erin_applications_v1','[]'), niD=lj('erin_not_interested_v1','{}'), out=[], seen={};
    function add(name,org,deadline,cat,link){
      if(!name) return;
      var d=dayDiff(deadline); if(d==null) return;
      if(d>14||d< -45) return;                       /* next 14 days, plus recent overdue */
      var key=(name+'').toLowerCase().trim(); if(!key||seen[key]) return; seen[key]=1;
      out.push({name:name,org:org||'',deadline:deadline,cat:fmtCat(cat),d:d,link:link});
    }
    apps.forEach(function(a){ if(/^(accepted|declined|waitlisted)$/i.test(a.status||'')) return; add((a.programTitle||'').split('—')[0].trim(),a.org,a.deadline,a.itemType,'erin_applications.html#acard-'+a.id); });
    Object.values(ml).forEach(function(it){ if(it._done||niD[it.id]) return; add((it.title||'').split('—')[0].trim(),it.org,it.deadline,it.type||it.cat,'erin_mylist.html'+(it.id?'#card-'+it.id:'')); });
    out.sort(function(x,y){ return x.d-y.d; });
    return out;
  }
  function renderDeadlines(){
    var box=document.getElementById('pd-deadlines'); if(!box) return;
    var list=buildDeadlines();
    var h='<div class="pd-section"><div class="pd-sec-head"><div class="pd-sec-title"><span class="pd-sec-icon">'+ICO_CLOCK+'</span> Deadlines in the next 14 days</div><span class="pd-sec-count">'+list.length+'</span></div>';
    h+='<div class="pd-sec-sub">Always shown — even ones that didn’t make the prioritized list above.</div>';
    if(!list.length){
      h+='<div class="pd-empty-dl"><span class="pd-empty-icon">'+ICO_CHECK+'</span> No deadlines in the next 14 days — nothing time-critical right now.</div>';
    } else {
      list.slice(0,8).forEach(function(o){
        var over=o.d<0, num, lbl;
        if(o.d<0){ num=-o.d; lbl=(num===1?'day':'days')+' overdue'; }
        else if(o.d===0){ num='!'; lbl='due today'; }
        else { num=o.d; lbl=(o.d===1?'day':'days')+' left'; }
        var meta=(over?'Was due ':'Due ')+esc(o.deadline)+(o.cat?' · '+esc(o.cat):'');
        h+='<a href="'+esc(o.link)+'" class="pdl'+(over?' over':'')+'">'
          +'<div class="pdl-when"><div class="pdl-num">'+num+'</div><div class="pdl-lbl">'+lbl+'</div></div>'
          +'<div class="pdl-mid"><div class="pdl-name">'+esc(o.name)+'</div><div class="pdl-meta">'+meta+'</div></div>'
          +'<div class="pdl-cta">›</div></a>';
      });
      if(list.length>8) h+='<div class="pd-more">+ '+(list.length-8)+' more with deadlines</div>';
    }
    h+='<div class="pd-foot"><span class="pd-foot-icon">'+ICO_CAL+'</span> <a href="erin_timeline.html">See all deadlines on the Timeline &rarr;</a></div></div>';
    box.innerHTML=h;
  }
  function render(){
    try{ renderDeadlines(); }catch(e){}
    var A=buildActions(), top=A.slice(0,5), c=document.getElementById('pd-actions'), ce=document.getElementById('pd-count');
    if(!c) return; c.innerHTML='';
    if(!top.length){ if(ce) ce.textContent=''; c.innerHTML='<div class="pd-empty"><span class="pd-empty-emoji">'+ICO_CHECK+'</span>All caught up — no urgent actions surfaced right now.</div>'; return; }
    if(ce) ce.textContent=A.length+' total';
    top.forEach(function(a){
      var w=document.createElement('div'), card=document.createElement('a');
      card.className='action-card '+(a.klass||'pr-medium'); card.href=a.link;
      var hf=a.full&&(a.full.parts.length||a.full.urls.length);
      card.innerHTML='<span class="action-emoji">'+a.emoji+'</span><span class="action-body"><div class="action-title">'+a.title.replace(/</g,'&lt;')+'</div><div class="action-detail">'+(a.detail||'').replace(/</g,'&lt;')+'</div><span class="action-cta">'+(a.cta||'Open')+' →</span></span>';
      w.appendChild(card);
      if(hf){
        var tr=document.createElement('div'); tr.className='action-row';
        var tg=document.createElement('button'); tg.type='button'; tg.className='action-toggle'; tg.textContent='Show details';
        var pn=document.createElement('div'); pn.className='action-expand';
        var h='';
        a.full.parts.forEach(function(p){ h+='<div class="ax-row"><span class="ax-lbl">'+p.k+':</span>'+(p.v+'').replace(/</g,'&lt;')+'</div>'; });
        if(a.full.urls.length){ h+='<div class="ax-row" style="margin-top:.55rem">'; a.full.urls.forEach(function(u){ h+='<a href="'+u.href+'" target="_blank" rel="noopener">'+(u.label||'Link')+' ↗</a>'; }); h+='</div>'; }
        pn.innerHTML=h;
        tg.onclick=function(ev){ ev.preventDefault(); ev.stopPropagation(); var o=pn.classList.toggle('open'); tg.textContent=o?'Hide details':'Show details'; };
        tr.appendChild(tg); w.appendChild(tr); w.appendChild(pn);
      }
      c.appendChild(w);
    });
    if(A.length>top.length){ var mr=document.createElement('div'); mr.className='pd-more'; mr.textContent='+ '+(A.length-top.length)+' more in the trackers'; c.appendChild(mr); }
  }
  function syncAndRender(){
    fetch('https://api.jsonbin.io/v3/b/'+BIN+'/latest',{headers:{'X-Master-Key':KEY}})
      .then(function(r){return r.json();})
      .then(function(data){
        if(data&&data.record&&!isPrimary()){ var r=data.record;
          if(r.items) localStorage.setItem('erin_mylist_v1',JSON.stringify(r.items));
          if(r.apps) localStorage.setItem('erin_applications_v1',JSON.stringify(r.apps));
          if(r.profs) localStorage.setItem('erin_prof_contacts',JSON.stringify(r.profs));
          if(r.refs) localStorage.setItem('erin_ref_tracker_v1',JSON.stringify(r.refs));
          if(r.notInterested) localStorage.setItem('erin_not_interested_v1',JSON.stringify(r.notInterested));
          if(r.writingSamples) localStorage.setItem('erin_writing_samples',JSON.stringify(r.writingSamples));
          if(r.materials) localStorage.setItem('erin_materials',JSON.stringify(r.materials));
          if(r.archiveLog) localStorage.setItem('erin_archive_log',JSON.stringify(r.archiveLog));
          if(r.priority) localStorage.setItem('erin_priority_v1',JSON.stringify(r.priority));
          try{ var n=Object.keys(JSON.parse(localStorage.getItem('erin_mylist_v1')||'{}')).length; var e=document.getElementById('home-count'); if(e) e.textContent=n>0?n:''; }catch(e){}
        }
      }).catch(function(){}).then(function(){ render(); });
  }
  render(); syncAndRender();
})();
