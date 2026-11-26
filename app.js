/* StrataBox interactive modules (zero-dependency ES6). */
(function () {
  "use strict";

  const DATA = window.STRATABOX_DATA;
  if (!DATA) {
    return;
  }

  const STORAGE_LANG_KEY = "stratabox-lang";
  const BACKEND_CODES = {
    fn: { id: "fncall", name: "FnCall", canonical: "fn" },
    ctr: { id: "container", name: "Container", canonical: "ctr" },
    uvm: { id: "microvm", name: "MicroVm", canonical: "uvm" },
    mvm: { id: "microvm", name: "MicroVm", canonical: "uvm" },
    vm: { id: "fullvm", name: "FullVm", canonical: "vm" },
  };

  const reducedMotionQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

  function prefersReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function readStoredLang() {
    try {
      const saved = window.localStorage.getItem(STORAGE_LANG_KEY);
      return saved === "zh" ? "zh" : "en";
    } catch (_err) {
      return "en";
    }
  }

  function writeStoredLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (_err) {
      /* Ignore storage quota or private mode errors. */
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getUi() {
    return (DATA.ui && DATA.ui[state.lang]) || (DATA.ui && DATA.ui.en) || {};
  }

  function getI18n() {
    return (DATA.i18n && DATA.i18n[state.lang]) || (DATA.i18n && DATA.i18n.en) || {};
  }

  const state = {
    lang: readStoredLang(),
    layer: "top",
    backend: "fncall",
    paging: "cold",
    bench: "paging",
    security: "ebpf",
    sandboxId: "stratabox-edge02-ctr-9f4a21",
    qs: "install",
    compactChart: false,
    compactDiagram: false,
  };

  const copyTimers = new WeakMap();

  /* --------------------------------------------------------------------------
   * Lightweight single-pass syntax highlighter (Python & Bash)
   * ------------------------------------------------------------------------ */
  const PYTHON_TOKEN_RE =
    /(#[^\n]*)|((?:\b[fFbBrRuU]{1,2})?(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|\b(from|import|async|await|with|as|def|return|None|True|False|if|else|elif|for|in|class|try|except|finally|raise|pass|and|or|not)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/g;

  const BASH_TOKEN_RE =
    /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(--[A-Za-z0-9][A-Za-z0-9_-]*)|(\s)(-[a-zA-Z])(?=\s|$)|\b(cargo|pip|stratabox-daemon|cluster|control|edge|layer|bench|build|install|import-oci)\b|\b(\d+(?:\.\d+)?)\b/g;

  function highlightCode(source, lang) {
    const code = String(source || "");
    const isBash = lang === "bash" || lang === "sh";
    const regex = isBash ? BASH_TOKEN_RE : PYTHON_TOKEN_RE;
    regex.lastIndex = 0;

    let out = "";
    let lastIndex = 0;
    let match = regex.exec(code);

    while (match !== null) {
      if (match.index > lastIndex) {
        out += escapeHtml(code.slice(lastIndex, match.index));
      }

      if (isBash) {
        if (match[1]) {
          out += '<span class="tok-com">' + escapeHtml(match[1]) + "</span>";
        } else if (match[2]) {
          out += '<span class="tok-str">' + escapeHtml(match[2]) + "</span>";
        } else if (match[3]) {
          out += '<span class="tok-flag">' + escapeHtml(match[3]) + "</span>";
        } else if (match[5]) {
          out +=
            escapeHtml(match[4]) +
            '<span class="tok-flag">' +
            escapeHtml(match[5]) +
            "</span>";
        } else if (match[6]) {
          out += '<span class="tok-kw">' + escapeHtml(match[6]) + "</span>";
        } else if (match[7]) {
          out += '<span class="tok-num">' + escapeHtml(match[7]) + "</span>";
        } else {
          out += escapeHtml(match[0]);
        }
      } else if (match[1]) {
        out += '<span class="tok-com">' + escapeHtml(match[1]) + "</span>";
      } else if (match[2]) {
        out += '<span class="tok-str">' + escapeHtml(match[2]) + "</span>";
      } else if (match[3]) {
        out += '<span class="tok-kw">' + escapeHtml(match[3]) + "</span>";
      } else if (match[4]) {
        out += '<span class="tok-num">' + escapeHtml(match[4]) + "</span>";
      } else if (match[5]) {
        out += '<span class="tok-fn">' + escapeHtml(match[5]) + "</span>";
      } else {
        out += escapeHtml(match[0]);
      }

      lastIndex = regex.lastIndex;
      match = regex.exec(code);
    }

    if (lastIndex < code.length) {
      out += escapeHtml(code.slice(lastIndex));
    }

    return out;
  }

  /* --------------------------------------------------------------------------
   * Clipboard helper with execCommand fallback
   * ------------------------------------------------------------------------ */
  function copyTextToClipboard(text) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      window.isSecureContext
    ) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopyText(text);
      });
    }
    return fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    return new Promise(function (resolve, reject) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          resolve();
        } else {
          reject(new Error("copy command failed"));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function bindCopyButton(button, getText, getDefaultLabel, getCopiedLabel) {
    if (!button) return;
    button.addEventListener("click", function () {
      const text = getText();
      if (!text) return;

      copyTextToClipboard(text).then(
        function () {
          const prevTimer = copyTimers.get(button);
          if (prevTimer) {
            window.clearTimeout(prevTimer);
          }
          button.textContent = getCopiedLabel();
          button.classList.add("is-copied");

          const timer = window.setTimeout(function () {
            button.textContent = getDefaultLabel();
            button.classList.remove("is-copied");
            copyTimers.delete(button);
          }, 1800);
          copyTimers.set(button, timer);
        },
        function () {
          /* Leave button unchanged if browser blocks clipboard access. */
        }
      );
    });
  }

  function resetCopyButtonLabel(button, label) {
    if (!button) return;
    const prevTimer = copyTimers.get(button);
    if (prevTimer) {
      window.clearTimeout(prevTimer);
      copyTimers.delete(button);
    }
    button.classList.remove("is-copied");
    button.textContent = label;
  }

  /* --------------------------------------------------------------------------
   * Accessible WAI-ARIA tablist keyboard helper
   * ------------------------------------------------------------------------ */
  function bindTablistKeyboard(container, selector, onSelect, orientation) {
    if (!container) return;
    const vertical = orientation === "vertical";

    container.addEventListener("keydown", function (event) {
      const tabs = Array.from(container.querySelectorAll(selector));
      if (!tabs.length) return;
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      if (
        (!vertical && event.key === "ArrowRight") ||
        (vertical && event.key === "ArrowDown")
      ) {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (
        (!vertical && event.key === "ArrowLeft") ||
        (vertical && event.key === "ArrowUp")
      ) {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== -1) {
        event.preventDefault();
        const target = tabs[nextIndex];
        target.focus();
        onSelect(target);
      }
    });
  }

  /* --------------------------------------------------------------------------
   * SVG text wrapping helper (handles ASCII and CJK widths cleanly)
   * ------------------------------------------------------------------------ */
  function visualCharUnits(ch) {
    return ch.charCodeAt(0) > 255 ? 1.85 : 1;
  }

  function wrapSvgLines(text, maxUnits, maxLines) {
    const str = String(text || "").trim();
    if (!str) return [""];
    const limit = maxLines || 2;
    const hasSpaces = /\s/.test(str);

    if (hasSpaces) {
      const words = str.split(/\s+/);
      const lines = [];
      let current = "";
      let currentUnits = 0;

      for (let i = 0; i < words.length; i += 1) {
        const word = words[i];
        let wordUnits = 0;
        for (let j = 0; j < word.length; j += 1) {
          wordUnits += visualCharUnits(word[j]);
        }

        if (!current) {
          current = word;
          currentUnits = wordUnits;
        } else if (currentUnits + 1 + wordUnits <= maxUnits || lines.length >= limit - 1) {
          current += " " + word;
          currentUnits += 1 + wordUnits;
        } else {
          lines.push(current);
          current = word;
          currentUnits = wordUnits;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    /* No spaces (e.g. continuous CJK phrase): wrap by visual units. */
    const lines = [];
    let current = "";
    let currentUnits = 0;
    for (let i = 0; i < str.length; i += 1) {
      const ch = str[i];
      const u = visualCharUnits(ch);
      if (current && currentUnits + u > maxUnits && lines.length < limit - 1) {
        lines.push(current);
        current = ch;
        currentUnits = u;
      } else {
        current += ch;
        currentUnits += u;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /* --------------------------------------------------------------------------
   * 1. Header scroll state & mobile drawer
   * ------------------------------------------------------------------------ */
  function initHeaderAndDrawer() {
    const header = document.getElementById("site-header");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-drawer");

    function updateHeaderScroll() {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    window.addEventListener("scroll", updateHeaderScroll, { passive: true });
    updateHeaderScroll();

    if (!menuBtn || !drawer) return;

    function setDrawerOpen(open, restoreFocus) {
      drawer.hidden = !open;
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.classList.toggle("is-open", open);
      if (header) {
        header.classList.toggle("is-drawer-open", open);
      }
      if (!open && restoreFocus) {
        menuBtn.focus();
      }
    }

    menuBtn.addEventListener("click", function () {
      const isOpen = !drawer.hidden;
      setDrawerOpen(!isOpen, false);
    });

    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setDrawerOpen(false, false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !drawer.hidden) {
        event.preventDefault();
        setDrawerOpen(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (!drawer.hidden && header && !header.contains(event.target)) {
        setDrawerOpen(false, false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && !drawer.hidden) {
        setDrawerOpen(false, false);
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 2. Interactive StrataBox 3-Layer Hero Stage (#hero-stage)
   * ------------------------------------------------------------------------ */
  function renderStrataBoxStage() {
    const stage = document.getElementById("hero-stage");
    const svg = document.getElementById("stratabox-stage-svg");
    const tabList = document.getElementById("stratabox-layer-tabs");
    const detail = document.getElementById("stratabox-stage-detail");
    const layers = DATA.strataboxLayers;
    if (!layers) return;

    const activeKey = layers[state.layer] ? state.layer : "top";
    state.layer = activeKey;
    const layerEntry = layers[activeKey];
    const copy = layerEntry[state.lang] || layerEntry.en;
    const ui = getUi();

    if (stage) {
      stage.setAttribute("data-active-layer", activeKey);
    }

    if (svg) {
      svg.setAttribute("data-active-layer", activeKey);
      const groups = svg.querySelectorAll("[data-layer]");
      groups.forEach(function (group) {
        const key = group.getAttribute("data-layer");
        const selected = key === activeKey;
        group.classList.toggle("is-selected", selected);
        group.setAttribute("aria-pressed", selected ? "true" : "false");
        if (layers[key]) {
          const labelCopy = layers[key][state.lang] || layers[key].en;
          group.setAttribute("aria-label", labelCopy.tab);
        }
      });
    }

    if (tabList) {
      const buttons = tabList.querySelectorAll("button[data-layer]");
      buttons.forEach(function (btn) {
        const key = btn.getAttribute("data-layer");
        const selected = key === activeKey;
        btn.classList.toggle("is-active", selected);
        btn.classList.toggle("is-selected", selected);
        btn.setAttribute("aria-selected", selected ? "true" : "false");
        if (layers[key]) {
          const labelCopy = layers[key][state.lang] || layers[key].en;
          btn.textContent = labelCopy.tab;
        }
      });
    }

    if (detail && copy) {
      detail.setAttribute("data-layer", activeKey);
      detail.setAttribute("data-active-layer", activeKey);
      const specsHtml = (copy.specs || [])
        .map(function (spec) {
          return (
            '<div class="spec-row">' +
            "<dt>" +
            escapeHtml(spec.label) +
            "</dt>" +
            "<dd>" +
            escapeHtml(spec.value) +
            "</dd>" +
            "</div>"
          );
        })
        .join("");

      const flowAria = ui.flowLabel
        ? ' aria-label="' + escapeHtml(ui.flowLabel + ": " + copy.flowStep) + '"'
        : "";
      detail.innerHTML =
        '<h3 class="stage-detail-title">' +
        escapeHtml(copy.title) +
        "</h3>" +
        '<p class="stage-detail-copy">' +
        escapeHtml(copy.summary) +
        "</p>" +
        '<p class="stage-flow"' +
        flowAria +
        ">" +
        escapeHtml(copy.flowStep) +
        "</p>" +
        '<dl class="stage-specs">' +
        specsHtml +
        "</dl>";
    }
  }

  function initStrataBoxStage() {
    const svg = document.getElementById("stratabox-stage-svg");
    const tabList = document.getElementById("stratabox-layer-tabs");

    function selectLayer(key) {
      if (!key || !DATA.strataboxLayers || !DATA.strataboxLayers[key]) return;
      state.layer = key;
      renderStrataBoxStage();
    }

    if (tabList) {
      tabList.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-layer]");
        if (btn) {
          selectLayer(btn.getAttribute("data-layer"));
        }
      });
      bindTablistKeyboard(
        tabList,
        "button[data-layer]",
        function (btn) {
          selectLayer(btn.getAttribute("data-layer"));
        },
        "horizontal"
      );
    }

    if (svg) {
      svg.addEventListener("click", function (event) {
        const group = event.target.closest("[data-layer]");
        if (group) {
          selectLayer(group.getAttribute("data-layer"));
        }
      });

      svg.addEventListener("keydown", function (event) {
        const group = event.target.closest("[data-layer]");
        if (!group) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectLayer(group.getAttribute("data-layer"));
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
   * 3. Four-Backend Interactive Explorer (#backends)
   * ------------------------------------------------------------------------ */
  function isCompactDiagram() {
    const el = document.getElementById("backend-diagram");
    if (el && el.clientWidth > 0) {
      return el.clientWidth < 480;
    }
    return window.innerWidth < 640;
  }

  function buildBackendDiagramSvg(backendId, backend, copy, ui, compact) {
    const colors = DATA.colors || {
      top: "#FF9F1D",
      mid: "#4090A5",
      bot: "#2E427C",
    };
    const accent = backend.accent || colors.bot;
    const diag = copy.diagram || {};

    const hostLines = wrapSvgLines(diag.host || "stratabox SDK", 16, 2);
    const chanLines = wrapSvgLines(diag.channel || "", 16, 2);
    const guestLines = wrapSvgLines(diag.guest || "", 16, 2);
    const storeLines = wrapSvgLines(diag.storage || "", 16, 2);

    function renderLines(lines, cx, startY, fontSize) {
      const size = fontSize || 14;
      if (lines.length === 1) {
        return (
          '<text x="' +
          cx +
          '" y="' +
          (startY + 9) +
          '" text-anchor="middle" fill="#111A2E" font-family="Plus Jakarta Sans, sans-serif" font-size="' +
          size +
          '" font-weight="700">' +
          escapeHtml(lines[0]) +
          "</text>"
        );
      }
      return (
        '<text x="' +
        cx +
        '" y="' +
        startY +
        '" text-anchor="middle" fill="#111A2E" font-family="Plus Jakarta Sans, sans-serif" font-size="' +
        (size - 0.5) +
        '" font-weight="700">' +
        '<tspan x="' +
        cx +
        '" dy="0">' +
        escapeHtml(lines[0]) +
        "</tspan>" +
        '<tspan x="' +
        cx +
        '" dy="17">' +
        escapeHtml(lines[1]) +
        "</tspan>" +
        "</text>"
      );
    }

    const textInkMap = {
      fncall: "#A34A06",
      container: "#1D6478",
      microvm: "#2E427C",
      fullvm: "#2E427C",
    };
    const textAccent = textInkMap[backendId] || "#2E427C";
    const chanDash =
      backendId === "container" || backendId === "microvm"
        ? ' stroke-dasharray="4 3"'
        : "";
    const ariaLabel =
      (copy.tab || backendId) +
      ": " +
      (diag.host || "") +
      " to " +
      (diag.channel || "") +
      " to " +
      (diag.guest || "") +
      " to " +
      (diag.storage || "");

    if (compact) {
      /* Crisp 2x2 architectural layout for mobile viewports (true 1:1 readable text). */
      let guestFrameMobile = "";
      if (backendId === "fncall") {
        guestFrameMobile =
          '<rect x="6" y="130" width="154" height="106" rx="11" fill="none" stroke="' +
          accent +
          '" stroke-width="1.5" stroke-opacity="0.45"/>';
      } else if (backendId === "container") {
        guestFrameMobile =
          '<rect x="4" y="128" width="158" height="110" rx="12" fill="none" stroke="' +
          accent +
          '" stroke-width="1.75" stroke-dasharray="5 4"/>';
      } else {
        guestFrameMobile =
          '<rect x="4" y="128" width="158" height="110" rx="12" fill="' +
          accent +
          '" fill-opacity="0.06" stroke="' +
          accent +
          '" stroke-width="2"/>';
      }

      return (
        '<svg class="backend-diagram-svg" viewBox="0 0 344 246" fill="none" role="img" aria-label="' +
        escapeHtml(ariaLabel) +
        '">' +
        /* Node 1: Host control (top-left) */
        '<rect x="8" y="8" width="150" height="98" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"/>' +
        '<rect x="8" y="8" width="150" height="5" rx="2.5" fill="' +
        colors.top +
        '"/>' +
        '<text x="83" y="34" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="600">' +
        escapeHtml(ui.diagramHost || "Host control") +
        "</text>" +
        renderLines(hostLines, 83, 58, 13.5) +
        '<text x="83" y="94" text-anchor="middle" fill="#47556E" font-family="JetBrains Mono, monospace" font-size="12.5">stratabox SDK</text>' +
        /* Arrow 1 -> 2 */
        '<line x1="158" y1="57" x2="178" y2="57" stroke="' +
        accent +
        '" stroke-width="1.75"/>' +
        '<polygon points="177,52.5 184,57 177,61.5" fill="' +
        accent +
        '"/>' +
        /* Node 2: Control channel (top-right) */
        '<rect x="186" y="8" width="150" height="98" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"' +
        chanDash +
        "/>" +
        '<rect x="186" y="8" width="150" height="5" rx="2.5" fill="' +
        colors.mid +
        '"/>' +
        '<text x="261" y="34" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="600">' +
        escapeHtml(ui.diagramChannel || "Channel") +
        "</text>" +
        renderLines(chanLines, 261, 58, 13.5) +
        '<line x1="226" y1="91" x2="296" y2="91" stroke="' +
        colors.mid +
        '" stroke-width="1.5" stroke-linecap="round"' +
        chanDash +
        "/>" +
        '<circle cx="226" cy="91" r="3" fill="' +
        colors.mid +
        '"/>' +
        '<circle cx="296" cy="91" r="3" fill="' +
        colors.mid +
        '"/>' +
        /* Routed connector from Node 2 down-left to Node 3 */
        '<path d="M 261 106 V 119 H 83 V 128" stroke="' +
        accent +
        '" stroke-width="1.75" fill="none" stroke-linejoin="round"/>' +
        '<polygon points="78.5,127 83,134 87.5,127" fill="' +
        accent +
        '"/>' +
        /* Node 3: Isolated guest (bottom-left) */
        guestFrameMobile +
        '<rect x="8" y="134" width="150" height="98" rx="9" fill="#FFFFFF" stroke="' +
        accent +
        '" stroke-width="1.75"/>' +
        '<rect x="8" y="134" width="150" height="5" rx="2.5" fill="' +
        accent +
        '"/>' +
        '<text x="83" y="160" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="600">' +
        escapeHtml(ui.diagramGuest || "Isolated guest") +
        "</text>" +
        renderLines(guestLines, 83, 184, 13.5) +
        '<text x="83" y="220" text-anchor="middle" fill="' +
        textAccent +
        '" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">' +
        escapeHtml(copy.tab || backendId) +
        "</text>" +
        /* Arrow 3 -> 4 */
        '<line x1="158" y1="183" x2="178" y2="183" stroke="' +
        colors.mid +
        '" stroke-width="1.75"/>' +
        '<polygon points="177,178.5 184,183 177,187.5" fill="' +
        colors.mid +
        '"/>' +
        /* Node 4: Storage stack (bottom-right) */
        '<rect x="186" y="134" width="150" height="98" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"/>' +
        '<rect x="186" y="134" width="150" height="5" rx="2.5" fill="' +
        colors.bot +
        '"/>' +
        '<text x="261" y="160" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="600">' +
        escapeHtml(ui.diagramStorage || "Storage stack") +
        "</text>" +
        renderLines(storeLines, 261, 184, 13.5) +
        '<rect x="231" y="211" width="60" height="3" rx="1.5" fill="' +
        colors.top +
        '"/>' +
        '<rect x="231" y="216.5" width="60" height="3" rx="1.5" fill="' +
        colors.mid +
        '"/>' +
        '<rect x="231" y="222" width="60" height="3" rx="1.5" fill="' +
        colors.bot +
        '"/>' +
        "</svg>"
      );
    }

    /* Backend-specific visual isolation glyph inside node 3 (desktop 4-stage pipeline). */
    let guestFrame = "";
    if (backendId === "fncall") {
      guestFrame =
        '<rect x="330" y="18" width="144" height="120" rx="11" fill="none" stroke="' +
        accent +
        '" stroke-width="1.5" stroke-opacity="0.45"/>';
    } else if (backendId === "container") {
      guestFrame =
        '<rect x="328" y="16" width="148" height="124" rx="12" fill="none" stroke="' +
        accent +
        '" stroke-width="1.75" stroke-dasharray="5 4"/>';
    } else {
      guestFrame =
        '<rect x="326" y="14" width="152" height="128" rx="12" fill="' +
        accent +
        '" fill-opacity="0.06" stroke="' +
        accent +
        '" stroke-width="2"/>';
    }

    return (
      '<svg class="backend-diagram-svg" viewBox="0 0 640 156" fill="none" role="img" aria-label="' +
      escapeHtml(ariaLabel) +
      '">' +
      /* Node 1: SDK & Host Control */
      '<rect x="4" y="22" width="140" height="112" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"/>' +
      '<rect x="4" y="22" width="140" height="5" rx="2.5" fill="' +
      colors.top +
      '"/>' +
      '<text x="74" y="50" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">' +
      escapeHtml(ui.diagramHost || "Host control") +
      "</text>" +
      renderLines(hostLines, 74, 77, 14) +
      '<text x="74" y="120" text-anchor="middle" fill="#47556E" font-family="JetBrains Mono, monospace" font-size="13">stratabox SDK</text>' +
      /* Arrow 1 -> 2 */
      '<line x1="144" y1="78" x2="162" y2="78" stroke="' +
      accent +
      '" stroke-width="1.75"/>' +
      '<polygon points="161,73.5 168,78 161,82.5" fill="' +
      accent +
      '"/>' +
      /* Node 2: Control Channel */
      '<rect x="168" y="22" width="140" height="112" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"' +
      chanDash +
      "/>" +
      '<rect x="168" y="22" width="140" height="5" rx="2.5" fill="' +
      colors.mid +
      '"/>' +
      '<text x="238" y="50" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">' +
      escapeHtml(ui.diagramChannel || "Channel") +
      "</text>" +
      renderLines(chanLines, 238, 77, 14) +
      '<line x1="204" y1="116" x2="272" y2="116" stroke="' +
      colors.mid +
      '" stroke-width="1.5" stroke-linecap="round"' +
      chanDash +
      "/>" +
      '<circle cx="204" cy="116" r="3" fill="' +
      colors.mid +
      '"/>' +
      '<circle cx="272" cy="116" r="3" fill="' +
      colors.mid +
      '"/>' +
      /* Arrow 2 -> 3 */
      '<line x1="308" y1="78" x2="326" y2="78" stroke="' +
      accent +
      '" stroke-width="1.75"/>' +
      '<polygon points="325,73.5 332,78 325,82.5" fill="' +
      accent +
      '"/>' +
      /* Node 3: Isolation Boundary */
      guestFrame +
      '<rect x="332" y="22" width="140" height="112" rx="9" fill="#FFFFFF" stroke="' +
      accent +
      '" stroke-width="1.75"/>' +
      '<rect x="332" y="22" width="140" height="5" rx="2.5" fill="' +
      accent +
      '"/>' +
      '<text x="402" y="50" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">' +
      escapeHtml(ui.diagramGuest || "Isolated guest") +
      "</text>" +
      renderLines(guestLines, 402, 77, 14) +
      '<text x="402" y="120" text-anchor="middle" fill="' +
      textAccent +
      '" font-family="JetBrains Mono, monospace" font-size="13" font-weight="600">' +
      escapeHtml(copy.tab || backendId) +
      "</text>" +
      /* Arrow 3 -> 4 */
      '<line x1="472" y1="78" x2="490" y2="78" stroke="' +
      colors.mid +
      '" stroke-width="1.75"/>' +
      '<polygon points="489,73.5 496,78 489,82.5" fill="' +
      colors.mid +
      '"/>' +
      /* Node 4: Storage Stack */
      '<rect x="496" y="22" width="140" height="112" rx="9" fill="#FFFFFF" stroke="#D7E0EC" stroke-width="1.5"/>' +
      '<rect x="496" y="22" width="140" height="5" rx="2.5" fill="' +
      colors.bot +
      '"/>' +
      '<text x="566" y="50" text-anchor="middle" fill="#47556E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">' +
      escapeHtml(ui.diagramStorage || "Storage stack") +
      "</text>" +
      renderLines(storeLines, 566, 77, 14) +
      '<rect x="536" y="111" width="60" height="3" rx="1.5" fill="' +
      colors.top +
      '"/>' +
      '<rect x="536" y="116.5" width="60" height="3" rx="1.5" fill="' +
      colors.mid +
      '"/>' +
      '<rect x="536" y="122" width="60" height="3" rx="1.5" fill="' +
      colors.bot +
      '"/>' +
      "</svg>"
    );
  }

  function renderBackendExplorer() {
    const backends = DATA.backends;
    if (!backends) return;

    const activeId = backends[state.backend] ? state.backend : "fncall";
    state.backend = activeId;
    const entry = backends[activeId];
    const copy = entry[state.lang] || entry.en;
    const ui = getUi();

    const tabs = document.getElementById("backend-tabs");
    if (tabs) {
      tabs.querySelectorAll("button[data-backend]").forEach(function (btn) {
        const id = btn.getAttribute("data-backend");
        const active = id === activeId;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (backends[id]) {
          const btnCopy = backends[id][state.lang] || backends[id].en;
          btn.textContent = btnCopy.tab;
        }
      });
    }

    const explorer = document.getElementById("backend-explorer");
    if (explorer) {
      explorer.setAttribute("data-active-backend", activeId);
    }

    const diagramEl = document.getElementById("backend-diagram");
    if (diagramEl) {
      state.compactDiagram = isCompactDiagram();
      diagramEl.innerHTML = buildBackendDiagramSvg(
        activeId,
        entry,
        copy,
        ui,
        state.compactDiagram
      );
    }

    const specsEl = document.getElementById("backend-specs");
    if (specsEl) {
      const rows = [
        [ui.boundary || "Isolation boundary", copy.boundary],
        [ui.storage || "Storage", copy.storage],
        [ui.control || "Control channel", copy.control],
        [ui.latency || "Startup latency", copy.latency],
        [ui.reclaim || "Memory reclamation", copy.reclaim],
        [ui.workloads || "Target workloads", copy.workloads],
      ];
      specsEl.innerHTML = rows
        .map(function (pair) {
          return (
            '<div class="spec-row">' +
            "<dt>" +
            escapeHtml(pair[0]) +
            "</dt>" +
            "<dd>" +
            escapeHtml(pair[1]) +
            "</dd>" +
            "</div>"
          );
        })
        .join("");
    }

    const codeTitle = document.getElementById("backend-code-title");
    if (codeTitle) {
      codeTitle.textContent = entry.filename || activeId + ".py";
    }

    const codeEl = document.getElementById("backend-code");
    if (codeEl) {
      codeEl.innerHTML = highlightCode(entry.code, "python");
    }

    renderBackendMatrix();
  }

  function renderBackendMatrix() {
    const table = document.getElementById("backend-table");
    const matrix = DATA.backendMatrix;
    if (!table || !matrix) return;

    const headers = matrix.headers[state.lang] || matrix.headers.en || [];
    const rows = matrix.rows || [];

    const theadHtml =
      "<thead><tr>" +
      headers
        .map(function (h) {
          return '<th scope="col">' + escapeHtml(h) + "</th>";
        })
        .join("") +
      "</tr></thead>";

    const tbodyHtml =
      "<tbody>" +
      rows
        .map(function (row) {
          const cells = row[state.lang] || row.en || [];
          const activeClass = row.id === state.backend ? ' class="is-highlight"' : "";
          return (
            "<tr" +
            activeClass +
            ">" +
            cells
              .map(function (cell) {
                return "<td>" + escapeHtml(cell) + "</td>";
              })
              .join("") +
            "</tr>"
          );
        })
        .join("") +
      "</tbody>";

    table.innerHTML = theadHtml + tbodyHtml;
  }

  function initBackendExplorer() {
    const tabs = document.getElementById("backend-tabs");
    const copyBtn = document.getElementById("backend-copy-btn");

    function selectBackend(id) {
      if (!id || !DATA.backends || !DATA.backends[id]) return;
      state.backend = id;
      renderBackendExplorer();
    }

    if (tabs) {
      tabs.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-backend]");
        if (btn) {
          selectBackend(btn.getAttribute("data-backend"));
        }
      });
      bindTablistKeyboard(
        tabs,
        "button[data-backend]",
        function (btn) {
          selectBackend(btn.getAttribute("data-backend"));
        },
        "horizontal"
      );
    }

    bindCopyButton(
      copyBtn,
      function () {
        const entry = DATA.backends && DATA.backends[state.backend];
        return entry ? entry.code : "";
      },
      function () {
        return getUi().copy || "Copy";
      },
      function () {
        return getUi().copied || "Copied";
      }
    );
  }

  /* --------------------------------------------------------------------------
   * 4. Composable EROFS & 256 KiB On-Demand Paging Simulator (#storage)
   * ------------------------------------------------------------------------ */
  function renderPagingSimulator() {
    const modes = DATA.pagingModes;
    if (!modes) return;

    const activeMode = modes[state.paging] ? state.paging : "cold";
    state.paging = activeMode;
    const modeData = modes[activeMode];
    const copy = modeData[state.lang] || modeData.en;
    const ui = getUi();

    const tabs = document.getElementById("paging-tabs");
    if (tabs) {
      tabs.querySelectorAll("button[data-mode]").forEach(function (btn) {
        const mode = btn.getAttribute("data-mode");
        const active = mode === activeMode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (modes[mode]) {
          const btnCopy = modes[mode][state.lang] || modes[mode].en;
          btn.textContent = btnCopy.tab;
        }
      });
    }

    const stage = document.getElementById("paging-stage");
    if (stage) {
      stage.setAttribute("data-paging-mode", activeMode);
    }

    const grid = document.getElementById("paging-grid");
    if (grid) {
      const activeSet = new Set(modeData.activeIndices || [3, 12, 27, 41, 52]);
      const reduceMotion = prefersReducedMotion();
      let cellsHtml = "";

      for (let i = 0; i < 64; i += 1) {
        const isWorkingSet = activeSet.has(i);
        let stateClass = "is-idle";
        let stateLabel = ui.chunksUntouched || "Skipped remote block";

        if (activeMode === "eager") {
          if (isWorkingSet) {
            stateClass = "is-fetched";
            stateLabel = ui.chunksFetched || "Working set chunk";
          } else {
            stateClass = "is-wasted";
            stateLabel = ui.chunksWasted || "Unpacked but unread";
          }
        } else if (activeMode === "cold") {
          if (isWorkingSet) {
            stateClass = "is-fetched";
            stateLabel = ui.chunksFetched || "Fetched on demand";
          } else {
            stateClass = "is-idle";
            stateLabel = ui.chunksUntouched || "Skipped remote block";
          }
        } else if (activeMode === "warm") {
          if (isWorkingSet) {
            stateClass = "is-cached";
            stateLabel = ui.chunksCached || "Node L2 cache hit";
          } else {
            stateClass = "is-idle";
            stateLabel = ui.chunksUntouched || "Skipped remote block";
          }
        }

        const delayMs = reduceMotion ? 0 : (i % 16) * 8;
        const chunkNum = String(i).padStart(2, "0");
        cellsHtml +=
          '<span class="chunk-cell ' +
          stateClass +
          '" style="--cell-delay:' +
          delayMs +
          'ms" title="Chunk #' +
          chunkNum +
          " (256 KiB): " +
          escapeHtml(stateLabel) +
          '"></span>';
      }

      grid.innerHTML = cellsHtml;

      let legendEl = document.getElementById("paging-legend");
      if (!legendEl && grid.parentNode) {
        legendEl = document.createElement("div");
        legendEl.id = "paging-legend";
        legendEl.className = "paging-legend";
        grid.insertAdjacentElement("afterend", legendEl);
      }
      if (legendEl) {
        if (activeMode === "eager") {
          legendEl.innerHTML =
            '<span class="legend-item"><span class="legend-swatch is-fetched"></span>' +
            escapeHtml(
              state.lang === "zh" ? "5 块实际读取（7.8%）" : "5 read working set (7.8%)"
            ) +
            "</span>" +
            '<span class="legend-item"><span class="legend-swatch is-wasted"></span>' +
            escapeHtml(
              state.lang === "zh" ? "59 块解压后未读" : "59 unpacked but unread"
            ) +
            "</span>";
        } else if (activeMode === "cold") {
          legendEl.innerHTML =
            '<span class="legend-item"><span class="legend-swatch is-fetched"></span>' +
            escapeHtml(
              state.lang === "zh" ? "5 块按需拉取（7.8%）" : "5 fetched on demand (7.8%)"
            ) +
            "</span>" +
            '<span class="legend-item"><span class="legend-swatch is-idle"></span>' +
            escapeHtml(
              state.lang === "zh" ? "59 块跳过未拉取" : "59 skipped remote blocks"
            ) +
            "</span>";
        } else {
          legendEl.innerHTML =
            '<span class="legend-item"><span class="legend-swatch is-cached"></span>' +
            escapeHtml(
              state.lang === "zh" ? "5 块命中节点 L2 缓存" : "5 node L2 cache hits (7.8%)"
            ) +
            "</span>" +
            '<span class="legend-item"><span class="legend-swatch is-idle"></span>' +
            escapeHtml(
              state.lang === "zh" ? "59 块跳过未拉取" : "59 skipped remote blocks"
            ) +
            "</span>";
        }
      }
    }

    const statNote = document.getElementById("paging-stat-note");
    if (statNote) {
      statNote.textContent = copy.statNote || "";
    }

    const metricsEl = document.getElementById("paging-metrics");
    if (metricsEl) {
      function splitMetricDelta(label, text) {
        const str = String(text || "");
        const m = str.match(/^(.+?)\s*(\([^)]+\))$/);
        if (m) {
          return [label + " " + m[2], m[1]];
        }
        return [label, str];
      }

      const metrics = [
        [ui.burstLatency || "Burst latency", modeData.latencyText],
        splitMetricDelta(ui.remoteBytes || "Remote bytes pulled", modeData.remoteText),
        splitMetricDelta(ui.diskWrites || "Local disk writes", modeData.diskWritesText),
        [ui.speedup || "Speedup", modeData.speedup],
      ];

      metricsEl.innerHTML = metrics
        .map(function (row) {
          return (
            '<div class="metric-row">' +
            '<span class="metric-label">' +
            escapeHtml(row[0]) +
            "</span>" +
            '<span class="metric-value">' +
            escapeHtml(row[1]) +
            "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    const summaryEl = document.getElementById("paging-summary");
    if (summaryEl) {
      summaryEl.textContent = copy.summary || "";
    }

    renderStoragePillars();
  }

  function renderStoragePillars() {
    const container = document.getElementById("storage-pillars");
    const pillars = DATA.storagePillars;
    if (!container || !pillars) return;

    container.innerHTML = pillars
      .map(function (pillar) {
        const copy = pillar[state.lang] || pillar.en;
        return (
          '<article class="pillar-item">' +
          '<h4 class="pillar-title">' +
          escapeHtml(copy.title) +
          "</h4>" +
          '<p class="pillar-body">' +
          escapeHtml(copy.body) +
          "</p>" +
          '<p class="pillar-detail">' +
          escapeHtml(copy.detail) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function initPagingSimulator() {
    const tabs = document.getElementById("paging-tabs");

    function selectMode(mode) {
      if (!mode || !DATA.pagingModes || !DATA.pagingModes[mode]) return;
      state.paging = mode;
      renderPagingSimulator();
    }

    if (tabs) {
      tabs.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-mode]");
        if (btn) {
          selectMode(btn.getAttribute("data-mode"));
        }
      });
      bindTablistKeyboard(
        tabs,
        "button[data-mode]",
        function (btn) {
          selectMode(btn.getAttribute("data-mode"));
        },
        "horizontal"
      );
    }
  }

  /* --------------------------------------------------------------------------
   * 5. Empirical Benchmark Lab (#benchmarks)
   * ------------------------------------------------------------------------ */
  function isCompactViewport() {
    const chartEl = document.getElementById("bench-chart");
    if (chartEl && chartEl.clientWidth > 0) {
      return chartEl.clientWidth < 560;
    }
    return window.innerWidth < 640;
  }

  function buildBenchChartMarkup(bench, copy, compact) {
    const bars = bench.bars || [];
    const maxVal = bars.reduce(function (acc, item) {
      const candidate = Math.max(Number(item.value) || 0, Number(item.baseline) || 0);
      return candidate > acc ? candidate : acc;
    }, 1);

    const headHtml =
      '<div class="bench-chart-head" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 16px;margin-bottom:14px;">' +
      '<span style="font-size:var(--text-body);font-weight:700;color:var(--ink);">' +
      escapeHtml(copy.title || "") +
      "</span>" +
      '<span style="font-size:var(--text-sm);color:var(--ink-muted);">' +
      escapeHtml(copy.unit || "") +
      "</span>" +
      "</div>";

    if (compact) {
      const viewW = 356;
      const trackW = 356;
      const rowH = 58;
      const topPad = 6;
      const viewH = topPad + bars.length * rowH + 6;

      const rowsHtml = bars
        .map(function (bar, index) {
          const y = topPad + index * rowH;
          const label = state.lang === "zh" ? bar.labelZh : bar.labelEn;
          const ratio = Math.max(0, Math.min(1, (Number(bar.value) || 0) / maxVal));
          const barW = Math.max(8, Math.round(ratio * trackW));

          return (
            '<g class="bench-row">' +
            '<text x="0" y="' +
            (y + 16) +
            '" fill="#111A2E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">' +
            escapeHtml(label) +
            "</text>" +
            '<text x="' +
            viewW +
            '" y="' +
            (y + 16) +
            '" text-anchor="end" fill="#111A2E" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" style="font-variant-numeric: tabular-nums">' +
            escapeHtml(bar.valueText || String(bar.value)) +
            "</text>" +
            '<rect x="0" y="' +
            (y + 25) +
            '" width="' +
            trackW +
            '" height="18" rx="4" fill="#EDF2F8"/>' +
            '<rect class="bench-bar-rect" x="0" y="' +
            (y + 25) +
            '" width="' +
            barW +
            '" height="18" rx="4" fill="' +
            escapeHtml(bar.accent || "#2E427C") +
            '"/>' +
            "</g>"
          );
        })
        .join("");

      return (
        headHtml +
        '<svg class="bench-chart-svg" viewBox="0 0 ' +
        viewW +
        " " +
        viewH +
        '" fill="none" aria-hidden="true">' +
        rowsHtml +
        "</svg>"
      );
    }

    /* Desktop wide horizontal layout: crisp zero-baseline axis, clean bars, bar-end tabular values with zero track/grid collision. */
    const viewW = 760;
    const trackX = 228;
    const trackW = 330;
    const rowH = 50;
    const topPad = 10;
    const viewH = topPad + bars.length * rowH + 10;

    const axisHtml =
      '<line x1="' +
      trackX +
      '" y1="' +
      (topPad - 2) +
      '" x2="' +
      trackX +
      '" y2="' +
      (viewH - 6) +
      '" stroke="#CBD5E1" stroke-width="1.25"/>';

    const rowsHtml = bars
      .map(function (bar, index) {
        const y = topPad + index * rowH;
        const barY = y + 8;
        const textY = y + 25;
        const label = state.lang === "zh" ? bar.labelZh : bar.labelEn;
        const ratio = Math.max(0, Math.min(1, (Number(bar.value) || 0) / maxVal));
        const barW = Math.max(10, Math.round(ratio * trackW));
        const valX = trackX + barW + 12;
        const divider =
          index > 0
            ? '<line x1="0" y1="' +
              (y - 2) +
              '" x2="' +
              viewW +
              '" y2="' +
              (y - 2) +
              '" stroke="#EDF2F8" stroke-width="1"/>'
            : "";

        return (
          '<g class="bench-row">' +
          divider +
          '<text x="0" y="' +
          textY +
          '" fill="#111A2E" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600">' +
          escapeHtml(label) +
          "</text>" +
          '<rect class="bench-bar-rect" x="' +
          trackX +
          '" y="' +
          barY +
          '" width="' +
          barW +
          '" height="24" rx="4" fill="' +
          escapeHtml(bar.accent || "#2E427C") +
          '"/>' +
          '<text x="' +
          valX +
          '" y="' +
          textY +
          '" fill="#111A2E" paint-order="stroke" stroke="#FFFFFF" stroke-width="4" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" style="font-variant-numeric: tabular-nums">' +
          escapeHtml(bar.valueText || String(bar.value)) +
          "</text>" +
          "</g>"
        );
      })
      .join("");

    return (
      headHtml +
      '<svg class="bench-chart-svg" viewBox="0 0 ' +
      viewW +
      " " +
      viewH +
      '" fill="none" aria-hidden="true">' +
      rowsHtml +
      axisHtml +
      "</svg>"
    );
  }

  function renderBenchmarks() {
    const benches = DATA.benchmarks;
    if (!benches) return;

    const activeId = benches[state.bench] ? state.bench : "paging";
    state.bench = activeId;
    const bench = benches[activeId];
    const copy = bench[state.lang] || bench.en;
    state.compactChart = isCompactViewport();

    const tabs = document.getElementById("bench-tabs");
    if (tabs) {
      tabs.querySelectorAll("button[data-bench]").forEach(function (btn) {
        const id = btn.getAttribute("data-bench");
        const active = id === activeId;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (benches[id]) {
          const btnCopy = benches[id][state.lang] || benches[id].en;
          btn.textContent = btnCopy.tab;
        }
      });
    }

    const chartEl = document.getElementById("bench-chart");
    if (chartEl) {
      chartEl.setAttribute("aria-label", copy.title || "Empirical benchmark chart");
      chartEl.innerHTML = buildBenchChartMarkup(bench, copy, state.compactChart);
    }

    const takeawayEl = document.getElementById("bench-takeaway");
    if (takeawayEl) {
      takeawayEl.textContent = copy.takeaway || "";
    }

    const tableEl = document.getElementById("bench-table");
    if (tableEl) {
      const headers = copy.headers || [];
      const rows = copy.rows || [];

      const theadHtml =
        "<thead><tr>" +
        headers
          .map(function (h) {
            return '<th scope="col">' + escapeHtml(h) + "</th>";
          })
          .join("") +
        "</tr></thead>";

      const tbodyHtml =
        "<tbody>" +
        rows
          .map(function (row) {
            return (
              "<tr>" +
              row
                .map(function (cell) {
                  return "<td>" + escapeHtml(cell) + "</td>";
                })
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</tbody>";

      tableEl.innerHTML = theadHtml + tbodyHtml;
    }
  }

  function initBenchmarks() {
    const tabs = document.getElementById("bench-tabs");

    function selectBench(id) {
      if (!id || !DATA.benchmarks || !DATA.benchmarks[id]) return;
      state.bench = id;
      renderBenchmarks();
    }

    if (tabs) {
      tabs.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-bench]");
        if (btn) {
          selectBench(btn.getAttribute("data-bench"));
        }
      });
      bindTablistKeyboard(
        tabs,
        "button[data-bench]",
        function (btn) {
          selectBench(btn.getAttribute("data-bench"));
        },
        "horizontal"
      );
    }

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(function () {
        const nextCompact = isCompactViewport();
        if (nextCompact !== state.compactChart) {
          state.compactChart = nextCompact;
          renderBenchmarks();
        }
        const nextCompactDiagram = isCompactDiagram();
        if (nextCompactDiagram !== state.compactDiagram) {
          state.compactDiagram = nextCompactDiagram;
          renderBackendExplorer();
        }
      }, 120);
    });
  }

  /* --------------------------------------------------------------------------
   * 6. Six-Layer Anti-Reward-Hacking Shield (#security)
   * ------------------------------------------------------------------------ */
  function renderSecuritySection() {
    const layers = DATA.securityLayers;
    if (!layers || !layers.length) return;

    let activeLayer = layers.find(function (item) {
      return item.id === state.security;
    });
    if (!activeLayer) {
      activeLayer = layers[0];
      state.security = activeLayer.id;
    }

    const listEl = document.getElementById("security-list");
    if (listEl) {
      const existingButtons = Array.from(
        listEl.querySelectorAll("button[data-security]")
      );
      const matchesSchema =
        existingButtons.length === layers.length &&
        existingButtons.every(function (btn, idx) {
          return btn.getAttribute("data-security") === layers[idx].id;
        });

      if (!matchesSchema) {
        listEl.innerHTML = layers
          .map(function (item) {
            const itemCopy = item[state.lang] || item.en;
            const active = item.id === state.security;
            return (
              '<button type="button" class="security-row' +
              (active ? " is-active" : "") +
              '" role="tab" aria-selected="' +
              (active ? "true" : "false") +
              '" aria-controls="security-detail" data-security="' +
              escapeHtml(item.id) +
              '">' +
              escapeHtml(itemCopy.name) +
              "</button>"
            );
          })
          .join("");
      } else {
        existingButtons.forEach(function (btn, idx) {
          const item = layers[idx];
          const itemCopy = item[state.lang] || item.en;
          const active = item.id === state.security;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
          if (btn.textContent !== itemCopy.name) {
            btn.textContent = itemCopy.name;
          }
        });
      }
    }

    const detailEl = document.getElementById("security-detail");
    if (detailEl) {
      const copy = activeLayer[state.lang] || activeLayer.en;
      const ui = getUi();
      detailEl.innerHTML =
        '<h3 class="security-detail-title">' +
        escapeHtml(copy.name) +
        "</h3>" +
        '<dl class="spec-list">' +
        '<div class="spec-row"><dt>' +
        escapeHtml(ui.threat || "Attack vector") +
        "</dt><dd>" +
        escapeHtml(copy.threat) +
        "</dd></div>" +
        '<div class="spec-row"><dt>' +
        escapeHtml(ui.defense || "Defense mechanism") +
        "</dt><dd>" +
        escapeHtml(copy.defense) +
        "</dd></div>" +
        '<div class="spec-row"><dt>' +
        escapeHtml(ui.kernelRef || "Kernel primitive") +
        "</dt><dd><code>" +
        escapeHtml(copy.kernelRef) +
        "</code></dd></div>" +
        "</dl>";
    }
  }

  function initSecuritySection() {
    const listEl = document.getElementById("security-list");
    if (!listEl) return;

    function selectSecurity(id) {
      if (!id) return;
      state.security = id;
      renderSecuritySection();
    }

    listEl.addEventListener("click", function (event) {
      const btn = event.target.closest("button[data-security]");
      if (btn) {
        selectSecurity(btn.getAttribute("data-security"));
      }
    });

    bindTablistKeyboard(
      listEl,
      "button[data-security]",
      function (btn) {
        const id = btn.getAttribute("data-security");
        selectSecurity(id);
        const focused = listEl.querySelector('button[data-security="' + id + '"]');
        if (focused) focused.focus();
      },
      "vertical"
    );
  }

  /* --------------------------------------------------------------------------
   * 7. Zero-State SandboxId O(1) Routing Inspector (#routing)
   * ------------------------------------------------------------------------ */
  function parseSandboxId(raw) {
    const trimmed = String(raw || "").trim();
    const prefix = "stratabox-";

    if (!trimmed.startsWith(prefix)) {
      return { ok: false, reason: "missing_prefix", raw: trimmed };
    }

    const rest = trimmed.slice(prefix.length);
    const lastHyphen = rest.lastIndexOf("-");
    if (lastHyphen === -1) {
      return { ok: false, reason: "malformed", raw: trimmed };
    }

    const beforeUid = rest.slice(0, lastHyphen);
    const uid = rest.slice(lastHyphen + 1);
    if (!uid || !/^[A-Za-z0-9_]+$/.test(uid)) {
      return { ok: false, reason: "invalid_uid", raw: trimmed };
    }

    const codeHyphen = beforeUid.lastIndexOf("-");
    if (codeHyphen === -1) {
      return { ok: false, reason: "malformed", raw: trimmed };
    }

    const edgeId = beforeUid.slice(0, codeHyphen);
    const backendCode = beforeUid.slice(codeHyphen + 1);

    if (!edgeId || !/^[A-Za-z0-9_.-]+$/.test(edgeId)) {
      return { ok: false, reason: "invalid_edge", raw: trimmed };
    }

    const backendInfo = BACKEND_CODES[backendCode];
    if (!backendInfo) {
      return {
        ok: false,
        reason: "unknown_backend",
        backendCode: backendCode,
        raw: trimmed,
      };
    }

    return {
      ok: true,
      prefix: "stratabox",
      edgeId: edgeId,
      backendCode: backendCode,
      backendName: backendInfo.name,
      backendId: backendInfo.id,
      canonicalCode: backendInfo.canonical,
      uid: uid,
    };
  }

  function renderRoutingPresets() {
    const container = document.getElementById("routing-presets");
    const presets = DATA.routingPresets;
    if (!container || !presets) return;

    const current = String(state.sandboxId || "").trim();

    container.innerHTML = presets
      .map(function (preset) {
        const backendEntry = DATA.backends && DATA.backends[preset.backend];
        const label =
          (backendEntry &&
            ((backendEntry[state.lang] && backendEntry[state.lang].tab) ||
              (backendEntry.en && backendEntry.en.tab))) ||
          preset.backend;
        const desc = preset[state.lang] || preset.en || "";
        const active = preset.id === current;
        return (
          '<button type="button" class="seg-btn' +
          (active ? " is-active" : "") +
          '" data-preset="' +
          escapeHtml(preset.id) +
          '" aria-pressed="' +
          (active ? "true" : "false") +
          '" title="' +
          escapeHtml(desc) +
          '">' +
          escapeHtml(label) +
          "</button>"
        );
      })
      .join("");
  }

  function renderRoutingOutput() {
    const output = document.getElementById("routing-output");
    const input = document.getElementById("sandbox-id-input");
    if (!output) return;

    const ui = getUi();
    const parsed = parseSandboxId(state.sandboxId);

    if (input) {
      input.setAttribute("aria-invalid", parsed.ok ? "false" : "true");
      input.classList.toggle("is-invalid", !parsed.ok);
    }

    const presetsEl = document.getElementById("routing-presets");
    if (presetsEl) {
      const current = String(state.sandboxId || "").trim();
      presetsEl.querySelectorAll("button[data-preset]").forEach(function (btn) {
        const active = btn.getAttribute("data-preset") === current;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    if (!parsed.ok) {
      let detailMsg = ui.invalidId || "Expected format: stratabox-<edge_id>-<fn|ctr|uvm|vm>-<uid>.";
      if (parsed.reason === "unknown_backend" && parsed.backendCode) {
        detailMsg =
          state.lang === "zh"
            ? '未知后端编码 "' +
              parsed.backendCode +
              '"。有效编码为 fn、ctr、uvm（兼容 mvm）、vm。' +
              " " +
              detailMsg
            : 'Unknown backend code "' +
              parsed.backendCode +
              '". Valid codes: fn, ctr, uvm (or mvm), vm. ' +
              detailMsg;
      }

      output.classList.add("is-invalid");
      output.innerHTML =
        '<p class="routing-error">' + escapeHtml(detailMsg) + "</p>";
      return;
    }

    output.classList.remove("is-invalid");

    const codeDisplay =
      parsed.backendCode === "mvm"
        ? "mvm -> uvm (" + parsed.backendName + ")"
        : parsed.backendCode + " (" + parsed.backendName + ")";

    const targetText =
      state.lang === "zh"
        ? escapeHtml(ui.directRoute || "O(1) 直连代理目标") +
          ": Edge 节点 <code>" +
          escapeHtml(parsed.edgeId) +
          "</code> -> " +
          escapeHtml(parsed.backendName) +
          " 运行时（0 次数据库查询，" +
          escapeHtml(ui.parseOk || "O(1) 零堆分配解析成功") +
          "）"
        : escapeHtml(ui.directRoute || "O(1) direct proxy target") +
          ": Edge node <code>" +
          escapeHtml(parsed.edgeId) +
          "</code> -> " +
          escapeHtml(parsed.backendName) +
          " runtime (0 DB lookups, " +
          escapeHtml(ui.parseOk || "Zero-allocation O(1) match") +
          ")";

    output.innerHTML =
      '<div class="routing-segments">' +
      '<div class="routing-seg routing-seg-prefix">' +
      '<span class="routing-seg-label">' +
      escapeHtml(ui.prefix || "Prefix") +
      "</span>" +
      '<code class="routing-seg-value">' +
      escapeHtml(parsed.prefix) +
      "</code>" +
      "</div>" +
      '<div class="routing-seg routing-seg-edge">' +
      '<span class="routing-seg-label">' +
      escapeHtml(ui.edgeNode || "Home edge node") +
      "</span>" +
      '<code class="routing-seg-value">' +
      escapeHtml(parsed.edgeId) +
      "</code>" +
      "</div>" +
      '<div class="routing-seg routing-seg-backend">' +
      '<span class="routing-seg-label">' +
      escapeHtml(ui.backendCode || "Backend code") +
      "</span>" +
      '<code class="routing-seg-value">' +
      escapeHtml(codeDisplay) +
      "</code>" +
      "</div>" +
      '<div class="routing-seg routing-seg-uid">' +
      '<span class="routing-seg-label">' +
      escapeHtml(ui.uid || "Sandbox UID") +
      "</span>" +
      '<code class="routing-seg-value">' +
      escapeHtml(parsed.uid) +
      "</code>" +
      "</div>" +
      "</div>" +
      '<p class="routing-target">' +
      targetText +
      "</p>";
  }

  function initRoutingInspector() {
    const presetsEl = document.getElementById("routing-presets");
    const input = document.getElementById("sandbox-id-input");

    if (input && input.value.trim()) {
      state.sandboxId = input.value.trim();
    }

    if (presetsEl) {
      presetsEl.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-preset]");
        if (!btn) return;
        const presetId = btn.getAttribute("data-preset");
        if (!presetId) return;
        state.sandboxId = presetId;
        if (input) {
          input.value = presetId;
        }
        renderRoutingOutput();
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        state.sandboxId = input.value;
        renderRoutingOutput();
      });
    }
  }

  /* --------------------------------------------------------------------------
   * 8. Quick Start Workbench, Crate Map & Footer BibTeX (#quickstart, #site-footer)
   * ------------------------------------------------------------------------ */
  function renderQuickStart() {
    const qsMap = DATA.quickstart;
    if (!qsMap) return;

    const activeId = qsMap[state.qs] ? state.qs : "install";
    state.qs = activeId;
    const item = qsMap[activeId];
    const copy = item[state.lang] || item.en;

    const tabs = document.getElementById("qs-tabs");
    if (tabs) {
      tabs.querySelectorAll("button[data-qs]").forEach(function (btn) {
        const id = btn.getAttribute("data-qs");
        const active = id === activeId;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (qsMap[id]) {
          const btnCopy = qsMap[id][state.lang] || qsMap[id].en;
          btn.textContent = btnCopy.tab;
        }
      });
    }

    const langEl = document.getElementById("qs-lang");
    if (langEl) {
      langEl.textContent = item.lang || "bash";
    }

    const descEl = document.getElementById("qs-desc");
    if (descEl) {
      descEl.textContent = copy.summary || "";
    }

    const codeEl = document.getElementById("qs-code");
    if (codeEl) {
      codeEl.innerHTML = highlightCode(item.code, item.lang);
    }
  }

  function renderCrates() {
    const listEl = document.getElementById("crate-list");
    const crates = DATA.crates;
    if (!listEl || !crates) return;

    listEl.innerHTML = crates
      .map(function (crate) {
        const copy = crate[state.lang] || crate.en;
        return (
          '<div class="crate-row">' +
          "<dt><code>" +
          escapeHtml(crate.name) +
          "</code></dt>" +
          "<dd>" +
          escapeHtml(copy.summary) +
          "</dd>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderBibtex() {
    const box = document.getElementById("bibtex-box");
    if (box && DATA.bibtex) {
      box.textContent = DATA.bibtex;
    }
  }

  function initQuickStartAndFooter() {
    const tabs = document.getElementById("qs-tabs");
    const qsCopyBtn = document.getElementById("qs-copy-btn");
    const bibCopyBtn = document.getElementById("bibtex-copy-btn");

    function selectQs(id) {
      if (!id || !DATA.quickstart || !DATA.quickstart[id]) return;
      state.qs = id;
      renderQuickStart();
    }

    if (tabs) {
      tabs.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-qs]");
        if (btn) {
          selectQs(btn.getAttribute("data-qs"));
        }
      });
      bindTablistKeyboard(
        tabs,
        "button[data-qs]",
        function (btn) {
          selectQs(btn.getAttribute("data-qs"));
        },
        "horizontal"
      );
    }

    bindCopyButton(
      qsCopyBtn,
      function () {
        const item = DATA.quickstart && DATA.quickstart[state.qs];
        return item ? item.code : "";
      },
      function () {
        return getUi().copy || "Copy";
      },
      function () {
        return getUi().copied || "Copied";
      }
    );

    bindCopyButton(
      bibCopyBtn,
      function () {
        return DATA.bibtex || "";
      },
      function () {
        return getI18n()["footer.copyBibtex"] || "Copy BibTeX";
      },
      function () {
        return getI18n()["footer.copied"] || getUi().copied || "Copied";
      }
    );
  }

  /* --------------------------------------------------------------------------
   * 9. Bilingual state controller (en / zh)
   * ------------------------------------------------------------------------ */
  function applyLanguage(lang) {
    state.lang = lang === "zh" ? "zh" : "en";
    writeStoredLang(state.lang);

    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    document.title =
      state.lang === "zh"
        ? "StrataBox: 为智能体规模而生的弹性沙箱"
        : "StrataBox: Elastic Sandboxes Built for Agent Scale";

    const switcher = document.getElementById("lang-switch");
    if (switcher) {
      switcher.querySelectorAll("button[data-lang]").forEach(function (btn) {
        const active = btn.getAttribute("data-lang") === state.lang;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    const dict = getI18n();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    });

    const ui = getUi();
    resetCopyButtonLabel(document.getElementById("backend-copy-btn"), ui.copy || "Copy");
    resetCopyButtonLabel(document.getElementById("qs-copy-btn"), ui.copy || "Copy");
    resetCopyButtonLabel(
      document.getElementById("bibtex-copy-btn"),
      dict["footer.copyBibtex"] || "Copy BibTeX"
    );

    renderStrataBoxStage();
    renderBackendExplorer();
    renderPagingSimulator();
    renderBenchmarks();
    renderSecuritySection();
    renderRoutingPresets();
    renderRoutingOutput();
    renderQuickStart();
    renderCrates();
    renderBibtex();
  }

  function initLanguageSwitcher() {
    const switcher = document.getElementById("lang-switch");
    if (!switcher) return;

    switcher.addEventListener("click", function (event) {
      const btn = event.target.closest("button[data-lang]");
      if (!btn) return;
      const nextLang = btn.getAttribute("data-lang");
      if (nextLang && nextLang !== state.lang) {
        applyLanguage(nextLang);
      }
    });
  }

  /* --------------------------------------------------------------------------
   * Bootstrap
   * ------------------------------------------------------------------------ */
  function init() {
    initHeaderAndDrawer();
    initLanguageSwitcher();
    initStrataBoxStage();
    initBackendExplorer();
    initPagingSimulator();
    initBenchmarks();
    initSecuritySection();
    initRoutingInspector();
    initQuickStartAndFooter();
    applyLanguage(state.lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
