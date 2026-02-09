(function () {
  function hasNonEmptyText(el) {
    return !!(el && el.textContent && el.textContent.trim());
  }

  function updateVisitorCounter() {
    const counter = document.querySelector('.visitor-counter');
    if (!counter) return true;

    const uvContainer = document.getElementById('busuanzi_container_site_uv');
    const pvContainer = document.getElementById('busuanzi_container_site_pv');
    const uvValue = document.getElementById('busuanzi_value_site_uv');
    const pvValue = document.getElementById('busuanzi_value_site_pv');
    const sep = counter.querySelector('.sep');

    const uvReady = hasNonEmptyText(uvValue);
    const pvReady = hasNonEmptyText(pvValue);

    if (uvReady || pvReady) {
      counter.classList.add('is-visible');
      counter.style.display = 'block';

      if (uvContainer) uvContainer.style.display = uvReady ? 'inline' : 'none';
      if (pvContainer) pvContainer.style.display = pvReady ? 'inline' : 'none';

      if (sep) {
        sep.style.display = uvReady && pvReady ? 'inline' : 'none';
      }
      return true;
    }

    return false;
  }

  function init() {
    // Hide separator by default to avoid a stray dot.
    const counter = document.querySelector('.visitor-counter');
    if (counter) {
      const sep = counter.querySelector('.sep');
      if (sep) sep.style.display = 'none';
    }

    // Poll briefly since busuanzi loads async.
    const startedAt = Date.now();
    const maxWaitMs = 15000;
    const intervalMs = 200;

    const timer = window.setInterval(function () {
      const done = updateVisitorCounter();
      if (done || Date.now() - startedAt > maxWaitMs) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    // One immediate attempt.
    updateVisitorCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
