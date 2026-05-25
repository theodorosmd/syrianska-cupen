// ===== MOBILE NAV =====
const menuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// ===== COUNTDOWN =====
const TARGET_DATE = new Date('2026-06-27T08:00:00+02:00');

function updateCountdown() {
  const diff = TARGET_DATE - Date.now();
  const el = document.getElementById('countdown');
  if (!el) return;

  if (diff <= 0) {
    el.remove();
    return;
  }

  const pad = n => String(Math.floor(n)).padStart(2, '0');
  const days  = diff / 86400000;
  const hours = (diff % 86400000) / 3600000;
  const mins  = (diff % 3600000) / 60000;
  const secs  = (diff % 60000) / 1000;

  const cd = document.getElementById('cd-days');
  const ch = document.getElementById('cd-hours');
  const cm = document.getElementById('cd-mins');
  const cs = document.getElementById('cd-secs');
  if (cd) cd.textContent = pad(days);
  if (ch) ch.textContent = pad(hours);
  if (cm) cm.textContent = pad(mins);
  if (cs) cs.textContent = pad(secs);
}

if (document.getElementById('countdown')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ===== STICKY CTA =====
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');
const anmalanSection = document.getElementById('anmalan');

if (stickyCta && heroSection) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === heroSection) {
        const hidden = entry.isIntersecting;
        stickyCta.classList.toggle('hidden', hidden);
        stickyCta.setAttribute('aria-hidden', String(hidden));
      }
      if (entry.target === anmalanSection && entry.isIntersecting) {
        stickyCta.classList.add('hidden');
        stickyCta.setAttribute('aria-hidden', 'true');
      }
    });
  }, { threshold: 0.1 });

  observer.observe(heroSection);
  if (anmalanSection) observer.observe(anmalanSection);
}
