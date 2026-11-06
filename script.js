const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = '☰';
}));
const motionOkay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOkay && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.intro, .space-copy, .space-gallery, .founder-photo, .founder-copy, .location-copy, .location-map, .final-cta .wrap').forEach(el => {
    el.classList.add('will-reveal'); observer.observe(el);
  });
}
const video = document.querySelector('.hero-video');
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) {
  video.pause(); video.removeAttribute('autoplay'); video.style.display = 'none';
}
