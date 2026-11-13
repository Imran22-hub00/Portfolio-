document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Mobile menu ---- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menuToggle.textContent = open ? "✕" : "☰";
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
      });
    });
  }

  /* ---- Scroll progress bar ---- */
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Cursor glow ---- */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    addEventListener("mousemove", (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      glow.classList.add("on");
    });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }

  /* ---- Scroll reveal with stagger ---- */
  const targets = document.querySelectorAll(
    ".section-heading, .about-copy, .fact, .skill-panel, .project-card, .education-card, .contact-wrap, .hero-content > *, .hero-art"
  );
  targets.forEach((el) => {
    el.classList.add("reveal");
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.max(sibs.indexOf(el), 0) * 90}ms`);
  });
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("show"));
  }

  /* ---- Typing effect on hero subtitle ---- */
  const sub = document.querySelector(".hero h2");
  if (sub && !reduce) {
    const roles = ["Aspiring Software Developer", "Java Programmer", "Web Developer"];
    const cursor = document.createElement("span");
    cursor.className = "type-cursor";
    sub.textContent = "";
    const text = document.createElement("span");
    sub.append(text, cursor);
    let r = 0, i = 0, del = false;
    const tick = () => {
      const word = roles[r];
      text.textContent = word.slice(0, i);
      if (!del && i === word.length) { del = true; return setTimeout(tick, 1600); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    };
    tick();
  }

  /* ---- 3D tilt + cursor spotlight on cards ---- */
  document.querySelectorAll(".panel").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      if (!reduce && (card.classList.contains("project-card") || card.classList.contains("skill-panel"))) {
        const rx = ((y / r.height) - 0.5) * -8, ry = ((x / r.width) - 0.5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---- Hero profile card parallax ---- */
  const art = document.querySelector(".hero-art");
  const avatarCard = document.querySelector(".avatar-card");
  if (art && avatarCard && !reduce) {
    art.addEventListener("mousemove", (e) => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      avatarCard.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${y * -14}deg)`;
    });
    art.addEventListener("mouseleave", () => { avatarCard.style.transform = ""; });
  }

  /* ---- Active nav link on scroll ---- */
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => so.observe(s));
  }
});


(function(){var b=document.getElementById("themeToggle");if(!b)return;var d=document.documentElement;
function lab(){b.setAttribute("aria-label",d.getAttribute("data-theme")==="light"?"Switch to dark theme":"Switch to light theme")}lab();
b.addEventListener("click",function(){var n=d.getAttribute("data-theme")==="light"?"dark":"light";d.setAttribute("data-theme",n);try{localStorage.setItem("theme",n)}catch(e){}lab()})})();

/* ---- Education timeline: line positioning + scroll-fill ---- */
(function () {
  var box = document.querySelector("#education .container");
  var cards = document.querySelectorAll("#education .education-card");
  if (!box || !cards.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var top = 0, h = 0, ticking = false;

  function measure() {
    var first = cards[0], last = cards[cards.length - 1];
    top = first.offsetTop + 38;
    h = Math.max(last.offsetTop - first.offsetTop, 1);
    box.style.setProperty("--lt", top + "px");
    box.style.setProperty("--lh", h + "px");
    update();
  }
  function update() {
    ticking = false;
    if (reduce) { box.style.setProperty("--p", 1); return; }
    var r = box.getBoundingClientRect();
    var p = (window.innerHeight * 0.6 - (r.top + top)) / h;
    box.style.setProperty("--p", Math.min(Math.max(p, 0), 1).toFixed(3));
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  measure();
})();

/* ---- Let's Connect: magnetic button + copy email ---- */
(function () {
  var actions = document.querySelector(".contact-actions");
  if (!actions) return;
  var email = "mohamedimran1052@gmail.com";

  var main = actions.querySelector(".btn-primary");
  if (main && window.matchMedia("(hover: hover)").matches) {
    main.addEventListener("mousemove", function (e) {
      var r = main.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25;
      var y = (e.clientY - r.top - r.height / 2) * 0.35;
      main.style.transform = "translate(" + x + "px," + y + "px)";
    });
    main.addEventListener("mouseleave", function () { main.style.transform = ""; });
  }

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy-mail";
  btn.textContent = "Copy email ⧉";
  actions.appendChild(btn);
  btn.addEventListener("click", function () {
    function done() {
      btn.textContent = "Copied ✓";
      btn.classList.add("done");
      setTimeout(function () { btn.textContent = "Copy email ⧉"; btn.classList.remove("done"); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, done);
    } else {
      var t = document.createElement("textarea");
      t.value = email; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(t); done();
    }
  });
})();


/* ---- Footer: theme button, back-to-top, reveal ---- */
(function () {
  var root = document.documentElement;

  var tb = document.getElementById("footerTheme");
  var label = document.getElementById("footerThemeLabel");
  var ico = tb ? tb.querySelector(".sf-theme-ico") : null;
  function sync() {
    var light = root.getAttribute("data-theme") === "light";
    if (label) label.textContent = light ? "Dark mode" : "Light mode";
    if (ico) ico.textContent = light ? "☾" : "☀";
  }
  if (tb) {
    sync();
    tb.addEventListener("click", function () {
      var n = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", n);
      try { localStorage.setItem("theme", n); } catch (e) {}
    });
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  var top = document.getElementById("toTop");
  if (top) {
    window.addEventListener("scroll", function () {
      top.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var cols = document.querySelectorAll(".sf-brand, .sf-col, .sf-bottom");
  cols.forEach(function (el, i) { el.classList.add("reveal"); el.style.setProperty("--d", i * 120 + "ms"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    cols.forEach(function (el) { io.observe(el); });
  } else {
    cols.forEach(function (el) { el.classList.add("show"); });
  }
})();


/* ---- Skills: bar fill + percentage count-up + tilt ---- */
(function () {
  var cards = document.querySelectorAll(".skill-card");
  if (!cards.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  cards.forEach(function (c, i) { c.classList.add("reveal"); c.style.setProperty("--d", (i % 3) * 110 + "ms"); });

  function run(c) {
    c.classList.add("show");
    var lvl = parseInt(c.getAttribute("data-level"), 10) || 0;
    var fill = c.querySelector(".sk-fill"), pct = c.querySelector(".sk-pct");
    fill.style.width = lvl + "%";
    if (reduce) { pct.textContent = lvl + "%"; return; }
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min((t - start) / 1400, 1);
      pct.textContent = Math.round(lvl * (1 - Math.pow(1 - k, 3))) + "%";
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    cards.forEach(function (c) { io.observe(c); });
  } else { cards.forEach(run); }

  if (!reduce) cards.forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -8, ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      c.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });
})();
