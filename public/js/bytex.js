/* ============================================
   BYTEX IA — Main JS (Animations & Interactions)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Sound Effects (Web Audio API) ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  window.playTick = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Soft "Bubble" Pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
    
    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  };

  document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }, { once: true });

  // Bind sound to all interactive elements
  const interactives = document.querySelectorAll('.btn, .nav-links a, .glass-card, .service-list-item, .techstack-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', window.playTick);
  });

  // --- Scroll Reveal with IntersectionObserver ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Sticky Nav ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
        }
      }
    });
  });

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const duration = 2000;
        const start = Date.now();

        function update() {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(target * eased);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        update();
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // --- Parallax on Mouse (Hero badges) ---
  const heroBadges = document.querySelectorAll('.hero-badge');
  if (heroBadges.length > 0) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroBadges.forEach((badge, i) => {
        const factor = (i + 1) * 0.3;
        badge.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  // --- Mobile Menu Toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // --- Glass Card Mouse Glow ---
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- Timeline Scroll Animation ---
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the timeline is from the center of the screen
      if (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2) {
        let progress = (windowHeight * 0.8 - rect.top) / (rect.height);
        progress = Math.max(0, Math.min(1, progress));
        timeline.style.setProperty('--scroll-line', `${progress * 100}%`);
      }
    });
  }

});
