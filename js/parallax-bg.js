/* ============================================
   Parallax Mountain Background
   ============================================ */

class ParallaxBackground {
  constructor() {
    this.root = document.querySelector('.parallax-background');
    this.scene = this.root?.querySelector('.scene');
    this.layers = this.root ? Array.from(this.root.querySelectorAll('.parallax-layer')) : [];
    this.currentPreset = null;
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.sceneWidth = 1425;
    this.sceneHeight = 820;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.presets = {
      landing: {
        accent: 'rgba(141, 255, 191, 0.18)',
        accentSoft: 'rgba(141, 255, 191, 0.12)'
      },
      about: {
        accent: 'rgba(98, 243, 200, 0.14)',
        accentSoft: 'rgba(98, 243, 200, 0.08)'
      },
      skills: {
        accent: 'rgba(141, 255, 191, 0.12)',
        accentSoft: 'rgba(69, 217, 141, 0.10)'
      },
      projects: {
        accent: 'rgba(98, 243, 200, 0.12)',
        accentSoft: 'rgba(69, 217, 141, 0.08)'
      },
      experience: {
        accent: 'rgba(141, 255, 191, 0.12)',
        accentSoft: 'rgba(255, 215, 0, 0.08)'
      },
      contact: {
        accent: 'rgba(98, 243, 200, 0.14)',
        accentSoft: 'rgba(141, 255, 191, 0.10)'
      }
    };

    this.bindEvents();
    this.scaleScene();
    this.setPreset('landing');
    this.animate();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.scaleScene();
    });

    window.addEventListener('mousemove', (event) => {
      this.targetMouse.x = event.clientX - window.innerWidth / 2;
      this.targetMouse.y = event.clientY - window.innerHeight / 2;
    });

    window.addEventListener('pointermove', (event) => {
      this.targetMouse.x = event.clientX - window.innerWidth / 2;
      this.targetMouse.y = event.clientY - window.innerHeight / 2;
    });

    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      this.targetMouse.x = touch.clientX - window.innerWidth / 2;
      this.targetMouse.y = touch.clientY - window.innerHeight / 2;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.targetMouse.x = 0;
      this.targetMouse.y = 0;
    });
  }

  scaleScene() {
    if (!this.scene) return;

    const scale = Math.max(
      window.innerWidth / this.sceneWidth,
      window.innerHeight / this.sceneHeight
    );

    this.scene.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  setPreset(name) {
    if (!this.root || this.currentPreset === name) return;

    const preset = this.presets[name] || this.presets.landing;
    this.currentPreset = name;
    this.root.dataset.preset = name;
    this.root.style.setProperty('--scene-accent', preset.accent);
    this.root.style.setProperty('--scene-accent-soft', preset.accentSoft);
  }

  updateLayers() {
    if (this.reducedMotion) return;

    const rotateDegree = (this.mouse.x / Math.max(window.innerWidth / 2, 1)) * 20;

    this.layers.forEach((layer) => {
      if (layer.classList.contains('parallax-shadow')) return;

      const speedX = Number(layer.dataset.speedx || 0);
      const speedY = Number(layer.dataset.speedy || 0);
      const speedZ = Number(layer.dataset.speedz || 0);
      const rotation = Number(layer.dataset.rotation || 0);
      const left = parseFloat(getComputedStyle(layer).left) || 0;
      const isInLeft = left < window.innerWidth / 2 ? 1 : -1;
      const zValue = (window.innerWidth / 2 - left) * isInLeft * 0.1;

      layer.style.transform = `translateX(calc(-50% + ${-this.mouse.x * speedX}px)) translateY(calc(-50% + ${this.mouse.y * speedY}px)) perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDegree * rotation}deg)`;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.reducedMotion) return;

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.updateLayers();
  }
}

window.ParallaxBackground = ParallaxBackground;
