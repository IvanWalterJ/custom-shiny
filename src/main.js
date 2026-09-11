import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lenis Smooth Scroll Engine
  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.2
  });

  lenisInstance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        closeMobileDrawer();
        lenisInstance.scrollTo(target, { offset: -70 });
      }
    });
  });

  // 2. Interactive Video Hero Player
  setupHeroVideo();

  // 3. Modal & Checkout Management (with Lenis freeze)
  setupModalSystem();

  // 4. Mobile Drawer Menu
  setupMobileDrawer();

  // 5. FAQ Accordion
  setupFaqAccordion();

  // 6. Hero Entrance & Scroll Animations
  setupHeroEntrance();
  setupSectionHeadingsReveal();
  setupCountUpCounters();
  setupScrollAnimations();
  setupStudioGallery();

  // 7. Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ==========================================================================
   2. HERO VIDEO CONTROLS & SOUND RAMP
   ========================================================================== */
function setupHeroVideo() {
  const video = document.getElementById('hero-video');
  const soundBtn = document.getElementById('btn-video-sound');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const playBtn = document.getElementById('btn-video-play-pause');
  const playIcon = document.getElementById('play-pause-icon');
  const prompt = document.getElementById('video-click-prompt');
  const progressBar = document.getElementById('video-progress-bar');
  const playerFrame = document.querySelector('.video-player-frame');

  if (!video) return;

  let isMuted = true;
  let hasStartedFromBeginning = false;

  const speakerMutedSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
  const speakerActiveSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  const playSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#00FF66"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  const pauseSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#00FF66"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`;

  function playFromBeginning() {
    video.currentTime = 0;
    video.muted = false;
    video.volume = 0;
    video.play();
    gsap.to(video, {
      volume: 0.9,
      duration: 0.8,
      ease: 'power2.out'
    });
    isMuted = false;
    hasStartedFromBeginning = true;
    if (soundIcon) soundIcon.innerHTML = speakerActiveSVG;
    if (soundLabel) soundLabel.textContent = 'Silenciar';
    if (playIcon) playIcon.innerHTML = pauseSVG;
    if (prompt) prompt.classList.add('is-hidden');
  }

  function toggleAudio() {
    if (!hasStartedFromBeginning) {
      playFromBeginning();
      return;
    }

    if (isMuted) {
      video.muted = false;
      video.volume = 0;
      gsap.to(video, {
        volume: 0.9,
        duration: 0.6,
        ease: 'power2.out'
      });
      isMuted = false;
      if (soundIcon) soundIcon.innerHTML = speakerActiveSVG;
      if (soundLabel) soundLabel.textContent = 'Silenciar';
    } else {
      gsap.to(video, {
        volume: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          video.muted = true;
          isMuted = true;
          if (soundIcon) soundIcon.innerHTML = speakerMutedSVG;
          if (soundLabel) soundLabel.textContent = 'Escuchar con Audio';
        }
      });
    }
  }

  function togglePlay() {
    if (!hasStartedFromBeginning) {
      playFromBeginning();
      return;
    }

    if (video.paused) {
      video.play();
      if (playIcon) playIcon.innerHTML = pauseSVG;
      if (prompt) prompt.classList.add('is-hidden');
    } else {
      video.pause();
      if (playIcon) playIcon.innerHTML = playSVG;
    }
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  if (playerFrame) {
    playerFrame.addEventListener('click', () => {
      if (!hasStartedFromBeginning) {
        playFromBeginning();
      } else {
        if (isMuted) {
          toggleAudio();
        } else {
          togglePlay();
        }
      }
    });
  }

  video.addEventListener('timeupdate', () => {
    if (progressBar && video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      progressBar.style.width = pct + '%';
    }
  });

  video.play().catch(() => {});
}

/* ==========================================================================
   3. MODAL & CHECKOUT MANAGEMENT (WITH LENIS FREEZE)
   ========================================================================== */
function setupModalSystem() {
  const modal = document.getElementById('reservation-modal');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const copyAliasBtn = document.getElementById('btn-copy-alias');

  function openModal() {
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenisInstance) lenisInstance.stop();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenisInstance) lenisInstance.start();
    }
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openModal));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const dialog = modal.querySelector('.modal-dialog');
    if (dialog) {
      dialog.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (copyAliasBtn) {
    copyAliasBtn.addEventListener('click', () => {
      const alias = document.getElementById('alias-text')?.textContent || 'CUSTOM.SHINY.MP';
      navigator.clipboard.writeText(alias).then(() => {
        const origText = copyAliasBtn.textContent;
        copyAliasBtn.textContent = '¡Copiado!';
        copyAliasBtn.style.background = 'var(--lime)';
        copyAliasBtn.style.color = '#000';
        setTimeout(() => {
          copyAliasBtn.textContent = origText;
          copyAliasBtn.style.background = '';
          copyAliasBtn.style.color = '';
        }, 2000);
      });
    });
  }
}

/* ==========================================================================
   4. MOBILE DRAWER MENU
   ========================================================================== */
