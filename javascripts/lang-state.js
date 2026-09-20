/* lang-state.js — 全站语言状态统一管理
   状态规则：URL ?lang=(zh|en) > localStorage('site-lang') > 默认 zh
   作用范围：仅子页面；主页（index.html / index-zh.html）语言由文件本身决定：
     index.html 在 <html> 上硬编码 class="lang-en"，index-zh.html 保持默认 zh。
   表现层：html.lang-en 时所有双语两行元素对调为「英文在上、中文在下」
  （样式见 styles.css 的 html.lang-en 规则集，纯 CSS 驱动、无重排闪烁）。 */
(function () {
  'use strict';

  var KEY = 'site-lang';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* 隐私模式等场景静默降级 */ }
  }

  var path = window.location.pathname.split('/').pop();
  var isHome = path === '' || path === 'index.html' || path === 'index-zh.html';

  /* ---- 子页面：head 阶段尽早确定语言，避免首帧闪烁 ---- */
  if (!isHome) {
    var lang = null;
    var match = /[?&]lang=(zh|en)\b/.exec(window.location.search);
    if (match) {
      lang = match[1];
      save(lang); /* 显式参数视为用户选择，写入记忆 */
    } else {
      lang = read() === 'en' ? 'en' : 'zh';
    }
    document.documentElement.classList.toggle('lang-en', lang === 'en');
  }

  function currentLang() {
    return document.documentElement.classList.contains('lang-en') ? 'en' : 'zh';
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* 顶部导航按钮：跳转前记录当前页面语言，保证「从哪个语言站进入，
       子页面就是哪种格式」（pub-btn 为页内锚点切换，无需记录） */
    document.querySelectorAll('header a.nav-button').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!a.classList.contains('pub-btn')) save(currentLang());
      });
    });

    /* 主页语言切换链接：跳转本身照常进行，仅记录目标语言 */
    document.querySelectorAll('header .lang-toggle a').forEach(function (a) {
      a.addEventListener('click', function () {
        save(currentLang() === 'en' ? 'zh' : 'en');
      });
    });

    /* 子页面语言切换链接：同页即时对调，不跳转 */
    document.querySelectorAll('header .lang-switch a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = a.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
        document.documentElement.classList.toggle('lang-en', target === 'en');
        save(target);
      });
    });
  });
})();
