// Intersection Observer for scroll animations
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.section-header, .mission-card, .stat-item, .step-card, .testimonial-card').forEach(el => {
  observer.observe(el);
});

// Counter animation for stats
const animateCounter = (element, target) => {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.ceil(current);
    }
  }, 30);
};

// Stats counter observer
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      const counter = entry.target.querySelector('[data-target]');
      if (counter) {
        entry.target.classList.add('counted');
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(item => statsObserver.observe(item));

// Smooth scroll for buttons
document.querySelectorAll('button, a[href^="#"]').forEach(el => {
  el.addEventListener('click', (e) => {
    const href = el.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
