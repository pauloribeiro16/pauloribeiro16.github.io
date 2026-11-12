(function () {
  var root = document.documentElement;

  /* Idioma (PT / EN) */
  var langButtons = document.querySelectorAll("button[data-lang]");
  function setLang(lang) {
    if (lang !== "pt" && lang !== "en") lang = "pt";
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    updateThemeButton();
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem("lang"); } catch (e) {}
  setLang(
    savedLang ||
      ((navigator.language || "pt").toLowerCase().indexOf("pt") === 0 ? "pt" : "en")
  );

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.dataset.lang);
      try { localStorage.setItem("lang", b.dataset.lang); } catch (e) {}
    });
  });

  /* Tema claro / escuro */
  var themeBtn = document.getElementById("theme-toggle");
  function effectiveTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function updateThemeButton() {
    if (!themeBtn) return;
    var dark = effectiveTheme() === "dark";
    var en = root.lang === "en";
    themeBtn.textContent = dark ? (en ? "light" : "claro") : (en ? "dark" : "escuro");
    themeBtn.setAttribute("aria-label", dark ? "Light mode" : "Dark mode");
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  if (savedTheme === "dark" || savedTheme === "light") root.setAttribute("data-theme", savedTheme);
  updateThemeButton();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      updateThemeButton();
    });
  }

  /* Ampliar imagens */
  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("hidden", "");
  box.innerHTML = '<img alt="">';
  document.body.appendChild(box);
  var boxImg = box.querySelector("img");

  document.querySelectorAll("figure img").forEach(function (img) {
    img.addEventListener("click", function () {
      boxImg.src = img.src;
      boxImg.alt = img.alt;
      box.removeAttribute("hidden");
    });
  });

  function close() { box.setAttribute("hidden", ""); boxImg.src = ""; }
  box.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
