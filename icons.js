/* ═══════════════════════════════════════════════════════════
   What's Next — v2.0 Phase 2.4 line-icon set
   17 stroke-based SVG icons, 1.5px stroke, 18px viewBox,
   currentColor — sourced from complete-mockups.html §08.
   Each function returns an SVG STRING (for innerHTML insertion).
   Usage: el.innerHTML = WN_ICONS.home();
   ═══════════════════════════════════════════════════════════ */
(function(){
  function svg(path, size){
    size = size || 16;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  window.WN_ICONS = {
    home:      function(s){ return svg('<path d="M3 9 9 3l6 6v6a1 1 0 0 1-1 1h-3v-4H7v4H4a1 1 0 0 1-1-1V9z"/>', s); },
    search:    function(s){ return svg('<circle cx="8" cy="8" r="4.5"/><path d="m11.5 11.5 3 3"/>', s); },
    star:      function(s){ return svg('<path d="M9 2.5 10.6 6.8l4.6.3-3.5 3 1.1 4.5L9 12.3l-3.8 2.3 1.1-4.5-3.5-3 4.6-.3z"/>', s); },
    compare:   function(s){ return svg('<rect x="2.5" y="3" width="5" height="12" rx="1"/><rect x="10.5" y="3" width="5" height="12" rx="1"/>', s); },
    kanban:    function(s){ return svg('<rect x="2.5" y="3" width="3" height="10" rx=".5"/><rect x="7.5" y="3" width="3" height="6" rx=".5"/><rect x="12.5" y="3" width="3" height="8" rx=".5"/>', s); },
    calendar:  function(s){ return svg('<rect x="2.5" y="4" width="13" height="11" rx="1"/><path d="M2.5 7.5h13M6 2.5v3M12 2.5v3"/>', s); },
    file:      function(s){ return svg('<path d="M4 2.5h6l4 4V15a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 4 15V3a.5.5 0 0 1 0-.5z"/><path d="M10 2.5v4h4"/>', s); },
    person:    function(s){ return svg('<circle cx="9" cy="6.5" r="2.8"/><path d="M3.5 15.5c.6-2.7 2.9-4.5 5.5-4.5s4.9 1.8 5.5 4.5"/>', s); },
    pen:       function(s){ return svg('<path d="m3 15 1-3.5L11.5 4l3 3-7.5 7.5L3.5 15zM10 5.5l3 3"/>', s); },
    archive:   function(s){ return svg('<rect x="2.5" y="3.5" width="13" height="3" rx=".5"/><path d="M3.5 6.5V14a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V6.5"/><path d="M7 9.5h4"/>', s); },
    cap:       function(s){ return svg('<path d="M1.5 6.5 9 3l7.5 3.5L9 10z"/><path d="M4.5 8.5V12c1.2 1.5 7.8 1.5 9 0V8.5"/>', s); },
    clipboard: function(s){ return svg('<rect x="4" y="3" width="10" height="12.5" rx=".5"/><rect x="6" y="2" width="6" height="2.5" rx=".4" fill="currentColor" stroke="none"/><path d="M6.5 9h5M6.5 12h3"/>', s); },
    briefcase: function(s){ return svg('<rect x="2.5" y="6" width="13" height="8.5" rx="1"/><path d="M6 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M2.5 10h13"/>', s); },
    leaf:      function(s){ return svg('<path d="M3 15c0-6 4-11 12-12-.5 8-5 12-11 12.5"/><path d="M3 15c2.5-3 5-5 8-7"/>', s); },
    book:      function(s){ return svg('<path d="M3 4a1 1 0 0 1 1-1h4a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H4a1 1 0 0 1-1-1z"/><path d="M15 4a1 1 0 0 0-1-1h-4a2 2 0 0 0-2 2v10a2 2 0 0 1 2-2h4a1 1 0 0 0 1-1z"/>', s); },
    printer:   function(s){ return svg('<path d="M5 6V3h8v3M3 6h12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2v2H5v-2H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/><circle cx="13" cy="9" r=".5" fill="currentColor"/>', s); },
    inbox:     function(s){ return svg('<path d="m2.5 9 2-5h9l2 5v5.5a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5z"/><path d="M2.5 9h4l1 1.5h3L11.5 9h4"/>', s); },
    /* v2.1 Phase A — clock + check, added so chrome emoji can be fully converted */
    clock:     function(s){ return svg('<circle cx="9" cy="9" r="6.5"/><path d="M9 5v4l2.5 1.5"/>', s); },
    check:     function(s){ return svg('<path d="M3.5 9.5 7 13l7.5-8"/>', s); }
  };
})();
