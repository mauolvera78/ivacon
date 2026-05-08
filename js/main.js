/**
 * IVACON — Seguridad Privada
 * Main JavaScript — Pure vanilla, no dependencies
 */

'use strict';

/* =============================================
   1. HEADER — Sticky + scroll behavior
   ============================================= */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  function updateHeader() {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();


/* =============================================
   2. MOBILE MENU TOGGLE
   ============================================= */
(function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-main');
  if (!toggle || !nav) return;

  function closeMobileMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    nav.querySelectorAll('.has-dropdown').forEach(item => item.classList.remove('mobile-open'));
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) {
      nav.querySelectorAll('.has-dropdown').forEach(item => item.classList.remove('mobile-open'));
    }
  });

  // Mobile dropdown toggle
  nav.querySelectorAll('.has-dropdown').forEach(item => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('mobile-open');
      }
    });
  });

  // Close on nav link click (skip dropdown triggers on mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && link.classList.contains('nav-dropdown-trigger')) return;
      closeMobileMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
})();


/* =============================================
   3. SMOOTH SCROLL for anchor links
   ============================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* =============================================
   4. SCROLL REVEAL (Intersection Observer)
   ============================================= */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = parseInt(el.dataset.delay) || 0;

      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);

      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
})();


/* =============================================
   5. HERO — Canvas particle network
   ============================================= */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const COUNT = window.innerWidth < 768 ? 28 : 52;
  const LINK_DIST = 130;
  const MOUSE_REPEL = 110;
  let W, H, rafId;
  let mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  // Create particles
  const pts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * (W || window.innerWidth),
    y: Math.random() * (H || window.innerHeight),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.4 + 0.6,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    for (const p of pts) {
      // Gentle mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.6;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    }

    // Draw connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(158,135,0,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,175,40,0.28)';
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouse.x = -999;
      mouse.y = -999;
    });
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();

  window.addEventListener('unload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
})();


/* =============================================
   6. COUNTER ANIMATION
   ============================================= */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 3200;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* =============================================
   7. HERO — Live clock & hero-time display
   ============================================= */
(function initHeroClock() {
  const el = document.getElementById('hero-time');
  if (!el) return;

  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  tick();
  const id = setInterval(tick, 1000);
  window.addEventListener('unload', () => clearInterval(id));
})();


/* =============================================
   8. HERO H1 — Rotating word
   ============================================= */
(function initRotatingWord() {
  const el = document.getElementById('h1-rotate');
  if (!el) return;

  const words = ['empresarial', 'industrias', 'corporativas', 'residencial', 'hospitalaria', 'construcciones', 'eventos'];
  let idx = 0;

  function rotate() {
    idx = (idx + 1) % words.length;

    el.classList.add('h1-word-out');

    setTimeout(() => {
      el.textContent = words[idx];
      el.classList.remove('h1-word-out');
      el.classList.add('h1-word-in');
      setTimeout(() => el.classList.remove('h1-word-in'), 460);
    }, 360);
  }

  setInterval(rotate, 2500);
})();


/* =============================================
   9. HERO RIGHT — Mouse parallax on tiger
   ============================================= */
(function initHeroParallax() {
  const hero  = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const panel = document.getElementById('hero-right');
  if (!panel) return;

  let targetX = 0, targetY = 0, targetRX = 0, targetRY = 0;
  let pX = 0, pY = 0, rX = 0, rY = 0;
  let rafId = null;

  hero.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1100) return;
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    targetX  =  nx * 18;  targetY  =  ny * 10;
    targetRX = -ny *  4;  targetRY =  nx *  5;
  });
  hero.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0; targetRX = 0; targetRY = 0;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    pX = lerp(pX, targetX,  0.06);
    pY = lerp(pY, targetY,  0.06);
    rX = lerp(rX, targetRX, 0.055);
    rY = lerp(rY, targetRY, 0.055);
    panel.style.transform =
      `perspective(900px) translateY(-50%) translate(${pX}px,${pY}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
    rafId = requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  window.addEventListener('unload', () => { if (rafId) cancelAnimationFrame(rafId); });
})();


/* =============================================
   9. HERO — Video scroll parallax
   ============================================= */
(function initHeroVideoParallax() {
  const vbg = document.getElementById('hero-vbg');
  if (!vbg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STRENGTH = 0.3; // fraction of scrollY to offset (0.3 = 30% speed)
  let ticking = false;

  function update() {
    const y = window.scrollY;
    // Only apply while hero is partially visible
    if (y < window.innerHeight) {
      vbg.style.transform = `translateY(${y * STRENGTH}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();


/* =============================================
   10. CONTACT FORM — Validation & Submit
   ============================================= */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit');
  if (!form || !submitBtn) return;

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (!field || !error) return;
    field.classList.add('error');
    error.textContent = message;
    error.classList.add('visible');
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (!field || !error) return;
    field.classList.remove('error');
    error.classList.remove('visible');
  }

  function validateForm() {
    let valid = true;

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();

    clearError('nombre');
    clearError('email');

    if (!nombre || nombre.length < 2) {
      showError('nombre', 'Ingresa tu nombre completo');
      valid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Ingresa un correo electrónico válido');
      valid = false;
    }

    return valid;
  }

  // Clear errors on input
  ['nombre', 'email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate async submit
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1800));

    submitBtn.classList.remove('loading');
    submitBtn.classList.add('success');

    // Reset after delay
    setTimeout(() => {
      form.reset();
      submitBtn.classList.remove('success');
      submitBtn.disabled = false;
    }, 4000);
  });
})();


/* =============================================
   10. BACK TO TOP BUTTON
   ============================================= */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* =============================================
   11. ACTIVE NAV LINK on scroll
   ============================================= */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const headerH = 100;

  function updateActiveLink() {
    const scrollY = window.scrollY + headerH + 60;

    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.style.color = 'var(--gold-light)';
      } else {
        link.style.color = '';
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* =============================================
   12. MARQUEE — Pause on hover
   ============================================= */
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  const strip = track.closest('.marquee-strip');
  if (!strip) return;

  strip.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  strip.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
})();


/* =============================================
   13. SERVICE CARD — directional hover effect
   ============================================= */
(function initServiceHover() {
  const serviceRows = document.querySelectorAll('.service-row');

  serviceRows.forEach(row => {
    const imgWrap = row.querySelector('.service-img-wrap');
    if (!imgWrap) return;

    imgWrap.addEventListener('mousemove', (e) => {
      const rect = imgWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      imgWrap.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
      imgWrap.style.transition = 'transform 0.15s ease-out';
    });

    imgWrap.addEventListener('mouseleave', () => {
      imgWrap.style.transform = '';
      imgWrap.style.transition = 'transform 0.4s ease-out';
    });
  });
})();
