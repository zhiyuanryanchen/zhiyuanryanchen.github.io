/* motion.js — 界面动效统一脚本
   场景 A：二级按钮内容切换入场（委托监听，不改各页内联逻辑）
   场景 B：Abstract 手风琴 grid 折叠展开（接管 research 页旧逻辑）
   场景 D：滚动入场（IntersectionObserver，首屏元素跳过） */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 场景 A：切换内容入场 ---------- */
  function animateSection(targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;
    el.classList.remove('section-enter');
    void el.offsetWidth; /* 强制 reflow 以重启动画 */
    el.classList.add('section-enter');
    el.addEventListener('animationend', function handler() {
      el.classList.remove('section-enter');
      el.removeEventListener('animationend', handler);
    });
  }

  /* ---------- 场景 B：手风琴 ---------- */
  /* 初始化：把每个 panel 的内容包进 .acc-wrap > .acc-inner，
     grid-template-rows 0fr -> 1fr 实现高度自适应的折叠动画 */
  function prepareAccordions() {
    var panels = document.querySelectorAll('div.panel');
    Array.prototype.forEach.call(panels, function (panel) {
      if (panel.querySelector(':scope > .acc-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'acc-wrap';
      var inner = document.createElement('div');
      inner.className = 'acc-inner';
      while (panel.firstChild) inner.appendChild(panel.firstChild);
      wrap.appendChild(inner);
      panel.appendChild(wrap);
      if (panel.classList.contains('show')) wrap.classList.add('open');
    });
  }

  function toggleAccordion(btn) {
    var host = btn.parentElement;
    if (!host) return;
    var panel = host.nextElementSibling;
    if (!panel || !panel.classList.contains('panel')) return;
    var wrap = panel.querySelector(':scope > .acc-wrap');

    btn.classList.toggle('active');
    var willShow = !panel.classList.contains('show');

    if (willShow) {
      panel.classList.add('show');
      if (wrap) {
        /* 双 rAF 确保先完成 display 切换，再播放展开过渡 */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { wrap.classList.add('open'); });
        });
      }
    } else if (wrap) {
      wrap.classList.remove('open');
      var settled = false;
      var finish = function () {
        if (settled) return;
        settled = true;
        wrap.removeEventListener('transitionend', onEnd);
        if (!wrap.classList.contains('open')) panel.classList.remove('show');
      };
      var onEnd = function (e) {
        if (e.target === wrap && e.propertyName !== 'grid-template-rows') return;
        finish();
      };
      wrap.addEventListener('transitionend', onEnd);
      setTimeout(finish, 320); /* 兜底：transitionend 未触发时收起 */
    } else {
      panel.classList.remove('show');
    }
  }

  /* ---------- 场景 D：滚动入场 ---------- */
  var REVEAL_SELECTOR = '.paper-item, .handout-card, .scheduled-updates, ' +
    '.updates-list li, .lecture-card, .resource-list li, .event-list li, ' +
    '.course-item, #ug > li, #grad > li';

  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var candidates = document.querySelectorAll(REVEAL_SELECTOR);
    var targets = [];

    Array.prototype.forEach.call(candidates, function (el) {
      var rect = el.getBoundingClientRect();
      var isHidden = rect.width === 0 && rect.height === 0;
      /* 首屏可见元素不做滚动入场（页面入场动画已覆盖） */
      if (!isHidden && rect.top < vh && rect.bottom > 0) return;
      el.classList.add('reveal');
      targets.push(el);
    });

    if (!targets.length) return;
    var observer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        /* 同批元素 50ms 递进，300ms 封顶 */
        el.style.setProperty('--reveal-delay',
          Math.min(batch * 50, 300) + 'ms');
        el.classList.add('is-visible');
        batch += 1;
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 事件委托 ---------- */
  function onDocClick(e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var accBtn = target.closest('button.accordion');
    if (accBtn) {
      toggleAccordion(accBtn);
      return;
    }

    var toggle = target.closest('.pub-btn, .sub-link, .pub-subbtn');
    if (toggle && toggle.getAttribute('data-target') && !reduceMotion) {
      /* 各页内联脚本先行切换 display，此处为新区块补入场动画 */
      animateSection(toggle.getAttribute('data-target'));
    }
  }

  function init() {
    prepareAccordions();
    setupReveal();
    document.addEventListener('click', onDocClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
