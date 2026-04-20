/* ============================================
   App Router + Orchestrator
   ============================================ */

class App {
  constructor() {
    this.pages = {};
    this.currentPage = null;
    this.bg = null;
    this.portal = null;
    this.nav = null;
    this.pageOrder = ['landing', 'about', 'skills', 'projects', 'experience', 'contact'];
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;

    document.querySelectorAll('.page').forEach(p => {
      this.pages[p.id.replace('page-', '')] = p;
    });
  }

  init() {
    // 1. Init Three.js background
    this.bg = new ThreeBackground();
    this.bg.setPreset('landing');

    // 2. Init portal transition
    this.portal = new PortalTransition();



    // 4. Show nav and landing
    this.onEntryComplete();
  }

  onEntryComplete() {
    // Show nav
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.add('visible');

    // Show landing page
    this.showPage('landing', false);

    // Init navigation clicks
    this.initNav();

    // Init special features
    new GhostCursor();
    new MusicPlayer();
    new EasterEgg();

    // Init swipe navigation
    this.initSwipe();

    // Init page-specific features
    this.initSkillsDomain();
    this.initTimeline();
    this.initContactForm();
  }

  initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.page;
        if (target && target !== this.currentPage) {
          this.navigateTo(target);
        }
      });
    });

    // Logo goes to landing
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.addEventListener('click', () => {
        this.navigateTo('landing');
      });
    }

    // Mobile hamburger
    const hamburger = document.querySelector('.nav-hamburger');
    const links = document.querySelector('.nav-links');
    if (hamburger && links) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        links.classList.toggle('open');
      });
      // Close on nav click
      document.querySelectorAll('.nav-link').forEach(l => {
        l.addEventListener('click', () => {
          hamburger.classList.remove('open');
          links.classList.remove('open');
        });
      });
    }
  }

  showPage(name, animate = true) {
    const page = this.pages[name];
    if (!page) return;

    if (animate && this.currentPage) {
      const fromPage = this.pages[this.currentPage];
      this.portal.transition(fromPage, page, this.bg, () => {
        this.updateNav(name);
      });
    } else {
      // No animation — just show
      Object.values(this.pages).forEach(p => p.classList.remove('active'));
      page.classList.add('active');
      this.bg.setPreset(name);
      this.updateNav(name);
    }

    this.currentPage = name;
  }

  navigateTo(name) {
    if (this.portal.isTransitioning) return;
    this.showPage(name, true);
  }

  navigatePrev() {
    const currentIndex = this.pageOrder.indexOf(this.currentPage);
    if (currentIndex > 0) {
      this.navigateTo(this.pageOrder[currentIndex - 1]);
    }
  }

  navigateNext() {
    const currentIndex = this.pageOrder.indexOf(this.currentPage);
    if (currentIndex < this.pageOrder.length - 1) {
      this.navigateTo(this.pageOrder[currentIndex + 1]);
    }
  }

  updateNav(name) {
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === name);
    });
  }

  // ── Swipe Navigation ──
  initSwipe() {
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('#app')) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
        console.log('touchstart', this.touchStartX, this.touchStartY);
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#app')) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        console.log('touchend', this.touchEndX, this.touchEndY);
        this.handleSwipe();
      }
    }, { passive: true });
  }

  handleSwipe() {
    const threshold = 50;
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;
    console.log('diffX', diffX, 'diffY', diffY, 'threshold', threshold);

    // Only trigger if horizontal movement is greater than vertical and exceeds threshold
    if (Math.abs(diffX) < Math.abs(diffY) || Math.abs(diffX) < threshold) return;

    const currentIndex = this.pageOrder.indexOf(this.currentPage);
    console.log('currentIndex', currentIndex, 'page', this.currentPage);

    if (diffX > 0 && currentIndex > 0) {
      console.log('navigating prev');
      this.navigateTo(this.pageOrder[currentIndex - 1]);
    } else if (diffX < 0 && currentIndex < this.pageOrder.length - 1) {
      console.log('navigating next');
      this.navigateTo(this.pageOrder[currentIndex + 1]);
    }
  }

  // ── Skills Domain Expansion ──
  initSkillsDomain() {
    const btn = document.querySelector('.domain-expand-btn');
    const section = document.getElementById('page-skills');
    if (btn && section) {
      btn.addEventListener('click', () => {
        section.classList.add('expanded');
      });
    }
  }

  // ── Timeline scroll unlock ──
  initTimeline() {
    // Since pages don't scroll in/out, unlock all nodes after a stagger
    const nodes = document.querySelectorAll('.tl-node');
    const page = document.getElementById('page-experience');

    const observer = new MutationObserver(() => {
      if (page.classList.contains('active')) {
        nodes.forEach((n, i) => {
          setTimeout(() => n.classList.add('unlocked'), i * 400);
        });
      }
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Contact form ──
  initContactForm() {
    const form = document.querySelector('.contact-form');
    const btn = document.querySelector('.submit-btn');
    if (form && btn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        btn.classList.add('sent');
        btn.textContent = '✓ SENT';
        setTimeout(() => {
          btn.classList.remove('sent');
          btn.textContent = 'SEND MESSAGE';
          form.reset();
        }, 3000);
      });
    }
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
