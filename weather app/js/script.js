/**
 * DEVFOLIO — Main ES6+ Application Script
 * Author: Praveena P.
 * Modular responsibilities:
 *   1. Project Data Registry (5 Featured Projects)
 *   2. Theme Persistence Engine (localStorage + OS fallback)
 *   3. Accessible Mobile Navigation & ScrollSpy
 *   4. Dynamic Asymmetrical Project Showcase, Filtering, Search & Modal
 *   5. Contact Form Validation & Honest Mailto Composition
 *   6. Scroll Reveals, Back-to-Top, Resume Actions & Toast Feedback
 */

(() => {
  'use strict';

  // Enable progressive enhancement class for CSS scroll reveals
  document.documentElement.classList.add('js-enabled');

  // ==========================================================================
  // 1. ACCURATE PROJECT DATA STORE
  // ==========================================================================
  const PROJECTS = [
    {
      id: 'ai-study-companion',
      number: '01',
      featured: true,
      title: 'AI-Powered Study Companion',
      categories: ['AI / ML', 'Full Stack'],
      primaryCategory: 'AI / ML',
      image: 'assets/images/project-study-companion.svg',
      problemStatement: 'Students often struggle to organize dense technical syllabi into structured revision schedules and practice active recall efficiently.',
      description: 'An intelligent study assistant platform built to organize course modules, summarize core concepts, and generate targeted practice prompts for exam preparation.',
      features: [
        'Structured syllabus breakdown organized by subject modules',
        'Automated concept summarization for quick revision sessions',
        'Interactive practice question and flashcard review workflow',
        'Clean, distraction-free study workspace layout'
      ],
      technologies: ['Python', 'FastAPI', 'React.js', 'REST APIs', 'HTML5', 'CSS3'],
      githubUrl: 'https://github.com/Praveena-P-729',
      githubLabel: 'GitHub Profile (Update Repo Link)',
      liveUrl: null
    },
    {
      id: 'answer-script-evaluation',
      number: '02',
      featured: false,
      title: 'Automated Answer Script Evaluation System',
      categories: ['AI / ML', 'Full Stack'],
      primaryCategory: 'AI / ML',
      image: 'assets/images/project-answer-eval.svg',
      problemStatement: 'Manual grading of descriptive examination papers is time-consuming and prone to inconsistent rubric application across large student cohorts.',
      description: 'An evaluation support system designed to compare digitized descriptive answers against predefined academic rubrics and keyword benchmarks.',
      features: [
        'Structured answer text extraction and preprocessing pipeline',
        'Keyword and semantic alignment comparison against model answer keys',
        'Rubric-based score breakdown with flagged review indicators',
        'Instructor dashboard to inspect and verify automated suggestions'
      ],
      technologies: ['Python', 'FastAPI', 'JavaScript', 'HTML5', 'CSS3', 'REST APIs'],
      githubUrl: 'https://github.com/Praveena-P-729',
      githubLabel: 'GitHub Profile (Update Repo Link)',
      liveUrl: null
    },
    {
      id: 'smart-healthcare-system',
      number: '03',
      featured: false,
      title: 'AI-Based Smart Healthcare System',
      categories: ['AI / ML', 'Full Stack'],
      primaryCategory: 'AI / ML',
      image: 'assets/images/project-healthcare.svg',
      problemStatement: 'Patients often face delayed preliminary symptom guidance and fragmented appointment scheduling when accessing outpatient care.',
      description: 'A smart healthcare coordination prototype combining symptom intake triage, baseline vitals tracking, and streamlined doctor consultation scheduling.',
      features: [
        'Structured symptom intake form for preliminary department routing',
        'Patient vitals trend log and digital visit history overview',
        'Priority-aware consultation slot scheduling interface',
        'Responsive patient and clinician workflow views'
      ],
      technologies: ['Python', 'JavaScript', 'React.js', 'Node.js', 'REST APIs', 'CSS3'],
      githubUrl: 'https://github.com/Praveena-P-729',
      githubLabel: 'GitHub Profile (Update Repo Link)',
      liveUrl: null
    },
    {
      id: 'warehouse-digital-twin',
      number: '04',
      featured: false,
      title: 'Digital Twin for Warehouse Management',
      categories: ['Web Development', 'Full Stack'],
      primaryCategory: 'Web Development',
      image: 'assets/images/project-warehouse.svg',
      problemStatement: 'Warehouse supervisors lack immediate visual visibility into rack-level capacity, empty bin locations, and low-stock alerts in static spreadsheets.',
      description: 'A web-based virtual replica of warehouse zones and rack bays that reflects real-time inventory occupancy states and restock thresholds.',
      features: [
        '2D virtual warehouse grid mapping rack zones and bin statuses',
        'Color-coded alerts for occupied, available, and restock-pending bins',
        'REST API telemetry simulation for stock intake and dispatch updates',
        'Responsive operational dashboard built with CSS Grid'
      ],
      technologies: ['JavaScript', 'Node.js', 'REST APIs', 'HTML5', 'CSS3'],
      githubUrl: 'https://github.com/Praveena-P-729',
      githubLabel: 'GitHub Profile (Update Repo Link)',
      liveUrl: null
    },
    {
      id: 'careerone-platform',
      number: '05',
      featured: false,
      title: 'CareerOne – Student Career Platform',
      categories: ['Web Development'],
      primaryCategory: 'Web Development',
      image: 'assets/images/project-careerone.svg',
      problemStatement: 'Undergraduate students often lose track of internship applications, required technical skills, and interview readiness milestones across scattered portals.',
      description: 'A centralized student career portal integrating curated technical opportunities, application status tracking, and skill readiness checklists.',
      features: [
        'Curated internship listing board with role and skill filters',
        'Application status tracking across Applied, Shortlisted, and Review states',
        'Technical interview and resume preparation checklist module',
        'Clean, mobile-responsive interface designed for students'
      ],
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Git'],
      githubUrl: 'https://github.com/Praveena-P-729',
      githubLabel: 'GitHub Profile (Update Repo Link)',
      liveUrl: null
    }
  ];

  // ==========================================================================
  // 2. SHARED UI HELPERS (Toast, Focus Trap, Clipboard)
  // ==========================================================================
  const toastRegion = document.getElementById('toastRegion');

  function showToast(message) {
    if (!toastRegion) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastRegion.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-shown');
    });

    window.setTimeout(() => {
      toast.classList.remove('is-shown');
      window.setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 280);
    }, 3000);
  }

  function trapFocusInContainer(e, container) {
    if (e.key !== 'Tab' || !container) return;
    const focusables = container.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }

  // ==========================================================================
  // 3. THEME ENGINE (Dark / Light + localStorage)
  // ==========================================================================
  function initTheme() {
    const STORAGE_KEY = 'praveena_portfolio_theme';
    const rootEl = document.documentElement;
    const toggleBtn = document.getElementById('themeToggleBtn');

    function resolveInitialTheme() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
      } catch (_) {
        // Ignore storage access errors in restricted contexts
      }
      return rootEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function setTheme(theme, persist = true) {
      rootEl.setAttribute('data-theme', theme);
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, theme);
        } catch (_) {
          // Ignore storage errors
        }
      }
      if (toggleBtn) {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        toggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
        toggleBtn.setAttribute('title', `Switch to ${nextTheme} theme`);
      }
    }

    setTheme(resolveInitialTheme(), false);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = rootEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next, true);
        showToast(`Theme switched to ${next} mode`);
      });
    }
  }

  // ==========================================================================
  // 4. NAVIGATION, MOBILE DRAWER & SCROLLSPY
  // ==========================================================================
  function initNavigation() {
    const header = document.getElementById('siteHeader');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-link');

    function openDrawer() {
      if (!mobileDrawer || !drawerBackdrop) return;
      mobileDrawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      drawerBackdrop.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (hamburgerBtn) {
        hamburgerBtn.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
      }
      if (drawerCloseBtn) drawerCloseBtn.focus();
    }

    function closeDrawer(restoreFocus = false) {
      if (!mobileDrawer || !drawerBackdrop) return;
      mobileDrawer.classList.remove('is-open');
      drawerBackdrop.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      drawerBackdrop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (hamburgerBtn) {
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        if (restoreFocus) hamburgerBtn.focus();
      }
    }

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
        if (isOpen) {
          closeDrawer(true);
        } else {
          openDrawer();
        }
      });
    }

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => closeDrawer(true));
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => closeDrawer(true));

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => closeDrawer(false));
    });

    document.addEventListener('keydown', (e) => {
      if (!mobileDrawer || !mobileDrawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeDrawer(true);
        return;
      }
      trapFocusInContainer(e, mobileDrawer);
    });

    // Auto-close mobile drawer if viewport expands past tablet/mobile breakpoint
    if (window.matchMedia) {
      const desktopQuery = window.matchMedia('(min-width: 1025px)');
      desktopQuery.addEventListener('change', (e) => {
        if (e.matches && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
          closeDrawer(false);
        }
      });
    }

    // Scroll State & Back-to-Top
    function handleScroll() {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 16);
      if (backToTopBtn) backToTopBtn.classList.toggle('is-visible', y > 420);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Active Navigation Highlighting via IntersectionObserver
    const sections = document.querySelectorAll('main section[id]');
    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              navLinks.forEach((link) => {
                const isMatch = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('is-active', isMatch);
              });
            }
          });
        },
        { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
      );
      sections.forEach((sec) => observer.observe(sec));
    }
  }

  // ==========================================================================
  // 5. PROJECTS SHOWCASE, FILTERING, SEARCH & ACCESSIBLE MODAL
  // ==========================================================================
  function initProjects() {
    const showcase = document.getElementById('projectsShowcase');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const searchInput = document.getElementById('projectSearchInput');

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    let activeCategory = 'All';
    let searchTerm = '';
    let lastTriggerEl = null;

    function updateCounts() {
      filterTabs.forEach((tab) => {
        const cat = tab.getAttribute('data-filter');
        const countEl = tab.querySelector('.filter-count');
        if (!countEl) return;
        const count =
          cat === 'All'
            ? PROJECTS.length
            : PROJECTS.filter((p) => p.categories.includes(cat)).length;
        countEl.textContent = String(count);
      });
    }

    function getFilteredProjects() {
      const q = searchTerm.trim().toLowerCase();
      return PROJECTS.filter((project) => {
        const matchesCat =
          activeCategory === 'All' || project.categories.includes(activeCategory);
        if (!q) return matchesCat;
        const matchesQuery =
          project.title.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q) ||
          project.problemStatement.toLowerCase().includes(q) ||
          project.technologies.some((t) => t.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
      });
    }

    function renderShowcase() {
      if (!showcase) return;
      const list = getFilteredProjects();

      if (list.length === 0) {
        showcase.innerHTML = `
          <div class="project-empty-state" role="status">
            <h3 style="margin-bottom: 0.5rem;">No matching projects found</h3>
            <p style="margin-bottom: 1.25rem;">Try clearing your search term or switching back to all categories.</p>
            <button id="clearProjectsFilterBtn" type="button" class="btn btn-secondary btn-sm">Reset Filters</button>
          </div>
        `;
        const clearBtn = document.getElementById('clearProjectsFilterBtn');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            activeCategory = 'All';
            searchTerm = '';
            if (searchInput) searchInput.value = '';
            filterTabs.forEach((t) =>
              t.classList.toggle('is-active', t.getAttribute('data-filter') === 'All')
            );
            renderShowcase();
          });
        }
        return;
      }

      showcase.innerHTML = list
        .map((project, idx) => {
          const isFeaturedLayout = idx === 0 && activeCategory === 'All' && !searchTerm.trim();
          return `
            <article class="project-entry ${isFeaturedLayout ? 'is-featured' : ''}">
              <div class="project-media">
                <img src="${project.image}" alt="${project.title} preview" loading="lazy" />
              </div>
              <div class="project-body">
                <div class="project-meta-top">
                  <span class="project-num">${project.number}</span>
                  <span class="project-category-tag">${project.primaryCategory}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-problem">${project.description}</p>
                <div class="project-stack">
                  ${project.technologies.map((tech) => `<span class="stack-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-footer">
                  <button type="button" class="btn btn-secondary btn-sm view-details-btn" data-project-id="${project.id}">
                    <span>View Details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                  <div class="project-ext-actions">
                    <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Open GitHub profile for ${project.title}" title="${project.githubLabel}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    </a>
                    ${
                      project.liveUrl
                        ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Live Demo</a>`
                        : ''
                    }
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join('');

      showcase.querySelectorAll('.view-details-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          lastTriggerEl = e.currentTarget;
          openModal(e.currentTarget.getAttribute('data-project-id'));
        });
      });
    }

    function openModal(projectId) {
      const project = PROJECTS.find((p) => p.id === projectId);
      if (!project || !modal || !modalBody) return;

      modalBody.innerHTML = `
        <img src="${project.image}" alt="${project.title} interface preview" class="modal-cover" />
        <div class="modal-content-inner">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; flex-wrap: wrap;">
            <span class="project-num">${project.number}</span>
            ${project.categories.map((cat) => `<span class="project-category-tag">${cat}</span>`).join('')}
          </div>

          <h2 id="modalProjectTitle" style="font-size: 1.55rem; margin-bottom: 0.5rem;">${project.title}</h2>
          <p style="font-size: 0.98rem;">${project.description}</p>

          <h3 class="modal-section-heading">Problem Statement</h3>
          <p style="font-size: 0.95rem;">${project.problemStatement}</p>

          <h3 class="modal-section-heading">Main Features</h3>
          <ul class="modal-features">
            ${project.features.map((feat) => `<li>${feat}</li>`).join('')}
          </ul>

          <h3 class="modal-section-heading">Technology Stack</h3>
          <div class="project-stack" style="margin-bottom: 0;">
            ${project.technologies.map((tech) => `<span class="stack-tag">${tech}</span>`).join('')}
          </div>

          <div class="modal-footer-links">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              GitHub Profile · Update Repo URL
            </a>
            ${
              project.liveUrl
                ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Open Live Demo</a>`
                : `<span class="placeholder-note">Live Demo URL: Pending Deployment Configuration</span>`
            }
          </div>
        </div>
      `;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeModal() {
      if (!modal || !modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
        lastTriggerEl.focus();
      }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Keyboard ESC & Focus Trap inside Modal
    document.addEventListener('keydown', (e) => {
      if (!modal || !modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      trapFocusInContainer(e, modal);
    });

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        activeCategory = tab.getAttribute('data-filter');
        renderShowcase();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderShowcase();
      });
    }

    updateCounts();
    renderShowcase();
  }

  // ==========================================================================
  // 6. CONTACT FORM VALIDATION, CLIPBOARD & RESUME CONTROLS
  // ==========================================================================
  function initContactAndResume() {
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const contactForm = document.getElementById('contactForm');
    const statusBanner = document.getElementById('formStatusBanner');
    const printResumeBtn = document.getElementById('printResumeBtn');
    const downloadResumeBtn = document.getElementById('downloadResumeBtn');

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', async () => {
        const email = copyEmailBtn.getAttribute('data-email') || '';
        if (!email) return;
        try {
          await copyTextToClipboard(email);
          showToast('Email address copied to clipboard');
        } catch (_) {
          showToast(`Email: ${email}`);
        }
      });
    }

    if (printResumeBtn) {
      printResumeBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (downloadResumeBtn) {
      downloadResumeBtn.addEventListener('click', () => {
        showToast('Downloading Praveena_P_Resume.pdf');
      });
    }

    if (contactForm) {
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');

      // Clear validation error on user typing
      [nameInput, emailInput, messageInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => {
          input.closest('.form-field')?.classList.remove('is-invalid');
        });
      });

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const msgVal = messageInput ? messageInput.value.trim() : '';

        if (nameVal.length < 2) {
          nameInput?.closest('.form-field')?.classList.add('is-invalid');
          valid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
          emailInput?.closest('.form-field')?.classList.add('is-invalid');
          valid = false;
        }
        if (msgVal.length < 10) {
          messageInput?.closest('.form-field')?.classList.add('is-invalid');
          valid = false;
        }

        if (!valid) {
          showToast('Please review the highlighted form fields');
          return;
        }

        // Honest frontend-only composition via mailto + clipboard fallback
        const formattedText = `Name: ${nameVal}\nReply-To: ${emailVal}\n\n${msgVal}`;
        const subject = encodeURIComponent(`Portfolio Contact from ${nameVal}`);
        const body = encodeURIComponent(formattedText);
        const mailtoLink = `mailto:praveena.dev.placeholder@example.com?subject=${subject}&body=${body}`;

        if (statusBanner) {
          statusBanner.classList.add('is-visible');
          statusBanner.innerHTML = `
            <p style="margin-bottom: 0.65rem; color: var(--text-primary);">
              <strong>Validation passed:</strong> Your message draft is ready. Because this is a static portfolio without a backend mail server, send via your mail app or copy the formatted message below.
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <a href="${mailtoLink}" class="btn btn-primary btn-sm">Open Email Client</a>
              <button type="button" id="copyDraftBtn" class="btn btn-secondary btn-sm">Copy Message</button>
            </div>
          `;
          const copyDraftBtn = document.getElementById('copyDraftBtn');
          if (copyDraftBtn) {
            copyDraftBtn.addEventListener('click', async () => {
              try {
                await copyTextToClipboard(formattedText);
                showToast('Message text copied to clipboard');
              } catch (_) {
                showToast('Unable to copy automatically');
              }
            });
          }
        }

        window.location.href = mailtoLink;
        showToast('Draft prepared for your email client');
      });
    }
  }

  // ==========================================================================
  // 7. SCROLL-TRIGGERED REVEALS & DYNAMIC COPYRIGHT YEAR
  // ==========================================================================
  function initRevealsAndFooter() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    const revealTargets = document.querySelectorAll('[data-reveal]');
    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px 80px 0px' }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  // Bootstrap on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initProjects();
    initContactAndResume();
    initRevealsAndFooter();
  });
})();
