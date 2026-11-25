/*
 * 링크페이먼트 홈페이지 공통 스크립트
 * - 모든 페이지에서 불러옵니다 (assets/js/site.js).
 * - HTML의 data-act(버튼 동작), data-when(상태에 따라 보이는 블록), data-i(목록 순번)을 기준으로 동작합니다.
 * - 페이지별 데이터는 <script type="application/json" id="page-data"> 에 들어 있습니다.
 */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var act = function (name, root) { return $$('[data-act~="' + name + '"]', root); };
  var when = function (name, root) { return $$('[data-when="' + name + '"]', root); };
  var show = function (els, on) { els.forEach(function (el) { el.hidden = !on; }); };
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var PAGE = {};
  try { var pdEl = document.getElementById('page-data'); if (pdEl) PAGE = JSON.parse(pdEl.textContent); } catch (e) {}

  /* ───────── 테마 (라이트/다크, 브라우저에 기억) ───────── */
  function applyTheme(theme) {
    var site = $('.site');
    if (!site) return;
    site.classList.remove('t-dark', 't-light');
    site.classList.add(theme === 'dark' ? 't-dark' : 't-light');
    show(when('isDark'), theme === 'dark');
    show(when('isLight'), theme !== 'dark');
    act('toggleTheme').forEach(function (b) {
      var label = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
      b.setAttribute('aria-label', label); b.setAttribute('title', label);
    });
  }
  var theme = 'light';
  try { var saved = localStorage.getItem('lp-theme'); if (saved === 'dark' || saved === 'light') theme = saved; } catch (e) {}
  applyTheme(theme);
  act('toggleTheme').forEach(function (b) {
    b.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('lp-theme', theme); } catch (e) {}
      applyTheme(theme);
    });
  });

  /* ───────── 헤더: 스크롤하면 배경 채우기 ───────── */
  var hdr = $('.hdr');
  function onScrollHdr() { if (hdr) hdr.classList.toggle('is-scrolled', (window.pageYOffset || 0) > 8); }
  window.addEventListener('scroll', onScrollHdr, { passive: true });
  onScrollHdr();

  /* ───────── 모바일 메뉴 ───────── */
  var menuBtn = $('#menu-btn');
  function setMenu(open) {
    show(when('menuOpen'), open);
    show(when('menuClosed'), !open);
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); }
    if (open) { var first = $('#m-menu a'); if (first) first.focus(); }
  }
  act('toggleMenu').forEach(function (b) { b.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); }); });
  act('closeMenu').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); if (menuBtn) menuBtn.focus(); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  setMenu(false);

  /* ───────── 주요 서비스 티커 (흐름 멈춤/재생) ───────── */
  act('toggleTicker').forEach(function (b) {
    var ticker = b.closest('.ticker');
    b.addEventListener('click', function () {
      var paused = !ticker.classList.contains('paused');
      ticker.classList.toggle('paused', paused);
      show(when('tickerRunning', ticker), !paused);
      show(when('tickerPaused', ticker), paused);
      var label = paused ? '서비스 목록 흐름 재생' : '서비스 목록 흐름 멈춤';
      b.setAttribute('aria-label', label); b.setAttribute('title', label);
    });
  });

  /* ───────── 메인 서비스 아코디언 (한 번에 하나만 열림) ───────── */
  var accBtns = act('v.toggle');
  accBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var willOpen = b.getAttribute('aria-expanded') !== 'true';
      accBtns.forEach(function (o) {
        var on = o === b && willOpen;
        o.setAttribute('aria-expanded', on ? 'true' : 'false');
        show(when('v.open', o.closest('.acc-item')), on);
      });
    });
  });

  /* ───────── FAQ 펼치기 ───────── */
  act('q.toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;
    });
  });

  /* ───────── LinkU 흐름: 단계 버튼 + 모바일 화면 자동 넘김 ───────── */
  (function () {
    var steps = act('st.pick'), shots = $$('.lu-phone');
    if (!steps.length || !shots.length) return;
    var cur = 0, stopped = reduceMotion, hover = false;
    var cap = $('.lu-cap'), playBtn = act('luToggle')[0];
    function render(i) {
      cur = i;
      steps.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      shots.forEach(function (f, k) {
        var o = k - i, a = Math.abs(o), c = Math.max(-2, Math.min(2, o)), m = Math.min(a, 2);
        f.style.transform = 'translateX(calc(-50% + ' + (c * 46) + '%)) translateY(' + (m * 5) + '%) scale(' + (1 - m * 0.12).toFixed(2) + ')';
        f.style.zIndex = String(10 - a);
        f.style.opacity = a >= 2 ? '0' : '1';
        f.classList.toggle('is-on', o === 0);
        f.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
      });
      if (cap) {
        var s = steps[i];
        cap.textContent = s.querySelector('.band-n').textContent + ' — ' + s.querySelector('.h3').textContent;
      }
    }
    steps.forEach(function (s, k) {
      ['click', 'mouseenter', 'focus'].forEach(function (ev) { s.addEventListener(ev, function () { render(k); }); });
    });
    var flow = $('.lu-flow');
    if (flow) { flow.addEventListener('mouseenter', function () { hover = true; }); flow.addEventListener('mouseleave', function () { hover = false; }); }
    function syncPlay() {
      show(when('luPlaying'), !stopped); show(when('luPaused'), stopped);
      if (playBtn) { var l = stopped ? '화면 자동 넘김 재생' : '화면 자동 넘김 멈추기'; playBtn.setAttribute('aria-label', l); playBtn.setAttribute('title', l); }
    }
    if (playBtn) playBtn.addEventListener('click', function () { stopped = !stopped; syncPlay(); });
    syncPlay();
    setInterval(function () { if (!stopped && !hover) render((cur + 1) % steps.length); }, 3200);
    render(0);
  })();

  /* ───────── 결제 서비스 분류 필터 ───────── */
  (function () {
    var chips = act('f.pick');
    if (!chips.length || !PAGE.payGroups) return;
    chips.forEach(function (c, i) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        PAGE.payGroups.forEach(function (hid, g) {
          var sec = $('section[aria-labelledby="' + hid + '"]');
          if (sec) sec.hidden = !(i === 0 || i - 1 === g);
        });
      });
    });
  })();

  /* ───────── 솔루션 상세: 판매 방식 탭(use case) · 웹 관리자 화면 탭 ───────── */
  (function () {
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var ucBtns = act('u.pick');
    if (ucBtns.length && PAGE.useCases) {
      var card = $('.uc-card');
      ucBtns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          ucBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          var u = PAGE.useCases[i];
          card.querySelector('.h3').textContent = u.title;
          card.querySelector('.muted').textContent = u.desc;
          var img = card.querySelector('.uc-img img'); img.src = u.img.src; img.alt = u.img.alt || '';
          card.querySelector('.uc-img').setAttribute('aria-label', u.title + ' 화면 흐름, 좁은 화면에서는 가로로 스크롤');
          card.querySelector('.uc-steps').innerHTML = u.steps.map(function (t, k) { return '<li><span class="num">' + (k + 1) + '</span><span>' + esc(t) + '</span></li>'; }).join('');
        });
      });
    }
    var waBtns = act('t.pick').filter(function (b) { return b.classList.contains('chip'); });
    if (waBtns.length && PAGE.waScreens) {
      waBtns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          waBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          var s = PAGE.waScreens[i], img = $('.web-shot'), view = $('.browser-view');
          if (img) { img.src = s.src; img.alt = s.alt || ''; }
          if (view) { view.setAttribute('aria-label', s.label + ' 예시 화면, 스크롤 가능'); view.scrollTop = 0; }
        });
      });
    }
  })();

  /* ───────── 복사 버튼 (코드 · 주소 · 이메일) ───────── */
  function copyText(text, done) {
    var ok = function () { done(true); }, fail = function () { done(false); };
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, fail); return; } } catch (e) {}
    try {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var r = document.execCommand('copy'); document.body.removeChild(ta); r ? ok() : fail();
    } catch (e) { fail(); }
  }
  $$('.code-copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.closest('.code').querySelector('pre');
      copyText(code ? code.textContent : '', function (ok) {
        b.textContent = ok ? '복사됨' : '복사 실패';
        setTimeout(function () { b.textContent = '복사'; }, 1800);
      });
    });
  });
  function statusAfter(btn) {
    var box = btn.closest('.stack') || btn.parentNode.parentNode;
    return box ? box.querySelector('.status') : null;
  }
  act('copyAddress').forEach(function (b) {
    b.addEventListener('click', function () {
      var addr = b.closest('.addr').querySelector('.h3').textContent.trim(), st = statusAfter(b);
      copyText(addr, function (ok) { if (st) { st.textContent = ok ? '주소를 복사했습니다' : '복사하지 못했습니다. 주소를 직접 선택해 복사해 주세요.'; st.classList.toggle('bad', !ok); } });
    });
  });
  act('copyEmail').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.parentNode.querySelector('a[href^="mailto:"]') || $('a[href^="mailto:"]', b.closest('section') || document);
      var mail = a ? a.getAttribute('href').replace('mailto:', '').split('?')[0] : '', st = statusAfter(b);
      copyText(mail, function (ok) { if (st) { st.textContent = ok ? '이메일 주소를 복사했습니다' : '복사하지 못했습니다. 주소를 직접 선택해 복사해 주세요.'; st.classList.toggle('bad', !ok); } });
    });
  });

  /* ───────── 개인정보처리방침 목차 ───────── */
  ['s1', 's2', 's3'].forEach(function (k, i) {
    act('toc.' + k).forEach(function (b) {
      b.addEventListener('click', function () { var el = document.getElementById('pv-' + (i + 1)); if (el) { el.scrollIntoView({ block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } });
    });
  });

  /* ───────── API 매뉴얼: 목차 이동 · 현재 위치 표시 · 에러 코드 검색 ───────── */
  (function () {
    var nav = $('.docs-nav');
    if (!nav) return;
    var btns = $$('button', nav), secs = $$('.docs-main .doc-sec');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { var s = secs[i]; if (s) { s.scrollIntoView({ block: 'start' }); s.setAttribute('tabindex', '-1'); s.focus({ preventScroll: true }); mark(i); } });
    });
    function mark(i) { btns.forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-current', k === i ? 'location' : 'false'); }); }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var cur = 0;
        secs.forEach(function (s, k) { if (s.getBoundingClientRect().top <= 140) cur = k; });
        var se = document.scrollingElement || document.documentElement;
        if (se.scrollTop + window.innerHeight >= se.scrollHeight - 4) cur = secs.length - 1;
        mark(cur);
      });
    }, { passive: true });

    // 에러 코드: 전체 목록이 HTML에 들어 있고, 검색·더 보기는 여기서 처리
    var q = $('#err-q'), rows = $$('.err-list .err-row:not(.head)'), status = q ? q.closest('.doc-sec').querySelector('[role="status"]') : null;
    var moreWrap = when('errMore')[0], limit = 30;
    function update() {
      var term = (q.value || '').trim().toLowerCase(), hits = 0, shown = 0;
      rows.forEach(function (r) {
        var hit = !term || r.textContent.toLowerCase().indexOf(term) >= 0;
        if (hit) hits++;
        var vis = hit && shown < limit; if (vis) shown++;
        r.hidden = !vis;
      });
      if (status) status.textContent = hits ? ('총 ' + hits + '건 중 ' + shown + '건 표시') : '검색 결과가 없습니다.';
      if (moreWrap) moreWrap.hidden = hits <= limit;
    }
    if (q && rows.length) {
      q.addEventListener('input', function () { limit = 30; update(); });
      act('showMoreErr').forEach(function (b) { b.addEventListener('click', function () { limit += 50; update(); }); });
      update();
    }
  })();

  /* ───────── 문의하기: 유형별 항목 · 검사 · 메일 앱 열기 ───────── */
  (function () {
    var form = $('form.form');
    if (!form || !PAGE.contact) return;
    var C = PAGE.contact;
    var val = function (id) { var el = document.getElementById('f-' + id); return el ? String(el.value || '') : ''; };
    var radio = function (name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; };
    var type = function () { return radio('ctype') || 'sales'; };
    function setType(t) {
      ['sales', 'partner', 'tech', 'support'].forEach(function (k) { show(when('ct.' + k, form), k === t); });
      var lbl = form.querySelector('label[for="f-message"]');
      if (lbl && lbl.firstChild) lbl.firstChild.textContent = t === 'partner' ? '제안 내용 ' : '문의 내용 ';
    }
    // 주소의 ?type=…&service=… 로 미리 선택
    var qs = {};
    location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) try { qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); } catch (e) {} });
    var ids = C.types.map(function (t) { return t.id; });
    var startType = ids.indexOf(qs.type) >= 0 ? qs.type : 'sales';
    var pickRadio = function (name, v) { var r = form.querySelector('input[name="' + name + '"][value="' + v + '"]'); if (r) r.checked = true; };
    pickRadio('ctype', startType);
    if (qs.service && C.names[qs.service]) pickRadio(startType === 'tech' ? 'techService' : 'interest', qs.service);
    setType(startType);
    $$('input[name="ctype"]', form).forEach(function (r) { r.addEventListener('change', function () { setType(type()); if (tried) showErrors(validate()); }); });

    function validate() {
      var e = {}, t = type();
      var need = function (k, msg, v) { if (!String(v != null ? v : val(k)).trim()) e[k] = msg; };
      need('company', '회사·상점명을 입력해 주세요.');
      need('name', '담당자명을 입력해 주세요.');
      var em = val('email').trim();
      if (!em) e.email = '회신받을 이메일을 입력해 주세요.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = '이메일 형식을 확인해 주세요. 예: name@company.com';
      var ph = val('phone').trim();
      if (ph && !/^[0-9+\-\s()]{7,20}$/.test(ph)) e.phone = '전화번호는 숫자와 하이픈(-)으로 입력해 주세요.';
      if (t === 'sales') {
        need('interest', '관심 서비스를 선택해 주세요.', radio('interest'));
        var cu = val('channelUrl').trim();
        if (cu && !/^https?:\/\/\S+\.\S+/.test(cu)) e.channelUrl = 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.';
      }
      if (t === 'partner') need('partnerField', '제휴 분야를 입력해 주세요.');
      if (t === 'tech') { need('techService', '연동 서비스를 선택해 주세요.', radio('techService')); need('env', '테스트·운영 환경을 선택해 주세요.', radio('env')); }
      if (t === 'support') need('area', '문의 분야를 선택해 주세요.', radio('area'));
      need('message', t === 'partner' ? '제안 내용을 입력해 주세요.' : '문의 내용을 입력해 주세요.');
      return e;
    }
    var KEYS = ['company', 'name', 'email', 'phone', 'interest', 'channelUrl', 'partnerField', 'techService', 'env', 'area', 'message'];
    function showErrors(e) {
      KEYS.forEach(function (k) {
        var p = document.getElementById('e-' + k), f = document.getElementById('f-' + k);
        if (p) {
          p.hidden = !e[k];
          var tn = null; p.childNodes.forEach(function (n) { if (n.nodeType === 3) tn = n; });
          if (!tn) { tn = document.createTextNode(''); p.appendChild(tn); }
          tn.textContent = e[k] || '';
        }
        if (f) {
          if (f.tagName !== 'FIELDSET') f.setAttribute('aria-invalid', e[k] ? 'true' : 'false');
          if (e[k]) f.setAttribute('aria-describedby', 'e-' + k); else if (k === 'message') f.setAttribute('aria-describedby', 'h-message'); else f.removeAttribute('aria-describedby');
        }
      });
      var n = Object.keys(e).length;
      when('errSummary', form).forEach(function (el) {
        el.hidden = !n;
        var t = el.querySelector('strong, span, p') || el; if (n) t.textContent = '입력 내용을 확인해 주세요. 확인이 필요한 항목 ' + n + '개';
      });
    }
    function buildMail() {
      var t = type(), label = C.types.filter(function (x) { return x.id === t; })[0].label;
      var L = ['[문의 유형] ' + label, '[회사·상점명] ' + val('company').trim(), '[담당자명] ' + val('name').trim(), '[회신 이메일] ' + val('email').trim()];
      if (val('phone').trim()) L.push('[전화번호] ' + val('phone').trim());
      if (t === 'sales') { L.push('[관심 서비스] ' + (C.names[radio('interest')] || '')); if (val('channelUrl').trim()) L.push('[판매 채널 URL] ' + val('channelUrl').trim()); }
      if (t === 'partner') L.push('[제휴 분야] ' + val('partnerField').trim());
      if (t === 'tech') { L.push('[연동 서비스] ' + (C.names[radio('techService')] || '')); L.push('[환경] ' + radio('env')); }
      if (t === 'support') { L.push('[문의 분야] ' + radio('area')); if (val('storeId').trim()) L.push('[상점 ID] ' + val('storeId').trim()); }
      L.push('', t === 'partner' ? '[제안 내용]' : '[문의 내용]', val('message').trim());
      var subject = '[링크페이먼트 ' + label + '] ' + val('company').trim();
      return 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(L.join('\n'));
    }
    var tried = false;
    form.addEventListener('input', function () { if (tried) showErrors(validate()); });
    form.addEventListener('change', function () { if (tried) showErrors(validate()); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      tried = true;
      var e = validate();
      showErrors(e);
      var first = KEYS.filter(function (k) { return e[k]; })[0];
      if (first) {
        var el = document.getElementById('f-' + first);
        if (el) { var target = el.tagName === 'FIELDSET' ? (el.querySelector('input') || el) : el; el.scrollIntoView({ block: 'center' }); target.focus({ preventScroll: true }); }
        show(when('mail', form), false);
        return;
      }
      var href = buildMail();
      when('mail', form).forEach(function (box) { box.hidden = false; var a = box.querySelector('a'); if (a) a.href = href; });
      window.location.href = href;
    });
    showErrors({});
  })();

  /* ───────── 0/1 아스키 애니메이션 (메인 히어로 심볼 · 결제 서비스 회전 카드) ───────── */
  var IMAGES = { cardSpin: { frames: 60, cols: 10, fw: 288, fh: 208, ms: 40 } };
  var Fx = {
  /* 결제 서비스 히어로: 회전하는 카드(GIF 프레임 시트)를 0/1 아스키 애니메이션으로 그립니다. */
  initTap() {
    var el = null;
    try { el = document.querySelector('.tap-scene .tap-ascii'); } catch (e) {}
    if (this._tap && this._tap.el === el) return;
    this.stopTap();
    if (!el) return;
    var scene = el.parentElement, sheet = scene.querySelector('.tap-sheet');
    if (!sheet) return;
    var SP = IMAGES.cardSpin;
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var st = { el: el, raf: 0, t0: performance.now(), last: -1 };
    this._tap = st;
    var hash = function (a, b, c) { var h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    var off = document.createElement('canvas'), o = off.getContext('2d', { willReadFrequently: true });
    var size = function () {
      var W = scene.clientWidth || 480, H = scene.clientHeight || 270, dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      st.W = W; st.H = H; st.dpr = dpr;
      st.cw = Math.max(4, Math.min(6, W / 104)); st.ch = st.cw * 1.2;
      st.cols = Math.ceil(W / st.cw); st.rows = Math.ceil(H / st.ch);
      off.width = st.cols; off.height = st.rows; st.last = -1;
      /* 글자색은 테마 전경색을 따름 (라이트: 진한 색, 다크: 밝은 색) */
      var m = (getComputedStyle(scene).color || '').match(/\d+(\.\d+)?/g);
      st.ink = m && m.length >= 3 ? m[0] + ',' + m[1] + ',' + m[2] : '16,19,16';
      /* 진한 배경(ink) 위에서는 테두리·띠 경계를 라임으로 강조 */
      st.acc = scene.closest && scene.closest('.ink') ? '190,255,106' : st.ink;
    };
    var draw = function (now, force) {
      var t = (now - st.t0) / 1000;
      var fi = reduce ? 0 : Math.floor((now - st.t0) / SP.ms) % SP.frames;
      var tick = Math.floor(t * 2);                                  // 0/1이 바뀌는 박자
      if (!force && fi === st.last && tick === st.tick) return;
      st.last = fi; st.tick = tick;
      /* 프레임을 장면 가운데에 맞춰(contain) 셀 해상도로 그림 */
      o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, st.cols, st.rows);
      /* 모든 프레임에서 카드가 차지하는 영역(x 34~252, y 30~195)을 장면 높이에 맞추고 왼쪽 선에 붙임 */
      var k = Math.min(st.H * 0.94 / 165, st.W / 218), dw = SP.fw * k, dh = SP.fh * k;
      var dx0 = (st.W - 218 * k) / 2 - 34 * k, dy0 = (st.H - 165 * k) / 2 - 30 * k;
      var sx = (fi % SP.cols) * SP.fw, sy = Math.floor(fi / SP.cols) * SP.fh;
      o.scale(st.cols / st.W, st.rows / st.H);
      o.drawImage(sheet, sx, sy, SP.fw, SP.fh, dx0, dy0, dw, dh);
      var d = o.getImageData(0, 0, st.cols, st.rows).data;
      var ctx = el.getContext('2d');
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); ctx.clearRect(0, 0, st.W, st.H);
      ctx.font = '600 ' + (st.ch * 0.92).toFixed(1) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var LUM = function (j) { return (0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2]) / 255; };
      for (var y = 0; y < st.rows; y++) {
        for (var x = 0; x < st.cols; x++) {
          var i = (y * st.cols + x) * 4, al = d[i + 3] / 255;
          var j1 = x + 1 < st.cols ? i + 4 : i, j2 = y + 1 < st.rows ? i + st.cols * 4 : i, j0 = x > 0 ? i - 4 : i, j3 = y > 0 ? i - st.cols * 4 : i;
          var aE = Math.max(Math.abs(al - d[j1 + 3] / 255), Math.abs(al - d[j2 + 3] / 255), Math.abs(al - d[j0 + 3] / 255), Math.abs(al - d[j3 + 3] / 255));
          if (al < 0.08 && aE < 0.3) continue;
          var lum = al > 0.05 ? LUM(i) : 1;
          /* 카드 면(밝은 회색)도 형태가 보이도록 기본 밀도를 두고, 어두운 띠·칩 그림자는 빽빽하게 */
          var dark = Math.min(1, 0.2 + 1.9 * Math.max(0, 0.6 - lum));
          var lumE = al > 0.3 ? Math.max(Math.abs(lum - LUM(j1)) * (d[j1 + 3] / 255), Math.abs(lum - LUM(j2)) * (d[j2 + 3] / 255)) : 0;
          var a = 0;
          if (al * dark > BAYER[(y & 3) * 4 + (x & 3)] / 16) a = 0.28 + 0.7 * dark * al;
          var isEdge = aE > 0.3;
          if (isEdge) a = Math.max(a, 0.9);                         // 카드 테두리
          else if (lumE > 0.12) a = Math.max(a, 0.6 + lumE);          // 칩·마그네틱 띠 경계
          if (a <= 0) continue;
          /* 금색 칩은 살짝 따뜻한 색으로 */
          var r = d[i], g = d[i + 1], b = d[i + 2], gold = al > 0.5 && r - b > 45 && g - b > 25;
          ctx.fillStyle = gold ? 'rgba(' + (st.acc === st.ink ? '150,112,30' : '232,196,98') + ',' + Math.min(1, a + 0.15).toFixed(3) + ')' : 'rgba(' + (isEdge ? st.acc : st.ink) + ',' + Math.min(1, a).toFixed(3) + ')';
          ctx.fillText(hash(x, y, tick + Math.floor(hash(x, y, 3) * 7)) < 0.5 ? '0' : '1', (x + 0.5) * st.cw, (y + 0.5) * st.ch);
        }
      }
    };
    var me = this;
    var loop = function (now) { if (me._tap !== st) return; draw(now, false); st.raf = requestAnimationFrame(loop); };
    var start = function () {
      size();
      try { st.ro = new ResizeObserver(function () { size(); draw(performance.now(), true); }); st.ro.observe(scene); } catch (e) {}
      if (reduce) { draw(performance.now(), true); return; }
      try {
        st.io = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { if (!st.raf) st.raf = requestAnimationFrame(loop); }
          else { cancelAnimationFrame(st.raf); st.raf = 0; }
        });
        st.io.observe(scene);
      } catch (e) { st.raf = requestAnimationFrame(loop); }
    };
    if (sheet.complete && sheet.naturalWidth) start();
    else sheet.addEventListener('load', function () { if (me._tap === st) start(); }, { once: true });
  },

  stopTap() {
    var st = this._tap;
    if (!st) return;
    try { cancelAnimationFrame(st.raf); } catch (e) {}
    try { st.ro && st.ro.disconnect(); st.io && st.io.disconnect(); } catch (e) {}
    this._tap = null;
  },

  initAscii() {
    var el = null;
    try { el = document.getElementById('ascii-logo'); } catch (e) {}
    if (!el) { this.stopAscii(); return; }
    if (this._ascii && this._ascii.el === el) return;
    this.stopAscii();
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var PATHS = [
      'M90 17.023L76.087 31.1186H30.8468V30.8883C30.8468 23.2186 36.9849 17 44.5553 17H90V17.023Z',
      'M68.1983 48.6459C68.1983 48.6459 68.1529 48.7611 68.0847 48.7611H13.4555L27.3686 34.6655H54.3762C61.992 34.6655 68.1756 40.9302 68.1756 48.6459H68.1983Z',
      'M86.5217 52.285L72.6087 66.3806H44.6689C37.0531 66.3806 30.8696 60.1158 30.8696 52.4001C30.8696 52.331 30.915 52.285 30.9832 52.285H86.5445H86.5217Z',
      'M68.1983 69.9044C68.1983 73.7969 66.6297 77.3207 64.129 79.8773C61.6056 82.4338 58.1273 84 54.2853 84H10L23.913 69.9044H68.1983Z'
    ];
    /* 하프톤 심볼: 심볼을 점 크기로 표현하고 오른쪽으로 천천히 회전합니다.
       히어로 오른쪽은 작은 회색 점이 깔린 하프톤 바탕, 서비스 버튼에 올리면 심볼이 그쪽으로 기울며 한 바퀴 돕니다. */
    var CYCLE = 9000;             // 자동으로 흩어지는 간격(ms)
    var GLASS_LO = [70, 86, 80], GLASS_HI = [240, 244, 236], BG = [237, 237, 237];   // 유리의 어두운 투과부 ~ 밝은 반사광 (저채도)
    var section = el.parentElement;
    var mark = section ? section.querySelector('.h2-mark .mark-hit') : null;
    if (!section || !mark) return;
    var st = { el: el, ctx: el.getContext('2d'), reduce: reduce, mx: -9999, my: -9999, inside: false, t0: performance.now(), last: 0, raf: 0, cells: [], lcells: [], built: false, slowUntil: 0, flashAt: -9999, waitFlash: false, nextBurst: 0,
      ang: 9, angV: 0, angT: 9, flipFrom: -9999 };
    this._ascii = st;
    var rgba = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; };
    var lerp = function (a, b, k) { k = Math.max(0, Math.min(1, k)); return [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)]; };
    var hash = function (a, b, c) { var h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    var P2D = PATHS.map(function (d) { return new Path2D(d); });
    var build = function () {
      var W = el.clientWidth || 600, H = el.clientHeight || 600;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      st.W = W; st.H = H; st.dpr = dpr;
      var cr = el.getBoundingClientRect(), mr = mark.getBoundingClientRect();
      var ls = mr.width || 300, lx = mr.left - cr.left, ly = mr.top - cr.top;
      st.cell = Math.max(7, Math.min(11, ls / 48));
      st.cols = Math.ceil(W / st.cell); st.rows = Math.ceil(H / st.cell);
      st.lx = lx; st.ly = ly; st.ls = ls; st.lcx = lx + ls / 2; st.lcy = ly + ls / 2;
      /* 심볼이 그려질 오프스크린 (매 프레임 다시 그려 점 크기를 읽습니다) */
      st.off = document.createElement('canvas'); st.off.width = Math.ceil(ls); st.off.height = Math.ceil(ls);
      st.octx = st.off.getContext('2d', { willReadFrequently: true });
      var first = !st.built;
      st.cells = []; st.lcells = [];
      var m = st.cell * 2;
      for (var y = 0; y < st.rows; y++) {
        for (var x = 0; x < st.cols; x++) {
          var cx = x * st.cell + st.cell / 2, cy = y * st.cell + st.cell / 2;
          var inL = cx > lx - m && cx < lx + ls + m && cy > ly - m && cy < ly + ls + m;
          var c = { x: x, y: y, cx: cx, cy: cy, seed: hash(x, y, 11), inL: inL, ox: 0, oy: 0, vx: 0, vy: 0, wake: 0,
            diag: ((cx - lx) / ls + (cy - ly) / ls) / 2 };
          st.cells.push(c);
          if (inL) st.lcells.push(c);
        }
      }
      st.built = true;
    };
    var step = function (now, dt) {
      /* 기울기: 목표 각도로 스프링처럼 따라갑니다 */
      st.angV += ((st.angT - st.ang) * 1.2 - st.angV * 2.2) * dt; st.ang += st.angV * dt;
    };
    /* 심볼을 오프스크린에 그립니다: 1·3번째 조각 흰색(밝은 면), 2·4번째 조각 회색(어두운 면) */
    var renderMark = function (now) {
      var o = st.octx, ls = st.ls, t = (now - st.t0) / 1000;
      var flip = Math.max(0, Math.min(1, (now - st.flipFrom) / 20000));   // 사선 회전도 한 바퀴 20초
      var ease = flip <= 0 || flip >= 1 ? (flip >= 1 ? 1 : 0) : 0.5 - 0.5 * Math.cos(Math.PI * flip);
      var spin = (st.reduce ? 0.35 : t * (Math.PI * 2 / 20)) + (flip > 0 && flip < 1 ? ease * Math.PI * 2 : 0);   // 오른쪽으로 천천히 회전
      var sx = Math.cos(spin);
      st.shade = 0.35 + 0.65 * Math.abs(sx);
      o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, st.off.width, st.off.height);
      o.translate(ls / 2, ls / 2); o.rotate(st.ang * Math.PI / 180); o.scale(sx >= 0 ? Math.max(0.04, sx) : Math.min(-0.04, sx), 1);
      o.scale(ls / 108, ls / 108); o.translate(-50, -50.5);
      /* 조각마다 깊이를 달리 줘 회전 방향이 보이도록 (앞쪽 조각이 오른쪽으로 흘러갑니다) */
      var depth = Math.sin(spin);
      /* 유리 재질: 조각마다 빛 방향 그라데이션 + 가장자리 프레넬 테두리 + 회전에 따라 흐르는 반사광 + 아래쪽 굴절광 */
      var lit = 0.5 + 0.5 * Math.cos(spin - 0.6);          // 빛을 정면으로 받을수록 밝게
      var band = Math.sin(spin) * 70 + 50;                  // 반사광 위치 (회전에 따라 표면을 가로지름)
      for (var k = 0; k < P2D.length; k++) {
        var P = P2D[k], front = k % 2 === 0;
        o.save(); o.translate(depth * (k - 1.5) * 2.2 * (sx >= 0 ? 1 : -1), 0);
        var hi = front ? 0.5 + 0.25 * lit : 0.26 + 0.12 * lit, lo = front ? 0.2 : 0.1;
        var g = o.createLinearGradient(8, 4, 92, 96);
        g.addColorStop(0, 'rgba(255,255,255,' + hi.toFixed(3) + ')');
        g.addColorStop(0.55, 'rgba(255,255,255,' + lo.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,255,255,' + (lo * 1.8).toFixed(3) + ')');
        o.fillStyle = g; o.fill(P);
        o.clip(P);
        /* 프레넬: 유리 두께가 보이는 밝은 가장자리 */
        o.lineWidth = front ? 5 : 4; o.strokeStyle = 'rgba(255,255,255,' + (front ? 0.85 : 0.5) + ')'; o.stroke(P);
        o.lineWidth = 1.6; o.strokeStyle = 'rgba(255,255,255,1)'; o.stroke(P);
        /* 반사광: 비스듬한 좁은 하이라이트 띠 */
        var sg = o.createLinearGradient(band - 14, 0, band + 14, 22);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,' + (front ? 0.95 : 0.55) + ')'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        o.fillStyle = sg; o.fillRect(-20, -20, 150, 150);
        /* 굴절광: 아래쪽 안쪽에 맺히는 은은한 빛 */
        var rg = o.createRadialGradient(62, 78, 0, 62, 78, 30);
        rg.addColorStop(0, 'rgba(255,255,255,' + (front ? 0.45 : 0.25) + ')'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        o.fillStyle = rg; o.fillRect(-20, -20, 150, 150);
        o.restore();
      }
      st.odata = o.getImageData(0, 0, st.off.width, st.off.height).data;
    };
    var draw = function (now) {
      var ctx = st.ctx, cs = st.cell, t = (now - st.t0) / 1000;
      if (!st.reduce || !st.odata) renderMark(now);
      var FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      /* 심볼 칸의 0/1 (천천히 바뀝니다) */
      var bit = function (c) { return hash(c.x, c.y, Math.floor(t * 0.25 + c.seed * 9)) < 0.5 ? '0' : '1'; };
      /* 배경 칸: 흐린 0/1이 깔려 있고, 군데군데 무작위로 다양한 밝기로 깜빡입니다 */
      var mx = function (c) {
        var cyc = t * (0.5 + c.seed * 0.7) + hash(c.x, c.y, 9) * 10, n = Math.floor(cyc), f = cyc - n;
        var a = 0.065, hi = 0, ch = bit(c);
        /* 로고 주변일수록 덜 깜빡이고 더 어둡게 해 심볼이 돋보이게 */
        var ddx = c.cx - st.lcx, ddy = c.cy - st.lcy, near = Math.max(0, 1 - Math.sqrt(ddx * ddx + ddy * ddy) / (st.ls * 0.9));
        if (hash(c.x, c.y, n) < 0.022 * (1 - near * 0.85)) {
          var peak = (0.1 + hash(c.x, c.y, n + 77) * 0.45) * (1 - near * 0.7);   // 깜빡임마다 밝기가 다름
          var w = Math.sin(Math.PI * f); a = 0.065 + peak * w * w;
          hi = peak > 0.5 && w > 0.8 ? 1 : 0;
          ch = hash(c.x, c.y, n + 5) < 0.5 ? '0' : '1';
        }
        return { ch: ch, a: a, hi: hi };
      };
      var HEAD = [226, 232, 222];
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.clearRect(0, 0, st.W, st.H);
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      /* 배경: 흐린 0/1 + 무작위 깜빡임 (별도 레이어, 약 1/30초마다 갱신) */
      if (!st.bgc) st.bgc = document.createElement('canvas');
      if (st.bgc.width !== el.width || st.bgc.height !== el.height) { st.bgc.width = el.width; st.bgc.height = el.height; st.bgAt = -9999; }
      if (!(st.bgAt >= 0) || (!st.reduce && now - st.bgAt > 33)) {
        var b = st.bgc.getContext('2d');
        b.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); b.clearRect(0, 0, st.W, st.H);
        b.font = '500 ' + (cs * 0.95).toFixed(1) + 'px ' + FONT; b.textBaseline = 'middle'; b.textAlign = 'center';
        for (var j = 0; j < st.cells.length; j++) {
          var c = st.cells[j]; if (c.inL) continue;
          var g = mx(c); b.fillStyle = rgba(g.hi ? HEAD : BG, g.a); b.fillText(g.ch, c.cx, c.cy);
        }
        st.bgAt = now;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(st.bgc, 0, 0); ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      /* 심볼: 유리 표면의 밝기를 읽어 0/1의 명도·굵기로 표현 */
      var d = st.odata, ow = st.off.width, oh = st.off.height;
      var lv = [[], [], []];
      ctx.font = '500 ' + (cs * 0.95).toFixed(1) + 'px ' + FONT;
      for (var i = 0; i < st.lcells.length; i++) {
        var p = st.lcells[i];
        var px = Math.floor(p.cx - st.lx), py = Math.floor(p.cy - st.ly), al = 0;
        if (px >= 0 && py >= 0 && px < ow && py < oh) al = d[((py * ow + px) * 4) + 3] / 255;
        if (al < 0.03) { var g2 = mx(p); ctx.fillStyle = rgba(g2.hi ? HEAD : BG, g2.a); ctx.fillText(g2.ch, p.cx, p.cy); continue; }
        var v = Math.min(1, al * (0.7 + 0.3 * st.shade));
        lv[v > 0.62 ? 2 : v > 0.3 ? 1 : 0].push(p, v);
      }
      /* 밝은 부분일수록 굵고 크게 (글꼴 변경을 줄이려고 3단계로 묶어 그림) */
      var fonts = ['500 ' + (cs * 0.92).toFixed(1), '600 ' + (cs * 1.02).toFixed(1), '700 ' + (cs * 1.12).toFixed(1)];
      for (var L = 0; L < 3; L++) {
        var arr = lv[L]; if (!arr.length) continue;
        ctx.font = fonts[L] + 'px ' + FONT;
        for (var k = 0; k < arr.length; k += 2) {
          var pc = arr[k], vv = arr[k + 1];
          ctx.fillStyle = rgba(lerp(GLASS_LO, GLASS_HI, Math.pow(vv, 0.8)), 0.3 + 0.7 * vv);
          ctx.fillText(bit(pc), pc.cx, pc.cy);
        }
      }
    };
    var me = this;
    var loop = function (now) {
      if (me._ascii !== st) return;
      var dt = st.last ? Math.min(1 / 30, (now - st.last) / 1000) : 1 / 60;
      st.last = now;
      step(now, dt); draw(now);
      st.raf = requestAnimationFrame(loop);
    };
    /* 서비스 버튼에 올리면 심볼이 그쪽으로 기울며 한 바퀴 돕니다 (최단 각도로 회전) */
    var pillOf = function (e) { return e.target && e.target.closest ? e.target.closest('.h2-tags .pill') : null; };
    st.onOver = function (e) {
      var pl = pillOf(e); if (!pl || pl === st.pill) return;
      st.pill = pl;
      var r = pl.getBoundingClientRect(), mr = mark.getBoundingClientRect();
      var deg = Math.atan2((r.top + r.height / 2) - (mr.top + mr.height / 2), (r.left + r.width / 2) - (mr.left + mr.width / 2)) * 180 / Math.PI;
      var delta = ((deg - st.ang) % 360 + 540) % 360 - 180;
      var idx = Array.prototype.indexOf.call(pl.parentNode.children, pl);
      st.angT = 9 + Math.max(-40, Math.min(40, delta * 0.3)) + (idx % 2 ? -8 : 8);
      var now = performance.now(); if (now - st.flipFrom > 20000) st.flipFrom = now;
    };
    st.onOut = function (e) {
      var pl = pillOf(e); if (!pl) return;
      if (e.relatedTarget && pl.contains(e.relatedTarget)) return;
      st.pill = null; st.angT = 9;
    };
    if (!st.reduce) {
      section.addEventListener('pointerover', st.onOver);
      section.addEventListener('pointerout', st.onOut);
      section.addEventListener('focusin', st.onOver);
      section.addEventListener('focusout', st.onOut);
    }
    build();
    try { st.ro = new ResizeObserver(function () { build(); st.bgAt = -1; if (st.reduce) draw(performance.now()); }); st.ro.observe(el); st.ro.observe(mark); } catch (e) {}
    if (st.reduce) draw(performance.now());
    else {
      try {
        st.io = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) {
            if (!st.raf) { st.last = 0; st.raf = requestAnimationFrame(loop); }
          } else { cancelAnimationFrame(st.raf); st.raf = 0; st.away = true; }
        });
        st.io.observe(el);
      } catch (e) { st.raf = requestAnimationFrame(loop); }
    }
    st.wrap = section; st.mark = mark;
  },

  stopAscii() {
    var st = this._ascii;
    if (!st) return;
    try { cancelAnimationFrame(st.raf); } catch (e) {}
    try { st.ro && st.ro.disconnect(); st.io && st.io.disconnect(); } catch (e) {}
    try {
      st.wrap.removeEventListener('pointermove', st.onMove);
      st.wrap.removeEventListener('pointerleave', st.onLeave);
      st.wrap.removeEventListener('pointerdown', st.onDown);
      st.wrap.removeEventListener('pointerover', st.onOver);
      st.wrap.removeEventListener('pointerout', st.onOut);
      st.wrap.removeEventListener('focusin', st.onOver);
      st.wrap.removeEventListener('focusout', st.onOut);
      if (st.mark) st.mark.removeEventListener('pointerdown', st.onDown);
    } catch (e) {}
    this._ascii = null;
  }
  };
  if (document.getElementById('ascii-logo')) Fx.initAscii();
  if (document.querySelector('.tap-scene .tap-ascii')) Fx.initTap();
})();
