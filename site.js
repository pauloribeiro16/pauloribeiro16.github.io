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
          ? "Filtrar por tecnologia, nome..."
          : "Filter by stack, name...";
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

  /* 4. Card Thumbnail Switcher */
  document.querySelectorAll(".thumb-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var src = btn.getAttribute("data-src");
      var card = btn.closest(".vcard");
      if (!card || !src) return;
      var mainImg = card.querySelector(".vcard-media > img");
      if (mainImg) {
        mainImg.src = src;
      }
      card.querySelectorAll(".thumb-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
    });
  });

  /* 5. Fullscreen Lightbox for Screenshots */
  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("hidden", "");
  lightbox.innerHTML =
    '<img id="lightbox-img" src="" alt="Screenshot preview">' +
    '<div class="lightbox-bar">' +
    '<span id="lightbox-caption"></span>' +
    '<button type="button" class="lightbox-close" id="lightbox-close">ESC / Fechar ✕</button>' +
    "</div>";
  document.body.appendChild(lightbox);

  var lbImg = document.getElementById("lightbox-img");
  var lbCap = document.getElementById("lightbox-caption");
  var lbClose = document.getElementById("lightbox-close");

  function openLightbox(src, alt) {
    if (!src) return;
    lbImg.src = src;
    lbCap.textContent = alt || "";
    lightbox.removeAttribute("hidden");
  }

  function closeLightbox() {
    lightbox.setAttribute("hidden", "");
    lbImg.src = "";
  }

  document.querySelectorAll(".vcard-media").forEach(function (media) {
    media.addEventListener("click", function (e) {
      var targetImg = e.target.closest("img") || media.querySelector("img");
      if (targetImg && targetImg.src) {
        openLightbox(targetImg.src, targetImg.alt);
      }
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hasAttribute("hidden")) {
      closeLightbox();
    }
  });

  /* 6. Interactive Area Explorer Pills (index.html & research.html) */
  document.querySelectorAll(".area-pills").forEach(function (pillGroup) {
    var pills = pillGroup.querySelectorAll(".area-pill[data-area]");
    var targetScope = pillGroup.getAttribute("data-target") || "area-item";
    var items = document.querySelectorAll('[data-area-group="' + targetScope + '"]');

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var area = pill.getAttribute("data-area") || "all";
        pills.forEach(function (p) {
          p.setAttribute("aria-pressed", String(p === pill));
        });
        items.forEach(function (item) {
          var itemArea = item.getAttribute("data-area-val") || "";
          if (area === "all" || itemArea.indexOf(area) !== -1) {
            item.removeAttribute("hidden");
          } else {
            item.setAttribute("hidden", "");
          }
        });
      });
    });
  });
})();
