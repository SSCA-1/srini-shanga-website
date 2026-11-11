(() => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const reveal = () => items.forEach((item) => {
    item.classList.add('is-visible');
    item.classList.remove('pre-reveal');
  });

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // No observer support, or the visitor prefers reduced motion: show everything now.
  if (reduceMotion || !('IntersectionObserver' in window)) { reveal(); return; }

  // Content is visible by default in CSS. Only hide it once we know we can bring it back.
  items.forEach((item) => item.classList.add('pre-reveal'));

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  items.forEach((item) => observer.observe(item));

  // Safety net: nothing stays hidden, whatever happens.
  window.setTimeout(reveal, 2500);
  window.addEventListener('load', () => window.setTimeout(reveal, 1200));
})();
