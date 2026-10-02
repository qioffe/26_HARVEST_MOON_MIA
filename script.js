/* =========================================================
   2026 CHINESE CULTURE FESTIVAL – HARVEST MOON CELEBRATION
   Ultra-High Performance 120 FPS Parallax Engine (Zero-Jitter)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Cached DOM Elements
  const heroScrollTrack = document.getElementById('heroScrollTrack');
  const heroSection = document.getElementById('heroSection');
  const theatricalCreditsSection = document.getElementById('theatrical-credits-root') || document.getElementById('theatricalCreditsSection');
  const moonWrapper = document.getElementById('moonWrapper');
  const lunarGlow = document.getElementById('lunarAmbientGlow');
  const midgroundWrapper = document.getElementById('midgroundWrapper');
  const foregroundWrapper = document.getElementById('foregroundWrapper');
  const titleEl = document.getElementById('heroTitleWrapper');
  const presentInfoStack = document.getElementById('presentInfoStack');
  const returnToHeroBtn = document.getElementById('returnToHeroBtn');
  const scrollToCreditsBtn = document.getElementById('scrollToCreditsBtn');
  const heroScrollDownCue = document.getElementById('heroScrollDownCue');
  const creditsBackToTop = document.getElementById('creditsBackToTop');
  const canvas = document.getElementById('ambientDustCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;

  /* -------------------------------------------------------------
     1. ROBUST MULTI-SOURCE IMAGE FALLBACK WATCHDOG
     ------------------------------------------------------------- */
  const imageSources = {
    bannerImg: [
      './landing/banner.webp',
      './landing/banner.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/banner.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/banner.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/banner.png'
    ],
    moonElement: [
      './landing/moon.webp',
      './landing/moon.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/moon.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/moon.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/moon.png'
    ],
    midgroundImg: [
      './landing/midground.webp',
      './landing/midground.png',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/midground.webp',
      'https://cdn.jsdelivr.net/gh/qioffe/Miami_Chinese_Culture_Festival@main/landing/midground.png',
      'https://raw.githubusercontent.com/qioffe/Miami_Chinese_Culture_Festival/main/landing/midground.png'
    ],
    foregroundImg: [
      './landing/foreground.webp',
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
     3. HIGH-PRECISION WINDOW SCROLL & INTERACTIVE NAVIGATION
     ------------------------------------------------------------- */
  let animProgress = 0;
  let lastPointerEvents = '';

  function calculateScrollProgress() {
    if (!heroScrollTrack) return 0;
    const trackHeight = heroScrollTrack.offsetHeight;
    const scrollDistance = trackHeight - window.innerHeight;
    if (scrollDistance <= 0) return 0;
    // Lights-off transition completes comfortably by 85% of hero track distance
    const fadeDistance = scrollDistance * 0.85;
    return Math.min(1.0, Math.max(0, window.scrollY / fadeDistance));
  }

  // Interactive Cues for smooth stage navigation
  if (returnToHeroBtn) {
    returnToHeroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (scrollToCreditsBtn) {
    scrollToCreditsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (theatricalCreditsSection) {
        theatricalCreditsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
      }
    });
  }

  if (heroScrollDownCue) {
    heroScrollDownCue.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (theatricalCreditsSection) {
        theatricalCreditsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
      }
    });
  }

  if (creditsBackToTop) {
    creditsBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Clicking on dark cover veil outside buttons returns smoothly to top
  if (presentInfoStack) {
    presentInfoStack.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      if (animProgress > 0.45) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

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
    // Lambda 14.0 yields silky instantaneous yet jitter-free response
    const blend = 1 - Math.exp(-14.0 * dt);
    const targetProgress = calculateScrollProgress();
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
          ? Math.min(115, Math.max(72, 19 * vw)) 
          : Math.min(320, Math.max(140, 18 * vw));
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

      // 5. Title & CTAs Lockup: Centered on 50dvh, upward drift and progressive soft fade
      if (titleEl) {
        const titleY = -p * 45;
        const titleScale = 1 - p * 0.05;
        const titleOpacity = Math.max(0, 1 - p * 2.4);
        titleEl.style.transform = `translate3d(0, calc(-50% + ${titleY.toFixed(1)}px), 0) scale(${titleScale.toFixed(3)})`;
        titleEl.style.opacity = titleOpacity.toFixed(3);

        const isInteractive = p <= 0.20;
        const pointerState = isInteractive ? 'auto' : 'none';
        if (pointerState !== lastPointerEvents) {
          titleEl.style.pointerEvents = pointerState;
          lastPointerEvents = pointerState;
        }
      }

      // 6. Present Info Stack: "Lights Off" Dark Cover Veil fades in
      if (presentInfoStack) {
        const presentProgress = Math.min(1.0, Math.max(0, p * 1.15));
        presentInfoStack.style.opacity = presentProgress.toFixed(3);
        const isPresentInteractive = p >= 0.40;
        presentInfoStack.style.pointerEvents = isPresentInteractive ? 'auto' : 'none';
      }

      // Sync CSS variable for backwards compatibility
      if (heroSection) {
        heroSection.style.setProperty('--p', p.toFixed(4));
      }
    }

    // Render Canvas Stardust only when hero is visible in viewport
    const trackH = heroScrollTrack ? heroScrollTrack.offsetHeight : window.innerHeight * 2;
    if (ctx && canvas && window.scrollY < trackH + 50) {
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
