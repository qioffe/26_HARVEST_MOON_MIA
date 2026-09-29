/* =========================================================
   2026 CHINESE CULTURE FESTIVAL – HARVEST MOON CELEBRATION
   High-Performance 60/120 FPS Interactive Engine
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------
     1. HIGH-PERFORMANCE 3D PERSPECTIVE & SCROLL ANIMATION ENGINE
     ------------------------------------------------------------- */
  const heroTrack = document.getElementById('heroScrollTrack');
  const heroSection = document.getElementById('heroSection');
  const titleEl = document.getElementById('heroTitleWrapper');

  // Cached layout metrics to eliminate getBoundingClientRect() reflows
  let winW = window.innerWidth;
  let winH = window.innerHeight;
  let heroScrollDistance = heroTrack ? Math.max(1, heroTrack.offsetHeight - winH) : winH;

  let resizeRafId = null;
  function updateMetrics() {
    if (resizeRafId) return;
    resizeRafId = requestAnimationFrame(() => {
      winW = window.innerWidth;
      winH = window.innerHeight;
      if (heroTrack) {
        heroScrollDistance = Math.max(1, heroTrack.offsetHeight - winH);
      }
      resizeDustCanvas();
      resizeRafId = null;
    });
  }

  window.addEventListener('resize', updateMetrics, { passive: true });

  // Scroll Tracking & Direction-Aware Asymmetric Auto-Snap
  let targetScrollY = window.scrollY || window.pageYOffset || 0;
  let currentScrollY = targetScrollY;
  let lastScrollY = targetScrollY;
  let scrollDeltaY = 0;
  let animProgress = 0;
  let targetProgress = 0;

  let isHeroVisible = true;
  let isRafRunning = false;
  let lastPStr = '';
  let lastPointerEvents = '';
  let lastSnappingState = false;

  /* -------------------------------------------------------------
     2. FAST OPTIMIZED GOLDEN DUST PARTICLES (Canvas Sim)
     ------------------------------------------------------------- */
  const canvas = document.getElementById('ambientDustCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;
  const particles = [];
  const PARTICLE_COUNT = 28; // Optimal balance for ethereal atmosphere and 120 FPS mobile GPU efficiency

  function resizeDustCanvas() {
    if (!canvas || !heroSection) return;
    const w = heroSection.clientWidth;
    const h = heroSection.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  resizeDustCanvas();

  class StardustParticle {
    constructor() {
      this.reset(true);
    }
    reset(randomY = false) {
      if (!canvas) return;
      this.x = Math.random() * canvas.width;
      this.y = randomY ? Math.random() * canvas.height : canvas.height + 15;
      this.size = Math.random() * 1.8 + 0.8;
      this.speedY = -(Math.random() * 0.45 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.55 + 0.25;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(t + this.phase) * 0.15;
      this.phase += this.pulseSpeed;
      if (this.y < -15 || this.x < -15 || (canvas && this.x > canvas.width + 15)) {
        this.reset(false);
      }
    }
    draw() {
      if (!ctx) return;
      const alpha = Math.max(0, this.opacity * (0.65 + 0.35 * Math.sin(this.phase)));
      ctx.fillStyle = `rgba(254, 238, 195, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (canvas && ctx) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new StardustParticle());
    }
  }

  /* -------------------------------------------------------------
     3. LIFECYCLE-AWARE 60/120 FPS RAF ENGINE
     ------------------------------------------------------------- */
  let time = 0;

  function render3D() {
    if (!isHeroVisible) {
      isRafRunning = false;
      return;
    }

    time += 0.022;

    // Smooth sub-pixel lerp for scroll position
    const diff = targetScrollY - currentScrollY;
    if (Math.abs(diff) < 0.15) {
      currentScrollY = targetScrollY;
    } else {
      currentScrollY += diff * 0.20;
    }

    // Direct mapping to hero scroll progress (0.0 at top to 1.0 when hero track is completed)
    const rawProgress = Math.max(0, Math.min(1.0, currentScrollY / heroScrollDistance));
    
    // Direction-aware Asymmetric Auto-Snap & Forward Progress:
    if (currentScrollY <= 15) {
      targetProgress = 0.0;
    } else if (scrollDeltaY < -4 && currentScrollY < heroScrollDistance * 0.6) {
      targetProgress = 0.0;
    } else {
      targetProgress = rawProgress;
    }

    // Continuous LERP eliminates mid-scroll jumps and thread conflicts
    animProgress += (targetProgress - animProgress) * 0.18;
    if (Math.abs(targetProgress - animProgress) < 0.0004) {
      animProgress = targetProgress;
    }
    const p = animProgress;
    const pStr = p.toFixed(4);

    // Optimized DOM Write: Only touch style property when changed
    if (heroSection && pStr !== lastPStr) {
      heroSection.style.setProperty('--p', pStr);
      lastPStr = pStr;
      
      const isSnapping = scrollDeltaY < -4 && currentScrollY < heroScrollDistance * 0.6;
      if (isSnapping !== lastSnappingState) {
        heroSection.classList.toggle('hero-snapping', isSnapping);
        lastSnappingState = isSnapping;
      }
    }

    // Optimized pointer-events assignment
    if (titleEl) {
      const isNearRest = p <= 0.10 && currentScrollY <= 30;
      const targetPointerEvents = isNearRest ? 'auto' : 'none';
      if (targetPointerEvents !== lastPointerEvents) {
        titleEl.style.pointerEvents = targetPointerEvents;
        lastPointerEvents = targetPointerEvents;
      }
    }

    // Ambient Golden Stardust Render
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw();
      }
    }

    requestAnimationFrame(render3D);
  }

  function startRafIfNeeded() {
    if (!isRafRunning && isHeroVisible) {
      isRafRunning = true;
      requestAnimationFrame(render3D);
    }
  }

  // Hero Visibility Observer
  if ('IntersectionObserver' in window && heroTrack) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible) {
          startRafIfNeeded();
        }
      });
    }, { threshold: 0.01 });

    heroObserver.observe(heroTrack);
  }

  window.addEventListener('scroll', () => {
    const newY = window.scrollY || window.pageYOffset || 0;
    scrollDeltaY = newY - lastScrollY;
    targetScrollY = newY;
    lastScrollY = newY;

    if (newY <= heroScrollDistance + 150) {
      isHeroVisible = true;
      startRafIfNeeded();
    }
  }, { passive: true });

  startRafIfNeeded();
});
