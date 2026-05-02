// Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

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

// ===== TOAST =====
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast${type ? ' ' + type : ''} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 6000);
}

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

// ===== FORM VALIDATION =====
const form = document.getElementById('anmalanForm');
const formSuccess = document.getElementById('formSuccess');

if (!form || !formSuccess) {
  console.error('[Syrianska Cupen] Form elements not found');
}

const required = {
  forening:    { el: null, msg: 'Vänligen ange föreningens namn.' },
  aldersklass: { el: null, msg: 'Vänligen välj åldersklass.' },
  kontakt:     { el: null, msg: 'Vänligen ange kontaktpersonens namn.' },
  epost:       { el: null, msg: 'Vänligen ange en giltig e-postadress.' },
  telefon:     { el: null, msg: 'Vänligen ange ett telefonnummer.' },
};

Object.keys(required).forEach(id => {
  required[id].el = document.getElementById(id);
});

function validateEmail(v) {
  const input = document.getElementById('epost');
  return input ? input.checkValidity() : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Swedish phone: 07X-XXX XX XX, 070XXXXXXX, +46XXXXXXXXX, 46XXXXXXXXX
function validatePhone(v) {
  return /^(\+46|46|0)[0-9\s\-]{6,13}$/.test(v.trim());
}

function setError(id, show) {
  const group = document.getElementById(`group-${id}`);
  const input = required[id].el;
  if (!group || !input) return;
  group.classList.toggle('has-error', show);
  input.classList.toggle('error', show);
  input.setAttribute('aria-invalid', String(show));
}

function validateField(id) {
  const input = required[id].el;
  if (!input) return true;
  const val = input.value.trim();
  if (!val) { setError(id, true); return false; }
  if (id === 'epost' && !validateEmail(val)) { setError(id, true); return false; }
  if (id === 'telefon' && !validatePhone(val)) { setError(id, true); return false; }
  setError(id, false);
  return true;
}

Object.keys(required).forEach(id => {
  required[id].el?.addEventListener('input', () => {
    if (required[id].el.classList.contains('error')) validateField(id);
  });
});

form?.addEventListener('submit', async e => {
  e.preventDefault();
  const valid = Object.keys(required).map(id => validateField(id)).every(Boolean);
  if (!valid) {
    const firstError = form.querySelector('.error');
    firstError?.focus();
    return;
  }

  const submitBtn = form.querySelector('.form-submit');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.textContent = 'Skickar…';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      form.style.display = 'none';
      formSuccess.style.display = 'block';
      formSuccess.focus();
      window.scrollTo({ top: formSuccess.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    } else {
      const data = await response.json().catch(() => ({}));
      const msg = data.errors?.map(err => err.message).join(', ') || 'Okänt fel';
      throw new Error(msg);
    }
  } catch {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = originalText;
    showToast(
      'Det gick inte att skicka anmälan. Försök igen eller kontakta oss på info@syrianskariksforbundet.se',
      'error'
    );
  }
});
