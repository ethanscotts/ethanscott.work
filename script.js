// Lightbox for gallery pieces and cover links that point at image files.
// Without JS, those links still open the image in a new navigation.

const pieces = Array.from(document.querySelectorAll(".piece, .featured-cover, .work-cover"));
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lb-image");
const lbCaption = document.getElementById("lb-caption");
const closeBtn = lightbox.querySelector(".lb-close");
const prevBtn = lightbox.querySelector(".lb-prev");
const nextBtn = lightbox.querySelector(".lb-next");

let current = 0;

function show(index) {
  current = (index + pieces.length) % pieces.length;
  const piece = pieces[current];
  const thumb = piece.querySelector("img");
  lbImage.src = piece.getAttribute("href");
  lbImage.alt = thumb.alt;
  lbCaption.textContent = thumb.alt;
}

function open(index) {
  show(index);
  lightbox.showModal();
}

pieces.forEach((piece, index) => {
  piece.addEventListener("click", (event) => {
    event.preventDefault();
    open(index);
  });
});

closeBtn.addEventListener("click", () => lightbox.close());
prevBtn.addEventListener("click", () => show(current - 1));
nextBtn.addEventListener("click", () => show(current + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.tagName === "FIGURE") {
    lightbox.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") show(current - 1);
  if (event.key === "ArrowRight") show(current + 1);
});

document.getElementById("year").textContent = new Date().getFullYear();
