// ==UserScript==
// @name         ClearFeed — Intentional Instagram & X
// @namespace    https://clearfeed.local/
// @version      4.0.0
// @description  Hide Instagram Reels/Explore and X For You; add independent daily visible-use limits. Local only.
// @match        https://instagram.com/*
// @match        https://www.instagram.com/*
// @match        https://x.com/*
// @match        https://www.x.com/*
// @match        https://twitter.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(() => {
  'use strict';
  if (window.__clearFeedV2) return;
  window.__clearFeedV2 = true;
  const host = location.hostname.toLowerCase();
  const platform = host.includes('instagram.com') ? 'instagram' : 'x';
  const DEFAULT_MINUTES = platform === 'instagram' ? 15 : 10;
  // Each domain has separate browser storage. Prefer x.com over twitter.com.
  const PREF_KEY = 'clearfeed-v2-limit-' + platform;
  const USAGE_KEY = 'clearfeed-v2-usage-' + platform;
  // Accept chosen limits passed from the ClearFeed Home Screen dashboard.
  // Values are clamped, and URL parameters are removed immediately.
  try {
    const target = new URL(location.href);
    const requested = target.searchParams.get('clearfeed_limit');
    if (requested !== null) {
      const parsed = Number(requested);
      if (Number.isInteger(parsed) && parsed >= 5 && parsed <= 60) safeWriteEarly(PREF_KEY, parsed);
      target.searchParams.delete('clearfeed_limit');
      history.replaceState(history.state, '', target.pathname + target.search + target.hash);
    }
  } catch (_) {}
  function safeWriteEarly(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  const STYLE_ID = 'clearfeed-v2-styles';
  const rootId = 'clearfeed-v2-root';
  let lastUrl = location.href;
  let xSwitching = false;
  let lastTick = Date.now();
  let lastActivity = Date.now();
  let lastDay = dayKey();
  let badge, overlay, usageText, settingsPanel;
  let renderScheduled = false;
  function dayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function safeRead(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } }
  function safeWrite(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch (_) { return false; } }
  function getLimit() { const x = safeRead(PREF_KEY); return Number.isInteger(x) && x >= 1 && x <= 180 ? x : DEFAULT_MINUTES; }
  function getUsage() {
    const d = dayKey();
    const obj = safeRead(USAGE_KEY);
    return obj && obj.day === d && typeof obj.ms === 'number' && Number.isFinite(obj.ms)
      ? Math.max(0,obj.ms) : 0;
  }
  function addUsage(ms) { const d=dayKey(); safeWrite(USAGE_KEY,{day:d,ms:getUsage()+ms}); }
  function remainingMs() { return Math.max(0, getLimit()*60000-getUsage()); }
  function minutesLabel(ms) { const total = Math.ceil(ms/60000); return total > 0 ? `${total} min left` : 'Time finished'; }
  const CSS = `
    /* Hide reel cards inserted in the Instagram home feed. */
    article:has(a[href^="/reel/"]),
    [role="article"]:has(a[href^="/reel/"]),
    article:has(a[href*="instagram.com/reel/"]),
    [role="article"]:has(a[href*="instagram.com/reel/"]) {display:none!important}

    a[href^="/reels"], a[href^="/reel/"], a[href^="/explore"],
    a[href^="https://www.instagram.com/reels"],a[href^="https://www.instagram.com/reel/"],
    a[href^="https://www.instagram.com/explore"] {display:none!important}
    #${rootId} [hidden] {display:none!important}
    #${rootId}, #${rootId} * {box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #${rootId} {position:relative;z-index:2147483647}
    #${rootId} .cf-badge {position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:12px;
      z-index:2147483647;padding:9px 13px;border:1px solid #a5b8aa;background:#153a30;color:#fff;
      border-radius:22px;font-size:12px;font-weight:700;box-shadow:0 5px 16px #0003;cursor:pointer}
    #${rootId} .cf-panel {position:fixed;right:12px;bottom:calc(66px + env(safe-area-inset-bottom));
      z-index:2147483647;background:#fff;color:#15251f;border-radius:15px;padding:17px;
      box-shadow:0 10px 32px #0005;width:min(310px,calc(100vw - 24px));font-size:14px}
    #${rootId} .cf-panel h3 {margin:0 0 10px;font-size:17px}
    #${rootId} .cf-panel p {margin:9px 0;color:#3d554c;line-height:1.4}
    #${rootId} .cf-panel select {width:100%;padding:10px;border:1px solid #aaa;border-radius:8px;background:#fff;color:#111}
    #${rootId} .cf-panel button {margin-top:12px;padding:9px 14px;border:0;border-radius:8px;background:#153a30;color:white;font-weight:700}
    #${rootId} .cf-lock {position:fixed;inset:0;background:#0d211b;color:white;z-index:2147483646;
      display:flex;align-items:center;justify-content:center;padding:25px;text-align:center}
    #${rootId} .cf-lock-content {max-width:380px}
    #${rootId} .cf-lock h2 {font-size:27px;line-height:1.2;margin:0 0 12px}
    #${rootId} .cf-lock p {font-size:16px;line-height:1.5;color:#c7d8d0}
    #${rootId} .cf-lock small {color:#a8c3b4}
    html.cf-x-guard [data-testid="primaryColumn"] [aria-label="Timeline: Your Home Timeline"] {visibility:hidden!important}
  `;
  function installCSS() { if(document.getElementById(STYLE_ID))return; const s=document.createElement('style');s.id=STYLE_ID;s.textContent=CSS;(document.head||document.documentElement).appendChild(s); }
  function el(tag, className, txt) { const n=document.createElement(tag);if(className)n.className=className;if(txt)n.textContent=txt;return n; }
  function ensureUI() {
    if(!document.body)return;
    if(document.getElementById(rootId))return;
    const root=el('div');root.id=rootId;
    badge=el('button','cf-badge');badge.type='button';badge.setAttribute('aria-label','Open ClearFeed settings');
    badge.addEventListener('click',()=>{settingsPanel.hidden=!settingsPanel.hidden;});
    settingsPanel=el('section','cf-panel');settingsPanel.hidden=true;
    const heading=el('h3','', 'ClearFeed settings');
    const desc=el('p','', 'Daily time budget for '+(platform==='instagram'?'Instagram':'X')+'. Resets at local midnight.');
    const select=el('select');select.setAttribute('aria-label','Daily time limit');
    [5,10,15,20,30,45,60,90,120].forEach(m=>{const o=el('option','',`${m} minutes`);o.value=String(m);select.appendChild(o);});
    select.value=String(getLimit());
    const change=el('button','', 'Save limit');change.type='button';
    change.addEventListener('click',()=>{safeWrite(PREF_KEY,Number(select.value));settingsPanel.hidden=true;render();});
    const note=el('p','', 'Counts time while this Safari page is visible and active. Settings can be changed, so this is a personal boundary, not a tamper-proof lock.');
    settingsPanel.append(heading,desc,select,change,note);
    overlay=el('div','cf-lock');overlay.hidden=true;
    const content=el('div','cf-lock-content');
    content.append(el('h2','', 'You have used your time intentionally today.'),el('p','',`Your ${platform==='instagram'?'Instagram':'X'} budget is finished. Come back tomorrow.`),el('small','', 'ClearFeed resets at midnight on this device.'));
    overlay.appendChild(content);
    root.append(badge,settingsPanel,overlay);document.body.appendChild(root);
  }
  function render() {
    ensureUI();if(!badge)return;
    const rem=remainingMs(), locked=rem<=0;
    badge.textContent='ClearFeed · '+minutesLabel(rem);
    overlay.hidden=!locked;
    // Prevent normal page interaction when the limit is exhausted.
    document.documentElement.classList.toggle('cf-time-finished',locked);
  }
  function blockInstagramPath(p) { return /^\/(?:reels?(?:\/|$)|explore(?:\/|$))/.test(p); }

  // Cover direct reel URLs while redirecting; catches deep links and SPA navigation.
  function earlyReelsGuard(){
    if(platform!=='instagram') return;
    const blocked=/^\/(?:reels?(?:\/|$)|explore(?:\/|$))/.test(location.pathname.toLowerCase());
    let shield=document.getElementById('cf-reel-route-guard');
    if(blocked){
      if(!shield){shield=document.createElement('style');shield.id='cf-reel-route-guard';shield.textContent='body{visibility:hidden!important}';(document.head||document.documentElement).appendChild(shield);}
    } else if(shield){shield.remove();}
  }
  function defendInstagram() {
    if(platform!=='instagram')return;
    earlyReelsGuard();
    if(blockInstagramPath(location.pathname.toLowerCase())) { location.replace('https://www.instagram.com/direct/inbox/');return; }
  }
  function preventBlockedClick(e) {
    if(platform!=='instagram')return;
    const a=e.target.closest?.('a[href]');if(!a)return;
    try {const target=new URL(a.href,location.href);if(/(^|\.)instagram\.com$/.test(target.hostname)&&blockInstagramPath(target.pathname.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();}}catch(_){}
  }
  function defendX() {
    if(platform!=='x')return;
    const home=/^\/(?:home)?\/?$/.test(location.pathname);
    document.documentElement.classList.toggle('cf-x-guard',home);
    if(!home)return;
    const tabs=[...document.querySelectorAll('[role="tab"]')];
    const forYou=tabs.find(t=>/^for\s+you$/i.test((t.textContent||'').trim()));
    const following=tabs.find(t=>/^following$/i.test((t.textContent||'').trim()));
    if(forYou && following) {
      if(forYou.getAttribute('aria-selected')==='true'&&!xSwitching){
        xSwitching=true;following.click();setTimeout(()=>{xSwitching=false;schedule();},450);
      }
      forYou.style.setProperty('display','none','important');
    }
    const allowed=!!following&&following.getAttribute('aria-selected')==='true';
    const timeline=document.querySelector('[data-testid="primaryColumn"] [aria-label="Timeline: Your Home Timeline"]');
    if(timeline)timeline.style.setProperty('visibility',allowed?'visible':'hidden','important');
  }
  function schedule() {if(renderScheduled)return;renderScheduled=true;setTimeout(()=>{renderScheduled=false;defendInstagram();defendX();render();},120);}
  function tick() {
    const now=Date.now();
    const delta=Math.max(0,Math.min(2000,now-lastTick));
    lastTick=now;
    if(dayKey()!==lastDay){lastDay=dayKey();lastActivity=now;}
    // Count foreground interaction; expire inactivity after 60 seconds.
    if(!document.hidden && document.hasFocus() && now-lastActivity<60000 && remainingMs()>0) addUsage(delta);
    render();
  }
  function activity() {lastActivity=Date.now();}
  function begin() {
    installCSS();earlyReelsGuard();render();schedule();
    document.addEventListener('click',preventBlockedClick,true);
    ['touchstart','pointerdown','keydown','scroll'].forEach(type=>document.addEventListener(type,activity,{passive:true,capture:true}));
    document.addEventListener('visibilitychange',()=>{lastTick=Date.now();activity();schedule();});
    window.addEventListener('focus',()=>{lastTick=Date.now();activity();});
    window.addEventListener('popstate',schedule);
    window.addEventListener('storage',render);
    const observer=new MutationObserver(records=>{
      if(records.every(r=>r.target.nodeType===1 && (r.target.id===rootId || r.target.closest?.(`#${rootId}`)))) return;
      if(location.href!==lastUrl){lastUrl=location.href;xSwitching=false;}schedule();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-selected']});
    setInterval(tick,1000);
    setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;xSwitching=false;schedule();}},1100);
  }
  if(document.documentElement)begin();else document.addEventListener('DOMContentLoaded',begin,{once:true});
})();
