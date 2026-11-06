// Ajuste aqui duração e agenda quando esses dados forem definidos pela barbearia.
// A prévia não consulta uma agenda real nem registra reservas.
window.EXODO_BOOKING_CONFIG = {
  services: [
    { id: 'barba', image: 'assets/services/barba.jpg', name: 'Barba', price: 25, durationMinutes: 30, symbol: '⌁' },
    { id: 'corte', image: 'assets/services/corte.jpg', name: 'Corte', price: 30, durationMinutes: 40, symbol: '✂' },
    { id: 'corte-barba', image: 'assets/services/corte-barba.jpg', name: 'Corte + Barba', price: 50, durationMinutes: 70, symbol: 'Ê' },
    { id: 'limpeza-pele', image: 'assets/services/limpeza-pele.jpg', name: 'Limpeza de pele', price: 20, durationMinutes: 25, symbol: '✧' },
    { id: 'pezinho', image: 'assets/services/pezinho.jpg', name: 'Pezinho', price: 10, durationMinutes: 15, symbol: '⌁' },
    { id: 'selagem', image: 'assets/services/selagem.jpg', name: 'Selagem', price: null, durationMinutes: 90, symbol: '◈' },
    { id: 'social', image: 'assets/services/social.jpg', name: 'Social', price: 25, durationMinutes: 35, symbol: '✂' }
  ],
  barbers: [
    { id: 'marcelo', name: 'Marcelo', photo: null },
    { id: 'pedro', name: 'Pedro', photo: 'pedrooliveira-ceo-exodo.jpeg' }
  ],
  // Horários ilustrativos para a interface. Substituir pela disponibilidade real antes de ativar reservas.
  previewTimes: ['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15']
};
