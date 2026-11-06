const config = window.EXODO_BOOKING_CONFIG;
const state = { step: 1, selected: new Set(), barber: null, date: '', time: '', name: '', phone: '' };
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const selectedServices = () => config.services.filter(service => state.selected.has(service.id));
const total = () => selectedServices().reduce((sum, service) => sum + (service.price ?? 0), 0);
const hasConsultation = () => selectedServices().some(service => service.price === null);
const escapeHtml = value => { const el = document.createElement('span'); el.textContent = value; return el.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };
const localDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const today = localDate(new Date());
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
const content = document.querySelector('#booking-step-content');
const feedback = document.querySelector('#booking-feedback');
const next = document.querySelector('#booking-next');
const back = document.querySelector('#booking-back');

function toggleService(id) {
  if (state.selected.has(id)) state.selected.delete(id);
  else {
    if (id === 'corte-barba') { state.selected.delete('corte'); state.selected.delete('barba'); }
    if (id === 'corte' || id === 'barba') state.selected.delete('corte-barba');
    state.selected.add(id);
  }
  state.date = ''; state.time = '';
  render();
}
function renderServices() {
  return `<div class="step-intro"><span>ETAPA 01 / 05</span><h2>Escolha seus serviços</h2><p>Selecione um ou mais. Corte + Barba substitui os serviços separados.</p></div><div class="booking-service-grid">${config.services.map(service => `<button type="button" class="booking-service-card ${state.selected.has(service.id) ? 'selected' : ''}" data-select-service="${service.id}" aria-pressed="${state.selected.has(service.id)}"><img src="${service.image}" alt="Foto ilustrativa de ${service.name.toLowerCase()} em um homem" loading="lazy" /><span class="booking-service-content"><span class="booking-service-name">${service.name}</span><span class="booking-service-price">${service.price === null ? 'Valor sob consulta' : money(service.price)}</span></span><span class="booking-check" aria-hidden="true">${state.selected.has(service.id) ? '✓' : '+'}</span></button>`).join('')}</div><p class="photo-note">Fotos ilustrativas dos serviços.</p>`;
}
function renderBarbers() {
  return `<div class="step-intro"><span>ETAPA 02 / 05</span><h2>Escolha o profissional</h2><p>Selecione quem você prefere para cuidar do seu visual.</p></div><div class="barber-grid barber-grid-featured">${config.barbers.map(barber => `<button type="button" class="barber-card ${state.barber === barber.id ? 'selected' : ''}" data-barber="${barber.id}" aria-pressed="${state.barber === barber.id}">${barber.photo ? `<img src="${barber.photo}" alt="Foto de ${barber.name}" />` : `<span class="barber-avatar" aria-label="Avatar temporário de Marcelo">M</span>`}<span><strong>${barber.name}</strong><small>Profissional Êxodo</small></span><span class="barber-radio" aria-hidden="true"></span></button>`).join('')}</div><p class="preview-note">A foto do Marcelo será adicionada em breve.</p>`;
}
function dateOptions() {
  return Array.from({ length: 14 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() + i); return { value: localDate(date), day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), number: date.getDate() }; });
}
function renderSchedule() {
  return `<div class="step-intro"><span>ETAPA 03 / 05</span><h2>Data e horário</h2><p>Escolha quando deseja vir. Os horários abaixo são apenas uma prévia visual.</p></div><div class="field-title">Escolha a data</div><div class="date-strip" aria-label="Próximos dias">${dateOptions().map(date => `<button type="button" class="date-pill ${state.date === date.value ? 'selected' : ''}" data-date="${date.value}" aria-pressed="${state.date === date.value}"><small>${date.day}</small><strong>${date.number}</strong></button>`).join('')}</div><label class="date-field">Ou selecione outra data <input id="booking-date-input" type="date" min="${today}" value="${state.date}" /></label><div class="field-title">Escolha o horário <small>prévia visual</small></div><div class="time-grid">${config.previewTimes.map(time => `<button type="button" class="time-pill ${state.time === time ? 'selected' : ''}" data-time="${time}" aria-pressed="${state.time === time}">${time}</button>`).join('')}</div><p class="preview-note">A disponibilidade real de cada barbeiro será conectada em uma próxima etapa.</p>`;
}
function renderIdentity() {
  return `<div class="step-intro"><span>ETAPA 04 / 05</span><h2>Seus dados</h2><p>Informe seu nome e WhatsApp para visualizar o resumo.</p></div><div class="identity-fields"><label>Nome completo<input id="booking-name" type="text" autocomplete="name" placeholder="Digite seu nome completo" value="${escapeHtml(state.name)}" required maxlength="120" /></label><label>WhatsApp com DDD<input id="booking-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(82) 99999-9999" value="${escapeHtml(state.phone)}" required maxlength="15" /></label></div>`;
}
function renderReview() {
  const barber = config.barbers.find(item => item.id === state.barber);
  return `<div class="step-intro"><span>ETAPA 05 / 05</span><h2>Revise os detalhes</h2><p>Confira sua escolha. Esta prévia ainda não registra reservas.</p></div><div class="review-list"><div><span>Cliente</span><strong>${escapeHtml(state.name)}</strong></div><div><span>Serviços</span><strong>${selectedServices().map(item => escapeHtml(item.name)).join(', ')}</strong></div><div><span>Profissional</span><strong>${barber?.name ?? '—'}</strong></div><div><span>Data e horário</span><strong>${formatDate(state.date)}, ${state.time}</strong></div><div><span>WhatsApp</span><strong>${escapeHtml(state.phone)}</strong></div><div><span>Valor previsto</span><strong>${money(total())}${hasConsultation() ? ' + valor sob consulta' : ''}</strong></div></div><div class="review-notice">A confirmação será ativada quando a agenda e o banco de dados estiverem configurados.</div>`;
}
function renderSummary() {
  const barber = config.barbers.find(item => item.id === state.barber);
  document.querySelector('#booking-summary-content').innerHTML = `<div class="summary-row"><span>Serviços</span><strong>${selectedServices().length ? selectedServices().map(item => item.name).join(', ') : 'Escolha seus serviços'}</strong></div><div class="summary-row"><span>Profissional</span><strong>${barber?.name ?? 'A escolher'}</strong></div><div class="summary-row"><span>Data e horário</span><strong>${state.date && state.time ? `${formatDate(state.date)}, ${state.time}` : 'A escolher'}</strong></div>`;
  document.querySelector('#booking-total').textContent = `${money(total())}${hasConsultation() ? ' + consulta' : ''}`;
}
function render() {
  content.innerHTML = [renderServices, renderBarbers, renderSchedule, renderIdentity, renderReview][state.step - 1]();
  feedback.textContent = '';
  document.querySelectorAll('[data-step-nav]').forEach(button => { const step = Number(button.dataset.stepNav); button.classList.toggle('is-active', step === state.step); button.classList.toggle('is-done', step < state.step); button.disabled = step > state.step; button.setAttribute('aria-current', step === state.step ? 'step' : 'false'); });
  back.hidden = state.step === 1;
  next.innerHTML = state.step === 5 ? 'Confirmação indisponível <span>↗</span>' : 'Continuar agendamento <span>↗</span>';
  next.disabled = state.step === 5;
  renderSummary();
}
function goToStep(step) { state.step = step; render(); document.querySelector('.booking-shell').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function validateAndContinue() {
  if (state.step === 1 && !state.selected.size) return feedback.textContent = 'Escolha pelo menos um serviço para continuar.';
  if (state.step === 2 && !state.barber) return feedback.textContent = 'Escolha um profissional para continuar.';
  if (state.step === 3 && (!state.date || !state.time)) return feedback.textContent = 'Escolha data e horário para continuar.';
  if (state.step === 4) {
    state.name = document.querySelector('#booking-name').value.trim();
    state.phone = document.querySelector('#booking-phone').value.trim();
    if (state.name.split(/\s+/).length < 2) return feedback.textContent = 'Informe seu nome completo.';
    if (state.phone.replace(/\D/g, '').length < 10) return feedback.textContent = 'Informe um WhatsApp válido com DDD.';
  }
  if (state.step < 5) goToStep(state.step + 1);
}
content.addEventListener('click', event => {
  const service = event.target.closest('[data-select-service]'); if (service) return toggleService(service.dataset.selectService);
  const barber = event.target.closest('[data-barber]'); if (barber) { state.barber = barber.dataset.barber; state.date = ''; state.time = ''; render(); return; }
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
render();
