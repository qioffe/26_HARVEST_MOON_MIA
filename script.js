/* =========================================================
   2026 CHINESE CULTURE FESTIVAL – HARVEST MOON CELEBRATION
   High-Performance Locked Viewport Interactive Engine
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  const titleEl = document.getElementById('heroTitleWrapper');
  const canvas = document.getElementById('ambientDustCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;

  /* -------------------------------------------------------------
     1. RESPONSIVE METRICS & PARTICLE CANVAS
     ------------------------------------------------------------- */
  function resizeDustCanvas() {
    if (!canvas || !heroSection) return;
    const w = heroSection.clientWidth || window.innerWidth;
    const h = heroSection.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  resizeDustCanvas();
  window.addEventListener('resize', resizeDustCanvas, { passive: true });

  const particles = [];
  const PARTICLE_COUNT = 28;

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
     2. LOCKED VIEWPORT GESTURE & PARALLAX TRACKING
     ------------------------------------------------------------- */
  let animProgress = 0;
  let targetProgress = 0;
  let lastPStr = '';
  let lastPointerEvents = '';

  // Wheel interaction (desktop touchpad / mousewheel)
  window.addEventListener('wheel', (e) => {
    targetProgress = Math.max(0, Math.min(1.0, targetProgress + e.deltaY * 0.0018));
    resetIdleTimer();
  }, { passive: true });

  // Touch gesture interaction (mobile swipe up / down)
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;
      targetProgress = Math.max(0, Math.min(1.0, targetProgress + deltaY * 0.0032));
      resetIdleTimer();
    }
  }, { passive: true });

  // Gentle auto-return to poster rest state when idle
  let idleTimer = null;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      targetProgress = 0.0;
    }, 2800);
  }

  window.addEventListener('touchend', resetIdleTimer, { passive: true });

  /* -------------------------------------------------------------
     3. 60/120 FPS RAF COMPOSITING ENGINE
     ------------------------------------------------------------- */
  let time = 0;

  function renderLoop() {
    time += 0.022;

    // Smooth sub-pixel interpolation
    animProgress += (targetProgress - animProgress) * 0.14;
    if (Math.abs(targetProgress - animProgress) < 0.0004) {
      animProgress = targetProgress;
    }

    const pStr = animProgress.toFixed(4);

    if (heroSection && pStr !== lastPStr) {
      heroSection.style.setProperty('--p', pStr);
      lastPStr = pStr;
    }

    if (titleEl) {
      const isInteractive = animProgress <= 0.20;
      const pointerState = isInteractive ? 'auto' : 'none';
      if (pointerState !== lastPointerEvents) {
        titleEl.style.pointerEvents = pointerState;
        lastPointerEvents = pointerState;
      }
    }

    // Render golden stardust particles
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw();
      }
    }

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
});
