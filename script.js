/* =========================================================
   2026 CHINESE CULTURE FESTIVAL – HARVEST MOON CELEBRATION
   Ultra-High Performance 120 FPS Parallax Engine (Zero-Jitter)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Cached DOM Elements
  const heroSection = document.getElementById('heroSection');
  const moonWrapper = document.getElementById('moonWrapper');
  const lunarGlow = document.getElementById('lunarAmbientGlow');
  const midgroundWrapper = document.getElementById('midgroundWrapper');
  const foregroundWrapper = document.getElementById('foregroundWrapper');
  const titleEl = document.getElementById('heroTitleWrapper');
  const canvas = document.getElementById('ambientDustCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;

  /* -------------------------------------------------------------
     1. ROBUST MULTI-SOURCE IMAGE FALLBACK WATCHDOG
     ------------------------------------------------------------- */
  const imageSources = {
    bannerImg: [
      './landing/banner.webp',
      './banner.webp',
      './landing/banner.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/banner.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/banner.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/banner.png'
    ],
    moonElement: [
      './landing/moon.webp',
      './moon.webp',
      './landing/moon.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/moon.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/moon.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/moon.png'
    ],
    midgroundImg: [
      './landing/midground.webp',
      './midground.webp',
      './landing/midground.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/midground.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/midground.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/midground.png'
    ],
    foregroundImg: [
      './landing/foreground.webp',
      './foreground.webp',
      './landing/foreground.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/foreground.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/foreground.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/foreground.png'
    ]
  };

  Object.entries(imageSources).forEach(([id, sources]) => {
    const el = document.getElementById(id);
    if (!el) return;

    let currentIdx = 0;
    function tryNextSource() {
      currentIdx++;
      if (currentIdx < sources.length) {
        el.src = sources[currentIdx];
      }
    }

    el.addEventListener('error', tryNextSource);

    // Watchdog check for stalled/blank images on mobile carriers
    setTimeout(() => {
      if (el.naturalWidth === 0 && currentIdx === 0) {
        tryNextSource();
      }
    }, 1200);
  });

  /* -------------------------------------------------------------
     2. CACHED VIEWPORT METRICS & PARTICLE CANVAS
     ------------------------------------------------------------- */
  let vw = window.innerWidth * 0.01;
  let vh = window.innerHeight * 0.01;
  let isMobile = window.innerWidth <= 640;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = window.innerWidth;
  let cssH = window.innerHeight;

  function updateMetrics() {
    vw = window.innerWidth * 0.01;
    vh = window.innerHeight * 0.01;
    isMobile = window.innerWidth <= 640;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas && heroSection) {
      cssW = heroSection.clientWidth || window.innerWidth;
      cssH = heroSection.clientHeight || window.innerHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#feeec3';
      }
    }
  }

  updateMetrics();
  window.addEventListener('resize', updateMetrics, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(updateMetrics, 150);
  }, { passive: true });

  // Pre-allocated particles for zero garbage-collection stutter
  const particles = [];
  const PARTICLE_COUNT = 24;

  class StardustParticle {
    constructor() {
      this.reset(true);
    }
    reset(randomY = false) {
      this.x = Math.random() * cssW;
      this.y = randomY ? Math.random() * cssH : cssH + 12;
      this.size = Math.random() * 1.5 + 0.8;
      this.speedY = -(Math.random() * 0.32 + 0.16);
      this.speedX = (Math.random() - 0.5) * 0.18;
      this.opacity = Math.random() * 0.45 + 0.25;
      this.pulseSpeed = Math.random() * 0.024 + 0.01;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(dt) {
      this.y += this.speedY * (dt * 60);
      this.x += (this.speedX + Math.sin(this.phase) * 0.1) * (dt * 60);
      this.phase += this.pulseSpeed * (dt * 60);
      if (this.y < -15 || this.x < -15 || this.x > cssW + 15) {
        this.reset(false);
      }
    }
    draw() {
      if (!ctx) return;
      const alpha = Math.max(0, this.opacity * (0.65 + 0.35 * Math.sin(this.phase)));
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (canvas && ctx) {
    ctx.fillStyle = '#feeec3';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new StardustParticle());
    }
  }

  /* -------------------------------------------------------------
     3. HIGH-PRECISION INPUT SAMPLER (ZERO BLOCKING)
     ------------------------------------------------------------- */
  let animProgress = 0;
  let targetProgress = 0;
  let lastPointerEvents = '';

  let idleTimer = null;
  function scheduleReturnToRest() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      targetProgress = 0.0;
    }, 3000);
  }

  // Wheel / Trackpad with normalized delta & smooth velocity damping
  window.addEventListener('wheel', (e) => {
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 20; // lines to px
    else if (e.deltaMode === 2) dy *= 380; // pages to px

    // Soft-clamp per-event delta to eliminate mouse wheel sudden jerks
    const clampedDelta = Math.sign(dy) * Math.min(Math.abs(dy), 65);
    targetProgress = Math.max(0, Math.min(1.0, targetProgress + clampedDelta * 0.00085));
    scheduleReturnToRest();
  }, { passive: true });

  // Purely Passive Touch Gesture (zero compositor blocking)
  let touchActive = false;
  let lastTouchY = 0;

  window.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    clearTimeout(idleTimer);
    touchActive = true;
    lastTouchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!touchActive || !e.touches || !e.touches[0]) return;
    const currentY = e.touches[0].clientY;
    const deltaY = lastTouchY - currentY;

    // Subpixel deadband filters hardware digitizer tremors
    if (Math.abs(deltaY) > 0.6) {
      lastTouchY = currentY;
      targetProgress = Math.max(0, Math.min(1.0, targetProgress + deltaY * 0.0020));
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    touchActive = false;
    scheduleReturnToRest();
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    touchActive = false;
    scheduleReturnToRest();
  }, { passive: true });

  /* -------------------------------------------------------------
     4. DIRECT GPU COMPOSITOR RENDERING (60 / 120 FPS STABLE)
     ------------------------------------------------------------- */
  let lastFrameTime = performance.now();
  let lastRenderedP = -1;

  function renderLoop(now) {
    // Delta time in seconds, clamped between 8ms (120Hz) and 40ms (25Hz)
    const dt = Math.min((now - lastFrameTime) * 0.001, 0.04);
    lastFrameTime = now;

    // Delta-time invariant exponential smoothing
    // Lambda 8.0 yields identical silky response regardless of screen refresh rate
    const blend = 1 - Math.exp(-8.0 * dt);
    const diff = targetProgress - animProgress;

    if (Math.abs(diff) < 0.00015) {
      animProgress = targetProgress;
    } else {
      animProgress += diff * blend;
    }

    // Only update GPU layer matrices when progress changes
    if (Math.abs(animProgress - lastRenderedP) > 0.0001) {
      lastRenderedP = animProgress;
      const p = animProgress;

      // 1. Celestial Moon: Centered at rest with smooth parallax translation
      if (moonWrapper) {
        const moonShift = -p * 16 * vw;
        const moonY = p * 8 * vh;
        const moonScale = 1 - p * 0.15;
        moonWrapper.style.transform = `translate3d(calc(-50% + ${moonShift.toFixed(1)}px), ${moonY.toFixed(1)}px, 0) scale(${moonScale.toFixed(3)})`;
      }

      // 2. Ambient Lunar Glow (concentric with Moon)
      if (lunarGlow) {
        const glowShift = -p * 16 * vw;
        const glowY = p * 8 * vh;
        const glowScale = 1 - p * 0.12;
        lunarGlow.style.transform = `translate3d(calc(-50% + ${glowShift.toFixed(1)}px), ${glowY.toFixed(1)}px, 0) scale(${glowScale.toFixed(3)})`;
        lunarGlow.style.opacity = Math.max(0.12, 0.24 - p * 0.10).toFixed(3);
      }

      // 3. Midground Mountains: Gracefully scaled ridge offset rightward
      if (midgroundWrapper) {
        const baseOffset = isMobile 
          ? Math.min(54, Math.max(36, 10 * vw)) 
          : Math.min(155, Math.max(65, 8.5 * vw));
        const midShift = p * 5 * vw;
        const midY = p * 6;
        midgroundWrapper.style.transform = `translate3d(calc(-50% + ${(baseOffset + midShift).toFixed(1)}px), ${midY.toFixed(1)}px, 0)`;
      }

      // 4. Foreground Figures: Stable anchored floor
      if (foregroundWrapper) {
        const foreY = p * 8;
        const foreScale = 1 + p * 0.025;
        foregroundWrapper.style.transform = `translate3d(0, ${foreY.toFixed(1)}px, 0) scale(${foreScale.toFixed(3)})`;
      }

      // 5. Title & CTAs Lockup: Upward drift and progressive soft fade
      if (titleEl) {
        const titleY = -p * 45;
        const titleScale = 1 - p * 0.05;
        const titleOpacity = Math.max(0, 1 - p * 2.2);
        titleEl.style.transform = `translate3d(0, ${titleY.toFixed(1)}px, 0) scale(${titleScale.toFixed(3)})`;
        titleEl.style.opacity = titleOpacity.toFixed(3);

        const isInteractive = p <= 0.25;
        const pointerState = isInteractive ? 'auto' : 'none';
        if (pointerState !== lastPointerEvents) {
          titleEl.style.pointerEvents = pointerState;
          lastPointerEvents = pointerState;
        }
      }

      // Sync CSS variable for backwards compatibility
      if (heroSection) {
        heroSection.style.setProperty('--p', p.toFixed(4));
      }
    }

    // Render Canvas Stardust (zero GC allocations)
    if (ctx && canvas) {
      ctx.clearRect(0, 0, cssW, cssH);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(dt);
        particles[i].draw();
      }
    }

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
});
