/* ===========================================================
   HOMEWORK INTEL — Interaction Layer
   =========================================================== */

(function () {
  'use strict';

  /* ---------- Scroll-driven drone rotation + parallax ---------- */
  const droneCraft = document.getElementById('drone-craft');
  const droneWrap  = document.getElementById('drone-img-wrap');
  const readoutRot = document.getElementById('readout-rot');
  const heroStage  = document.getElementById('hero-stage');

  let mouseRotX = 0, mouseRotY = 0;
  let scrollRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragRotX = 0, dragRotY = 0;

  function updateDrone() {
    // Combined rotation
    const totalY = scrollRotY + mouseRotY + dragRotY;
    const totalX = mouseRotX + dragRotX;
    currentRotX += (totalX - currentRotX) * 0.12;
    currentRotY += (totalY - currentRotY) * 0.12;
    if (droneWrap) {
      droneWrap.style.transform =
        `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    }
    if (readoutRot) {
      const deg = Math.round(((currentRotY % 360) + 360) % 360);
      readoutRot.textContent = String(deg).padStart(3, '0') + '°';
    }
    requestAnimationFrame(updateDrone);
  }
  requestAnimationFrame(updateDrone);

  // Mouse parallax over the hero stage
  if (heroStage) {
    heroStage.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const r = heroStage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mouseRotY = ((e.clientX - cx) / r.width) * 18;
      mouseRotX = -((e.clientY - cy) / r.height) * 10;
    });
    heroStage.addEventListener('mouseleave', () => {
      mouseRotX = 0;
      mouseRotY = 0;
    });

    // Drag to spin
    heroStage.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      heroStage.setPointerCapture(e.pointerId);
      heroStage.style.cursor = 'grabbing';
      // Pause CSS spin while dragging
      droneCraft && droneCraft.classList.remove('spinning-y');
      droneCraft && droneCraft.classList.add('paused');
    });
    heroStage.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragRotY = (dx / 4);
      dragRotX = -(dy / 8);
    });
    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      heroStage.style.cursor = '';
      // Bake the drag rotation into scrollRotY so spinning resumes from current
      scrollRotY += dragRotY;
      dragRotY = 0;
      dragRotX *= 0.5;
      droneCraft && droneCraft.classList.add('spinning-y');
    }
    heroStage.addEventListener('pointerup', endDrag);
    heroStage.addEventListener('pointercancel', endDrag);
  }

  /* ---------- Platform stack: scroll-driven parallax ---------- */
  const stackList    = document.getElementById('stack-list');
  const stackScene   = document.getElementById('stack-scene');
  const platformSec  = document.getElementById('solution');
  const ppFill       = document.getElementById('sol-fill');

  if (stackList && stackScene && platformSec) {
    const items  = [...stackList.querySelectorAll('.loop-step')];
    const layers = [...stackScene.querySelectorAll('.layer-plate')];
    // Base z-positions for layers when "compact"
    const baseZ = [60, 20, -20, -60];

    let hoverLayer = -1;

    function applyStack(progress) {
      // progress 0..1 over the scrollable platform section
      const p = Math.max(0, Math.min(1, progress));
      // separation factor with ease-out cubic for satisfying deceleration
      const sep = 1 - Math.pow(1 - p, 2.5);
      // active layer index: 0..3 based on eased progress
      const activeIdx = Math.min(3, Math.floor(sep * 4));
      const idx = hoverLayer >= 0 ? hoverLayer : activeIdx;

      // Stage tilt eases out as you scroll
      stackScene.style.transform =
        `rotateX(${38 - p * 10}deg) rotateY(${-22 + p * 18}deg) rotateZ(${8 - p * 4}deg)`;

      layers.forEach((l, i) => {
        // Distance from active grows the separation
        const dist = i - idx;
        const absDist = Math.abs(dist);
        const z = baseZ[i] + dist * -180 * sep;
        const ry = dist * -8 * sep;
        const yShift = dist * 20 * sep;
        const isActive = i === idx;
        l.style.transform = `translateY(${yShift}px) translateZ(${z}px) rotateY(${ry}deg)`;
        // Active layer fully visible; others fade to near-transparent based on distance
        const opacity = isActive ? 1 : Math.max(0.06, 0.25 - absDist * 0.08) * sep + (1 - sep) * (isActive ? 1 : 0.5);
        l.style.opacity = opacity;
        l.classList.toggle('active', isActive);
      });

      // Mirror to right-side list
      items.forEach((it) => {
        it.classList.toggle('active', it.dataset.layer == String(idx));
      });

      if (ppFill) ppFill.style.width = (p * 100).toFixed(1) + '%';
    }

    // Hover overrides scroll-driven active layer briefly
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        hoverLayer = parseInt(item.dataset.layer, 10);
      });
      item.addEventListener('mouseleave', () => {
        hoverLayer = -1;
      });
      item.addEventListener('click', () => {
        // Scroll to a position within the platform section that activates this layer
        const rect = platformSec.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const scrollable = platformSec.offsetHeight - window.innerHeight;
        const layerIdx = parseInt(item.dataset.layer, 10);
        const target = top + scrollable * ((layerIdx + 0.5) / 4);
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });

    function updatePlatform() {
      const rect = platformSec.getBoundingClientRect();
      const scrollable = platformSec.offsetHeight - window.innerHeight;
      const progress = (-rect.top) / scrollable;
      applyStack(progress);
    }
    window.addEventListener('scroll', updatePlatform, { passive: true });
    window.addEventListener('resize', updatePlatform);
    updatePlatform();
  }

  /* ---------- Exploded view: scroll-driven radial explosion ---------- */
  const expSec    = document.getElementById('exploded');
  const expStage  = document.getElementById('exploded-stage');
  const expCenter = document.getElementById('exp-center');
  const expFill   = document.getElementById('ex-fill');
  const expFrame  = document.getElementById('exp-frame');
  const expSepEl  = document.getElementById('exp-sep');

  if (expSec && expStage) {
    const callouts = [...expStage.querySelectorAll('.exp-callout')];
    const rings    = [...expStage.querySelectorAll('.exp-ring')];

    function applyExplode(progress) {
      const p = Math.max(0, Math.min(1, progress));
      // Ease curve
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      // Center: zoom out + spin as it explodes
      if (expCenter) {
        const scale = 1 - eased * 0.35;
        const rot = eased * 30;
        expCenter.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
      }

      // Rings expand
      rings.forEach((r, i) => {
        const grow = 1 + eased * (0.4 + i * 0.2);
        r.style.transform = `translate(-50%, -50%) rotateX(70deg) scale(${grow})`;
        r.style.opacity = (0.3 - eased * 0.15) * (1 - i * 0.1);
      });

      // Callouts fly radially outward
      callouts.forEach((c) => {
        const deg = parseFloat(c.dataset.deg);
        const r = parseFloat(c.dataset.r) * eased;
        const rad = deg * Math.PI / 180;
        const tx = Math.cos(rad) * r;
        const ty = Math.sin(rad) * r;
        c.style.setProperty('--tx', tx + 'px');
        c.style.setProperty('--ty', ty + 'px');
        // Line back to center: length = r, rotation back toward center
        const lineRot = (deg + 180) * Math.PI / 180;
        const lineLen = Math.max(0, r - 20);
        c.style.setProperty('--line-len', lineLen + 'px');
        c.style.setProperty('--line-rot', (deg + 180) + 'deg');
        c.style.opacity = Math.min(1, eased * 2.2);
      });

      if (expFill)  expFill.style.width = (p * 100).toFixed(1) + '%';
      if (expFrame) expFrame.textContent = String(Math.round(p * 240)).padStart(3, '0');
      if (expSepEl) expSepEl.textContent = String(Math.round(eased * 100));
    }

    function updateExplode() {
      const rect = expSec.getBoundingClientRect();
      const scrollable = expSec.offsetHeight - window.innerHeight;
      const progress = (-rect.top) / scrollable;
      applyExplode(progress);
    }
    window.addEventListener('scroll', updateExplode, { passive: true });
    window.addEventListener('resize', updateExplode);
    updateExplode();
  }

  /* ---------- Tilt on hover for fleet cards ---------- */
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const img = el.querySelector('.fc-imgwrap');
    if (!img) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      img.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 10}deg) translateZ(20px)`;
    });
    el.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });

  /* ---------- 3D pointer tilt for system cards ---------- */
  document.querySelectorAll('[data-tilt3d]').forEach((el) => {
    const inner = el.querySelector('.sys-inner');
    if (!inner) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      inner.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(28px)`;
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      el.classList.add('lit');
    });
    el.addEventListener('mouseleave', () => {
      inner.style.transform = '';
      el.classList.remove('lit');
    });
  });

  /* ---------- Reveal-on-scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counted = new WeakSet();
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !counted.has(e.target)) {
        counted.add(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const unit   = el.querySelector('.unit');
        const dur = 1800;
        const t0 = performance.now();
        function step(t) {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          const v = Math.round(target * eased);
          el.firstChild.textContent = v.toLocaleString('en-IN');
          if (unit) el.appendChild(unit);
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countIO.observe(c));

  /* ---------- Subtle hero-grid parallax on scroll ---------- */
  const heroBg = document.querySelector('.hero-bg-grid');
  const heroGlow = document.querySelector('.hero-glow');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    // gentle scroll-rotation of the drone
    scrollRotY = (y * 0.15);
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.18}px)`;
    if (heroGlow) heroGlow.style.transform = `translate(${y * 0.05}px, calc(-50% + ${y * 0.25}px))`;
  }, { passive: true });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (t) {
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
      }
    });
  });

})();
