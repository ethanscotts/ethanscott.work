document.addEventListener("DOMContentLoaded", function () {
  const dlg = document.getElementById("sample");
  const openBtn = document.getElementById("sample-open");
  if (!dlg || !openBtn) return;

  openBtn.addEventListener("click", function () {
    dlg.showModal();
    dlg.querySelector(".sample-body").scrollTop = 0;
  });

  dlg.querySelector(".sample-close").addEventListener("click", function () {
    dlg.close();
  });

  // Click outside the panel to close
  let pressedOutside = false;
  dlg.addEventListener("mousedown", function (e) {
    pressedOutside = e.target === dlg;
  });
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg && pressedOutside) dlg.close();
  });
});
