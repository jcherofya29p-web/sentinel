/* =========================================================
   SENTINEL · Scripts v2
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverDevice = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Año automático ----------
  $('#year').textContent = new Date().getFullYear();

  // ---------- Titular: palabra por palabra ----------
  function splitWords(el) {
    let i = 0;
    const nodes = [...el.childNodes];
    el.textContent = '';
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { if (part) el.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--wd', `${0.25 + i++ * 0.07}s`);
          w.innerHTML = '<span></span>';
          w.firstChild.textContent = part;
          el.appendChild(w);
        });
      } else {
        const w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--wd', `${0.25 + i++ * 0.07}s`);
        const inner = document.createElement('span');
        inner.appendChild(node);
        w.appendChild(inner);
        el.appendChild(w);
      }
    });
  }
  $$('.split-words').forEach(splitWords);

  // ---------- Preloader → entrada del hero ----------
  const ready = () => { root.classList.add('loaded'); $('.hero').classList.add('ready'); };
  window.addEventListener('load', () => setTimeout(ready, 500));
  setTimeout(ready, 2800); // por si alguna imagen tarda

  // ---------- Franja infinita (duplicar contenido) ----------
  const track = $('.marquee__track');
  if (track) track.appendChild(track.firstElementChild.cloneNode(true));

  // ---------- Menú móvil ----------
  const burger = $('#burger');
  const nav = $('#nav');
  const closeMenu = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));

  // ---------- Scroll: progreso, header, botón subir ----------
  const header = $('#header');
  const progress = $('#progress');
  const toTop = $('#toTop');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------- Menú activo según la sección ----------
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  // ---------- Aparición al hacer scroll ----------
  const reveals = $$('.reveal');
  reveals.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${sibs.indexOf(el) * 90}ms`);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ---------- Contadores ----------
  const counters = $$('[data-count]');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const target = +e.target.dataset.count;
      if (reduce) return;
      const t0 = performance.now();
      const dur = 1600;
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        e.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countIO.observe(c));

  // ---------- Efectos con el mouse (solo escritorio) ----------
  if (hoverDevice && !reduce) {
    // luz que sigue el cursor en tarjetas
    $$('.tile').forEach(t => t.addEventListener('pointermove', e => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', `${e.clientX - r.left}px`);
      t.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));

    // parallax del hero + luz de fondo
    const hero = $('.hero');
    const depthEls = $$('[data-depth]', hero);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
      depthEls.forEach(el => {
        const d = +el.dataset.depth;
        el.style.setProperty('--px', `${-nx * d}px`);
        el.style.setProperty('--py', `${-ny * d}px`);
      });
    });
    hero.addEventListener('pointerleave', () => depthEls.forEach(el => {
      el.style.setProperty('--px', '0px'); el.style.setProperty('--py', '0px');
    }));

    // botones magnéticos
    $$('.btn--magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
        b.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }

  // ---------- Simulación de caída (Cómo funciona) ----------
  const steps = $$('#steps .step');
  const fill = $('#stepsFill');
  const simBtn = $('#simBtn');
  const simStatus = $('#simStatus');
  const msgs = [
    'Paso 1 · Sentinel está colocado en la prenda y monitoreando…',
    'Paso 2 · ¡Caída detectada! Analizando el movimiento…',
    'Paso 3 · Alerta enviada: el celular de la familia ya recibió el aviso.'
  ];
  let timers = [];
  let simDone = false;

  function setStep(i) {
    steps.forEach((s, n) => s.classList.toggle('active', n === i || (i === 2 && n < 3)));
    fill.style.width = `${(i / 2) * 100}%`;
    simStatus.textContent = msgs[i];
  }
  function runSim() {
    timers.forEach(clearTimeout);
    timers = [];
    simBtn.disabled = true;
    simBtn.querySelector('span').textContent = 'Simulando…';
    steps.forEach(s => s.classList.remove('active'));
    fill.style.width = '0%';
    [0, 1, 2].forEach(i => timers.push(setTimeout(() => setStep(i), 300 + i * 1500)));
    timers.push(setTimeout(() => {
      simBtn.disabled = false;
      simBtn.querySelector('span').textContent = 'Repetir simulación';
      simDone = true;
    }, 300 + 2 * 1500 + 600));
  }
  simBtn.addEventListener('click', runSim);

  // se reproduce sola la primera vez que la sección es visible
  const stepsIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !simDone) { stepsIO.disconnect(); setTimeout(runSim, 500); }
    });
  }, { threshold: 0.5 });
  stepsIO.observe($('#steps'));

  // ---------- Visor 3D: controles ----------
  const mv = $('#mv');
  const rotateBtn = $('#mvRotate');
  rotateBtn.addEventListener('click', () => {
    const on = mv.hasAttribute('auto-rotate');
    on ? mv.removeAttribute('auto-rotate') : mv.setAttribute('auto-rotate', '');
    rotateBtn.setAttribute('aria-pressed', String(!on));
  });
  $('#mvReset').addEventListener('click', () => {
    mv.cameraOrbit = '0deg 75deg auto';
    mv.cameraTarget = 'auto auto auto';
    mv.fieldOfView = 'auto';
    if (mv.jumpCameraToGoal) mv.jumpCameraToGoal();
  });
  $('#mvFull').addEventListener('click', () => {
    const v = $('#viewer');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (v.requestFullscreen) v.requestFullscreen();
  });

  // ---------- Galería: visor ampliado ----------
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const openLb = src => { lbImg.src = src; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; };
  $$('.gallery__item').forEach(fig => fig.addEventListener('click', () => {
    const img = $('img', fig);
    if (img) openLb(img.src);
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // ---------- Formulario de contacto ----------
  // NOTA: por ahora solo valida y muestra un mensaje.
  // Para recibir los datos conecta el formulario con tu backend
  // (PHP, Formspree, EmailJS, etc.) en el lugar indicado abajo.
  const form = $('#contactForm');
  const formMsg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    formMsg.className = 'form__msg';
    const { nombre, correo } = form;
    [nombre, correo].forEach(f => f.classList.remove('is-invalid'));
    const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim());

    if (!nombre.value.trim() || !correoOk) {
      if (!nombre.value.trim()) nombre.classList.add('is-invalid');
      if (!correoOk) correo.classList.add('is-invalid');
      formMsg.textContent = 'Por favor completa tu nombre y un correo válido.';
      formMsg.classList.add('error');
      return;
    }

    // >>> AQUÍ puedes enviar los datos a tu servidor:
    // fetch('enviar.php', { method: 'POST', body: new FormData(form) })

    formMsg.textContent = '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.';
    formMsg.classList.add('ok');
    form.reset();
  });
})();
