(function () {
  // ── Theme Management ──
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  function getSystemTheme() {
    return mq.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    updateIcon(theme);
  }

  function updateIcon(theme) {
    if (!toggle) return;
    const sunIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const moonIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    toggle.innerHTML = theme === "dark" ? sunIcon : moonIcon;
  }

  const saved = localStorage.getItem("theme");
  applyTheme(saved || getSystemTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      // Enable smooth transition only when clicked
      document.body.classList.add("theme-transitioning");
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      applyTheme(next);
      
      // Clean up class after transition completes
      setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
      }, 500);
    });
  }

  mq.addEventListener("change", function (e) {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  // ── Dynamic DOM Element Injection ──
  document.addEventListener("DOMContentLoaded", () => {
    injectDOMElements();
    initCustomCursor();
    initSmoothScroll();
    initNavbarScroll();
    initSpotlightEffect();
    initReadingProgress();
    initBackToTop();
    initPreloaderAndAnimations();
  });

  function injectDOMElements() {
    // Noise Overlay
    if (!document.querySelector(".noise-overlay")) {
      const noise = document.createElement("div");
      noise.className = "noise-overlay";
      document.body.appendChild(noise);
    }

    // Glow Blobs
    if (!document.querySelector(".glow-blob")) {
      const b1 = document.createElement("div");
      b1.className = "glow-blob blob-1";
      const b2 = document.createElement("div");
      b2.className = "glow-blob blob-2";
      const b3 = document.createElement("div");
      b3.className = "glow-blob blob-3";
      document.body.appendChild(b1);
      document.body.appendChild(b2);
      document.body.appendChild(b3);
    }

    // Back to Top Button
    if (!document.querySelector(".back-to-top")) {
      const backButton = document.createElement("button");
      backButton.className = "back-to-top";
      backButton.id = "back-to-top";
      backButton.setAttribute("aria-label", "Back to top");
      // Clean upwards arrow chevron logo
      backButton.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>';
      document.body.appendChild(backButton);
    }

    // Custom Cursor (Desktop only)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      if (!document.getElementById("custom-cursor")) {
        const cursor = document.createElement("div");
        cursor.id = "custom-cursor";
        cursor.className = "custom-cursor";
        const cursorDot = document.createElement("div");
        cursorDot.id = "custom-cursor-dot";
        cursorDot.className = "custom-cursor-dot";
        document.body.appendChild(cursor);
        document.body.appendChild(cursorDot);
      }
    }

    // Reading Progress Bar (only on blog posts, injected inside navbar to prevent gaps)
    if (document.querySelector(".blog-post") && !document.querySelector(".reading-progress-container")) {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        const progressContainer = document.createElement("div");
        progressContainer.className = "reading-progress-container";
        progressContainer.innerHTML = '<div class="reading-progress-bar"></div>';
        navbar.appendChild(progressContainer);
      }
    }
  }

  // ── Custom Cursor (GPU-Accelerated translate3d) ──
  function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const cursorDot = document.getElementById("custom-cursor-dot");
    if (!cursor || !cursorDot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isMoving = false;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;

      // Inner dot moves instantly using translate3d
      const scale = cursorDot.classList.contains("hovered") ? 1.5 : 1;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${scale})`;
      
      if (cursor.style.opacity === "0" || !cursor.style.opacity) {
        cursor.style.opacity = "1";
        cursorDot.style.opacity = "1";
      }
    });

    // Handle mouse leaving window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
      cursorDot.style.opacity = "0";
    });

    function lerpCursor() {
      if (isMoving) {
        const xp = 0.16; // Snappier LERP speed
        cursorX += (mouseX - cursorX) * xp;
        cursorY += (mouseY - cursorY) * xp;

        // Outer circle moves with LERP using translate3d
        const scale = cursor.classList.contains("hovered") ? 1.55 : 1;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${scale})`;
      }
      requestAnimationFrame(lerpCursor);
    }
    requestAnimationFrame(lerpCursor);

    // Dynamic hover bindings
    function updateHoverBindings() {
      const targets = document.querySelectorAll("a, button, [role='button'], input, textarea");
      targets.forEach(target => {
        target.addEventListener("mouseenter", () => {
          cursor.classList.add("hovered");
          cursorDot.classList.add("hovered");
        });
        target.addEventListener("mouseleave", () => {
          cursor.classList.remove("hovered");
          cursorDot.classList.remove("hovered");
        });
      });
    }

    updateHoverBindings();
    
    // Periodically re-bind to handle dynamically loaded content if any
    const observer = new MutationObserver(updateHoverBindings);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Smooth Scroll (Lenis) ──
  function initSmoothScroll() {
    if (typeof Lenis === "undefined") return;
    
    const lenis = new Lenis({
      duration: 0.9, // Snappier scrolling response
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      smoothTouch: false,
    });

    // Share lenis globally so the back-to-top scroll can hook into it
    window.lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== "undefined" && gsap.registerPlugin && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // ── Scroll to Hide/Show Navbar ──
  function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          navbar.classList.add("nav-hidden");
        } else {
          navbar.classList.remove("nav-hidden");
        }
      } else {
        navbar.classList.remove("nav-hidden");
      }
      lastScrollY = currentScrollY;
    });
  }

  // ── Spotlight Effect on Cards ──
  function initSpotlightEffect() {
    const cards = document.querySelectorAll(".blog-card");
    cards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });
  }

  // ── Reading Progress Bar ──
  function initReadingProgress() {
    const bar = document.querySelector(".reading-progress-bar");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      bar.style.width = scrolled + "%";
    });
  }

  // ── Back to Top Center Floating Control ──
  function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    });

    backToTop.addEventListener("click", () => {
      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // ── Preloader & Snappy Entrance Animations ──
  function initPreloaderAndAnimations() {
    const preloader = document.getElementById("preloader");
    const barInner = document.querySelector(".preloader-bar-inner");
    
    // Default animation helper if GSAP is loaded
    if (typeof gsap !== "undefined") {
      const tl = gsap.timeline();

      // Step 1: Animate loading bar to 100% (or quickly exit if loaded)
      tl.to(barInner, {
        width: "100%",
        duration: 0.45, // Snappier loading bar
        ease: "power2.out"
      });

      // Step 2: Fade out preloader and transition content
      tl.to(preloader, {
        opacity: 0,
        duration: 0.4, // Snappier fade
        ease: "power2.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          // Reveal page contents by removing js-loading FOUC class
          document.documentElement.classList.remove("js-loading");
          triggerEntranceAnimations();
        }
      }, "+=0.1");

      // Safety timeout: Ensure page reveals even if GSAP or load hangs
      setTimeout(() => {
        if (preloader.style.display !== "none") {
          preloader.style.display = "none";
          document.documentElement.classList.remove("js-loading");
          triggerEntranceAnimations();
        }
      }, 1800);

    } else {
      // Fallback if GSAP is not loaded
      if (preloader) {
        setTimeout(() => {
          if (barInner) barInner.style.width = "100%";
          setTimeout(() => {
            preloader.style.transition = "opacity 0.4s ease";
            preloader.style.opacity = 0;
            setTimeout(() => {
              preloader.style.display = "none";
              document.documentElement.classList.remove("js-loading");
            }, 400);
          }, 300);
        }, 100);
      }
    }
  }

  function triggerEntranceAnimations() {
    if (typeof gsap === "undefined") return;

    const tl = gsap.timeline();

    // 1. Navbar slides down
    tl.from(".navbar", {
      y: -20,
      opacity: 0,
      duration: 0.45, // snappier duration
      ease: "power2.out"
    });

    // 2. Hero content slides up and fades in
    if (document.querySelector(".hero")) {
      tl.from(".hero h1", {
        y: 15,
        opacity: 0,
        duration: 0.5, // snappier duration
        ease: "power2.out"
      }, "-=0.25");

      tl.from(".hero .tagline", {
        y: 10,
        opacity: 0,
        duration: 0.5, // snappier duration
        ease: "power2.out"
      }, "-=0.35");
    }

    // 3. Sections staggered
    const sections = document.querySelectorAll("section");
    if (sections.length > 0) {
      tl.from(sections, {
        y: 15,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08, // smaller stagger
        ease: "power2.out"
      }, "-=0.3");
    }

    // 4. Blog listing cards staggered
    const cards = document.querySelectorAll(".blog-card");
    if (cards.length > 0) {
      tl.from(cards, {
        y: 12,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06, // smaller stagger
        ease: "power2.out"
      }, "-=0.35");
    }

    // 5. Blog post content animations
    if (document.querySelector(".blog-post")) {
      tl.from(".blog-back", {
        x: -8,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.35");

      tl.from(".blog-post h1", {
        y: 15,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out"
      }, "-=0.3");

      const postElements = document.querySelectorAll(".blog-post > *:not(.blog-back):not(h1)");
      if (postElements.length > 0) {
        tl.from(postElements, {
          y: 10,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05, // smaller stagger
          ease: "power2.out"
        }, "-=0.3");
      }
    }
  }

})();
