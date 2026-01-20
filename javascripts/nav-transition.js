document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-button');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      // Skip in-page toggle buttons (e.g., research page pub toggles)
      if (link.classList.contains('pub-btn')) return;
      // Ignore modifier clicks or external targets
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute('href');
      if (!href) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      document.body.classList.add('page-transition');
      // Navigate after animation; keep delay modest for snappy feel
      setTimeout(() => {
        window.location.href = url.href;
      }, 180);
    });
  });

  // Remove transition class on load/restore for consistent state
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-transition');
  });
});
