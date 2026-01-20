document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('#recent-updates');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('li'));
  const pageSize = 6;
  const pageCount = Math.ceil(items.length / pageSize);
  if (pageCount <= 1) return; // nothing to paginate

  const pagination = document.querySelector('#updates-pagination');
  if (!pagination) return;

  let currentPage = 0;

  const renderPage = () => {
    items.forEach((item, index) => {
      const pageIndex = Math.floor(index / pageSize);
      item.style.display = pageIndex === currentPage ? 'list-item' : 'none';
    });

    const buttons = pagination.querySelectorAll('[data-page]');
    buttons.forEach((btn) => {
      const target = Number(btn.dataset.page);
      const isActive = target === currentPage;
      btn.disabled = isActive;
      btn.classList.toggle('active', isActive);
    });

    const prev = pagination.querySelector('[data-nav="prev"]');
    const next = pagination.querySelector('[data-nav="next"]');
    if (prev) prev.disabled = currentPage === 0;
    if (next) next.disabled = currentPage >= pageCount - 1;
  };

  const changePage = (page) => {
    const nextPage = Math.min(Math.max(page, 0), pageCount - 1);
    if (nextPage === currentPage) return;
    currentPage = nextPage;
    renderPage();
  };

  const makeButton = (label, page, attrs = {}) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'updates-page-btn';
    if (page !== null && page !== undefined) {
      btn.dataset.page = page;
      btn.addEventListener('click', () => changePage(page));
    }
    Object.entries(attrs).forEach(([key, value]) => {
      btn.setAttribute(key, value);
    });
    return btn;
  };

  const prevBtn = makeButton('Prev', null, { 'data-nav': 'prev' });
  prevBtn.addEventListener('click', () => changePage(currentPage - 1));
  pagination.appendChild(prevBtn);

  for (let p = 0; p < pageCount; p += 1) {
    const pageBtn = makeButton(String(p + 1), p, { 'aria-label': `Go to updates page ${p + 1}` });
    pagination.appendChild(pageBtn);
  }

  const nextBtn = makeButton('Next', null, { 'data-nav': 'next' });
  nextBtn.addEventListener('click', () => changePage(currentPage + 1));
  pagination.appendChild(nextBtn);

  renderPage();
});
