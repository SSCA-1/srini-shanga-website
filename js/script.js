(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const toast = document.querySelector('.toast');

  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll('[data-current-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  setHeader(); window.addEventListener('scroll', setHeader, { passive: true });

  toggle?.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', opened);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open');
  }));

  const page = document.body.dataset.page;
  const pageLinks = { home: 'index.html', services: 'services.html', industries: 'industries.html', resources: 'resources.html', careers: 'careers.html', contact: 'contact.html' };
  if (pageLinks[page]) document.querySelectorAll('.site-nav a').forEach((link) => {
    if (link.getAttribute('href') === pageLinks[page]) link.classList.add('active');
  });

  const showToast = (message) => { if (!toast) return; toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 4200); };

  // Contact form rule: a 10-digit phone number or an email address must be given (or both).
  const setupEitherRule = (form) => {
    const email = form.querySelector('input[name="email"]');
    const phone = form.querySelector('input[name="phone"]');
    if (!email || !phone) return () => true;

    // keep only digits in the phone box, at most 10
    phone.addEventListener('input', () => {
      const digits = phone.value.replace(/\D/g, '').slice(0, 10);
      if (phone.value !== digits) phone.value = digits;
      phone.setCustomValidity('');
      email.setCustomValidity('');
    });
    email.addEventListener('input', () => { email.setCustomValidity(''); phone.setCustomValidity(''); });

    return () => {
      phone.setCustomValidity('');
      email.setCustomValidity('');
      const phoneValue = phone.value.trim();
      const emailValue = email.value.trim();
      if (phoneValue === '' && emailValue === '') {
        phone.setCustomValidity('Please enter a 10-digit phone number or an email address.');
        phone.reportValidity();
        return false;
      }
      if (phoneValue !== '' && !/^[0-9]{10}$/.test(phoneValue)) {
        phone.setCustomValidity('Phone number must be exactly 10 digits.');
        phone.reportValidity();
        return false;
      }
      return true;
    };
  };

  document.querySelectorAll('form[data-ajax-form]').forEach((form) => {
    const tsField = form.querySelector('input[name="ts"]');
    if (tsField) tsField.value = String(Date.now());
    const eitherOk = form.hasAttribute('data-contact-either') ? setupEitherRule(form) : () => true;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!eitherOk()) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const submit = form.querySelector('[type="submit"]');
      const label = submit ? submit.innerHTML : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending...'; }
      try {
        const response = await fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error('Send failed');
        showToast('Thank you. Your message has been sent. We will get back to you shortly.');
        form.reset();
        if (tsField) tsField.value = String(Date.now());
        if (submit) submit.textContent = 'Sent';
      } catch (error) {
        showToast('Sorry, we could not send your message. Please email info@srinishanga.in or use WhatsApp.');
        if (submit) { submit.innerHTML = label; if (window.lucide) window.lucide.createIcons(); }
      } finally {
        if (submit) window.setTimeout(() => { submit.disabled = false; submit.innerHTML = label; if (window.lucide) window.lucide.createIcons(); }, 3000);
      }
    });
  });
})();
