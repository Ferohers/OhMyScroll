(() => {
  "use strict";

  const api = globalThis.browser ?? globalThis.chrome;

  const MESSAGE_TYPE_GET_STATE = "OH_MY_SCROLL_GET_STATE";
  const MESSAGE_TYPE_SET_CURSOR_THEME = "OH_MY_SCROLL_SET_CURSOR_THEME";
  const MESSAGE_TYPE_TOGGLE_ENABLED = "OH_MY_SCROLL_TOGGLE_ENABLED";
  const MESSAGE_TYPE_SET_MIDDLE_CLICK = "OH_MY_SCROLL_SET_MIDDLE_CLICK";
  const MESSAGE_TYPE_SET_AUTO_SPEED = "OH_MY_SCROLL_SET_AUTO_SPEED";

  const MESSAGE_TYPE_AUTO_START = "OH_MY_SCROLL_AUTO_START";
  const MESSAGE_TYPE_AUTO_STOP = "OH_MY_SCROLL_AUTO_STOP";
  const MESSAGE_TYPE_AUTO_STATUS = "OH_MY_SCROLL_AUTO_STATUS";

  // ── DOM refs ─────────────────────────────────────
  const enableToggle = document.getElementById("enableToggle");
  const speedSlider = document.getElementById("speedSlider");
  const speedBadge = document.getElementById("speedBadge");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const middleClickToggle = document.getElementById("middleClickToggle");
  const themePills = document.getElementById("themePills");
  const autoScrollCard = document.getElementById("autoScrollCard");

  let activeTabId = null;
  let isAutoScrolling = false;

  // ── Messaging helpers ────────────────────────────

  function sendToBackground(message) {
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
          maybePromise.then((r) => resolve(r ?? null)).catch(() => resolve(null));
        }
      } catch {
        resolve(null);
      }
    });
  }

  function sendToTab(tabId, message) {
    if (!api?.tabs?.sendMessage || !tabId) {
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
        const maybePromise = api.tabs.sendMessage(tabId, message, onResponse);
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then((r) => resolve(r ?? null)).catch(() => resolve(null));
        }
      } catch {
        resolve(null);
      }
    });
  }

  function getActiveTab() {
    if (!api?.tabs?.query) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const onTabs = (tabs) => {
        if (api.runtime?.lastError) {
          resolve(null);
          return;
        }
        const tab = Array.isArray(tabs) && tabs.length > 0 ? tabs[0] : null;
        resolve(tab);
      };

      try {
        const maybePromise = api.tabs.query({ active: true, currentWindow: true }, onTabs);
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(onTabs).catch(() => resolve(null));
        }
      } catch {
        resolve(null);
      }
    });
  }

  // ── UI helpers ───────────────────────────────────

  function updateSpeedBadge(value) {
    speedBadge.textContent = value + "×";
  }

  function setAutoScrollUI(running) {
    isAutoScrolling = running;
    startBtn.disabled = running;
    stopBtn.disabled = !running;

    if (running) {
      startBtn.classList.add("is-running");
      startBtn.textContent = "RUNNING";
    } else {
      startBtn.classList.remove("is-running");
      startBtn.textContent = "START";
    }
  }

  function setEnabledUI(enabled) {
    enableToggle.checked = enabled;
    if (!enabled) {
      autoScrollCard.classList.add("is-disabled");
    } else {
      autoScrollCard.classList.remove("is-disabled");
    }
  }

  function setThemeUI(theme) {
    const pills = themePills.querySelectorAll(".pill");
    pills.forEach((pill) => {
      pill.classList.toggle("active", pill.dataset.theme === theme);
    });
  }

  // ── Load state ───────────────────────────────────

  async function loadState() {
    // Get active tab
    const tab = await getActiveTab();
    activeTabId = tab?.id ?? null;

    // Get global settings from background
    const bgState = await sendToBackground({ type: MESSAGE_TYPE_GET_STATE });

    if (bgState) {
      setEnabledUI(bgState.enabled !== false);
      middleClickToggle.checked = bgState.middleClickEnabled !== false;
      setThemeUI(bgState.cursorTheme === "yellow" ? "yellow" : "white");

      if (typeof bgState.autoSpeed === "number") {
        speedSlider.value = bgState.autoSpeed;
        updateSpeedBadge(bgState.autoSpeed);
      }
    }

    // Get auto-scroll status from active tab
    if (activeTabId) {
      const status = await sendToTab(activeTabId, { type: MESSAGE_TYPE_AUTO_STATUS });
      if (status) {
        setAutoScrollUI(status.active === true);
        if (typeof status.speed === "number") {
          speedSlider.value = status.speed;
          updateSpeedBadge(status.speed);
        }
      }
    }
  }

  // ── Event handlers ───────────────────────────────

  enableToggle.addEventListener("change", async () => {
    const enabled = enableToggle.checked;
    setEnabledUI(enabled);

    await sendToBackground({
      type: MESSAGE_TYPE_TOGGLE_ENABLED,
      enabled
    });

    // If disabling, also stop auto-scroll
    if (!enabled && isAutoScrolling) {
      await sendToTab(activeTabId, { type: MESSAGE_TYPE_AUTO_STOP });
      setAutoScrollUI(false);
    }
  });

  speedSlider.addEventListener("input", () => {
    const value = parseInt(speedSlider.value, 10);
    updateSpeedBadge(value);

    // Persist speed preference
    sendToBackground({ type: MESSAGE_TYPE_SET_AUTO_SPEED, speed: value });

    // If currently scrolling, update the speed in real time
    if (isAutoScrolling && activeTabId) {
      sendToTab(activeTabId, { type: MESSAGE_TYPE_AUTO_START, speed: value });
    }
  });

  startBtn.addEventListener("click", async () => {
    if (!activeTabId) return;

    const speed = parseInt(speedSlider.value, 10);
    await sendToTab(activeTabId, { type: MESSAGE_TYPE_AUTO_START, speed });
    setAutoScrollUI(true);
  });

  stopBtn.addEventListener("click", async () => {
    if (!activeTabId) return;

    await sendToTab(activeTabId, { type: MESSAGE_TYPE_AUTO_STOP });
    setAutoScrollUI(false);
  });

  middleClickToggle.addEventListener("change", async () => {
    await sendToBackground({
      type: MESSAGE_TYPE_SET_MIDDLE_CLICK,
      enabled: middleClickToggle.checked
    });
  });

  themePills.addEventListener("click", async (event) => {
    const pill = event.target.closest(".pill");
    if (!pill) return;

    const theme = pill.dataset.theme;
    setThemeUI(theme);

    await sendToBackground({
      type: MESSAGE_TYPE_SET_CURSOR_THEME,
      cursorTheme: theme
    });
  });

  // ── Init ─────────────────────────────────────────
  void loadState().catch(() => {
    // Best-effort: show defaults
    setEnabledUI(true);
    middleClickToggle.checked = true;
    setThemeUI("white");
  });
})();