function setupMobileDrawer() {
  const burger = document.getElementById('menu-burger');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');

  function openDrawer() {
    drawer?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lenisInstance) lenisInstance.stop();
  }

  function closeDrawer() {
    drawer?.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lenisInstance) lenisInstance.start();
  }

  burger?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  window.closeMobileDrawer = closeDrawer;
}

function closeMobileDrawer() {
  if (window.closeMobileDrawer) window.closeMobileDrawer();
}

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function setupFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach((i) => i.classList.remove('is-open'));
      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });
}

/* ==========================================================================
   6. ANIMATIONS: HERO ENTRANCE, HEADINGS REVEAL & COUNT-UP COUNTERS
   ========================================================================== */
function setupHeroEntrance() {
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.header-nav', { opacity: 0, y: -20, duration: 1.0 })
    .from('.hero-badge-wrap', { opacity: 0, y: 25, duration: 1.2 }, '-=0.7')
    .from('.hero-main-title .title-sub-label', { opacity: 0, y: 25, duration: 1.2 }, '-=0.9')
    .from('.hero-main-title .title-line-huge', { opacity: 0, y: 35, duration: 1.4 }, '-=1.0')
    .from('.hero-lead-text', { opacity: 0, y: 25, duration: 1.2 }, '-=1.0')
    .from('.hero-stats-row .stat-pill', { opacity: 0, y: 20, stagger: 0.1, duration: 1.0 }, '-=0.8')
    .from('.hero-cta-group', { opacity: 0, y: 20, duration: 1.0 }, '-=0.8')
    .from('.hero-col-video', { opacity: 0, scale: 0.96, y: 30, duration: 1.4 }, '-=1.1');
}

function setupSectionHeadingsReveal() {
  const headings = document.querySelectorAll('.section-tag, .section-title, .section-subtitle, .audience-title, .pricing-title, .final-cta-title');
  headings.forEach((heading) => {
    gsap.fromTo(
      heading,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

function setupCountUpCounters() {
  const statsStrip = document.getElementById('stats-strip');
  if (!statsStrip) return;

  ScrollTrigger.create({
    trigger: statsStrip,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      // 1. +13 Años
      const el1 = document.getElementById('stat-num-1');
      if (el1) {
        gsap.to({ val: 0 }, {
          val: 13,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () {
            el1.textContent = '+' + Math.round(this.targets()[0].val);
          }
        });
      }

      // 2. 20 Horas
      const el2 = document.getElementById('stat-num-2');
      if (el2) {
        gsap.to({ val: 0 }, {
          val: 20,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate: function () {
            el2.textContent = Math.round(this.targets()[0].val);
          }
        });
      }

      // 3. 07 Modulos
      const el3 = document.getElementById('stat-num-3');
      if (el3) {
        gsap.to({ val: 0 }, {
          val: 7,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () {
            const v = Math.round(this.targets()[0].val);
            el3.textContent = v < 10 ? '0' + v : v;
          }
        });
      }

      // 4. 100% Practico
      const el4 = document.getElementById('stat-num-4');
      if (el4) {
        gsap.to({ val: 0 }, {
          val: 100,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: function () {
            el4.textContent = Math.round(this.targets()[0].val) + '%';
          }
        });
      }
    }
  });
}

function setupScrollAnimations() {
  const cards = document.querySelectorAll('.module-card, .bento-card, .audience-card, .gallery-item');
  cards.forEach((card, idx) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: (idx % 3) * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}


/* ==========================================================================
   STUDIO GALLERY CAROUSEL (LA COCHERA ARCHITECTURE)
   ========================================================================== */
function setupStudioGallery() {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const thumbs = [...gallery.querySelectorAll('[data-gallery-target]')];
  const current = gallery.querySelector('[data-gallery-current]');
  const bar = gallery.querySelector('[data-gallery-bar]');
  let active = 0;

  const pad = (value) => String(value + 1).padStart(2, '0');

  const update = (next) => {
    active = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (index === active) {
        slide.classList.add('is-active');
      } else if (index === (active - 1 + slides.length) % slides.length) {
        slide.classList.add('is-prev');
      } else if (index === (active + 1) % slides.length) {
        slide.classList.add('is-next');
      }
    });

    thumbs.forEach((thumb, index) => {
      const isActive = index === active;
      thumb.classList.toggle('is-active', isActive);
      if (isActive) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    if (current) current.textContent = pad(active);
    if (bar) bar.style.width = `${((active + 1) / slides.length) * 100}%`;
  };

  gallery.querySelector('.gallery-prev')?.addEventListener('click', () => update(active - 1));
  gallery.querySelector('.gallery-next')?.addEventListener('click', () => update(active + 1));

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => update(Number(thumb.dataset.galleryTarget)));
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (index !== active) update(index);
    });
  });

  const stage = gallery.querySelector('.gallery-stage');
  let touchStartX = 0;
  let touchEndX = 0;

  stage?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) update(active + 1);
      else update(active - 1);
    }
  }, { passive: true });

  stage?.addEventListener('mousemove', (event) => {
    const rect = stage.getBoundingClientRect();
    gallery.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    gallery.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });

  update(0);
}
