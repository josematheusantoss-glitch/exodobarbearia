const dialog = document.querySelector('#booking');
const selection = document.querySelector('.booking-selection');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function openBooking(service) {
  selection.textContent = service ? `Serviço selecionado: ${service}` : 'Selecione um serviço acima.';
  document.querySelectorAll('[data-choice]').forEach(button => button.classList.toggle('selected', button.dataset.choice === service));
  dialog.showModal();
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => openBooking()));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.service)));
document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.choice)));
document.querySelector('.modal-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? '×' : '☰'; });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰'; }));
