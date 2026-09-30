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
        a.textContent = c.title;
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
