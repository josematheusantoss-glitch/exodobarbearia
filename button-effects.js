(() => {
  const toast = document.createElement('div');
  toast.className = 'action-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span class="action-toast-icon" aria-hidden="true"></span><span class="action-toast-copy"><strong></strong><small></small></span>';
  document.body.appendChild(toast);
  let timer;
  window.exodoToast = (title, detail = '', kind = 'success') => {
    clearTimeout(timer);
    toast.classList.remove('is-visible', 'is-complete');
    toast.querySelector('strong').textContent = title;
    toast.querySelector('small').textContent = detail;
    toast.dataset.kind = kind;
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    requestAnimationFrame(() => toast.classList.add('is-complete'));
    timer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="agendamento.html"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (link.classList.contains('is-busy')) return;
    link.classList.add('is-busy');
    link.setAttribute('aria-busy', 'true');
    window.exodoToast('Abrindo agendamento', 'Prepare sua experiência na Êxodo.', 'loading');
    setTimeout(() => { window.location.href = link.href; }, 430);
  });
})();
