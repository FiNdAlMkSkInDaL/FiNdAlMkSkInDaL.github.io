/**
 * Pixel garden — canvas bush, critters, project modals, list view, a11y.
 */
(function () {
  "use strict";

  const PROJECTS = {
    tickforge: {
      title: "TICKFORGE",
      href: "https://findalmkskindal.github.io/tickforge/explorer/",
      blurb:
        "TickForge is a live trading simulator. You can watch buy and sell orders hit the book, see them match, and try a built-in market-making strategy — all in an interactive explorer. This is a small demo of the real project. Check my GitHub for the full codebase.",
    },
    polymarket: {
      title: "POLYMARKET",
      href: "./demos/polymarket.html?v=intro4",
      blurb:
        "This demo shows a paper-trading setup for prediction markets. It records live prices, flags missing data, and lets you test strategies with fake money so you can see how they would have done without risking cash. This is a small demo of the real project. Check my GitHub for the full codebase.",
    },
    macro: {
      title: "MACRO BIAS",
      href: "./demos/macro-bias.html?v=intro4",
      blurb:
        "Macro Bias looks at today's market mood — stocks, fear, credit, metals, and oil — finds similar days in the past, and turns that into a simple next-session score and risk size. It is not a price target. This is a small demo of the real project. Check my GitHub for the full codebase.",
    },
    identity: {
      title: "IDENTITY",
      href: "./demos/identity.html?v=intro4",
      blurb:
        "Identity keeps personal facts in a sealed vault and only shares the few that matter for the job. The red side dumps everything; the green side is the gated approach Identity is built for. This is a small demo of the real project. Check my GitHub for the full codebase.",
    },
    vectorbot: {
      title: "VECTORBOT",
      href: "./demos/vectorbot.html?v=intro4",
      blurb:
        "Type a command in plain English and VectorBot maps it to a small set of actions — move, toggle the light, reset — without writing free-form replies. Unknown or unsafe commands are simply ignored. This is a small demo of the real project. Check my GitHub for the full codebase.",
    },
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── Canvas bush (thinned density) ─────────────────────────── */
  (function paintBush() {
    const canvas = document.getElementById("bush");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const LEAF_LIGHT = ["#86efac", "#4ade80", "#6ee7b7", "#a3e635", "#84cc16", "#bbf7d0"];
    const LEAF_MID = ["#22c55e", "#16a34a", "#4ade80", "#65a30d", "#15803d"];
    const LEAF_DARK = ["#166534", "#14532d", "#15803d", "#3f6212", "#1a2e05"];
    const BARK = ["#3f2a1e", "#5c3d2e", "#4a3224", "#6b4423"];

    const FLOWER_PALETTES = [
      { petals: ["#ff6b8a", "#ff8fab", "#ffb3c6"], center: "#ffe566" },
      { petals: ["#f472b6", "#ec4899", "#f9a8d4"], center: "#fde68a" },
      { petals: ["#c084fc", "#a78bfa", "#e9d5ff"], center: "#fef08a" },
      { petals: ["#60a5fa", "#38bdf8", "#93c5fd"], center: "#fde047" },
      { petals: ["#22d3ee", "#67e8f9", "#a5f3fc"], center: "#fef9c3" },
      { petals: ["#34d399", "#6ee7b7", "#a7f3d0"], center: "#fef08a" },
      { petals: ["#fbbf24", "#fcd34d", "#fde68a"], center: "#f97316" },
      { petals: ["#fb923c", "#fdba74", "#fed7aa"], center: "#fef08a" },
      { petals: ["#a3e635", "#bef264", "#d9f99d"], center: "#fef08a" },
      { petals: ["#5eead4", "#2dd4bf", "#99f6e4"], center: "#fef08a" },
    ];

    function leafColor(yNorm) {
      const r = Math.random();
      if (yNorm < 0.35) return LEAF_LIGHT[Math.floor(r * LEAF_LIGHT.length)];
      if (yNorm < 0.65)
        return r < 0.55
          ? LEAF_MID[Math.floor(r * LEAF_MID.length)]
          : LEAF_LIGHT[Math.floor(r * LEAF_LIGHT.length)];
      return r < 0.65
        ? LEAF_DARK[Math.floor(r * LEAF_DARK.length)]
        : LEAF_MID[Math.floor(r * LEAF_MID.length)];
    }

    function drawTinyFlower(cx, cy, size, pal) {
      const s = size;
      const p0 = pal.petals[0];
      const p1 = pal.petals[1] || p0;
      const p2 = pal.petals[2] || p1;
      ctx.fillStyle = p0;
      ctx.fillRect(cx, cy - s * 2, s, s);
      ctx.fillRect(cx, cy + s * 2, s, s);
      ctx.fillRect(cx - s * 2, cy, s, s);
      ctx.fillRect(cx + s * 2, cy, s, s);
      ctx.fillStyle = p1;
      ctx.fillRect(cx - s, cy - s, s, s);
      ctx.fillRect(cx + s, cy - s, s, s);
      ctx.fillRect(cx - s, cy + s, s, s);
      ctx.fillRect(cx + s, cy + s, s, s);
      ctx.fillStyle = p2;
      ctx.fillRect(cx, cy - s * 3, s, s);
      ctx.fillRect(cx, cy + s * 3, s, s);
      ctx.fillStyle = pal.center;
      ctx.fillRect(cx, cy, s, s);
    }

    function paint(w, h) {
      for (let y = 0; y < h; y++) {
        const t = y / h;
        const g = Math.floor(180 - t * 100);
        const r = Math.floor(40 + (1 - t) * 50);
        const b = Math.floor(50 + (1 - t) * 40);
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(0, y, w, 1);
      }

      // Branches (~20% fewer than v2)
      for (let i = 0; i < 10; i++) {
        let x = Math.floor((i / 10) * w + Math.sin(i * 1.7) * 5);
        let y = h;
        ctx.fillStyle = BARK[i % BARK.length];
        const steps = Math.floor(h * (0.45 + (i % 5) * 0.07));
        for (let s = 0; s < steps; s++) {
          const thick = 2 + ((i + s) % 3);
          ctx.fillRect(x, y - s, thick, 2);
          if (s % 6 === 0) x += ((i + s) % 2 === 0 ? 1 : -1) * (1 + (s % 2));
          if (s % 10 === 0) {
            const dir = s % 20 === 0 ? 1 : -1;
            for (let t = 0; t < 7; t++) {
              ctx.fillRect(x + dir * t, y - s - Math.floor(t / 2), 2, 2);
            }
          }
        }
      }

      // Leaves: another ~20% thinner than v2 (/16 → /20)
      const leafCount = Math.floor((w * h) / 20);
      for (let i = 0; i < leafCount; i++) {
        const x = (i * 19 + (i * i) % 17) % w;
        const y = (i * 29 + i * 5) % h;
        const yNorm = y / h;
        ctx.fillStyle = leafColor(yNorm);
        const s = yNorm < 0.3 ? 2 + ((x + y) % 2) : 2 + ((x + y) % 3);
        ctx.fillRect(x, y, s, s);
        if ((i + y) % 5 === 0) ctx.fillRect(x - 1, y + 1, s, s);
      }

      // Sparse accent flowers
      const flowerCount = Math.max(5, Math.floor((w * h) / 1150));
      for (let i = 0; i < flowerCount; i++) {
        const x = 3 + Math.floor(Math.random() * Math.max(1, w - 8));
        const y = 3 + Math.floor(Math.random() * Math.max(1, h - 8));
        if (y > h * 0.88) continue;
        const pal = FLOWER_PALETTES[Math.floor(Math.random() * FLOWER_PALETTES.length)];
        const size = Math.random() < 0.65 ? 1 : 2;
        drawTinyFlower(x, y, size, pal);
      }

      ctx.globalAlpha = 0.24;
      for (let i = 0; i < Math.floor(w * 0.42); i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h * 0.36);
        ctx.fillStyle = "#bbf7d0";
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      const w = Math.ceil(window.innerWidth / 4);
      const h = Math.ceil(window.innerHeight / 4);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      paint(w, h);
    }

    resize();
    window.addEventListener("resize", resize);
  })();

  /* ─── Critters ──────────────────────────────────────────────── */
  (function spawnCritters() {
    const host = document.getElementById("critters");
    if (!host) return;

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }
    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function place(el, opts) {
      el.style.left = rand(opts.leftMin, opts.leftMax).toFixed(1) + "%";
      el.style.top = rand(opts.topMin, opts.topMax).toFixed(1) + "%";
      el.style.right = "auto";
      el.style.bottom = "auto";
      if (opts.flip) el.classList.add("flip");
      if (opts.scale) el.style.setProperty("--s", String(opts.scale));
      if (opts.delay) el.style.animationDelay = opts.delay + "s";
      host.appendChild(el);
    }

    const snake = document.createElement("div");
    snake.className = "snake critter";
    snake.innerHTML =
      '<div class="snake-body"></div><div class="snake-head">' +
      '<span class="eye e1"></span><span class="eye e2"></span>' +
      '<span class="tongue"></span></div>';
    place(snake, {
      leftMin: 55,
      leftMax: 88,
      topMin: 10,
      topMax: 30,
      flip: Math.random() < 0.45,
      scale: rand(0.85, 1.1),
      delay: rand(0, 0.8),
    });

    const ladyPalettes = [
      { shell: "#ef4444", shell2: "#dc2626", edge: "#7f1d1d" },
      { shell: "#f97316", shell2: "#ea580c", edge: "#9a3412" },
      { shell: "#fbbf24", shell2: "#f59e0b", edge: "#92400e" },
      { shell: "#a855f7", shell2: "#9333ea", edge: "#581c87" },
      { shell: "#22c55e", shell2: "#16a34a", edge: "#14532d" },
      { shell: "#38bdf8", shell2: "#0ea5e9", edge: "#0c4a6e" },
    ];
    // Fewer ladybirds — less visual noise
    for (let i = 0; i < 4; i++) {
      const pal = pick(ladyPalettes);
      const bug = document.createElement("div");
      bug.className = "ladybird critter";
      bug.style.setProperty("--lb", pal.shell);
      bug.style.setProperty("--lb2", pal.shell2);
      bug.style.setProperty("--lb-edge", pal.edge);
      bug.innerHTML =
        '<span class="lb-shell"></span><span class="lb-line"></span>' +
        '<span class="lb-head"></span><span class="lb-spot s1"></span>' +
        '<span class="lb-spot s2"></span><span class="lb-spot s3"></span>' +
        '<span class="lb-spot s4"></span>';
      place(bug, {
        leftMin: 8,
        leftMax: 90,
        topMin: 18,
        topMax: 78,
        flip: Math.random() < 0.5,
        scale: rand(0.85, 1.15),
        delay: rand(0, 1.2),
      });
    }
  })();

  /* ─── Parallax (subtle) ─────────────────────────────────────── */
  (function parallax() {
    if (reduceMotion) return;
    const layer = document.getElementById("parallax");
    const world = document.getElementById("world");
    if (!layer || !world) return;
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 16;
        my = (e.clientY / window.innerHeight - 0.5) * 11;
      },
      { passive: true }
    );
    function tick() {
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      layer.style.transform = "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ─── Petal burst ───────────────────────────────────────────── */
  function petalBurst(el) {
    if (reduceMotion) return;
    const host = document.getElementById("petals");
    if (!host) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ["#ff6b8a", "#fbbf24", "#22d3ee", "#a78bfa", "#34d399", "#f472b6"];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const dist = 28 + Math.random() * 40;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      host.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  function clickFlash() {
    if (reduceMotion) return;
    const flash = document.getElementById("click-flash");
    if (!flash) return;
    flash.classList.remove("show");
    void flash.offsetWidth;
    flash.classList.add("show");
    setTimeout(() => flash.classList.remove("show"), 280);
  }

  /* ─── Modals ────────────────────────────────────────────────── */
  let lastFocus = null;

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add("modal-open");
    const closeBtn = el.querySelector(".modal-x");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(el) {
    if (!el) return;
    el.hidden = true;
    if (!document.querySelector(".modal:not([hidden])") && !isShellOpen()) {
      document.body.classList.remove("modal-open");
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function closeAllContentModals() {
    document.querySelectorAll(".modal").forEach((m) => {
      m.hidden = true;
    });
  }

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const map = {
        about: "modalAbout",
        skills: "modalSkills",
        contact: "modalContact",
      };
      const id = map[btn.getAttribute("data-modal")];
      if (id) {
        closeAllContentModals();
        openModal(id);
      }
    });
  });

  document.getElementById("btnAboutHud")?.addEventListener("click", () => {
    closeAllContentModals();
    openModal("modalAbout");
  });

  document.getElementById("btnHome")?.addEventListener("click", () => {
    closeShell();
    closeAllContentModals();
    document.body.classList.remove("modal-open");
    window.scrollTo(0, 0);
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-close") || e.target.classList.contains("modal-backdrop")) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isShellOpen()) {
      closeShell();
      return;
    }
    const open = document.querySelector(".modal:not([hidden])");
    if (open) closeModal(open);
    closeProjectsMenu();
  });

  /* ─── Projects dropdown ─────────────────────────────────────── */
  const btnProjects = document.getElementById("btnProjects");
  const projectsMenu = document.getElementById("projectsMenu");

  function closeProjectsMenu() {
    if (!projectsMenu || !btnProjects) return;
    projectsMenu.hidden = true;
    btnProjects.setAttribute("aria-expanded", "false");
  }

  btnProjects?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = projectsMenu.hidden;
    projectsMenu.hidden = !open;
    btnProjects.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!projectsMenu || projectsMenu.hidden) return;
    if (!e.target.closest(".nav-drop")) closeProjectsMenu();
  });

  /* ─── Project shell (iframe) ────────────────────────────────── */
  const shell = document.getElementById("projectShell");
  const shellFrame = document.getElementById("shellFrame");
  const shellTitle = document.getElementById("shellTitle");
  const shellOpen = document.getElementById("shellOpen");
  const projectIntro = document.getElementById("projectIntroModal");
  const projectIntroTitle = document.getElementById("projectIntroTitle");
  const projectIntroBody = document.getElementById("projectIntroBody");
  let projectIntroCleanup = null;

  function isShellOpen() {
    return shell && !shell.hidden;
  }

  function hideProjectIntro(immediate) {
    if (projectIntroCleanup) {
      projectIntroCleanup();
      projectIntroCleanup = null;
    }
    if (!projectIntro) return;
    if (immediate || reduceMotion) {
      projectIntro.hidden = true;
      projectIntro.classList.remove("is-leaving");
      return;
    }
    if (projectIntro.hidden) return;
    projectIntro.classList.add("is-leaving");
    let done = false;
    function finish() {
      if (done) return;
      done = true;
      projectIntro.hidden = true;
      projectIntro.classList.remove("is-leaving");
    }
    projectIntro.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 280);
  }

  function showProjectIntro(p) {
    if (!projectIntro || !p || !p.blurb) return;
    if (projectIntroCleanup) {
      projectIntroCleanup();
      projectIntroCleanup = null;
    }
    if (projectIntroTitle) projectIntroTitle.textContent = p.title;
    if (projectIntroBody) projectIntroBody.textContent = p.blurb;
    projectIntro.classList.remove("is-leaving");
    projectIntro.hidden = false;

    let dismissed = false;
    function dismiss(e) {
      if (dismissed) return;
      dismissed = true;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      hideProjectIntro(false);
    }

    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", dismiss, true);
    window.addEventListener("touchstart", dismiss, { capture: true, passive: false });

    projectIntroCleanup = function () {
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("touchstart", dismiss, true);
    };
  }

  function openProject(id) {
    const p = PROJECTS[id];
    if (!p || !shell) return;
    closeAllContentModals();
    closeProjectsMenu();
    lastFocus = document.activeElement;
    shellTitle.textContent = p.title;
    shellOpen.href = p.href;
    shellFrame.src = p.href;
    shell.hidden = false;
    document.body.classList.add("modal-open", "shell-open");
    showProjectIntro(p);
    document.getElementById("btnBackGarden")?.focus();
  }

  function closeShell() {
    if (!shell) return;
    hideProjectIntro(true);
    shell.hidden = true;
    shellFrame.src = "about:blank";
    document.body.classList.remove("shell-open");
    if (!document.querySelector(".modal:not([hidden])")) {
      document.body.classList.remove("modal-open");
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("btnBackGarden")?.addEventListener("click", closeShell);

  document.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const id = el.getAttribute("data-open");
      openProject(id);
    });
  });

  /* Boss flowers: intercept navigation → modal */
  document.querySelectorAll(".boss").forEach((boss) => {
    boss.addEventListener("mouseenter", () => petalBurst(boss));
    boss.addEventListener("focus", () => petalBurst(boss));

    boss.addEventListener("click", (e) => {
      e.preventDefault();
      const id = boss.getAttribute("data-id");
      boss.classList.add("is-pop");
      clickFlash();
      setTimeout(() => {
        boss.classList.remove("is-pop");
        openProject(id);
      }, reduceMotion ? 0 : 160);
    });
  });

  /* ─── Garden / list view ────────────────────────────────────── */
  const viewToggle = document.getElementById("viewToggle");
  const listView = document.getElementById("listView");
  const bossFlowers = document.getElementById("projects");
  let listMode = false;

  function setListMode(on) {
    listMode = on;
    document.body.classList.toggle("list-mode", on);
    if (listView) listView.hidden = !on;
    if (bossFlowers) bossFlowers.setAttribute("aria-hidden", on ? "true" : "false");
    if (viewToggle) {
      viewToggle.setAttribute("aria-pressed", on ? "true" : "false");
      viewToggle.textContent = on ? "GARDEN VIEW" : "LIST VIEW";
    }
  }

  viewToggle?.addEventListener("click", () => setListMode(!listMode));

  // Mobile default: LIST VIEW (<768px)
  const mobileMq = window.matchMedia("(max-width: 768px)");
  function applyMobileDefault(e) {
    if (e.matches) setListMode(true);
  }
  applyMobileDefault(mobileMq);
  if (mobileMq.addEventListener) {
    mobileMq.addEventListener("change", (e) => {
      if (e.matches) setListMode(true);
    });
  }

  /* ─── Hamburger nav ─────────────────────────────────────────── */
  const navBurger = document.getElementById("navBurger");
  function setNavOpen(on) {
    document.body.classList.toggle("nav-open", on);
    if (navBurger) {
      navBurger.setAttribute("aria-expanded", on ? "true" : "false");
      navBurger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
    }
  }
  navBurger?.addEventListener("click", (e) => {
    e.stopPropagation();
    setNavOpen(!document.body.classList.contains("nav-open"));
  });
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (!e.target.closest(".mini-nav")) setNavOpen(false);
  });
  // Close burger after choosing a nav action
  document.getElementById("navLinks")?.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal], [data-open], .nav-ext, .view-toggle")) {
      setNavOpen(false);
    }
  });
})();
