import { gsap } from 'gsap';

type Point = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  depth: number;
};

const canvas = document.querySelector<HTMLCanvasElement>('[data-network]');
const stage = document.querySelector<HTMLElement>('[data-stage]');
const title = document.querySelector<HTMLElement>('[data-title]');
const question = document.querySelector<HTMLElement>('[data-question]');
const frame = document.querySelector<HTMLElement>('[data-frame]');

const mouse = { x: 0.5, y: 0.5, active: false };
let points: Point[] = [];
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;

function buildPoints() {
  const count = window.innerWidth < 900 ? 56 : 128;
  points = Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      x,
      y,
      ox: x,
      oy: y,
      vx: 0,
      vy: 0,
      depth: 0.35 + Math.random() * 0.9
    };
  });
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx = canvas.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildPoints();
}

function animateNetwork() {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  const mx = mouse.x * width;
  const my = mouse.y * height;

  for (const p of points) {
    const driftX = Math.sin(Date.now() * 0.00022 + p.oy * 0.01) * 0.22 * p.depth;
    const driftY = Math.cos(Date.now() * 0.00018 + p.ox * 0.01) * 0.22 * p.depth;

    const dx = mx - p.x;
    const dy = my - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = mouse.active ? Math.max(0, 1 - dist / 260) : 0;

    p.vx += (p.ox - p.x) * 0.002 + dx * force * 0.0007 + driftX;
    p.vy += (p.oy - p.y) * 0.002 + dy * force * 0.0007 + driftY;
    p.vx *= 0.88;
    p.vy *= 0.88;
    p.x += p.vx;
    p.y += p.vy;
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = window.innerWidth < 900 ? 105 : 140;

      if (dist < max) {
        const alpha = (1 - dist / max) * 0.16;
        ctx.strokeStyle = `rgba(8,8,7,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const p of points) {
    ctx.fillStyle = `rgba(8,8,7,${0.18 * p.depth})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2 * p.depth, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animateNetwork);
}

function intro() {
  gsap.fromTo('.top-nav', { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' });
  gsap.fromTo('.left-panel', { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 1.15, delay: 0.18, ease: 'power3.out' });
  gsap.fromTo('.right-panel', { x: 26, opacity: 0 }, { x: 0, opacity: 1, duration: 1.15, delay: 0.28, ease: 'power3.out' });
  gsap.fromTo('.object-orbit', { scale: 0.82, opacity: 0, rotate: -4 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.35, delay: 0.25, ease: 'power3.out' });
  gsap.fromTo('.hero-copy', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, delay: 0.42, ease: 'power3.out' });
  gsap.to('.hex-cloud', { rotate: 2, y: -8, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}

function wireMouse() {
  window.addEventListener('pointermove', (event) => {
    mouse.x = event.clientX / window.innerWidth;
    mouse.y = event.clientY / window.innerHeight;
    mouse.active = true;

    const rx = (mouse.x - 0.5) * 8;
    const ry = (mouse.y - 0.5) * -8;

    gsap.to('.object-orbit', {
      rotateY: rx,
      rotateX: ry,
      x: (mouse.x - 0.5) * 18,
      y: (mouse.y - 0.5) * 12,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  window.addEventListener('pointerleave', () => {
    mouse.active = false;
    gsap.to('.object-orbit', { rotateY: 0, rotateX: 0, x: 0, y: 0, duration: 1.2, ease: 'power2.out' });
  });
}

export const filmStates = [
  {
    id: 'question',
    title: 'WALLS',
    question: 'WHY ARE WALLS STILL DEAD?',
    frame: 'DEAD / LIVE / WALL / HOUSE'
  },
  {
    id: 'feeling',
    title: 'PAINT',
    question: 'PAINT. REPEAT. FLATNESS.',
    frame: 'BOREDOM → SURFACE'
  },
  {
    id: 'image',
    title: 'JUNGLE',
    question: 'WHAT IF LIFE TAKES THE WALL?',
    frame: 'COAT / SPIDER / RUINS / JUNGLE'
  },
  {
    id: 'frame',
    title: 'ARCHITECTURE',
    question: 'PLANTS BECOME SURFACE.',
    frame: 'PLANTS → SURFACE → ARCHITECTURE'
  },
  {
    id: 'reality',
    title: 'LIVETILE',
    question: 'A NEW LAYER OF HOME.',
    frame: 'FRESH GREENS, BUILT INTO THE WALL'
  }
];

let current = 4;

function setState(index: number) {
  current = (index + filmStates.length) % filmStates.length;
  const state = filmStates[current];

  gsap.to([title, question, frame], {
    opacity: 0,
    y: 10,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      if (title) title.textContent = state.title;
      if (question) question.textContent = state.question;
      if (frame) frame.textContent = state.frame;

      gsap.to([title, question, frame], {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.04,
        ease: 'power3.out'
      });
    }
  });
}

function wireKeyboard() {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === ' ') setState(current + 1);
    if (event.key === 'ArrowLeft') setState(current - 1);
  });
}

if (canvas && stage) {
  resize();
  window.addEventListener('resize', resize);
  wireMouse();
  wireKeyboard();
  intro();
  requestAnimationFrame(animateNetwork);
}
