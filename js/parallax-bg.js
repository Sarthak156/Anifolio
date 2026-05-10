/* ============================================
   Parallax Mountain Background
   ============================================ */

class ParallaxBackground {
  constructor() {
    this.root = document.querySelector('.parallax-background');
    this.scene = this.root?.querySelector('.scene');
    this.allLayers = this.root ? Array.from(this.root.querySelectorAll('.parallax-layer')) : [];
    this.layers = this.allLayers;
    this.currentPreset = null;
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.sceneWidth = 1425;
    this.sceneHeight = 820;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.mobileQuery = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    this.reducedMotion = this.motionQuery.matches;
    this.isMobile = this.mobileQuery.matches;
    this.rafId = null;
    this.layerState = [];

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
    this.prepareLayers();
    this.scaleScene();
    this.setPreset('landing');
    if (!this.reducedMotion && !this.isMobile) {
      this.animate();
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.scaleScene();
    });

    this.motionQuery.addEventListener?.('change', (event) => {
      this.reducedMotion = event.matches;
      this.toggleMotion();
    });

    this.mobileQuery.addEventListener?.('change', (event) => {
      this.isMobile = event.matches;
      this.prepareLayers();
      this.toggleMotion();
    });

    if (this.isMobile) return;

    window.addEventListener('mousemove', (event) => {
      this.targetMouse.x = event.clientX - window.innerWidth / 2;
      this.targetMouse.y = event.clientY - window.innerHeight / 2;
    });

    window.addEventListener('mouseleave', () => {
      this.targetMouse.x = 0;
      this.targetMouse.y = 0;
    });
  }

  prepareLayers() {
    if (!this.allLayers.length) return;

    const mobileKeep = new Set([
      'home__bg-img',
      'home__mountain-8',
      'home__mountain-5',
      'home__fog-3',
      'home__black-shadow',
      'home__fog-1'
    ]);

    this.allLayers.forEach((layer) => {
      const keepLayer = !this.isMobile || Array.from(layer.classList).some(className => mobileKeep.has(className));

      layer.hidden = !keepLayer;
      if (!keepLayer) {
        layer.removeAttribute('src');
        return;
      }

      if (!layer.src && layer.dataset.src) {
        layer.src = layer.dataset.src;
      }
    });

    this.layers = this.allLayers.filter(layer => !layer.hidden);
    this.layerState = this.layers.map((layer) => ({
      layer,
      speedX: Number(layer.dataset.speedx || 0),
      speedY: Number(layer.dataset.speedy || 0),
      speedZ: Number(layer.dataset.speedz || 0),
      rotation: Number(layer.dataset.rotation || 0),
      left: Number(layer.dataset.leftBase || this.getLayerLeft(layer))
    }));
  }

  getLayerLeft(layer) {
    const left = layer.style.left || '';
    const match = left.match(/calc\(50%\s*([+-])\s*([\d.]+)px\)/);

    if (match) {
      const offset = Number(match[2]) * (match[1] === '-' ? -1 : 1);
      const value = (window.innerWidth / 2) + offset;
      layer.dataset.leftBase = String(value);
      return value;
    }

    const parsed = parseFloat(left);
    const value = Number.isFinite(parsed) ? parsed : window.innerWidth / 2;
    layer.dataset.leftBase = String(value);
    return value;
  }

  toggleMotion() {
    if (this.reducedMotion || this.isMobile) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      return;
    }

    if (!this.rafId) this.animate();
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

    this.layerState.forEach(({ layer, speedX, speedY, speedZ, rotation, left }) => {
      if (layer.classList.contains('parallax-shadow')) return;

      const isInLeft = left < window.innerWidth / 2 ? 1 : -1;
      const zValue = (window.innerWidth / 2 - left) * isInLeft * 0.1;

      layer.style.transform = `translateX(calc(-50% + ${-this.mouse.x * speedX}px)) translateY(calc(-50% + ${this.mouse.y * speedY}px)) perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDegree * rotation}deg)`;
    });
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    if (this.reducedMotion || this.isMobile) return;

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.updateLayers();
  }
}

window.ParallaxBackground = ParallaxBackground;
