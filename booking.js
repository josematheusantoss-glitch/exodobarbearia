const config = window.EXODO_BOOKING_CONFIG;
const state = { step: 1, selected: new Set(), barber: null, date: '', time: '', name: '', phone: '', calendarMonth: new Date().getMonth(), calendarYear: new Date().getFullYear() };
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
  updateServiceSelection();
  const selected = state.selected.has(id);
  window.exodoToast?.(selected ? 'Serviço adicionado' : 'Serviço removido', selected ? 'Sua seleção foi atualizada.' : 'O total foi atualizado.', selected ? 'success' : 'neutral');
}
function renderServices() {
  return `<div class="step-intro service-step-intro"><span>ETAPA 01 / 05 · SUA EXPERIÊNCIA</span><h2>Escolha seus serviços</h2><p>Monte seu momento com liberdade. Selecione quantos desejar e acompanhe o total em tempo real.</p></div><div class="service-grid-heading"><span>MENU DE SERVIÇOS</span><span>TOQUE PARA SELECIONAR ↘</span></div><div class="booking-service-grid">${config.services.map((service, index) => `<button type="button" class="booking-service-card ${state.selected.has(service.id) ? 'selected' : ''}" data-select-service="${service.id}" aria-pressed="${state.selected.has(service.id)}"><img src="${service.image}" alt="Foto ilustrativa de ${service.name.toLowerCase()} em um homem" loading="lazy" /><span class="service-card-top"><span>${String(index + 1).padStart(2, '0')} / 07</span>${service.id === 'corte-barba' ? '<span class="service-featured-tag">A EXPERIÊNCIA COMPLETA</span>' : ''}</span><span class="booking-service-content"><span class="booking-service-name">${service.name}</span><span class="booking-service-price">${service.price === null ? 'Valor sob consulta' : money(service.price)}</span></span><span class="booking-check" aria-hidden="true">${state.selected.has(service.id) ? '✓' : '+'}</span></button>`).join('')}</div><p class="photo-note">Corte + Barba substitui os serviços separados. Fotos ilustrativas.</p><div class="service-selection-tray" id="service-selection-tray" hidden><span class="tray-icon" aria-hidden="true">✦</span><span class="tray-details"><small id="selection-count">0 serviços selecionados</small><strong id="selection-total">R$ 0,00</strong></span><button type="button" data-continue-services>Agendar agora <span aria-hidden="true">↗</span></button></div>`;
}
function updateServiceSelection() {
  content.querySelectorAll('[data-select-service]').forEach(button => {
    const selected = state.selected.has(button.dataset.selectService);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.booking-check').textContent = selected ? '✓' : '+';
  });
  const tray = document.querySelector('#service-selection-tray');
  tray.hidden = state.selected.size === 0;
  document.body.classList.toggle('has-service-selection', state.selected.size > 0);
  document.querySelector('#selection-count').textContent = `${state.selected.size} ${state.selected.size === 1 ? 'serviço selecionado' : 'serviços selecionados'}`;
  document.querySelector('#selection-total').textContent = `${money(total())}${hasConsultation() ? ' + consulta' : ''}`;
  feedback.textContent = '';
  renderSummary();
}
function renderBarbers() {
  return `<div class="step-intro"><span>ETAPA 02 / 05</span><h2>Escolha o profissional</h2><p>Selecione quem você prefere para cuidar do seu visual.</p></div><div class="barber-grid barber-grid-featured">${config.barbers.map(barber => `<button type="button" class="barber-card ${state.barber === barber.id ? 'selected' : ''}" data-barber="${barber.id}" aria-pressed="${state.barber === barber.id}">${barber.photo ? `<img src="${barber.photo}" alt="Foto de ${barber.name}" />` : `<span class="barber-avatar" aria-label="Avatar temporário de Marcelo">M</span>`}<span><strong>${barber.name}</strong><small>Profissional Êxodo</small></span><span class="barber-radio" aria-hidden="true"></span></button>`).join('')}</div><p class="preview-note">A foto do Marcelo será adicionada em breve.</p>`;
}
function renderCalendar() {
  const now = new Date();
  const first = new Date(state.calendarYear, state.calendarMonth, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();
  const monthName = first.toLocaleDateString('pt-BR', { month: 'long' });
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${state.calendarYear}`;
  const currentMonth = state.calendarYear === now.getFullYear() && state.calendarMonth === now.getMonth();
  const lastMonth = state.calendarYear === now.getFullYear() + 2 && state.calendarMonth === 11;
  const monthOptions = Array.from({ length: 12 }, (_, month) => `<option value="${month}" ${month === state.calendarMonth ? 'selected' : ''} ${state.calendarYear === now.getFullYear() && month < now.getMonth() ? 'disabled' : ''}>${new Date(2020, month, 1).toLocaleDateString('pt-BR', { month: 'long' })}</option>`).join('');
  const yearOptions = Array.from({ length: 3 }, (_, index) => now.getFullYear() + index).map(year => `<option value="${year}" ${year === state.calendarYear ? 'selected' : ''}>${year}</option>`).join('');
  const cells = Array.from({ length: offset }, () => '<span class="calendar-empty" aria-hidden="true"></span>');
  for (let day = 1; day <= days; day++) {
    const date = new Date(state.calendarYear, state.calendarMonth, day);
    const value = localDate(date);
    const selected = value === state.date;
    const past = value < today;
    cells.push(`<button type="button" class="calendar-day${selected ? ' selected' : ''}${value === today ? ' is-today' : ''}" data-date="${value}" aria-label="${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}" aria-pressed="${selected}" ${past ? 'disabled' : ''}><span>${day}</span></button>`);
  }
  return `<div class="booking-calendar" aria-label="Calendário de datas"><div class="calendar-header"><div class="calendar-caption"><small>ESCOLHA O DIA</small><strong>${monthLabel}</strong></div><div class="calendar-controls"><label class="calendar-select-label"><span class="sr-only">Mês</span><select id="calendar-month" aria-label="Selecionar mês">${monthOptions}</select></label><label class="calendar-select-label calendar-year"><span class="sr-only">Ano</span><select id="calendar-year" aria-label="Selecionar ano">${yearOptions}</select></label><div class="calendar-navigation"><button type="button" data-calendar-shift="-1" aria-label="Mês anterior" ${currentMonth ? 'disabled' : ''}>←</button><button type="button" data-calendar-shift="1" aria-label="Próximo mês" ${lastMonth ? 'disabled' : ''}>→</button></div></div></div><div class="calendar-weekdays" aria-hidden="true"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div><div class="calendar-grid">${cells.join('')}</div><div class="calendar-footer"><span class="calendar-today-dot"></span>${state.date ? `Selecionado: <strong>${formatDate(state.date)}</strong>` : 'Toque em um dia para ver os horários'}</div></div>`;
}
function renderSchedule() {
  return `<div class="step-intro"><span>ETAPA 03 / 05</span><h2>Data e horário</h2><p>Escolha quando deseja vir. Os horários abaixo são apenas uma prévia visual.</p></div>${renderCalendar()}<div class="field-title">Escolha o horário <small>prévia visual</small></div><div class="time-grid">${config.previewTimes.map(time => `<button type="button" class="time-pill ${state.time === time ? 'selected' : ''}" data-time="${time}" aria-pressed="${state.time === time}" ${state.date ? '' : 'disabled'}>${time}</button>`).join('')}</div><p class="preview-note">A disponibilidade real de cada barbeiro será conectada em uma próxima etapa.</p>`;
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
  document.querySelector('.booking-shell').classList.toggle('step-services', state.step === 1);
  document.querySelector('.booking-shell').classList.toggle('step-barber', state.step === 2);
  document.body.classList.toggle('has-service-selection', state.step === 1 && state.selected.size > 0);
  next.innerHTML = state.step === 5 ? 'Confirmação indisponível <span>↗</span>' : 'Continuar agendamento <span>↗</span>';
  next.disabled = state.step === 5;
  renderSummary();
  if (state.step === 1) updateServiceSelection();
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
  if (state.step < 5) { goToStep(state.step + 1); window.exodoToast?.('Etapa concluída', 'Continue escolhendo sua experiência.', 'success'); }
}
content.addEventListener('click', event => {
  const service = event.target.closest('[data-select-service]'); if (service) return toggleService(service.dataset.selectService);
  if (event.target.closest('[data-continue-services]')) return validateAndContinue();
  const barber = event.target.closest('[data-barber]'); if (barber) { state.barber = barber.dataset.barber; state.date = ''; state.time = ''; goToStep(3); window.exodoToast?.('Profissional selecionado', 'Escolha um dia e horário na agenda.', 'success'); return; }
  const month = event.target.closest('[data-calendar-shift]'); if (month) { shiftCalendar(Number(month.dataset.calendarShift)); return; }
  const date = event.target.closest('[data-date]'); if (date) { selectDate(date.dataset.date); return; }
  const time = event.target.closest('[data-time]'); if (time) { state.time = time.dataset.time; content.querySelectorAll('[data-time]').forEach(button => { const selected = button.dataset.time === state.time; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); }); feedback.textContent = ''; renderSummary(); }
});
function selectDate(value) {
  state.date = value; state.time = '';
  content.querySelectorAll('[data-date]').forEach(button => { const selected = button.dataset.date === value; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
  content.querySelectorAll('[data-time]').forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
  content.querySelectorAll('[data-time]').forEach(button => { button.disabled = false; });
  content.querySelector('.calendar-footer').innerHTML = `<span class="calendar-today-dot"></span>Selecionado: <strong>${formatDate(value)}</strong>`;
  feedback.textContent = '';
  renderSummary();
}
function shiftCalendar(amount) {
  const month = new Date(state.calendarYear, state.calendarMonth + amount, 1);
  state.calendarYear = month.getFullYear();
  state.calendarMonth = month.getMonth();
  content.querySelector('.booking-calendar').outerHTML = renderCalendar();
}
content.addEventListener('change', event => {
  if (event.target.id !== 'calendar-month' && event.target.id !== 'calendar-year') return;
  const year = Number(content.querySelector('#calendar-year').value);
  let month = Number(content.querySelector('#calendar-month').value);
  const now = new Date();
  if (year === now.getFullYear() && month < now.getMonth()) month = now.getMonth();
  state.calendarYear = year;
  state.calendarMonth = month;
  content.querySelector('.booking-calendar').outerHTML = renderCalendar();
});
content.addEventListener('input', event => {
  if (event.target.id === 'booking-name') state.name = event.target.value;
  if (event.target.id === 'booking-phone') { const digits = event.target.value.replace(/\D/g, '').slice(0, 11); state.phone = digits.length > 6 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits; event.target.value = state.phone; }
});
next.addEventListener('click', validateAndContinue);
back.addEventListener('click', () => { if (state.step > 1) goToStep(state.step - 1); });
document.querySelectorAll('[data-step-nav]').forEach(button => button.addEventListener('click', () => { const step = Number(button.dataset.stepNav); if (step < state.step) goToStep(step); }));
render();
