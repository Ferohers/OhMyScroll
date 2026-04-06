(() => {
  "use strict";

  if (window.__ohMyScrollInstalled) {
    return;
  }
  window.__ohMyScrollInstalled = true;

  const api = globalThis.browser ?? globalThis.chrome;
  const STORAGE_KEY_ENABLED = "ohMyScrollEnabled";
  const STORAGE_KEY_CURSOR_THEME = "ohMyScrollCursorTheme";
  const STORAGE_KEY_MIDDLE_CLICK = "ohMyScrollMiddleClickEnabled";
  const DEFAULT_CURSOR_THEME = "white";
  const MESSAGE_TYPE_STATE = "OH_MY_SCROLL_STATE";
  const MESSAGE_TYPE_GET_STATE = "OH_MY_SCROLL_GET_STATE";
  const MESSAGE_TYPE_AUTO_START = "OH_MY_SCROLL_AUTO_START";
  const MESSAGE_TYPE_AUTO_STOP = "OH_MY_SCROLL_AUTO_STOP";
  const MESSAGE_TYPE_AUTO_STATUS = "OH_MY_SCROLL_AUTO_STATUS";

  const CURSOR_THEMES = Object.freeze({
    white: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAIxlWElmTU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAEyAAIAAAAUAAAAWodpAAQAAAABAAAAbgAAAAAAAABwAAAAAQAAAHAAAAABMjAyNjowNDowNSAxOTo0NDozNgAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAABdXBRSAAAACXBIWXMAABE5AAAROQEb2ZNGAAADD2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyI+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjExMjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+MTEyPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NTEyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj41MTI8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAyNi0wNC0wNVQxOTo0NDozNjwveG1wOk1vZGlmeURhdGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgqt+NonAAABy0lEQVQ4EY1TS0tCQRRWLxm5MVwKPnpsWrgRcSMqSgQthHKliAhBIi5auAqCK/Qr3AbmThBcCbUIlED8BZW0EMRHBum10uSezrk5Wj6uHZg5Z2a+7+O7Z+5witVhRsg6jv5q6BSxjaVRpVKdOZ3OrsViqeP6aHosX504HI6u3W5/1el07/1+H1qtFrhcLnJwvIy6hgcXWq32VqPRvLTbbej1euDz+SCXywEFibjdbhLxLxLZD4fDUK1WIRQKQTKZlEiCIEC9XpdqmkjY4/EsdHIYCAREAg0GAwgGg2I6nablXJAIOhHQxQFzsqXX6ytWq1VMJBLiaDSSRJrN5hyZbdRqNTCZTE8osEki5UwmA0SMxWJiKpViONnM8zwgV2rqKX0/CVB0Oh1ZIjvM5/MkcEcOKPhoNPrFRBhILmezWRK4ltjjqRSJRIDu/T8Rj8dJwK1iCtjID47jFNh9trU0F4tFBfaN7N9PQGq1+qpcLks3IOegUqmA0Wh8ROLuhDwuHF6v9/P3jzMrVCgUwGAwPCB+j5GVrBhnv9lsvrTZbDvoiFMqf45FUYRGoyGUSqWb4XB4jthnxpsVoP0NHAYc9D6oURSU33DQq/wT366216nje0HyAAAAAElFTkSuQmCC") 8 8, grab',
    yellow: 'url("data:image/png;base64,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") 8 8, grab'
  });

  const SETTINGS = Object.freeze({
    deadZonePx: 8,
    baseSpeed: 1.35,
    curveExponent: 1.2,
    maxSpeedPerFrame: 42,
    ignoreMiddleClickOnLinks: true,
    ignoreEditableTargets: true
  });

  // ── Middle-click scroll state ────────────────────
  const state = {
    enabled: true,
    middleClickEnabled: true,
    cursorTheme: DEFAULT_CURSOR_THEME,
    active: false,
    suppressNextClick: false,
    suppressNextAuxClick: false,
    origin: { x: 0, y: 0 },
    pointer: { x: 0, y: 0 },
    scroller: null,
    lastFrameTime: 0,
    rafId: 0,
    totalDelta: { x: 0, y: 0 }
  };

  // ── Auto-scroll state ───────────────────────────
  const autoScroll = {
    active: false,
    speed: 3,        // slider value 1–10
    rafId: 0,
    lastTime: 0,
    accum: 0,        // fractional pixel accumulator
    indicatorHost: null
  };

  // ── Speed mapping: slider value → pixels/second ──
  // Exponential ramp that starts slow enough for reading,
  // then builds up aggressively at higher values:
  //   1 → ~21 px/s   (slow reading — ~50s per screen)
  //   2 → ~30 px/s   (comfortable reading)
  //   3 → ~43 px/s   (casual browse)
  //   5 → ~87 px/s   (skim)
  //   8 → ~248 px/s  (fast)
  //  10 → ~500 px/s  (very fast)
  function sliderToPixelsPerSecond(sliderValue) {
    return Math.round(15 * Math.pow(1.42, sliderValue));
  }

  // ── Shared helpers ──────────────────────────────

  function normalizeCursorTheme(value) {
    return value === "yellow" ? "yellow" : DEFAULT_CURSOR_THEME;
  }

  function readSettingsFromStorage() {
    if (!api?.storage?.local) {
      return Promise.resolve({
        enabled: true,
        cursorTheme: DEFAULT_CURSOR_THEME,
        middleClickEnabled: true
      });
    }

    return new Promise((resolve) => {
      const onValue = (value) =>
        resolve({
          enabled: value?.[STORAGE_KEY_ENABLED] !== false,
          cursorTheme: normalizeCursorTheme(value?.[STORAGE_KEY_CURSOR_THEME]),
          middleClickEnabled: value?.[STORAGE_KEY_MIDDLE_CLICK] !== false
        });

      try {
        const maybePromise = api.storage.local.get(
          [STORAGE_KEY_ENABLED, STORAGE_KEY_CURSOR_THEME, STORAGE_KEY_MIDDLE_CLICK],
          onValue
        );
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise
            .then(onValue)
            .catch(() =>
              resolve({
                enabled: true,
                cursorTheme: DEFAULT_CURSOR_THEME,
                middleClickEnabled: true
              })
            );
        }
      } catch {
        resolve({
          enabled: true,
          cursorTheme: DEFAULT_CURSOR_THEME,
          middleClickEnabled: true
        });
      }
    });
  }

  function sendRuntimeMessage(message) {
    if (!api?.runtime?.sendMessage) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const onResponse = (response) => {
        if (api.runtime?.lastError) {
          resolve(null);
          return;
        }
        resolve(response ?? null);
      };

      try {
        const maybePromise = api.runtime.sendMessage(message, onResponse);
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then((response) => resolve(response ?? null)).catch(() => resolve(null));
        }
      } catch {
        resolve(null);
      }
    });
  }

  // ── Target checks ──────────────────────────────

  function shouldIgnoreTarget(target) {
    const element =
      target instanceof Element
        ? target
        : target instanceof Node
          ? target.parentElement
          : null;

    if (!element) {
      return false;
    }

    if (SETTINGS.ignoreEditableTargets) {
      const editable = element.closest(
        "input, textarea, select, button, [contenteditable=''], [contenteditable='true']"
      );
      if (editable) {
        return true;
      }
    }

    if (SETTINGS.ignoreMiddleClickOnLinks) {
      const link = element.closest("a[href]");
      if (link) {
        return true;
      }
    }

    return false;
  }

  // ── Scroll helpers ─────────────────────────────

  function getParentElement(current) {
    if (!current) {
      return null;
    }

    if (current.parentElement) {
      return current.parentElement;
    }

    const root = current.getRootNode();
    if (root instanceof ShadowRoot) {
      return root.host;
    }

    return null;
  }

  function isScrollableElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    const styles = getComputedStyle(element);
    const hasScrollableY =
      /(auto|scroll|overlay)/.test(styles.overflowY) && element.scrollHeight > element.clientHeight + 1;
    const hasScrollableX =
      /(auto|scroll|overlay)/.test(styles.overflowX) && element.scrollWidth > element.clientWidth + 1;

    return hasScrollableY || hasScrollableX;
  }

  function getDocumentScroller() {
    return document.scrollingElement || document.documentElement;
  }

  function findScrollableAncestor(start) {
    let current = start instanceof Element ? start : null;

    while (current) {
      if (isScrollableElement(current)) {
        return current;
      }
      current = getParentElement(current);
    }

    return getDocumentScroller();
  }

  function scrollNode(node, deltaX, deltaY) {
    if (!node || (!deltaX && !deltaY)) {
      return false;
    }

    if (node === document.body || node === document.documentElement || node === document.scrollingElement) {
      const el = document.scrollingElement || document.documentElement;
      const beforeLeft = el.scrollLeft;
      const beforeTop = el.scrollTop;
      el.scrollLeft = beforeLeft + deltaX;
      el.scrollTop = beforeTop + deltaY;
      const didScroll = el.scrollLeft !== beforeLeft || el.scrollTop !== beforeTop;
      if (didScroll) {
        state.totalDelta.x += el.scrollLeft - beforeLeft;
        state.totalDelta.y += el.scrollTop - beforeTop;
      }
      return didScroll;
    }

    if (!(node instanceof Element)) {
      return false;
    }

    const beforeLeft = node.scrollLeft;
    const beforeTop = node.scrollTop;
    node.scrollLeft = beforeLeft + deltaX;
    node.scrollTop = beforeTop + deltaY;
    const didScroll = node.scrollLeft !== beforeLeft || node.scrollTop !== beforeTop;
    if (didScroll) {
      state.totalDelta.x += node.scrollLeft - beforeLeft;
      state.totalDelta.y += node.scrollTop - beforeTop;
    }
    return didScroll;
  }

  function applyScroll(deltaX, deltaY) {
    const primary = state.scroller || getDocumentScroller();
    if (scrollNode(primary, deltaX, deltaY)) {
      return;
    }

    const fallback = getDocumentScroller();
    if (fallback && fallback !== primary) {
      scrollNode(fallback, deltaX, deltaY);
    }
  }

  function curve(delta) {
    const absDelta = Math.abs(delta);
    if (absDelta <= SETTINGS.deadZonePx) {
      return 0;
    }

    const adjusted = (absDelta - SETTINGS.deadZonePx) / 10;
    const curved = Math.pow(adjusted, SETTINGS.curveExponent) * SETTINGS.baseSpeed;

    return Math.sign(delta) * Math.min(SETTINGS.maxSpeedPerFrame, curved);
  }

  // ── Active classes (cursor override) ───────────

  function addActiveClasses() {
    document.documentElement.classList.add("ohmyscroll-active");
    if (document.body) {
      document.body.classList.add("ohmyscroll-active");
    }
  }

  function removeActiveClasses() {
    document.documentElement.classList.remove("ohmyscroll-active");
    if (document.body) {
      document.body.classList.remove("ohmyscroll-active");
    }
  }

  // ── Middle-click scroll activation / deactivation ──

  function activate(startX, startY, target) {
    // If auto-scroll is running, stop it first
    if (autoScroll.active) {
      stopAutoScroll();
    }

    state.active = true;
    state.origin = { x: startX, y: startY };
    state.pointer = { x: startX, y: startY };
    state.scroller = findScrollableAncestor(target);
    state.lastFrameTime = performance.now();
    state.totalDelta = { x: 0, y: 0 };

    addActiveClasses();
    state.rafId = requestAnimationFrame(tick);
  }

  function deactivate() {
    if (!state.active) {
      return;
    }

    state.active = false;
    state.scroller = null;
    state.lastFrameTime = 0;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }

    removeActiveClasses();
    forceHitTestInvalidation();
    state.totalDelta = { x: 0, y: 0 };
  }

  function forceHitTestInvalidation() {
    const root = document.documentElement;
    const body = document.body;

    const el = document.scrollingElement || root;
    const savedTop = el.scrollTop;
    const savedLeft = el.scrollLeft;
    el.scrollTop = savedTop + 1;
    el.scrollLeft = savedLeft + 1;
    void root.offsetHeight;
    el.scrollTop = savedTop;
    el.scrollLeft = savedLeft;
    void root.offsetHeight;

    if (body) {
      const savedOverflow = body.style.overflow;
      body.style.overflow = "hidden";
      void body.offsetHeight;
      body.style.overflow = savedOverflow;
      void body.offsetHeight;
    }

    root.style.transform = "translateZ(0)";
    void root.offsetHeight;
    root.style.transform = "";
    void root.offsetHeight;

    void document.elementFromPoint(0, 0);
    void document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    window.dispatchEvent(new Event("scroll"));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.style.transform = "translateZ(0)";
        void root.offsetHeight;
        root.style.transform = "";
      });
    });
  }

  function tick(frameTime) {
    if (!state.active) {
      return;
    }

    const elapsed = Math.min(40, Math.max(8, frameTime - state.lastFrameTime || 16.67));
    const frameScale = elapsed / 16.67;
    const deltaX = state.pointer.x - state.origin.x;
    const deltaY = state.pointer.y - state.origin.y;
    const velocityX = curve(deltaX) * frameScale;
    const velocityY = curve(deltaY) * frameScale;

    if (velocityX || velocityY) {
      applyScroll(velocityX, velocityY);
    }

    state.lastFrameTime = frameTime;
    state.rafId = requestAnimationFrame(tick);
  }

  // ── Auto-scroll ────────────────────────────────

  function startAutoScroll(sliderSpeed) {
    // If middle-click scroll is active, deactivate it first
    if (state.active) {
      deactivate();
    }

    autoScroll.speed = Math.max(1, Math.min(10, parseInt(sliderSpeed, 10) || 3));
    autoScroll.lastTime = performance.now();
    autoScroll.accum = 0;

    if (!autoScroll.active) {
      autoScroll.active = true;
      showAutoScrollIndicator();
      autoScroll.rafId = requestAnimationFrame(autoScrollTick);
    }
  }

  function stopAutoScroll() {
    if (!autoScroll.active) {
      return;
    }

    autoScroll.active = false;

    if (autoScroll.rafId) {
      cancelAnimationFrame(autoScroll.rafId);
      autoScroll.rafId = 0;
    }

    hideAutoScrollIndicator();
  }

  function autoScrollTick(now) {
    if (!autoScroll.active) {
      return;
    }

    const dt = Math.min(100, now - autoScroll.lastTime) / 1000;
    autoScroll.lastTime = now;

    const pxPerSecond = sliderToPixelsPerSecond(autoScroll.speed);
    autoScroll.accum += pxPerSecond * dt;

    // Only scroll when we've accumulated at least 1 whole pixel,
    // otherwise sub-pixel deltas get lost due to integer scrollTop.
    const intDelta = Math.floor(autoScroll.accum);
    if (intDelta < 1) {
      autoScroll.rafId = requestAnimationFrame(autoScrollTick);
      return;
    }
    autoScroll.accum -= intDelta;

    const el = document.scrollingElement || document.documentElement;
    const before = el.scrollTop;
    el.scrollTop += intDelta;

    // Reached the bottom — stop
    if (el.scrollTop === before && intDelta > 0) {
      stopAutoScroll();
      return;
    }

    autoScroll.rafId = requestAnimationFrame(autoScrollTick);
  }

  // ── Auto-scroll page indicator ─────────────────
  //    A small floating badge at the bottom of the viewport
  //    so the user knows auto-scroll is running.

  function showAutoScrollIndicator() {
    if (autoScroll.indicatorHost) {
      return;
    }

    const host = document.createElement("div");
    host.id = "ohmyscroll-auto-indicator";
    const shadow = host.attachShadow({ mode: "closed" });

    shadow.innerHTML = `
      <style>
        :host {
          all: initial !important;
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 2147483647 !important;
          pointer-events: auto !important;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif !important;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(252, 205, 146, 0.94);
          color: #5a3e0a;
          padding: 8px 18px 8px 14px;
          border-radius: 24px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(252, 205, 146, 0.3);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          user-select: none;
          -webkit-user-select: none;
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .badge:hover {
          background: rgba(240, 185, 106, 0.96);
          transform: scale(1.03);
        }
        .badge:active {
          transform: scale(0.97);
        }
        .arrow {
          font-size: 14px;
          animation: bounce 1.8s ease-in-out infinite;
        }
        .hint {
          opacity: 0.6;
          font-size: 11px;
          margin-left: 2px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(3px); }
        }
      </style>
      <div class="badge" title="Click to stop auto-scroll">
        <span class="arrow">↓</span>
        <span>Auto Scrolling</span>
        <span class="hint">· click to stop</span>
      </div>
    `;

    shadow.querySelector(".badge").addEventListener("click", () => {
      stopAutoScroll();
    });

    (document.body || document.documentElement).appendChild(host);
    autoScroll.indicatorHost = host;
  }

  function hideAutoScrollIndicator() {
    if (autoScroll.indicatorHost) {
      autoScroll.indicatorHost.remove();
      autoScroll.indicatorHost = null;
    }
  }

  // ── State setters ──────────────────────────────

  function setEnabled(enabled) {
    state.enabled = Boolean(enabled);
    if (!state.enabled) {
      deactivate();
      stopAutoScroll();
    }
  }

  function applyCursorTheme(theme) {
    const normalized = normalizeCursorTheme(theme);
    state.cursorTheme = normalized;

    const cursor = CURSOR_THEMES[normalized];
    document.documentElement.style.setProperty("--ohmyscroll-cursor", cursor);
    if (document.body) {
      document.body.style.setProperty("--ohmyscroll-cursor", cursor);
    }
  }

  // ── Event handlers ─────────────────────────────

  function onMouseDown(event) {
    if (!state.enabled) {
      return;
    }

    if (state.active) {
      const wasLeftClick = event.button === 0;
      state.suppressNextClick = wasLeftClick;
      state.suppressNextAuxClick = event.button === 1;
      event.preventDefault();
      event.stopPropagation();

      const clickX = event.clientX;
      const clickY = event.clientY;

      deactivate();

      if (wasLeftClick) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const target = document.elementFromPoint(clickX, clickY);
            if (target) {
              const commonInit = {
                bubbles: true,
                cancelable: true,
                clientX: clickX,
                clientY: clickY,
                button: 0,
                buttons: 1,
                view: window
              };
              target.dispatchEvent(new MouseEvent("mousedown", commonInit));
              target.dispatchEvent(new MouseEvent("mouseup", { ...commonInit, buttons: 0 }));
              target.dispatchEvent(new MouseEvent("click", { ...commonInit, buttons: 0 }));
            }
          });
        });
      }
      return;
    }

    // Middle-click activation — only if middle-click is enabled
    if (event.button !== 1 || !state.middleClickEnabled) {
      return;
    }

    if (shouldIgnoreTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    activate(event.clientX, event.clientY, event.target);
  }

  function onClick(event) {
    if (!state.suppressNextClick || event.button !== 0) {
      return;
    }

    state.suppressNextClick = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function onAuxClick(event) {
    if (event.button !== 1 || !state.enabled) {
      return;
    }

    if (state.suppressNextAuxClick) {
      state.suppressNextAuxClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Only suppress default middle-click if middle-click scroll is enabled
    if (!state.middleClickEnabled) {
      return;
    }

    if (shouldIgnoreTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function onMouseMove(event) {
    if (!state.active) {
      return;
    }

    state.pointer = { x: event.clientX, y: event.clientY };
  }

  function suppressEvent(event) {
    if (!state.active) {
      return;
    }
    if (event.type !== "pointerdown") {
      event.preventDefault();
    }
    event.stopPropagation();
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (state.active) {
        deactivate();
      }
      if (autoScroll.active) {
        stopAutoScroll();
      }
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      deactivate();
    } else {
      reApplyCursorTheme();
    }
  }

  async function reApplyCursorTheme() {
    applyCursorTheme(state.cursorTheme);

    try {
      const fromBackground = await sendRuntimeMessage({ type: MESSAGE_TYPE_GET_STATE });
      if (fromBackground) {
        if (typeof fromBackground.enabled === "boolean") {
          setEnabled(fromBackground.enabled);
        }
        if (typeof fromBackground.middleClickEnabled === "boolean") {
          state.middleClickEnabled = fromBackground.middleClickEnabled;
        }
        applyCursorTheme(fromBackground.cursorTheme ?? state.cursorTheme);
      } else {
        const fromStorage = await readSettingsFromStorage();
        state.middleClickEnabled = fromStorage.middleClickEnabled;
        applyCursorTheme(fromStorage.cursorTheme ?? state.cursorTheme);
      }
    } catch {
      // Best-effort
    }
  }

  // ── Runtime message handler ────────────────────

  function onRuntimeMessage(message, _sender, sendResponse) {
    if (!message) {
      return false;
    }

    // Broadcast state update from background
    if (message.type === MESSAGE_TYPE_STATE) {
      if (typeof message.enabled === "boolean") {
        setEnabled(message.enabled);
      }
      if (typeof message.middleClickEnabled === "boolean") {
        state.middleClickEnabled = message.middleClickEnabled;
      }
      applyCursorTheme(message.cursorTheme);
      return false;
    }

    // Auto-scroll: start
    if (message.type === MESSAGE_TYPE_AUTO_START) {
      if (state.enabled) {
        startAutoScroll(message.speed);
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false, reason: "disabled" });
      }
      return false;
    }

    // Auto-scroll: stop
    if (message.type === MESSAGE_TYPE_AUTO_STOP) {
      stopAutoScroll();
      sendResponse({ ok: true });
      return false;
    }

    // Auto-scroll: status query
    if (message.type === MESSAGE_TYPE_AUTO_STATUS) {
      sendResponse({
        active: autoScroll.active,
        speed: autoScroll.speed
      });
      return false;
    }

    return false;
  }

  // ── Initialization ─────────────────────────────

  async function initialize() {
    const fromBackground = await sendRuntimeMessage({ type: MESSAGE_TYPE_GET_STATE });
    const fromStorage = await readSettingsFromStorage();

    const enabled =
      typeof fromBackground?.enabled === "boolean" ? fromBackground.enabled : fromStorage.enabled;
    const cursorTheme = normalizeCursorTheme(fromBackground?.cursorTheme ?? fromStorage.cursorTheme);
    const middleClickEnabled =
      typeof fromBackground?.middleClickEnabled === "boolean"
        ? fromBackground.middleClickEnabled
        : fromStorage.middleClickEnabled;

    setEnabled(enabled);
    applyCursorTheme(cursorTheme);
    state.middleClickEnabled = middleClickEnabled;

    if (api?.runtime?.onMessage) {
      api.runtime.onMessage.addListener(onRuntimeMessage);
    }

    document.addEventListener("mousedown", onMouseDown, { capture: true, passive: false });
    document.addEventListener("click", onClick, { capture: true, passive: false });
    document.addEventListener("auxclick", onAuxClick, { capture: true, passive: false });
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", deactivate);

    document.addEventListener("mouseup", suppressEvent, { capture: true, passive: false });
    document.addEventListener("pointerdown", suppressEvent, { capture: true, passive: false });
    document.addEventListener("pointerup", suppressEvent, { capture: true, passive: false });
    document.addEventListener("contextmenu", suppressEvent, { capture: true, passive: false });
  }

  void initialize();
})();
