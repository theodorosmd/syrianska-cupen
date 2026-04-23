// Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

// Mobile nav toggle
const menuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

// Close nav when a link is clicked
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// Form validation
const form = document.getElementById('anmalanForm');
const formSuccess = document.getElementById('formSuccess');

if (!form || !formSuccess) {
  console.error('Form elements not found in DOM');
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

// Clear error on input
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
    } else {
      const data = await response.json().catch(() => ({}));
      const msg = data.errors?.map(err => err.message).join(', ') || 'Okänt fel';
      throw new Error(msg);
    }
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert(
      'Det gick inte att skicka anmälan. Försök igen eller kontakta oss på info@syrianskariksforbundet.se'
    );
  }
});
