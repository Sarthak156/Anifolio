/* ============================================
   Cursor, Music, Easter Egg (v2)
   ============================================ */

// ── Custom Cursor ──
class GhostCursor {
  constructor() {
    if (window.innerWidth <= 768) return;
    this.el = document.querySelector('.custom-cursor');
    this.trails = [];
    this.mx = 0; this.my = 0;
    this.cx = 0; this.cy = 0;
    for (let i = 0; i < 4; i++) {
      const t = document.createElement('div');
      t.className = 'cursor-trail';
      t.style.opacity = 0.25 - i * 0.05;
      t.style.width = t.style.height = (6 - i) + 'px';
      document.body.appendChild(t);
      this.trails.push({ el: t, x: 0, y: 0 });
    }
    document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
    document.body.classList.add('custom-cursor-active');
    this.loop();
  }
  loop() {
    this.cx += (this.mx - this.cx) * 0.15;
    this.cy += (this.my - this.cy) * 0.15;
    if (this.el) this.el.style.transform = `translate(${this.cx - 18}px, ${this.cy - 18}px)`;
    let px = this.cx, py = this.cy;
    this.trails.forEach((t, i) => {
      const s = 0.08 - i * 0.01;
      t.x += (px - t.x) * s;
      t.y += (py - t.y) * s;
      t.el.style.transform = `translate(${t.x - 3}px, ${t.y - 3}px)`;
      px = t.x; py = t.y;
    });
    requestAnimationFrame(() => this.loop());
  }
}

// ── Music Player ──
class MusicPlayer {
  constructor() {
    this.btn = document.querySelector('.music-toggle');
    this.audio = new Audio();
    this.audio.src = 'https://cdn.pixabay.com/audio/2024/11/28/audio_3eca47db5a.mp3';
    this.audio.loop = true;
    this.audio.volume = 0;
    this.playing = false;
    this.btn?.addEventListener('click', () => this.toggle());
  }
  toggle() {
    this.playing ? this.fadeOut() : this.fadeIn();
  }
  fadeIn() {
    this.audio.play().then(() => {
      this.playing = true;
      this.btn.classList.add('playing');
      let v = 0;
      const f = setInterval(() => { v += 0.02; if (v >= 0.25) { v = 0.25; clearInterval(f); } this.audio.volume = v; }, 50);
    }).catch(() => {});
  }
  fadeOut() {
    let v = this.audio.volume;
    const f = setInterval(() => { v -= 0.02; if (v <= 0) { v = 0; this.audio.pause(); this.playing = false; this.btn.classList.remove('playing'); clearInterval(f); } this.audio.volume = v; }, 50);
  }
}

// ── Easter Egg ──
class EasterEgg {
  constructor() {
    this.overlay = document.querySelector('.easter-egg-overlay');
    this.clicks = 0;
    this.timer = null;
    const target = document.querySelector('.hero-name');
    if (!target || !this.overlay) return;
    target.addEventListener('click', () => {
      this.clicks++;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.clicks = 0, 500);
      if (this.clicks >= 3) { this.trigger(); this.clicks = 0; }
    });
    this.overlay.addEventListener('click', () => this.dismiss());
  }
  trigger() { this.overlay.classList.add('active'); setTimeout(() => this.dismiss(), 4000); }
  dismiss() { this.overlay.classList.remove('active'); }
}

window.GhostCursor = GhostCursor;
window.MusicPlayer = MusicPlayer;
window.EasterEgg = EasterEgg;
