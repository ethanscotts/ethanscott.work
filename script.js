const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lb-image");
const lbCaption = document.getElementById("lb-caption");
const yearEl = document.getElementById("year");

if (yearEl) yearEl.textContent = new Date().getFullYear();

if (gallery && lightbox && lbImage) {
  const pieces = Array.from(gallery.querySelectorAll(".piece"));
  const closeBtn = lightbox.querySelector(".lb-close");
  const prevBtn = lightbox.querySelector(".lb-prev");
  const nextBtn = lightbox.querySelector(".lb-next");
  let current = 0;

  function fullSrc(piece) {
    return piece.getAttribute("data-full") || piece.getAttribute("href") || "";
  }

  function show(index) {
    if (!pieces.length) return;
    current = (index + pieces.length) % pieces.length;
    const piece = pieces[current];
    const thumb = piece.querySelector("img");
    lbImage.src = fullSrc(piece);
    lbImage.alt = thumb ? thumb.alt : "";
    if (lbCaption) lbCaption.textContent = thumb ? thumb.alt : "";
  }

  gallery.addEventListener("click", function (event) {
    const piece = event.target.closest(".piece");
    if (!piece) return;
    event.preventDefault();
    event.stopPropagation();
    show(pieces.indexOf(piece));
    lightbox.showModal();
  }, true);

  if (closeBtn) closeBtn.addEventListener("click", function () { lightbox.close(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { show(current - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { show(current + 1); });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox || event.target.tagName === "FIGURE") lightbox.close();
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
}
// Latest chapters (from data/chapters.json, refreshed by GitHub Action)
(function () {
  const list = document.getElementById("latest-chapters");
  if (!list) return;
  // Anything listed here is removed from chapter titles, wherever it appears.
  // One item per line, in quotes, with a comma after each.
  const REMOVE = [
    "Journey Through The Endless Castle",
    "[Progression | Slow Burn | Tower Climber]",
  ];
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const clean = (t) => {
    let out = t;
    REMOVE.forEach((r) => {
      out = out.replace(new RegExp(esc(r), "gi"), "");
    });
    out = out
      .replace(/\s{2,}/g, " ")
      .replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, "")
      .trim();
    return out || t;
  };

  fetch("data/chapters.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(({ chapters }) => {
      if (!chapters || !chapters.length) return;
      list.textContent = "";
      chapters.forEach((c) => {
        if (!c.url.startsWith("https://www.royalroad.com/")) return;
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = c.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = clean(c.title);
        li.appendChild(a);
        if (c.date) {
          const time = document.createElement("time");
          time.dateTime = c.date;
          time.textContent = new Date(c.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          li.appendChild(time);
        }
        list.appendChild(li);
      });
    })
    .catch(() => {}); // keep the fallback link
})();
// Chapter 1 sample popup
(function () {
  const dlg = document.getElementById("sample");
  const openBtn = document.getElementById("sample-open");
  if (!dlg || !openBtn) return;

  openBtn.addEventListener("click", () => {
    dlg.showModal();
    dlg.querySelector(".sample-body").scrollTop = 0;
  });

  dlg.querySelector(".sample-close").addEventListener("click", () => dlg.close());

  // Click outside the panel to close. Tracking where the press started
  // stops a text-selection drag that ends outside from closing it.
  let pressedOutside = false;
  dlg.addEventListener("mousedown", (e) => { pressedOutside = e.target === dlg; });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg && pressedOutside) dlg.close();
  });
})();
// World map popup
(function () {
  const dlg = document.getElementById("worldmap");
  const openBtn = document.getElementById("map-open");
  if (!dlg || !openBtn) return;

  const img = document.getElementById("map-img");
  const frame = dlg.querySelector(".map-frame");

  openBtn.addEventListener("click", () => {
    dlg.classList.remove("zoomed");
    dlg.showModal();
    frame.scrollTop = 0;
    frame.scrollLeft = 0;
  });

  dlg.querySelector(".map-close").addEventListener("click", () => dlg.close());

  // Click the map to toggle between fit-to-screen and full size
  img.addEventListener("click", () => dlg.classList.toggle("zoomed"));

  // Click outside the map to close
  let pressedOutside = false;
  dlg.addEventListener("mousedown", (e) => { pressedOutside = e.target === dlg; });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg && pressedOutside) dlg.close();
  });
})();
// Click sparks
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "sparks";
  canvas.setAttribute("aria-hidden", "true");

  // Popover puts the canvas in the browser's top layer so sparks can show
  // above the open chapter/map/lightbox popups too.
  const usePopover = typeof canvas.showPopover === "function";
  if (usePopover) canvas.setAttribute("popover", "manual");

  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let dpr = 1;
  let sparks = [];
  let running = false;
  let last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  function toFront() {
    if (!usePopover) return;
    try { canvas.hidePopover(); } catch (e) {}
    try { canvas.showPopover(); } catch (e) {}
  }

  const COLORS = ["#fff3c4", "#ffd27a", "#ffb03a", "#ff8a1f", "#ff5a1a"];

  function burst(x, y) {
    const count = 22 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 320;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60, // slight upward kick
        life: 0,
        max: 450 + Math.random() * 450,
        w: 1 + Math.random() * 1.8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter"; // overlapping sparks glow brighter
    ctx.lineCap = "round";

    sparks = sparks.filter(function (s) {
      s.life += dt * 1000;
      if (s.life >= s.max) return false;

      s.vx *= 1 - 2.2 * dt;               // air drag
      s.vy = s.vy * (1 - 2.2 * dt) + 620 * dt; // drag + gravity
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      const t = 1 - s.life / s.max;
      ctx.globalAlpha = t;
      ctx.strokeStyle = s.c;
      ctx.lineWidth = s.w * (0.4 + 0.6 * t);
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 0.025, s.y - s.vy * 0.025); // short streak
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      return true;
    });

    if (sparks.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest && e.target.closest("a, button, .piece, summary, [role='button']");
    if (!el) return;

    let x = e.clientX;
    let y = e.clientY;
    if (!x && !y) { // keyboard activation: spark from the center of the element
      const r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    toFront();
    burst(x, y);
  }, true);
})();
