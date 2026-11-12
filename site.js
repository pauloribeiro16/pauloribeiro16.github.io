(function () {
  var root = document.documentElement;

  /* 1. Language Switcher (EN / PT) */
  var langButtons = document.querySelectorAll(".switch button[data-lang]");
  function setLang(lang) {
    if (lang !== "pt" && lang !== "en") lang = "pt";
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    var searchInput = document.getElementById("project-search");
    if (searchInput) {
      searchInput.placeholder =
        lang === "pt"
          ? "Filtrar por tecnologia, nome, tema..."
          : "Filter by stack, name, topic...";
    }
  }

  var savedLang = null;
  try {
    savedLang = localStorage.getItem("lang");
  } catch (e) {}
  var initialLang =
    savedLang ||
    ((navigator.language || "pt").toLowerCase().indexOf("pt") === 0
      ? "pt"
      : "en");
  setLang(initialLang);

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.dataset.lang);
      try {
        localStorage.setItem("lang", b.dataset.lang);
      } catch (e) {}
    });
  });

  /* 2. Theme Switcher (Light / Dark) */
  var themeBtn = document.getElementById("theme-toggle");
  function getEffectiveTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function updateThemeButton() {
    if (!themeBtn) return;
    var current = getEffectiveTheme();
    themeBtn.textContent = current === "dark" ? "☀" : "☾";
    themeBtn.setAttribute(
      "aria-label",
      current === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    themeBtn.setAttribute(
      "title",
      current === "dark" ? "Light mode / Modo claro" : "Dark mode / Modo escuro"
    );
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch (e) {}
  if (savedTheme === "dark" || savedTheme === "light") {
    root.setAttribute("data-theme", savedTheme);
  }
  updateThemeButton();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = getEffectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      updateThemeButton();
    });
  }

  /* 3. Interactive Project Directory Filter (projects.html) */
  var filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
  var searchInput = document.getElementById("project-search");
  var projectItems = document.querySelectorAll("[data-category]");
  var groups = document.querySelectorAll(".group[data-group]");
  var countDisplay = document.getElementById("visible-project-count");

  var activeFilter = "all";
  var searchQuery = "";

  function applyFilters() {
    if (!projectItems.length) return;
    var visibleTotal = 0;

    projectItems.forEach(function (item) {
      var cat = item.getAttribute("data-category") || "";
      var vis = item.getAttribute("data-vis") || "";
      var text = (item.textContent || "").toLowerCase();

      var matchesCat =
        activeFilter === "all" ||
        cat === activeFilter ||
        vis === activeFilter;
      var matchesSearch =
        !searchQuery || text.indexOf(searchQuery) !== -1;

      var show = matchesCat && matchesSearch;
      if (show) {
        item.removeAttribute("hidden");
        visibleTotal++;
      } else {
        item.setAttribute("hidden", "");
      }
    });

    groups.forEach(function (g) {
      var visibleInGroup = g.querySelectorAll("[data-category]:not([hidden])").length;
      if (visibleInGroup === 0) {
        g.setAttribute("hidden", "");
      } else {
        g.removeAttribute("hidden");
      }
    });

    if (countDisplay) {
      countDisplay.textContent = String(visibleTotal);
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.getAttribute("data-filter") || "all";
      filterBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = (e.target.value || "").trim().toLowerCase();
      applyFilters();
    });
  }
})();
