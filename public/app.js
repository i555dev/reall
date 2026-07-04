(() => {
  const dataEl = document.getElementById('projectsData');
  const projects = JSON.parse(dataEl.textContent);
  const projectWordmark = document.getElementById('projectWordmark');
  const $ = (id) => document.getElementById(id);
  const langToggle = $('langToggle');

  const experience = $('experience');
  const canvas = $('neuralField');
  const ctx = canvas.getContext('2d');
  const frameMedia = $('frameMedia');
  const frameWords = $('frameWords');
  const projectTrack = $('projectTrack');
  const stepTabs = $('stepTabs');
  const projectTitle = $('projectTitle');
  const feelingPanel = $('feelingPanel');
  const centerWord = $('centerWord');
  const stepTitle = $('stepTitle');
  const stepLabel = $('stepLabel');
  const meaningText = $('meaningText');
  const visualMass = $('visualMass');
  const neuralByStep = [
    { opacity: 0.82, speed: 1 },
    { opacity: 0.62, speed: 0.65 },
    { opacity: 0.44, speed: 0.38 },
    { opacity: 0.28, speed: 0.16 },
    { opacity: 0.16, speed: 0 }
  ];
  let neuralSpeed = 1;
  let projectIndex = Number(experience.dataset.initialProject || 0);
  let stepIndex = Number(experience.dataset.initialStep || 0);
  let viewMode = 'cover';
  let mediaIndex = 0;
  let mediaTimer = null;
  let wordTimer = null;
  let wordRaf = null;
  let wordParticles = [];
  let realityTimer = null;
  let realityIndex = 0;
  let currentLang = localStorage.getItem('reallLang') || '';

  const panelTitles = {
    en: { soul: 'FEELING', smart: 'STRUCTURE', meaning: 'MEANING' },
    ru: { soul: 'ЧУВСТВО', smart: 'ЛОГИКА', meaning: 'СМЫСЛ' }
  };

  function projectDefaultLang(project) {
    return ['olga', 'chaveta'].includes(String(project?.id || '').toLowerCase()) ? 'ru' : 'en';
  }

  function activeLang(project = projects[projectIndex]) {
    return currentLang || projectDefaultLang(project);
  }

  function pickLang(value, lang = currentLang) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    if ('ru' in value || 'en' in value) return value[lang] ?? value.en ?? value.ru ?? '';
    return value;
  }

  function localizeObject(item, lang = currentLang) {
    if (!item || typeof item !== 'object') return item;
    const localized = { ...item };
    const layer = item.i18n?.[lang] || item.lang?.[lang] || item[lang];
    if (layer && typeof layer === 'object' && !Array.isArray(layer)) {
      Object.assign(localized, layer);
    }

    ['name', 'subtitle', 'label', 'title', 'meaning', 'center'].forEach((key) => {
      localized[key] = pickLang(localized[key], lang);
    });

    return localized;
  }

  function getProject(index = projectIndex) {
    const source = projects[index];
    const lang = activeLang(source);
    const project = localizeObject(source, lang);
    project.steps = Array.isArray(source.steps)
      ? source.steps.map((step) => localizeObject(step, lang))
      : [];
    project.cover = source.cover ? localizeObject(source.cover, lang) : source.cover;
    return project;
  }

  function updatePanelTitles(project = getProject()) {
    const lang = activeLang(project);
    const titles = panelTitles[lang] || panelTitles.en;
    document.querySelectorAll('[data-panel-title]').forEach((node) => {
      node.textContent = titles[node.dataset.panelTitle] || '';
    });
  }

  function updateLangToggle(project = projects[projectIndex]) {
    if (!langToggle) return;
    const lang = activeLang(project);
    langToggle.textContent = lang === 'ru' ? 'RU' : 'EN';
    langToggle.setAttribute('aria-label', lang === 'ru' ? 'Переключить на English' : 'Switch to Russian');
  }

  const normalize = (value) => String(value || '').toLowerCase();

  function stopFrameMedia() {
    if (mediaTimer) {
      clearInterval(mediaTimer);
      mediaTimer = null;
    }
    mediaIndex = 0;
  }

  function startFrameMedia() {
    stopFrameMedia();

    const slides = Array.from(frameMedia.querySelectorAll('img'));
    if (slides.length <= 1) return;

    mediaTimer = setInterval(() => {
      slides[mediaIndex]?.classList.remove('active');
      mediaIndex = (mediaIndex + 1) % slides.length;
      slides[mediaIndex]?.classList.add('active');
    }, 7000);
  }

  function stopFrameWords() {
    if (wordTimer) {
      clearInterval(wordTimer);
      wordTimer = null;
    }

    if (wordRaf) {
      cancelAnimationFrame(wordRaf);
      wordRaf = null;
    }

    wordParticles = [];
    frameWords.classList.remove('active');
    frameWords.innerHTML = '';
  }

  const wordBehaviors = {
    float: {
      friction: 0.94,
      drift: 0.12,
      anchor: 0.0018,
      mouse: 0.34,
      collision: 0.42,
      opacity: 0.58
    },
    hit: {
      friction: 0.91,
      drift: 0.24,
      anchor: 0.0008,
      mouse: 0.92,
      collision: 1.1,
      opacity: 0.82
    },
    stuck: {
      friction: 0.84,
      drift: 0.035,
      anchor: 0.018,
      mouse: 0.12,
      collision: 0.18,
      opacity: 0.54
    },
    fade: {
      friction: 0.92,
      drift: 0.08,
      anchor: 0.002,
      mouse: 0.26,
      collision: 0.28,
      opacity: 0.42
    }
  };

  function normalizeFrameWord(item) {
    const source = typeof item === 'string' ? { text: item } : (item || {});
    const behavior = normalize(source.behavior || 'float');
    const tone = normalize(source.tone || 'black').replace(/[^a-z0-9_-]/g, '') || 'black';
    const weight = Number(source.weight);
    const speed = Number(source.speed);
    const opacity = Number(source.opacity);
    const angle = Number(source.angle);
    const spin = Number(source.spin);
    return {
      text: String(source.text || source.word || '').trim(),
      tone,
      behavior: wordBehaviors[behavior] ? behavior : 'float',
      weight: Number.isFinite(weight) ? Math.min(2.2, Math.max(0.45, weight)) : 1,
      speed: Number.isFinite(speed) ? Math.min(2.6, Math.max(0, speed)) : 1,
      opacity: Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : null,
      color: source.color || '',
      angle: Number.isFinite(angle) ? Math.min(90, Math.max(-90, angle)) : null,
      spin: Number.isFinite(spin) ? Math.min(0.6, Math.max(-0.6, spin)) : null
    };
  }

  function createFrameWord(config, index, total) {
    const word = document.createElement('span');
    word.className = `frame-word tone-${config.tone} behavior-${config.behavior}`;
    word.textContent = config.text;
    word.style.setProperty('--word-weight', String(config.weight));
    word.style.willChange = 'transform, opacity, filter';
    word.style.transition = 'opacity .35s ease, filter .35s ease, color .35s ease';

    if (config.color) {
      word.style.setProperty('--word-color', config.color);
    }

    frameWords.appendChild(word);

    const behavior = wordBehaviors[config.behavior] || wordBehaviors.float;
    const spread = total > 1 ? index / (total - 1) : 0.5;
    const x = width * (0.18 + Math.random() * 0.64);
    const y = height * (0.22 + Math.random() * 0.55);
    const baseSpeed = (0.34 + Math.random() * 0.58) * config.speed;
    const baseRotate = config.angle ?? (-7 + Math.random() * 14);
    const baseSpin = config.spin ?? (
      (Math.random() - 0.5) *
      (config.behavior === 'hit' ? 0.14 : 0.035) *
      config.speed
    );
    const particle = {
      el: word,
      text: config.text,
      behavior: config.behavior,
      weight: config.weight,
      speed: config.speed,
      opacity: config.opacity ?? behavior.opacity,
      x,
      y,
      ax: width * (0.15 + spread * 0.7) + (Math.random() - 0.5) * width * 0.18,
      ay: height * (0.28 + Math.random() * 0.42),
      vx: (Math.random() - 0.5) * baseSpeed * (config.behavior === 'hit' ? 7.5 : 3.2),
      vy: (Math.random() - 0.5) * baseSpeed * (config.behavior === 'hit' ? 5.8 : 2.8),
      rotate: baseRotate,
      spin: baseSpin,
      spinKick: 0,
      phase: Math.random() * Math.PI * 2,
      width: 80,
      height: 40,
      radius: 60
    };

    return particle;
  }

  function measureFrameWords() {
    wordParticles.forEach((particle) => {
      const rect = particle.el.getBoundingClientRect();
      particle.width = rect.width || particle.width;
      particle.height = rect.height || particle.height;
      particle.radius = Math.max(particle.width, particle.height) * 0.42;
    });
  }

  function updateFrameWords(time) {
    if (!wordParticles.length) return;

    if (tilt.active && isMobileView()) {
      mouse.x += (tilt.x - mouse.x) * 0.075;
      mouse.y += (tilt.y - mouse.y) * 0.075;
      mouse.active = true;
    }

    const mx = mouse.x * width;
    const my = mouse.y * height;

    for (const particle of wordParticles) {
      const behavior = wordBehaviors[particle.behavior] || wordBehaviors.float;
      const driftTime = time * 0.001 + particle.phase;

      particle.vx += Math.sin(driftTime * 0.85) * behavior.drift * particle.speed;
      particle.vy += Math.cos(driftTime * 0.72) * behavior.drift * particle.speed;

      particle.vx += (particle.ax - particle.x) * behavior.anchor;
      particle.vy += (particle.ay - particle.y) * behavior.anchor;

      if (particle.behavior === 'stuck') {
        particle.vx += Math.sin(driftTime * 0.45) * 0.018;
        particle.vy += Math.cos(driftTime * 0.4) * 0.014;
      }

      if (mouse.active) {
        const dx = particle.x - mx;
        const dy = particle.y - my;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const force = Math.max(0, 1 - dist / 310);

        if (force > 0) {
          const push = force * force * behavior.mouse * particle.speed;
          particle.vx += (dx / dist) * push * 7.2;
          particle.vy += (dy / dist) * push * 7.2;
          particle.spinKick += (Math.random() - 0.5) * push * 0.22;
        }
      }
    }

    for (let i = 0; i < wordParticles.length; i++) {
      for (let j = i + 1; j < wordParticles.length; j++) {
        const a = wordParticles[i];
        const b = wordParticles[j];

        if (a.behavior === 'stuck' && b.behavior === 'stuck') continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const minDist = (a.radius + b.radius) * 0.54;

        if (dist < minDist) {
          const overlap = (minDist - dist) / minDist;
          const nx = dx / dist;
          const ny = dy / dist;
          const strength = overlap * 1.35 * Math.max(
            wordBehaviors[a.behavior].collision,
            wordBehaviors[b.behavior].collision
          );

          a.vx -= nx * strength / Math.max(0.7, a.weight);
          a.vy -= ny * strength / Math.max(0.7, a.weight);
          b.vx += nx * strength / Math.max(0.7, b.weight);
          b.vy += ny * strength / Math.max(0.7, b.weight);

          const angularHit = Math.min(0.28, strength * 0.045);
          a.spinKick -= angularHit / Math.max(0.7, a.weight);
          b.spinKick += angularHit / Math.max(0.7, b.weight);
        }
      }
    }

    for (const particle of wordParticles) {
      const behavior = wordBehaviors[particle.behavior] || wordBehaviors.float;
      const halfW = particle.width * 0.5;
      const halfH = particle.height * 0.5;

      particle.vx *= behavior.friction;
      particle.vy *= behavior.friction;
      particle.spinKick *= 0.9;
      particle.spinKick = Math.max(-1.2, Math.min(1.2, particle.spinKick));

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotate += particle.spin + particle.spinKick;

      if (particle.x < halfW) {
        particle.x = halfW;
        particle.vx = Math.abs(particle.vx) * 0.76;
      }

      if (particle.x > width - halfW) {
        particle.x = width - halfW;
        particle.vx = -Math.abs(particle.vx) * 0.76;
      }

      if (particle.y < halfH + 72) {
        particle.y = halfH + 72;
        particle.vy = Math.abs(particle.vy) * 0.76;
      }

      if (particle.y > height - halfH - 44) {
        particle.y = height - halfH - 44;
        particle.vy = -Math.abs(particle.vy) * 0.76;
      }

      const fadePulse = particle.behavior === 'fade'
        ? 0.55 + Math.sin(time * 0.0015 + particle.phase) * 0.32
        : 1;
      particle.el.style.opacity = String(Math.max(0.08, particle.opacity * fadePulse));
      particle.el.style.filter = particle.behavior === 'hit' ? 'blur(0px)' : 'blur(0.8px)';
      particle.el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) translate(-50%, -50%) rotate(${particle.rotate}deg)`;
    }

    wordRaf = requestAnimationFrame(updateFrameWords);
  }

  function renderFrameWords(step) {
    stopFrameWords();

    const words = Array.isArray(step.words)
      ? step.words.map(normalizeFrameWord).filter((word) => word.text)
      : [];

    if (!words.length) return;

    const visibleWords = width < 900
      ? [...words].sort((a, b) => (b.weight || 1) - (a.weight || 1)).slice(0, 3)
      : words;

    frameWords.classList.add('active');
    wordParticles = visibleWords.map((word, index) => createFrameWord(word, index, visibleWords.length));

    requestAnimationFrame(() => {
      measureFrameWords();
      wordRaf = requestAnimationFrame(updateFrameWords);
    });
  }

  function renderFrameMedia(step) {
    stopFrameMedia();

    const media = Array.isArray(step.media) ? step.media : [];
    frameMedia.innerHTML = '';
    experience.classList.toggle('has-media', media.length > 0);

    if (!media.length) return;

    media.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.decoding = 'async';
      img.loading = index === 0 ? 'eager' : 'lazy';
      if (index === 0) img.classList.add('active');
      frameMedia.appendChild(img);
    });

    startFrameMedia();
  }


  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function stopRealityScreens() {
    if (realityTimer) {
      clearInterval(realityTimer);
      realityTimer = null;
    }
    realityIndex = 0;
  }

  function startRealityScreens(screens) {
    stopRealityScreens();

    if (!Array.isArray(screens) || screens.length <= 1) return;

    const img = visualMass.querySelector('[data-reality-screen]');
    if (!img) return;

    realityTimer = setInterval(() => {
      realityIndex = (realityIndex + 1) % screens.length;
      img.classList.add('is-changing');

      setTimeout(() => {
        img.src = screens[realityIndex];
        img.classList.remove('is-changing');
      }, 260);
    }, 3400);
  }

  function renderRealityVisual(visual) {
    const screens = Array.isArray(visual.screens) ? visual.screens.filter(Boolean) : [];
    const firstScreen = screens[0] || visual.content || '';
    const display = visual.display || '';

    return `
      <div class="reality-display-scene">
        ${display ? `
          <img class="reality-display-frame" src="${escapeHtml(display)}" alt="" decoding="async" loading="eager">
        ` : ''}

        <div class="reality-screen-mask">
          ${firstScreen ? `
            <img class="reality-screen-img" src="${escapeHtml(firstScreen)}" alt="" decoding="async" loading="eager" data-reality-screen>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderImageVisual(visual) {
    const src = visual.src || visual.image || visual.content || '';
    if (!src) return '';

    return `
      <div class="visual-image-scene">
        <img class="visual-image" src="${escapeHtml(src)}" alt="" decoding="async" loading="eager">
      </div>
    `;
  }

  function renderWordsVisual(visual) {
    const words = Array.isArray(visual.words) ? visual.words : [];
    if (!words.length) return '';

    return `
      <div class="visual-words-scene">
        ${words.map((item) => {
      const word = typeof item === 'string' ? { text: item } : (item || {});
      const tone = normalize(word.tone || 'black').replace(/[^a-z0-9_-]/g, '') || 'black';
      return `<span class="visual-word tone-${tone}">${escapeHtml(word.text || word.word || '')}</span>`;
    }).join('')}
      </div>
    `;
  }


  function renderCoverObject(visual) {
    const src = visual.src || visual.image || visual.content || '';
    if (!src) return '';

    return `
      <div class="cover-object-scene">
        <img class="cover-object-img" src="${escapeHtml(src)}" alt="" decoding="async" loading="eager">
      </div>
    `;
  }

  function renderVisualMass(step) {
    const visual = step.visual;

    if (!visual || !visual.type) return '';

    if (visual.type === 'realityDisplay') return renderRealityVisual(visual);
    if (visual.type === 'image') return renderImageVisual(visual);
    if (visual.type === 'words') return renderWordsVisual(visual);
    if (visual.type === 'coverObject') return renderCoverObject(visual);

    return '';
  }

  function updateVisualMass(step) {
    if (!visualMass) return;

    stopRealityScreens();

    const type = step.visual?.type || '';
    const html = renderVisualMass(step);

    visualMass.innerHTML = html;
    visualMass.className = 'visual-mass';
    visualMass.dataset.visualType = type || 'empty';
    visualMass.style.transform = '';
    visualMass.style.opacity = html ? '1' : '';
    visualMass.style.visibility = html ? 'visible' : '';

    if (type) {
      visualMass.classList.add(`visual-mass--${type}`);
    }

    if (type === 'realityDisplay') {
      startRealityScreens(step.visual.screens || []);
    }
  }

  const soulModeFallback = {
    question: 'cloud',
    feeling: 'stack',
    image: 'orbit',
    imagination: 'orbit',
    frame: 'frame',
    brief: 'frame',
    reality: 'quiet'
  };

  const safeSoulModes = new Set(['cloud', 'stack', 'orbit', 'frame', 'quiet']);

  function normalizeSoulWord(item, index, total, mode) {
    const source = typeof item === 'string' ? { text: item } : (item || {});
    const tone = normalize(source.tone || 'black').replace(/[^a-z0-9_-]/g, '') || 'black';
    const state = normalize(source.state || '');
    const size = Number(source.size);
    const rotate = Number(source.rotate);
    const opacity = Number(source.opacity);
    const weight = Number(source.weight);
    const x = Number(source.x);
    const y = Number(source.y);
    const pos = Number(source.pos);
    const spread = total > 1 ? index / (total - 1) : 0.5;

    let fallbackX = 18 + Math.random() * 68;
    let fallbackY = 18 + Math.random() * 68;

    if (mode === 'stack') {
      fallbackX = 50 + (Math.random() - 0.5) * 18;
      fallbackY = 14 + index * 10.5;
    }

    if (mode === 'orbit') {
      const angle = spread * Math.PI * 2 - Math.PI / 2;
      const radius = 30 + Math.sin(index * 1.7) * 7;
      fallbackX = 50 + Math.cos(angle) * radius;
      fallbackY = 50 + Math.sin(angle) * radius;
    }

    if (mode === 'quiet') {
      fallbackX = 26 + Math.random() * 54;
      fallbackY = 28 + Math.random() * 46;
    }

    const sides = ['top', 'right', 'bottom', 'left'];
    const side = normalize(source.side || (mode === 'frame' ? sides[index % sides.length] : ''));

    return {
      text: String(source.text || source.word || '').trim(),
      tone,
      state,
      x: Number.isFinite(x) ? x : fallbackX,
      y: Number.isFinite(y) ? y : fallbackY,
      size: Number.isFinite(size) ? size : 1,
      rotate: Number.isFinite(rotate) ? rotate : ((Math.random() - 0.5) * 16),
      opacity: Number.isFinite(opacity) ? opacity : 0.78,
      weight: Number.isFinite(weight) ? weight : 760,
      side,
      pos: Number.isFinite(pos) ? pos : (18 + (index % 4) * 21)
    };
  }

  function renderSoul(step) {
    if (!feelingPanel) return;

    if (step.soul === false || (Array.isArray(step.hide) && step.hide.includes('soul'))) {
      feelingPanel.innerHTML = '<div class="panel-title" data-panel-title="soul"></div>';
      updatePanelTitles();
      feelingPanel.style.opacity = '0';
      feelingPanel.hidden = true;
      return;
    }

    feelingPanel.hidden = false;

    const frameId = step.id || normalize(step.label);
    const source = step.soul || {
      mode: soulModeFallback[frameId] || 'cloud',
      words: Array.isArray(step.feeling) ? step.feeling : []
    };

    const mode = safeSoulModes.has(normalize(source.mode)) ? normalize(source.mode) : 'cloud';
    const words = Array.isArray(source.words)
      ? source.words.map((word, index) => normalizeSoulWord(word, index, source.words.length, mode)).filter((word) => word.text)
      : [];

    feelingPanel.className = `feeling-panel soul-panel soul-${mode}`;

    if (!words.length) {
      feelingPanel.innerHTML = '<div class="panel-title" data-panel-title="soul"></div>';
      updatePanelTitles();
      return;
    }

    const titleHtml = '<div class="panel-title" data-panel-title="soul"></div>';
    feelingPanel.innerHTML = titleHtml + words.map((word, index) => {
      const side = ['top', 'right', 'bottom', 'left'].includes(word.side) ? word.side : '';
      const stateClass = word.state === 'reject' || word.state === 'rejected'
        ? ' is-rejected'
        : word.state === 'want' || word.state === 'wanted'
          ? ' is-wanted'
          : '';
      const style = [
        `--i:${index}`,
        `--x:${Math.max(0, Math.min(100, word.x))}%`,
        `--y:${Math.max(0, Math.min(100, word.y))}%`,
        `--s:${Math.max(0.35, Math.min(2.4, word.size))}`,
        `--r:${Math.max(-90, Math.min(90, word.rotate))}deg`,
        `--o:${Math.max(0.08, Math.min(1, word.opacity))}`,
        `--w:${Math.max(100, Math.min(950, word.weight))}`,
        `--pos:${Math.max(0, Math.min(100, word.pos))}%`
      ].join(';');

      return `<span class="soul-word tone-${word.tone}${stateClass}${side ? ` side-${side}` : ''}" style="${style}">${escapeHtml(word.text)}</span>`;
    }).join('');
    updatePanelTitles();
  }

  function renderSmart(step, project) {
    const fallbackSmart = {
      status: 'LIVE',
      rows: [
        { label: 'SYSTEMS', value: '24' },
        { label: 'CONNECTIONS', value: '1,284' },
        { label: 'GROWTH', value: '+38%', highlight: true }
      ]
    };

    const smart = step.smart ?? project.smart ?? fallbackSmart;

    if (!smartPanel || !smartStatus || !smartRows) return;

    smartPanel.hidden = smart === false;

    if (smart === false) {
      smartStatus.textContent = '';
      smartRows.innerHTML = '';
      updatePanelTitles(project);
      return;
    }

    smartStatus.textContent = smart.status || fallbackSmart.status;
    const rows = Array.isArray(smart.rows) ? smart.rows : fallbackSmart.rows;

    smartRows.innerHTML = rows.map((row) => `
      <div class="smart-row">
        <small>${escapeHtml(row.label)}</small>
        <strong class="${row.highlight ? 'green' : ''}">${escapeHtml(row.value)}</strong>
      </div>
    `).join('');
    updatePanelTitles(project);
  }

  function renderProjectRail() {
    projectTrack.innerHTML = projects.map((sourceProject, index) => {
      const project = getProject(index);
      return `
      <button class="project-pill ${index === projectIndex ? 'active' : ''}" data-project="${index}" type="button">
        <span>${project.name}</span><small>${project.subtitle}</small>
      </button>
    `;
    }).join('');

    projectTrack.querySelectorAll('[data-project]').forEach((button) => {
      button.addEventListener('click', () => setCover(Number(button.dataset.project)));
    });
  }

  function renderStepTabs() {
    const steps = getProject(projectIndex).steps;

    stepTabs.innerHTML = steps.map((step, index) => `
      <button class="step-tab ${viewMode === 'step' && index === stepIndex ? 'active' : ''}" data-step="${index}" type="button">
        <b>${String(index + 1).padStart(2, '0')}</b><span>${step.label}</span>
      </button>
    `).join('');

    stepTabs.querySelectorAll('[data-step]').forEach((button) => {
      button.addEventListener('click', () => setState(projectIndex, Number(button.dataset.step)));
    });
  }

  function getCover(project) {
    return project.cover || {
      id: 'cover',
      label: 'Intro',
      center: project.name || '',
      title: project.subtitle || '',
      meaning: project.subtitle || '',
      object: 'none',
      media: [],
      visual: { type: 'words', words: [{ text: project.name || '', tone: 'black' }] }
    };
  }

  function setCover(nextProjectIndex = projectIndex) {
    viewMode = 'cover';
    projectIndex = nextProjectIndex;
    stepIndex = 0;

    const project = getProject(projectIndex);
    const cover = getCover(project);
    const accent = cover.accent || project.accent || '#24b837';
    const object = cover.object || (cover.visual ? project.id : 'none');

    neuralSpeed = 0.35;
    document.documentElement.style.setProperty('--accent', accent);

    if (experience) {
      experience.style.setProperty('--neural-opacity', '0.52');
      experience.dataset.project = project.id;
      experience.dataset.frame = 'cover';
      experience.dataset.mode = 'cover';
      experience.dataset.layout = cover.layout || '';
      experience.dataset.object = object;
    }

    if (projectTitle) projectTitle.dataset.stepNumber = '';

    if (projectWordmark) {
      projectWordmark.textContent = project.name;
      projectWordmark.style.setProperty('--project-wordmark-opacity', '0.08');
    }

    renderFrameMedia(cover);
    stopFrameWords();
    updateVisualMass(cover);
    renderProjectRail();
    renderStepTabs();
    updateLangToggle(projects[projectIndex]);
    updatePanelTitles(project);

    if (smartPanel) smartPanel.hidden = true;
    if (feelingPanel) {
      feelingPanel.innerHTML = '';
      feelingPanel.style.opacity = '0';
    }

    const textNodes = [centerWord, stepTitle, stepLabel, meaningText].filter(Boolean);
    textNodes.forEach((el) => {
      el.style.transition = 'opacity .24s ease, transform .24s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
    });

    setTimeout(() => {
      if (centerWord) centerWord.textContent = cover.center || project.name || '';
      if (stepTitle) stepTitle.textContent = cover.title || project.subtitle || '';
      if (stepLabel) stepLabel.textContent = cover.label || 'Intro';
      if (meaningText) meaningText.innerHTML = cover.meaning || '';

      textNodes.forEach((el, index) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 28);
      });
    }, 120);
  }

  function setState(nextProjectIndex, nextStepIndex) {
    viewMode = 'step';
    projectIndex = nextProjectIndex;
    stepIndex = nextStepIndex;

    const project = getProject(projectIndex);
    const step = project.steps[stepIndex];
    const neuralState = neuralByStep[stepIndex] ?? neuralByStep[0];
    const accent = step.accent || project.accent || '#24b837';
    const object = step.object || (step.visual ? project.id : 'none');
    const frameId = step.id || normalize(step.label);
    const wordmarkOpacityByStep = [0.18, 0.28, 0.48, 0.72, 1];

    neuralSpeed = neuralState.speed;
    document.documentElement.style.setProperty('--accent', accent);

    if (experience) {
      experience.style.setProperty('--neural-opacity', String(neuralState.opacity));
      experience.dataset.project = project.id;
      experience.dataset.frame = frameId;
      experience.dataset.mode = 'step';
      experience.dataset.layout = step.layout || '';
      experience.dataset.object = object;
    }

    if (projectTitle) {
      projectTitle.dataset.stepNumber = String(stepIndex + 1).padStart(2, '0');
    }

    if (projectWordmark) {
      projectWordmark.textContent = project.name;
      projectWordmark.style.setProperty(
        '--project-wordmark-opacity',
        String(wordmarkOpacityByStep[stepIndex] ?? 1)
      );
    }

    renderFrameMedia(step);
    if (Array.isArray(step.hide) && step.hide.includes('mind')) stopFrameWords();
    else renderFrameWords(step);
    updateVisualMass(step);
    renderSmart(step, project);
    if (smartPanel && Array.isArray(step.hide) && step.hide.includes('smart')) smartPanel.hidden = true;
    renderProjectRail();
    renderStepTabs();
    updateLangToggle(projects[projectIndex]);

    const textNodes = [centerWord, stepTitle, stepLabel, meaningText].filter(Boolean);

    if (feelingPanel) {
      feelingPanel.style.transition = 'opacity .24s ease, transform .24s ease';
      feelingPanel.style.opacity = '0';
      feelingPanel.style.transform = 'translateY(10px)';
    }

    textNodes.forEach((el) => {
      el.style.transition = 'opacity .24s ease, transform .24s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
    });

    setTimeout(() => {
      if (centerWord) centerWord.textContent = step.center || '';
      if (stepTitle) stepTitle.textContent = step.title || '';
      if (stepLabel) stepLabel.textContent = step.label || '';
      if (meaningText) meaningText.innerHTML = step.meaning || '';

      updatePanelTitles(project);
      renderSoul(step);

      if (feelingPanel && !feelingPanel.hidden) {
        feelingPanel.style.opacity = '1';
        feelingPanel.style.transform = 'translateY(0)';
      }

      textNodes.forEach((el, index) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 28);
      });
    }, 240);
  }

  $('railLeft').addEventListener('click', () => projectTrack.scrollBy({ left: -280, behavior: 'smooth' }));
  $('railRight').addEventListener('click', () => projectTrack.scrollBy({ left: 280, behavior: 'smooth' }));

  if (langToggle) {
    updateLangToggle();
    langToggle.addEventListener('click', () => {
      currentLang = activeLang(projects[projectIndex]) === 'ru' ? 'en' : 'ru';
      localStorage.setItem('reallLang', currentLang);
      updateLangToggle(projects[projectIndex]);
      if (viewMode === 'cover') setCover(projectIndex);
      else setState(projectIndex, stepIndex);
    });
  }

  const backdrop = $('modalBackdrop');
  const about = $('aboutModal');
  const contact = $('contactModal');

  function openModal(modal) {
    backdrop.classList.add('active');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModals() {
    backdrop.classList.remove('active');
    [about, contact].forEach((modal) => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  const aboutOpen = $('aboutOpen');
  if (aboutOpen && localStorage.getItem('reallAboutOpened') !== '1') {
    aboutOpen.classList.add('is-pulsing');
  }

  aboutOpen.addEventListener('click', () => {
    localStorage.setItem('reallAboutOpened', '1');
    aboutOpen.classList.remove('is-pulsing');
    openModal(about);
  });
  $('contactOpen').addEventListener('click', () => openModal(contact));
  $('aboutClose').addEventListener('click', closeModals);
  $('contactClose').addEventListener('click', closeModals);
  backdrop.addEventListener('click', closeModals);

  function setProjectByOffset(offset) {
    const nextProjectIndex = (projectIndex + offset + projects.length) % projects.length;

    if (viewMode === 'cover') {
      setCover(nextProjectIndex);
      return;
    }

    const nextSteps = getProject(nextProjectIndex).steps;
    setState(nextProjectIndex, Math.min(stepIndex, nextSteps.length - 1));
  }

  function setStepByOffset(offset) {
    const steps = getProject(projectIndex).steps;

    if (viewMode === 'cover') {
      setState(projectIndex, offset > 0 ? 0 : steps.length - 1);
      return;
    }

    const nextStepIndex = (stepIndex + offset + steps.length) % steps.length;
    setState(projectIndex, nextStepIndex);
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'ArrowRight') setProjectByOffset(1);
    if (event.key === 'ArrowLeft') setProjectByOffset(-1);
    if (event.key === 'ArrowDown') setStepByOffset(1);
    if (event.key === 'ArrowUp') setStepByOffset(-1);
    if (event.key === 'Escape') closeModals();
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  const mouse = { x: 0.5, y: 0.5, active: false };
  const tilt = { x: 0.5, y: 0.5, active: false, ready: false };

  function isMobileView() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function handleDeviceOrientation(event) {
    if (!isMobileView()) return;

    const gamma = Math.max(-28, Math.min(28, Number(event.gamma) || 0));
    const beta = Math.max(18, Math.min(66, Number(event.beta) || 42));

    tilt.x = 0.5 + gamma / 80;
    tilt.y = 0.5 + (beta - 42) / 110;
    tilt.active = true;
  }

  function enableTilt() {
    if (tilt.ready || !('DeviceOrientationEvent' in window)) return;
    tilt.ready = true;
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
  }

  async function requestTilt() {
    const Orientation = window.DeviceOrientationEvent;

    if (Orientation && typeof Orientation.requestPermission === 'function') {
      try {
        const permission = await Orientation.requestPermission();
        if (permission === 'granted') enableTilt();
      } catch (_) {
        // keep default animation when permission is denied
      }
      return;
    }

    enableTilt();
  }

  window.addEventListener('pointerdown', requestTilt, { once: true, passive: true });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = width < 900 ? 105 : 300;//плотность нейросети

    points = Array.from({ length: count }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random();

      return {
        x,
        y,
        ox: x,
        oy: y,
        vx: 0,
        vy: 0,
        d: r > 0.95 ? 2.4 + Math.random() :
          r > 0.75 ? 1.3 + Math.random() * 0.8 :
            0.4 + Math.random() * 0.6
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    if (tilt.active && isMobileView()) {
      mouse.x += (tilt.x - mouse.x) * 0.045;
      mouse.y += (tilt.y - mouse.y) * 0.045;
      mouse.active = true;
    }

    const mx = mouse.x * width;
    const my = mouse.y * height;
    const time = performance.now();

    for (const p of points) {
      const driftX = Math.sin(time * 0.00022 + p.oy * 0.008) * 0.18 * p.d;
      const driftY = Math.cos(time * 0.00020 + p.ox * 0.008) * 0.18 * p.d;

      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.hypot(dx, dy);
      const force = mouse.active ? Math.max(0, 1 - dist / 680) : 0;
      const angle = Math.atan2(dy, dx);

      p.vx +=
        (p.ox - p.x) * 0.0016 +
        Math.cos(angle + Math.PI / 2) * force * 0.72 +
        dx * force * 0.0024 +
        driftX;

      p.vy +=
        (p.oy - p.y) * 0.0016 +
        Math.sin(angle + Math.PI / 2) * force * 0.72 +
        dy * force * 0.0024 +
        driftY;

      p.vx *= 0.30;
      p.vy *= 0.30;
      p.x += p.vx * neuralSpeed;
      p.y += p.vy * neuralSpeed;
    }

    const renderPoint = (p) => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.hypot(dx, dy);
      const pull = mouse.active ? Math.max(0, 1 - dist / 520) : 0;
      const angle = Math.atan2(dy, dx);

      return {
        x: p.x + Math.cos(angle) * pull * 48 + Math.cos(angle + Math.PI / 2) * pull * 30,
        y: p.y + Math.sin(angle) * pull * 48 + Math.sin(angle + Math.PI / 2) * pull * 30
      };
    };

    const rendered = points.map(renderPoint);
    const max = width < 900 ? 180 : 240; // кол-во связей нейросети

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = rendered[i];
        const b = rendered[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < max) {
          const alpha = (1 - dist / max) * 0.24; // "громкость" линии
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.20, alpha)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    const pulse = 1 + Math.sin(time * 0.0014) * 0.14;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const rp = rendered[i];
      const big = p.d > 2;

      const radius = big ? 5.1 * pulse : 1.5 * p.d;
      const glowRadius = big ? 24 * pulse : 4 * p.d;
      const glow = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, glowRadius);

      glow.addColorStop(0, big ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)');
      glow.addColorStop(0.35, big ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = big ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.78)';
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', (event) => {
    if (!isMobileView()) {
      mouse.x = event.clientX / width;
      mouse.y = event.clientY / height;
      mouse.active = true;
    }

    const visualType = visualMass?.dataset.visualType;
    const canMoveVisualMass = visualMass
      && experience.dataset.object !== 'none'
      && visualType !== 'realityDisplay'
      && visualType !== 'coverObject';

    if (canMoveVisualMass) {
      visualMass.style.transform = `rotateY(${(mouse.x - 0.5) * 8}deg) rotateX(${(0.5 - mouse.y) * 6}deg) translate(${(mouse.x - 0.5) * 18}px, ${(mouse.y - 0.5) * 12}px)`;
    }
  });

  window.addEventListener('pointerleave', () => {
    mouse.active = false;

    const visualType = visualMass?.dataset.visualType;
    if (visualMass && visualType !== 'realityDisplay' && visualType !== 'coverObject') {
      visualMass.style.transform = '';
    }
  });

  let mobileStepsHinted = false;

  function hintMobileSteps() {
    if (mobileStepsHinted || !isMobileView() || !stepTabs) return;

    mobileStepsHinted = true;
    setTimeout(() => {
      stepTabs.classList.remove('is-hinting');
      void stepTabs.offsetWidth;
      stepTabs.classList.add('is-hinting');
      setTimeout(() => stepTabs.classList.remove('is-hinting'), 2800);
    }, 1200);
  }

  window.addEventListener('resize', resize);
  updateLangToggle(projects[projectIndex]);
  resize();
  setCover(projectIndex);
  hintMobileSteps();
  requestAnimationFrame(draw);
})();
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const submitButton = contactForm.querySelector(".send-button");

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        contactForm.reset();
        formStatus.textContent = "Sent. I’ll get back to you.";
        submitButton.textContent = "Sent";
      } else {
        formStatus.textContent = "Something went wrong. Try again.";
        submitButton.textContent = "Send";
        submitButton.disabled = false;
      }
    } catch (error) {
      formStatus.textContent = "Connection error. Try again.";
      submitButton.textContent = "Send";
      submitButton.disabled = false;
    }
  });
}