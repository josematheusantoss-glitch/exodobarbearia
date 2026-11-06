const config = window.EXODO_BOOKING_CONFIG;
const state = { step: 1, selected: new Set(), barber: null, date: '', time: '', name: '', phone: '' };
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const selectedServices = () => config.services.filter(service => state.selected.has(service.id));
const total = () => selectedServices().reduce((sum, service) => sum + (service.price ?? 0), 0);
const hasConsultation = () => selectedServices().some(service => service.price === null);
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
const localDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const today = localDate(new Date());
const content = document.querySelector('#booking-step-content');
const feedback = document.querySelector('#booking-feedback');
const next = document.querySelector('#booking-next');
const back = document.querySelector('#booking-back');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function clearDownstream(start) {
  if (start <= 2) { state.barber = null; state.date = ''; state.time = ''; }
  if (start <= 3) state.time = '';
}
function toggleService(id) {
  if (state.selected.has(id)) { state.selected.delete(id); }
  else {
    if (id === 'corte-barba') { state.selected.delete('corte'); state.selected.delete('barba'); }
    if (id === 'corte' || id === 'barba') state.selected.delete('corte-barba');
    state.selected.add(id);
  }
  clearDownstream(2); render();
}
function safeText(value) { const el = document.createElement('span'); el.textContent = value; return el.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function renderServices() {
  return `<div class="step-intro"><span>ETAPA 01 / 04</span><h3>Escolha seus serviços</h3><p>Você pode combinar serviços. Corte + Barba substitui os dois serviços separados.</p></div><div class="booking-service-grid">${config.services.map(service => `<button type="button" class="booking-service-card ${state.selected.has(service.id) ? 'selected' : ''}" data-select-service="${service.id}" aria-pressed="${state.selected.has(service.id)}"><span class="booking-service-symbol">${service.symbol}</span><span class="booking-service-name">${service.name}</span><span class="booking-service-price">${service.price === null ? 'Valor sob consulta' : money(service.price)}</span><span class="booking-check" aria-hidden="true">${state.selected.has(service.id) ? '✓' : '+'}</span></button>`).join('')}</div>`;
}
function dateOptions() {
  return Array.from({ length: 14 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() + i); return { value: localDate(date), day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), number: date.getDate() }; });
}
function renderSchedule() {
  return `<div class="step-intro"><span>ETAPA 02 / 04</span><h3>Profissional e horário</h3><p>Visualização da agenda. Os horários definitivos serão exibidos quando a agenda estiver conectada.</p></div><div class="field-title">Escolha o profissional</div><div class="barber-grid">${config.barbers.map(barber => `<button type="button" class="barber-card ${state.barber === barber.id ? 'selected' : ''}" data-barber="${barber.id}" aria-pressed="${state.barber === barber.id}">${barber.photo ? `<img src="${barber.photo}" alt="" />` : `<span class="barber-avatar" aria-hidden="true">M</span>`}<span><strong>${barber.name}</strong><small>Barbeiro Êxodo</small></span><span class="barber-radio" aria-hidden="true"></span></button>`).join('')}</div><div class="field-title">Escolha a data</div><div class="date-strip" aria-label="Próximos dias">${dateOptions().map(date => `<button type="button" class="date-pill ${state.date === date.value ? 'selected' : ''}" data-date="${date.value}" aria-pressed="${state.date === date.value}"><small>${date.day}</small><strong>${date.number}</strong></button>`).join('')}</div><label class="date-field">Ou selecione outra data <input id="booking-date-input" type="date" min="${today}" value="${state.date}" /></label><div class="field-title">Escolha o horário <small>prévia visual</small></div><div class="time-grid">${config.previewTimes.map(time => `<button type="button" class="time-pill ${state.time === time ? 'selected' : ''}" data-time="${time}" aria-pressed="${state.time === time}">${time}</button>`).join('')}</div><p class="preview-note">Os horários acima são ilustrativos e não representam disponibilidade real.</p>`;
}
function renderIdentity() {
  return `<div class="step-intro"><span>ETAPA 03 / 04</span><h3>Como podemos chamar você?</h3><p>Seus dados serão usados para identificar seu agendamento quando o sistema estiver ativo.</p></div><div class="identity-fields"><label>Nome completo<input id="booking-name" type="text" autocomplete="name" placeholder="Digite seu nome completo" value="${safeText(state.name)}" required maxlength="120" /></label><label>WhatsApp com DDD<input id="booking-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(82) 99999-9999" value="${safeText(state.phone)}" required maxlength="15" /></label></div>`;
}
function renderReview() {
  const barber = config.barbers.find(item => item.id === state.barber);
  return `<div class="step-intro"><span>ETAPA 04 / 04</span><h3>Revise os detalhes</h3><p>Confira tudo antes de enviar. Esta página ainda é uma prévia e não registra reservas.</p></div><div class="review-list"><div><span>Cliente</span><strong>${safeText(state.name)}</strong></div><div><span>Serviços</span><strong>${selectedServices().map(item => safeText(item.name)).join(', ')}</strong></div><div><span>Profissional</span><strong>${barber?.name ?? '—'}</strong></div><div><span>Data e horário</span><strong>${formatDate(state.date)}, ${state.time}</strong></div><div><span>WhatsApp</span><strong>${safeText(state.phone)}</strong></div><div><span>Valor previsto</span><strong>${money(total())}${hasConsultation() ? ' + valor sob consulta' : ''}</strong></div></div><div class="review-notice">A confirmação será ativada quando a agenda e o banco de dados estiverem configurados.</div>`;
}
function renderSummary() {
  const barber = config.barbers.find(item => item.id === state.barber);
  document.querySelector('#booking-summary-content').innerHTML = `<div class="summary-row"><span>Serviços</span><strong>${selectedServices().length ? selectedServices().map(item => item.name).join(', ') : 'Escolha seus serviços'}</strong></div><div class="summary-row"><span>Profissional</span><strong>${barber?.name ?? 'A escolher'}</strong></div><div class="summary-row"><span>Data e horário</span><strong>${state.date && state.time ? `${formatDate(state.date)}, ${state.time}` : 'A escolher'}</strong></div>`;
  document.querySelector('#booking-total').textContent = `${money(total())}${hasConsultation() ? ' + consulta' : ''}`;
}
function render() {
  content.innerHTML = [renderServices, renderSchedule, renderIdentity, renderReview][state.step - 1]();
  feedback.textContent = '';
  document.querySelectorAll('[data-step-nav]').forEach(button => { const step = Number(button.dataset.stepNav); button.classList.toggle('is-active', step === state.step); button.classList.toggle('is-done', step < state.step); button.disabled = step > state.step; button.setAttribute('aria-current', step === state.step ? 'step' : 'false'); });
  back.hidden = state.step === 1;
  next.innerHTML = state.step === 4 ? 'Confirmação indisponível <span>↗</span>' : 'Continuar agendamento <span>↗</span>';
  next.disabled = state.step === 4;
  renderSummary();
}
function goToStep(step) { state.step = step; render(); document.querySelector('#agendamento').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function validateAndContinue() {
  if (state.step === 1 && !state.selected.size) return feedback.textContent = 'Escolha pelo menos um serviço para continuar.';
  if (state.step === 2 && (!state.barber || !state.date || !state.time)) return feedback.textContent = 'Escolha profissional, data e horário para continuar.';
  if (state.step === 3) {
    state.name = document.querySelector('#booking-name').value.trim();
    state.phone = document.querySelector('#booking-phone').value.trim();
    if (state.name.split(/\s+/).length < 2) return feedback.textContent = 'Informe seu nome completo.';
    if (state.phone.replace(/\D/g, '').length < 10) return feedback.textContent = 'Informe um WhatsApp válido com DDD.';
  }
  if (state.step < 4) goToStep(state.step + 1);
}
content.addEventListener('click', event => {
  const service = event.target.closest('[data-select-service]'); if (service) return toggleService(service.dataset.selectService);
  const barber = event.target.closest('[data-barber]'); if (barber) { state.barber = barber.dataset.barber; state.time = ''; render(); return; }
  const date = event.target.closest('[data-date]'); if (date) { state.date = date.dataset.date; state.time = ''; render(); return; }
  const time = event.target.closest('[data-time]'); if (time) { state.time = time.dataset.time; render(); }
});
content.addEventListener('change', event => { if (event.target.id === 'booking-date-input') { state.date = event.target.value; state.time = ''; render(); } });
content.addEventListener('input', event => {
  if (event.target.id === 'booking-name') state.name = event.target.value;
  if (event.target.id === 'booking-phone') { const digits = event.target.value.replace(/\D/g, '').slice(0, 11); state.phone = digits.length > 6 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits; event.target.value = state.phone; }
});
next.addEventListener('click', validateAndContinue);
back.addEventListener('click', () => { if (state.step > 1) goToStep(state.step - 1); });
document.querySelectorAll('[data-step-nav]').forEach(button => button.addEventListener('click', () => { const step = Number(button.dataset.stepNav); if (step < state.step) goToStep(step); }));
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => document.querySelector('#agendamento').scrollIntoView({ behavior: 'smooth' })));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => { const id = { 'Corte de cabelo': 'corte', 'Barba': 'barba', 'Corte + barba': 'corte-barba' }[button.dataset.service]; if (id && !state.selected.has(id)) toggleService(id); goToStep(1); }));
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? '×' : '☰'; });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰'; }));
const motionOkay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOkay && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.intro, .section-top, .service-card, .space-copy, .space-gallery, .founder-photo, .founder-copy, .location-copy, .location-map, .final-cta .wrap, .reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
}
const video = document.querySelector('.hero-video');
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) { video.pause(); video.removeAttribute('autoplay'); video.style.display = 'none'; }
render();
