/* =========================================================
   2026 CHINESE CULTURE FESTIVAL – HARVEST MOON CELEBRATION
   Ultra-High Performance 120 FPS Parallax & Stage Program Engine
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Cached DOM Elements
  const heroScrollTrack = document.getElementById('heroScrollTrack');
  const heroSection = document.getElementById('heroSection');
  const theatricalCreditsSection = document.getElementById('theatrical-credits-root') || document.getElementById('theatricalCreditsSection');
  const presentInfoStack = document.getElementById('presentInfoStack');
  const stageProgramCard = document.getElementById('stageProgramCard');
  const stageProgramScrollContainer = document.getElementById('stageProgramScrollContainer');
  const stageProgramContent = document.getElementById('stageProgramContent');
  const returnToHeroBtn = document.getElementById('returnToHeroBtn');
  const scrollToCreditsBtn = document.getElementById('scrollToCreditsBtn');
  const programBottomCreditsBtn = document.getElementById('programBottomCreditsBtn');
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
  let cachedTrackHeight = 0;
  let cachedWinHeight = 0;

  function updateMetrics() {
    vw = window.innerWidth * 0.01;
    vh = window.innerHeight * 0.01;
    isMobile = window.innerWidth <= 640;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cachedWinHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    cachedTrackHeight = heroScrollTrack ? heroScrollTrack.offsetHeight : cachedWinHeight * 3;

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
    setTimeout(updateMetrics, 120);
  }, { passive: true });

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
     3. DYNAMIC FETCHING & PARSING OF MHMC-2026-STAGE.XML
     ------------------------------------------------------------- */
  async function loadStageProgramXML() {
    if (!stageProgramContent) return;
    const XML_PATHS = [
      './MHMC-2026-STAGE.xml',
      '/MHMC-2026-STAGE.xml',
      'MHMC-2026-STAGE.xml',
      'https://raw.githubusercontent.com/qioffe/26_HARVEST_MOON_MIA/main/MHMC-2026-STAGE.xml',
      'https://cdn.jsdelivr.net/gh/qioffe/26_HARVEST_MOON_MIA@main/MHMC-2026-STAGE.xml'
    ];

    let xmlDoc = null;
    let xmlText = '';

    const isValidXmlText = (str) => {
      if (!str || typeof str !== 'string') return false;
      const s = str.trim().toLowerCase();
      if (s.startsWith('<!doctype') || s.startsWith('<html')) return false;
      return str.includes('<program') || str.includes('<event_program>') || str.includes('<festivalProgram>');
    };

    for (const path of XML_PATHS) {
      try {
        const res = await fetch(path + (path.startsWith('http') ? '?t=' : '?v=') + Date.now());
        if (res.ok) {
          const text = await res.text();
          if (isValidXmlText(text)) {
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(text, 'application/xml');
            if (parsedDoc && !parsedDoc.querySelector('parsererror')) {
              xmlDoc = parsedDoc;
              xmlText = text;
              break;
            }
          }
        }
      } catch (_) {}
    }

    if (!xmlDoc) {
      stageProgramContent.innerHTML = `
        <div class="text-center py-16 space-y-3">
          <p class="font-cinzel text-xs tracking-[0.24em] text-[#cfb268] uppercase">Program Schedule Unavailable</p>
          <p class="text-xs text-[#87a398]">Unable to load stage program data.</p>
        </div>
      `;
      return;
    }

    const getText = (parent, selector) => {
      const el = parent ? parent.querySelector(selector) : null;
      return el ? el.textContent.trim() : '';
    };

    const rootTagName = xmlDoc.documentElement ? xmlDoc.documentElement.tagName.toLowerCase() : '';
    const isNewSchema = rootTagName === 'program' || !!xmlDoc.querySelector('act') || !!xmlDoc.querySelector('meta');

    let festivalNameEn = '';
    let festivalNameZh = '';
    let mainTitleEn = '';
    let mainTitleZh = '';
    let programTypeEn = '';
    let programTypeZh = '';
    let dateEn = '';
    let venueEn = '';
    let curatorialZh = '';
    let curatorialEn = '';
    let openingZh = '';
    let openingEn = '';
    let chaptersHtml = '';

    if (isNewSchema) {
      const meta = xmlDoc.querySelector('meta');
      festivalNameEn = getText(meta, 'festival > en') || '2026 Miami Harvest Moon Celebration';
      festivalNameZh = getText(meta, 'festival > zh') || '2026 迈阿密中秋嘉年华';
      mainTitleEn = getText(meta, 'title > en') || 'Together Under One Moon';
      mainTitleZh = getText(meta, 'title > zh') || '天涯共此时';
      programTypeEn = getText(meta, 'subtitle > en') || 'Stage Performance Program';
      programTypeZh = getText(meta, 'subtitle > zh') || '舞台演出节目单';
      dateEn = getText(meta, 'schedule > date_en') || 'Saturday, October 3, 2026 · 1:00 – 3:00 PM';
      
      curatorialEn = getText(meta, 'thematic_statement > en');
      curatorialZh = getText(meta, 'thematic_statement > zh');

      const opening = xmlDoc.querySelector('opening');
      openingEn = getText(opening, 'title > en') || 'Welcome and Opening Remarks';
      openingZh = getText(opening, 'title > zh') || '欢迎与开场致辞';

      const acts = Array.from(xmlDoc.querySelectorAll('act'));

      acts.forEach((act, actIndex) => {
        const actTitleZh = getText(act, 'act_title > zh');
        const actTitleEn = getText(act, 'act_title > en');

        let colTitle = actTitleZh;
        let colLatin = 'Act';

        const titleEnLower = actTitleEn.toLowerCase();

        if (titleEnLower.includes('prologue')) {
          colTitle = '序·醒狮迎月';
          colLatin = 'Prologue';
        } else if (titleEnLower.includes('act i:')) {
          colTitle = '第一幕·月映华章';
          colLatin = 'Act I';
        } else if (titleEnLower.includes('act ii:')) {
          colTitle = '第二幕·新月新声';
          colLatin = 'Act II';
        } else if (titleEnLower.includes('act iii:')) {
          colTitle = '第三幕·天涯共此时';
          colLatin = 'Act III';
        } else if (titleEnLower.includes('finale')) {
          colTitle = '终·文化共舞·友谊无界';
          colLatin = 'Finale';
        } else {
          colTitle = actTitleZh;
          colLatin = actTitleEn;
        }

        const items = Array.from(act.querySelectorAll('performances > item'));
        const finaleNode = act.querySelector('performances > finale');
        let perfHtml = '';

        items.forEach((item) => {
          const rawId = item.getAttribute('id') || '';
          const numDisplay = rawId ? (rawId.length === 1 ? `0${rawId}.` : `${rawId}.`) : '';
          const pTitleEn = getText(item, 'title > en');
          const pTitleZh = getText(item, 'title > zh');
          const genreEn = getText(item, 'genre > en');
          const genreZh = getText(item, 'genre > zh');

          const performerNodes = Array.from(item.querySelectorAll('performers > performer'));
          const performerList = [];
          let bioEn = '';
          let bioZh = '';

          performerNodes.forEach((perf) => {
            const pEn = getText(perf, 'en') || getText(perf, 'name > en') || getText(perf, 'name_en') || perf.textContent.trim();
            const pZh = getText(perf, 'zh') || getText(perf, 'zh-Hans') || getText(perf, 'name > zh') || getText(perf, 'name > zh-Hans') || getText(perf, 'name_zh');
            if (pZh && pEn && pZh !== pEn) {
              performerList.push(`
                <div class="flex flex-col">
                  <span class="block text-[#dfc07b] font-medium tracking-wide text-[12px] sm:text-[13px]">${pEn}</span>
                  <span class="block text-[#edd69a]/80 font-cjk text-[11px] sm:text-xs font-light tracking-[0.14em] sm:tracking-[0.22em] pt-0.5">${pZh}</span>
                </div>
              `);
            } else if (pEn) {
              performerList.push(`
                <div class="flex flex-col">
                  <span class="block text-[#dfc07b] font-medium tracking-wide text-[12px] sm:text-[13px]">${pEn}</span>
                </div>
              `);
            } else if (pZh) {
              performerList.push(`
                <div class="flex flex-col">
                  <span class="block text-[#dfc07b] font-medium tracking-wide font-cjk text-[12px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.22em]">${pZh}</span>
                </div>
              `);
            }
          });

          const performerHtml = performerList.join('');

          perfHtml += `
            <article class="grid grid-cols-[1.35rem_1fr] sm:grid-cols-[2.25rem_1fr] items-start gap-x-1.5 sm:gap-x-3.5">
              ${numDisplay 
                ? `<span class="font-cinzel text-[11px] sm:text-sm text-[#dfc07b]/75 pt-0.5 tabular-nums select-none">${numDisplay}</span>` 
                : `<span class="select-none text-transparent text-[11px] sm:text-sm" aria-hidden="true">&nbsp;</span>`
              }
              <div class="space-y-1 min-w-0">
                <h2 class="text-[14.5px] sm:text-lg font-medium text-[#f3efe6] font-cinzel tracking-wide leading-snug">
                  ${pTitleEn}
                </h2>
                <p class="font-cjk text-[11px] sm:text-[13px] text-[#cfc7b8] font-light tracking-[0.1em] sm:tracking-[0.16em] leading-relaxed">
                  ${pTitleZh}
                </p>
                ${genreEn || genreZh || performerHtml ? `
                <div class="space-y-1 pt-1 sm:pt-1.5 mt-1 border-t border-[#162a22]">
                  ${genreEn || genreZh ? `
                    <p class="text-[#789c8e] font-western-serif italic text-[11px] sm:text-xs">
                      ${genreEn} <span class="font-cjk not-italic text-[#59786d] text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.12em]">｜ ${genreZh}</span>
                    </p>` : ''}
                  ${performerHtml ? `
                    <div class="pt-1 min-w-0 flex flex-col gap-2">
                      ${performerHtml}
                    </div>` : ''}
                </div>` : ''}
              </div>
            </article>
          `;
        });

        if (finaleNode) {
          const fTitleEn = getText(finaleNode, 'title > en');
          const fTitleZh = getText(finaleNode, 'title > zh');
          const fGenreEn = getText(finaleNode, 'genre > en');
          const fGenreZh = getText(finaleNode, 'genre > zh');
          const fPerfEn = getText(finaleNode, 'performers > performer > name > en') || getText(finaleNode, 'performers > performer > en');
          const fPerfZh = getText(finaleNode, 'performers > performer > name > zh') || getText(finaleNode, 'performers > performer > zh');

          let fPerfHtml = '';
          if (fPerfZh && fPerfEn && fPerfZh !== fPerfEn) {
            fPerfHtml = `
              <span class="inline-block">
                <span class="block text-[#dfc07b] font-medium tracking-wide text-[11.5px] sm:text-xs">${fPerfEn}</span>
                <span class="block text-[#edd69a]/80 font-cjk text-[10.5px] sm:text-xs font-light tracking-[0.14em] sm:tracking-[0.22em] pt-0.5">${fPerfZh}</span>
              </span>
            `;
          } else {
            fPerfHtml = `<span class="text-[#dfc07b] font-medium tracking-wide text-[11.5px] sm:text-xs">${fPerfEn || fPerfZh}</span>`;
          }

          perfHtml += `
            <article class="grid grid-cols-[1.35rem_1fr] sm:grid-cols-[2.25rem_1fr] items-start gap-x-1.5 sm:gap-x-3.5 pt-3 sm:pt-4 border-t border-[#1a3328]">
              <span class="text-[11px] sm:text-sm text-[#dfc07b]/70 pt-0.5 select-none font-cinzel">❖</span>
              <div class="space-y-1 min-w-0">
                <h2 class="text-[14.5px] sm:text-lg font-medium text-[#f3efe6] font-cinzel tracking-wide leading-snug">
                  ${fTitleEn}
                </h2>
                <p class="font-cjk text-[11px] sm:text-[13px] text-[#cfc7b8] font-light tracking-[0.1em] sm:tracking-[0.16em] leading-relaxed">
                  ${fTitleZh}
                </p>
                <div class="space-y-0.5 pt-1 sm:pt-1.5 mt-1 border-t border-[#162a22]">
                  <p class="text-[#789c8e] font-western-serif italic text-[11px] sm:text-xs">
                    ${fGenreEn} <span class="font-cjk not-italic text-[#59786d] text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.12em]">｜ ${fGenreZh}</span>
                  </p>
                  <div class="pt-0.5 min-w-0">
                    ${fPerfHtml}
                  </div>
                </div>
              </div>
            </article>
          `;
        }

        const isGrandFinale = actIndex === acts.length - 1;

        chaptersHtml += `
          <section class="flex flex-row items-stretch gap-2.5 sm:gap-6 ${actIndex === acts.length - 1 ? 'pb-1' : ''}">
            <div class="flex flex-col items-center shrink-0 w-6 sm:w-10 pr-1.5 sm:pr-4 border-r fine-jade-divider select-none">
              <div class="vertical-mode text-[11px] sm:text-[13px] font-normal text-[#dfc07b]">
                ${colTitle}
              </div>
              <span class="vertical-latin-spine font-western-serif text-[8px] sm:text-[9px] text-[#5c7e72] uppercase mt-2 sm:mt-3">
                ${colLatin}
              </span>
            </div>

            <div class="grow ${titleEnLower.includes('prologue') ? 'py-1 flex flex-col justify-center' : 'space-y-5 sm:space-y-7 py-0.5'} min-w-0">
              ${perfHtml}
            </div>
          </section>
        `;

        // Dynamically Render Featured Guest Artist Profiles belonging to this act
        const bioPerformers = Array.from(act.querySelectorAll('performances > item > performers > performer'));
        const actBios = [];
        bioPerformers.forEach((perf) => {
          const bioEn = getText(perf, 'bio > en');
          const bioZh = getText(perf, 'bio > zh') || getText(perf, 'bio > zh-Hans');
          if (bioEn && bioZh) {
            const artistNameEn = getText(perf, 'name > en') || getText(perf, 'en') || getText(perf, 'name_en');
            const artistNameZh = getText(perf, 'name > zh') || getText(perf, 'zh') || getText(perf, 'zh-Hans') || getText(perf, 'name_zh');
            actBios.push({ nameEn: artistNameEn, nameZh: artistNameZh, bioEn, bioZh });
          }
        });

        if (actBios.length > 0) {
          let biosHtml = `
            <div class="my-6 sm:my-10 max-w-xl mx-auto text-center px-2 sm:px-4 space-y-6">
              <div class="w-16 sm:w-20 mx-auto h-px bg-gradient-to-r from-transparent via-[#dfc07b]/35 to-transparent"></div>
              <p class="font-cinzel text-[9.5px] sm:text-[10.5px] tracking-[0.26em] text-[#789c8e] uppercase">
                Featured Guest Artist Profile${actBios.length > 1 ? 's' : ''} 
              </p>
          `;

          actBios.forEach((bioItem, bIdx) => {
            biosHtml += `
              <div class="space-y-2.5 ${bIdx > 0 ? 'pt-6 border-t border-[#162720]/70' : ''}">
                <div class="space-y-1">
                  <h3 class="font-cinzel text-sm sm:text-base text-[#dfc07b] font-medium tracking-wide">
                    ${bioItem.nameEn}
                  </h3>
                  ${bioItem.nameZh && bioItem.nameZh !== bioItem.nameEn ? `
                    <div class="font-cjk font-normal text-xs sm:text-sm text-[#edd69a]/90 tracking-[0.2em]">
                      ${bioItem.nameZh}
                    </div>` : ''}
                </div>
                <p class="text-[#cfc7b8]/90 font-western-serif text-xs sm:text-[13px] leading-relaxed text-center px-1 sm:px-2">
                  ${bioItem.bioEn}
                </p>
                <p class="text-[#8eaba0] font-cjk font-light text-[10.5px] sm:text-[11.5px] leading-loose tracking-[0.1em] sm:tracking-[0.16em] text-center px-1 sm:px-2 pt-1 border-t border-[#162720]/50">
                  ${bioItem.bioZh}
                </p>
              </div>
            `;
          });

          biosHtml += `
              <div class="w-16 sm:w-20 mx-auto h-px bg-gradient-to-r from-transparent via-[#dfc07b]/35 to-transparent"></div>
            </div>
          `;
          chaptersHtml += biosHtml;
        }

        if (!isGrandFinale) {
          chaptersHtml += '<div class="h-px bg-gradient-to-r from-transparent via-[#dfc07b]/20 to-transparent"></div>';
        }
      });
    }

    stageProgramContent.innerHTML = `
      <!-- ==================== PLAYBILL HEADER ==================== -->
      <header class="text-center pb-8 sm:pb-12 relative z-10">
        <!-- Top Festival Identifier -->
        <div class="font-cinzel text-[10px] sm:text-xs tracking-[0.38em] uppercase text-[#789c8e]/90 mb-3.5">
          ${festivalNameEn}
        </div>

        <!-- Main Majestic Titles -->
        <div class="space-y-1.5">
          <h1 class="text-3xl sm:text-5xl md:text-[50px] font-normal text-[#dfc07b] tracking-[0.16em] leading-tight font-cinzel">
            ${mainTitleEn}
          </h1>
          <div class="text-xl sm:text-2xl md:text-[25px] text-[#f3efe6]/90 tracking-[0.42em] font-light font-cjk pt-0.5">
            ${mainTitleZh}
          </div>
        </div>

        <!-- Subtitle Designation -->
        <div class="mt-3.5 sm:mt-4 text-xs sm:text-[13px] tracking-[0.20em] sm:tracking-[0.24em] text-[#8eaba0]/80 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <span>${programTypeEn}</span>
          <span class="hidden sm:inline text-[#28473a] select-none">|</span>
          <span class="font-cjk font-light text-[#cfc7b8]/80 tracking-[0.18em] sm:tracking-[0.24em]">${programTypeZh}</span>
        </div>

        <!-- Date (Classical Playbill Inscription) -->
        <div class="mt-3.5 sm:mt-4 text-xs sm:text-sm tracking-wider font-western-serif">
          <p class="text-[#edd69a] font-normal text-sm sm:text-[15px] tracking-[0.06em]">${dateEn}</p>
        </div>

        <!-- Thematic Poetic Epigraph (Pure Organic Negative Space, No Clunky Box) -->
        ${curatorialEn || curatorialZh ? `
        <div class="mt-8 max-w-xl mx-auto px-4 py-5 space-y-3 relative">
          <!-- Subtle Top & Bottom Hairline Gradients -->
          <div class="w-24 mx-auto h-px bg-gradient-to-r from-transparent via-[#dfc07b]/30 to-transparent"></div>
          
          ${curatorialEn ? `<p class="font-western-serif italic text-sm sm:text-base leading-relaxed text-[#f3efe6]/90 text-center font-normal px-2">“${curatorialEn}”</p>` : ''}
          ${curatorialZh ? `<p class="text-xs sm:text-[13px] leading-loose text-[#cfc7b8]/80 tracking-[0.18em] sm:tracking-[0.28em] font-light font-cjk text-center px-2">${curatorialZh}</p>` : ''}

          <div class="w-24 mx-auto h-px bg-gradient-to-r from-transparent via-[#dfc07b]/30 to-transparent"></div>
        </div>` : ""}

        <!-- Opening Remarks Protocol -->
        <div class="mt-6 text-xs tracking-[0.24em] text-[#dfc07b]/90 flex items-center justify-center gap-2">
          <span class="w-1 h-1 rounded-full bg-[#dfc07b]/50"></span>
          <span class="font-cinzel tracking-[0.16em]">${openingEn}</span>
          <span class="text-[#2c473c] font-light">|</span>
          <span class="font-cjk font-light text-[#8eaba0] tracking-[0.22em] sm:tracking-[0.3em]">${openingZh}</span>
          <span class="w-1 h-1 rounded-full bg-[#dfc07b]/50"></span>
        </div>
      </header>

      <!-- ==================== PROGRAMME BODY ==================== -->
      <div class="space-y-11 sm:space-y-14 relative z-10">
        ${chaptersHtml}
      </div>

      <!-- ==================== PLAYBILL FOOTER ==================== -->
      <footer class="mt-12 sm:mt-16 pt-7 border-t border-[#162a22] text-center space-y-3.5 relative z-10">
        <div class="text-xs text-[#789c8e] leading-relaxed flex flex-col items-center gap-1 sm:gap-1.5">
          <div class="font-cinzel text-xs text-[#dfc07b]/90 uppercase tracking-[0.18em] sm:tracking-[0.24em] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>${mainTitleEn}</span>
            <span class="hidden sm:inline text-[#28473a] select-none">•</span>
            <span class="font-cjk font-light text-[#dfc07b]/80 tracking-[0.16em] sm:tracking-[0.22em]">${mainTitleZh}</span>
          </div>
          <div class="mt-0.5 text-[#aaa395] font-western-serif italic text-xs sm:text-sm text-center">
            <span>${festivalNameEn}</span>
          </div>
        </div>
      </footer>
    `;

    if (typeof bindNavigationControls === 'function') {
      bindNavigationControls();
    }
  }

  loadStageProgramXML();

  /* -------------------------------------------------------------
     3b. DYNAMIC FETCHING & PARSING OF CREDITS.XML
     ------------------------------------------------------------- */
  async function loadCreditsXML() {
    const viewport = document.getElementById("tc-viewport");
    if (!viewport) return;

    const XML_PATHS = [
      "./credits.xml",
      "/credits.xml",
      "credits.xml",
      "https://raw.githubusercontent.com/qioffe/26_HARVEST_MOON_MIA/main/credits.xml",
      "https://raw.githubusercontent.com/qioffe/26_HARVEST_MOON_MIA/main/public/credits.xml",
      "https://cdn.jsdelivr.net/gh/qioffe/26_HARVEST_MOON_MIA@main/credits.xml",
      "https://cdn.jsdelivr.net/gh/qioffe/26_HARVEST_MOON_MIA@main/public/credits.xml"
    ];
    const GITHUB_USER = "qioffe";
    const GITHUB_REPO = "26_HARVEST_MOON_MIA";
    const GITHUB_BRANCH = "main";
    const GITHUB_FOLDER = "public/logos";

    const cdnBase = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${GITHUB_FOLDER}/`;
    const rawBase = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_FOLDER}/`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}?ref=${GITHUB_BRANCH}`;

    const slugify = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    const CORE_LOGOS = {
      clta: {
        id: "clta",
        label: "CLTA-FL",
        aliases: ["clta_fl", "clta-fl", "cltafl", "clta", "chineselanguageteachersassociationofflorida", "chineselanguageteachersassociationoffloridacltafl"]
      },
      mdc: {
        id: "mdc",
        label: "Miami Dade College",
        aliases: ["wolfsoncampus", "mdc", "miamidadecollege", "mdcwolfson", "miamidadecollegewolfsoncampus"]
      },
      fiu: {
        id: "fiu",
        label: "FIU Asian Studies",
        aliases: ["fiu_asu", "fiu-asu", "fiuasu", "fiu", "fiuasianstudies"]
      },
      aaab: {
        id: "aaab",
        label: "AAAB",
        aliases: ["aaab", "asianamericanadvisoryboard", "miamidadecountyasianamericanadvisoryboard"]
      },
      miamidade: {
        id: "miamidade",
        label: "Miami-Dade County",
        aliases: ["miamidade", "culturalaffairs", "miamidadecountyculturalaffairs", "miamidadeculturalaffairs", "miamidadecounty", "support", "seal"]
      },
      casec: {
        id: "casec",
        label: "CASEC Florida",
        aliases: ["casec", "casecflorida", "chineseassociationofscienceeducationandcultureofflorida", "chineseassociationofscienceeducationandcultureoffloridacasec"]
      },
      ccf: {
        id: "ccf",
        label: "CCF Miami",
        aliases: ["ChineseCultureFoundationMiami", "ccf", "ccfmiami", "chineseculturalfoundation", "chineseculturalfoundationmiami"]
      },
      de: {
        id: "de",
        label: "D&E Foundation",
        aliases: ["de", "D&E", "defoundation", "dandefoundation"]
      }
    };

    const repoLogoMap = new Map();
    try {
      const ghRes = await fetch(apiUrl);
      if (ghRes.ok) {
        const files = await ghRes.json();
        if (Array.isArray(files)) {
          files.forEach(f => {
            const base = f.name.substring(0, f.name.lastIndexOf("."));
            repoLogoMap.set(slugify(base), `${cdnBase}${encodeURIComponent(f.name)}`);
          });
        }
      }
    } catch (_) {}

    const getCoreLogoUrls = (markId) => {
      const mark = CORE_LOGOS[markId];
      if (!mark) return [];
      const urls = [];

      for (const alias of mark.aliases) {
        const enc = encodeURIComponent(alias);
        // 1. High priority: Fast local cached assets (Zero HTTP 404 latency)
        urls.push(`./logos/${alias}.png`, `/logos/${alias}.png`, `./logos/${enc}.png`, `/logos/${enc}.png`);
        
        // 2. High priority: Exactly resolved GitHub file from API
        const sKey = slugify(alias);
        if (repoLogoMap.has(sKey)) {
          urls.push(repoLogoMap.get(sKey));
        }

        // 3. Fallback CDN / Raw GitHub
        urls.push(`${cdnBase}${enc}.png`, `${rawBase}${enc}.png`);
      }

      return Array.from(new Set(urls.filter(Boolean)));
    };

    const bindCoreImage = (containerEl, markId) => {
      if (!containerEl) return;
      const imgEl = containerEl.querySelector(".tc-core-mark-img");
      const labelEl = containerEl.querySelector(".tc-mark-fallback-label");
      if (!imgEl) return;

      const candidates = getCoreLogoUrls(markId);
      let currentIdx = 0;

      function tryNext() {
        if (currentIdx < candidates.length) {
          const nextUrl = candidates[currentIdx++];
          const testImg = new Image();
          testImg.decoding = "async";
          testImg.onload = () => {
            if (testImg.naturalWidth > 0 && testImg.naturalHeight > 0) {
              imgEl.src = nextUrl;
              imgEl.classList.remove("hidden");
              if (labelEl) labelEl.classList.add("hidden");
            } else {
              tryNext();
            }
          };
          testImg.onerror = () => {
            tryNext();
          };
          testImg.src = nextUrl;
        } else {
          imgEl.classList.add("hidden");
          if (labelEl) labelEl.classList.remove("hidden");
        }
      }

      tryNext();
    };

    try {
      let xmlText = null;
      for (const p of XML_PATHS) {
        try {
          const res = await fetch(p + (p.startsWith("http") ? "?t=" : "?v=") + Date.now());
          if (res.ok) {
            xmlText = await res.text();
            if (xmlText && xmlText.includes("<section")) break;
          }
        } catch (_) {}
      }
      if (!xmlText) return;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      viewport.innerHTML = "";

      const sections = xmlDoc.querySelectorAll("section");

      if (sections.length > 0) {
        sections.forEach((sec, idx) => {
          if (idx > 0) {
            const divider = document.createElement("div");
            divider.className = "w-20 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mx-auto my-6 sm:my-8";
            viewport.appendChild(divider);
          }

          const title = sec.getAttribute("title") || "";
          const type = (sec.getAttribute("type") || "stacked").toLowerCase();
          const entityEls = Array.from(sec.querySelectorAll("entity"));

          const secEl = document.createElement("div");
          secEl.className = "space-y-5 sm:space-y-6";

          const titleEl = document.createElement("h2");
          titleEl.className = "credit-title-role";
          titleEl.textContent = title;
          secEl.appendChild(titleEl);

          if (type === "headline" || title.toLowerCase().includes("present")) {
            const list = document.createElement("div");
            list.className = "max-w-2xl mx-auto";

            const logoBox = document.createElement("div");
            logoBox.className = "tc-core-logo-slot w-44 sm:w-56 h-20 sm:h-24 mx-auto mt-3 mb-6 sm:mb-8";
            logoBox.innerHTML = `
              <span class="tc-mark-fallback-label text-sm font-semibold text-amber-400/90">CLTA-FL</span>
              <img class="tc-core-mark-img hidden" alt="CLTA-FL Mark">
            `;
            bindCoreImage(logoBox, "clta");
            list.appendChild(logoBox);

            entityEls.forEach(el => {
              const rawName = el.getAttribute("name") || el.textContent.trim();
              const nameEl = document.createElement("div");
              nameEl.className = "space-y-1.5";
              nameEl.innerHTML = `<h1 class="cinema-headline-name">${rawName}</h1>`;
              list.appendChild(nameEl);
            });
            secEl.appendChild(list);
          } else if (type === "lead" || title.toLowerCase().includes("lead")) {
            const list = document.createElement("div");
            list.className = "max-w-xl mx-auto";

            const logoBox = document.createElement("div");
            logoBox.className = "tc-core-logo-slot w-48 sm:w-60 h-16 sm:h-20 mx-auto mt-3 mb-6 sm:mb-8";
            logoBox.innerHTML = `
              <span class="tc-mark-fallback-label text-xs font-semibold text-zinc-300">MDC</span>
              <img class="tc-core-mark-img hidden" alt="Miami Dade College Mark">
            `;
            bindCoreImage(logoBox, "mdc");
            list.appendChild(logoBox);

            entityEls.forEach(el => {
              const rawName = el.getAttribute("name") || el.textContent.trim();
              const nameEl = document.createElement("div");
              nameEl.className = "space-y-1.5";
              nameEl.innerHTML = `<h2 class="cinema-lead-name">${rawName}</h2>`;
              list.appendChild(nameEl);
            });
            secEl.appendChild(list);
          } else if (title.toLowerCase().includes("support")) {
            const list = document.createElement("div");
            list.className = "max-w-2xl mx-auto";

            const sealBox = document.createElement("div");
            sealBox.className = "tc-core-logo-slot w-44 sm:w-56 h-16 sm:h-20 mx-auto mt-3 mb-6 sm:mb-8";
            sealBox.innerHTML = `
              <span class="tc-mark-fallback-label text-[10px] font-semibold text-amber-400/80 text-center leading-tight">MIAMI<br>DADE</span>
              <img class="tc-core-mark-img hidden" alt="Miami-Dade County Seal">
            `;
            bindCoreImage(sealBox, "miamidade");
            list.appendChild(sealBox);

            const namesList = document.createElement("div");
            namesList.className = "space-y-4";
            entityEls.forEach((el, i) => {
              const name = el.getAttribute("name") || el.textContent.trim();
              const item = document.createElement("div");
              item.className = "space-y-1";
              item.innerHTML = `
                ${i > 0 ? '<div class="w-8 h-px bg-amber-400/20 mx-auto my-3"></div>' : ''}
                <p class="cinema-stacked-name">${name}</p>
              `;
              namesList.appendChild(item);
            });
            list.appendChild(namesList);
            secEl.appendChild(list);
          } else if (type === "grid" || title.toLowerCase().includes("community")) {
            const grid = document.createElement("div");
            grid.className = "tc-community-grid";

            entityEls.forEach(el => {
              const name = el.getAttribute("name") || el.textContent.trim();
              const item = document.createElement("div");
              item.className = "tc-community-item";
              item.innerHTML = `<span class="cinema-community-name">${name}</span>`;
              grid.appendChild(item);
            });
            secEl.appendChild(grid);
          } else {
            const list = document.createElement("div");
            list.className = "max-w-xl mx-auto space-y-3.5 sm:space-y-4 pt-1";
            entityEls.forEach((el, i) => {
              const name = el.getAttribute("name") || el.textContent.trim();
              const item = document.createElement("div");
              item.className = "space-y-1";
              item.innerHTML = `
                ${i > 0 ? '<div class="w-6 h-px bg-amber-400/20 mx-auto my-3"></div>' : ''}
                <p class="cinema-stacked-name">${name}</p>
              `;
              list.appendChild(item);
            });
            secEl.appendChild(list);
          }

          viewport.appendChild(secEl);
        });

        const bugBlockDivider = document.createElement("div");
        bugBlockDivider.className = "w-20 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mx-auto mt-16 mb-8 sm:mb-10";
        viewport.appendChild(bugBlockDivider);

        const bugBlockSec = document.createElement("div");
        bugBlockSec.className = "w-full max-w-6xl mx-auto pt-2 pb-6 px-2 sm:px-4";
        bugBlockSec.innerHTML = `
          <h2 class="credit-title-role mb-8 sm:mb-10 text-center">Official Partners &amp; Patrons</h2>
          <div class="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center justify-items-center w-full">
            
            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-clta" title="CLTA-FL">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-amber-400/90">CLTA-FL</span>
              <img class="tc-core-mark-img hidden" alt="CLTA-FL">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-mdc" title="Miami Dade College">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-zinc-300">MDC</span>
              <img class="tc-core-mark-img hidden" alt="Miami Dade College">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-fiu" title="FIU Asian Studies">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-amber-300/80">FIU</span>
              <img class="tc-core-mark-img hidden" alt="FIU Asian Studies">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-aaab" title="Asian American Advisory Board">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-amber-300/90">AAAB</span>
              <img class="tc-core-mark-img hidden" alt="Asian American Advisory Board">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-ccf" title="Chinese Cultural Foundation, Miami">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-amber-400/90">CCF Miami</span>
              <img class="tc-core-mark-img hidden" alt="Chinese Cultural Foundation, Miami">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-de" title="D&amp;E Foundation">
              <span class="tc-mark-fallback-label text-[10px] sm:text-xs font-semibold text-amber-200/90">D&amp;E</span>
              <img class="tc-core-mark-img hidden" alt="D&amp;E Foundation">
            </div>

            <div class="tc-bug-slot w-full h-11 sm:h-13 md:h-16 flex items-center justify-center" id="bug-miamidade" title="Miami-Dade County Cultural Affairs">
              <span class="tc-mark-fallback-label text-[9px] sm:text-[10px] font-semibold text-amber-400/80 text-center leading-tight">MIAMI<br>DADE</span>
              <img class="tc-core-mark-img hidden" alt="Miami-Dade County Cultural Affairs">
            </div>

          </div>
        `;

        viewport.appendChild(bugBlockSec);

        bindCoreImage(bugBlockSec.querySelector("#bug-clta"), "clta");
        bindCoreImage(bugBlockSec.querySelector("#bug-mdc"), "mdc");
        bindCoreImage(bugBlockSec.querySelector("#bug-fiu"), "fiu");
        bindCoreImage(bugBlockSec.querySelector("#bug-aaab"), "aaab");
        bindCoreImage(bugBlockSec.querySelector("#bug-ccf"), "ccf");
        bindCoreImage(bugBlockSec.querySelector("#bug-de"), "de");
        bindCoreImage(bugBlockSec.querySelector("#bug-miamidade"), "miamidade");

        const copyrightDivider = document.createElement("div");
        copyrightDivider.className = "w-16 h-px bg-amber-400/20 mx-auto mt-16 mb-8";
        viewport.appendChild(copyrightDivider);

        const copyrightSec = document.createElement("div");
        copyrightSec.className = "text-center space-y-2.5 text-xs text-[#87a398] font-sans tracking-wide pb-14 max-w-xl mx-auto px-4";
        copyrightSec.innerHTML = `
          <div class="inline-flex items-center gap-2 text-[#cfb268] font-cinzel tracking-[0.2em] uppercase text-[11px] sm:text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400/60"></span>
            <span>2026 Miami Harvest Moon Celebration</span>
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400/60"></span>
          </div>
          <p class="text-zinc-400 text-xs sm:text-[13px] font-normal tracking-normal">
            © 2026 Chinese Language Teachers Association of Florida (CLTA-FL). All rights reserved.
          </p>
          <p class="text-[11px] sm:text-xs text-zinc-500 tracking-normal leading-relaxed">
            Presented in partnership with Miami Dade College, Wolfson Campus and Co-Hosting Organizations.
          </p>
        `;
        viewport.appendChild(copyrightSec);
      }
    } catch (err) {
      console.error("Error loading theatrical credits XML:", err);
    }
  }

  loadCreditsXML();

  /* -------------------------------------------------------------
     4. ATMOSPHERIC SOUNDSCAPE ENGINE & MUTE CONTROLLER
     ------------------------------------------------------------- */
  let audioCtx = null;
  let isMuted = true;
  let masterGain = null;

  function initAudioEngine() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Pentatonic Guzheng Harmonic Frequencies (Hz): D4, E4, G4, A4, C5, D5, E5, G5
      const notes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

      function playPluck() {
        if (!audioCtx || isMuted) return;
        const now = audioCtx.currentTime;
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 3.0);
      }

      setInterval(() => {
        if (!isMuted && audioCtx && audioCtx.state === 'running') {
          playPluck();
          if (Math.random() > 0.45) {
            setTimeout(playPluck, 240 + Math.random() * 320);
          }
        }
      }, 2200);
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  const audioMuteBtn = document.getElementById('audioMuteBtn');
  const audioMuteText = document.getElementById('audioMuteText');
  const audioMuteStatusDot = document.getElementById('audioMuteStatusDot');
  const heroDarkMaskEl = document.getElementById('heroDarkMask');
  const heroTitleWrapperEl = document.getElementById('heroTitleWrapper');

  let currentScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
  let isScrollDirty = true;

  function onScroll() {
    currentScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    isScrollDirty = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  function updateMuteAndActState() {
    const isAt50Dvh = currentScrollY >= (cachedWinHeight * 0.4);

    if (audioMuteBtn) {
      if (!isMuted && isAt50Dvh) {
        audioMuteBtn.classList.remove('audio-muted-grayout');
        audioMuteBtn.classList.add('audio-active-solid');
        if (audioMuteText) audioMuteText.textContent = 'SOUND ON';
        if (audioMuteStatusDot) {
          audioMuteStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-[#DFC18A] shadow-[0_0_8px_#DFC18A] transition-all animate-pulse';
        }
      } else {
        audioMuteBtn.classList.remove('audio-active-solid');
        audioMuteBtn.classList.add('audio-muted-grayout');
        if (audioMuteText) audioMuteText.textContent = isMuted ? 'MUTE' : 'SOUND ON';
        if (audioMuteStatusDot) {
          audioMuteStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-[#738f83] transition-colors';
        }
      }
    }
  }

  if (audioMuteBtn) {
    audioMuteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudioEngine();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isMuted = !isMuted;
      if (isMuted) {
        if (masterGain && audioCtx) {
          masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        }
      } else {
        if (masterGain && audioCtx) {
          masterGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.4);
        }
      }
      updateMuteAndActState();
    };
  }

  /* -------------------------------------------------------------
     5. HERO SECTION SILKY PARALLAX ANIMATION ENGINE
     ------------------------------------------------------------- */
  let currentP = 0;
  let targetP = 0;

  function updateHeroParallax() {
    if (heroScrollTrack && heroSection) {
      const scrollRange = Math.max(cachedTrackHeight - cachedWinHeight, 1);
      targetP = Math.min(Math.max(currentScrollY / scrollRange, 0), 1);
      
      if (Math.abs(targetP - currentP) > 0.0001) {
        currentP = targetP;
        heroSection.style.setProperty('--p', currentP.toFixed(4));

        if (heroDarkMaskEl) {
          const maskOpacity = Math.min(currentP * 1.35, 1).toFixed(4);
          heroDarkMaskEl.style.setProperty('--mask-opacity', maskOpacity);
        }

        if (heroTitleWrapperEl) {
          heroTitleWrapperEl.style.pointerEvents = currentP > 0.22 ? 'none' : 'auto';
        }
      }
    }
  }

  updateHeroParallax();

  /* -------------------------------------------------------------
     6. NAVIGATION BINDINGS
     ------------------------------------------------------------- */
  function bindNavigationControls() {
    // Navigation handlers reserved for dynamic content
  }

  bindNavigationControls();

  /* -------------------------------------------------------------
     7. DIRECT GPU COMPOSITOR RENDERING (60 / 120 FPS STABLE)
     ------------------------------------------------------------- */
  let lastFrameTime = performance.now();

  function renderLoop(now) {
    const dt = Math.min((now - lastFrameTime) * 0.001, 0.033);
    lastFrameTime = now;

    // Only recalculate parallax metrics when the scroll position actually moves
    if (isScrollDirty) {
      updateMuteAndActState();
      updateHeroParallax();
      isScrollDirty = false;
    }

    // Performance Optimization: Only run particle canvas when Hero section is visible
    if (ctx && canvas && currentScrollY < (cachedTrackHeight + 150)) {
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
