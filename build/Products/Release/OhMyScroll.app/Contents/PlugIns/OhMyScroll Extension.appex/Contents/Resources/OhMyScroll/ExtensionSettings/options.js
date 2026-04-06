(() => {
  "use strict";

  const api = globalThis.browser ?? globalThis.chrome;
  const MESSAGE_TYPE_GET_STATE = "OH_MY_SCROLL_GET_STATE";
  const MESSAGE_TYPE_SET_CURSOR_THEME = "OH_MY_SCROLL_SET_CURSOR_THEME";
  const DEFAULT_CURSOR_THEME = "white";

  const statusEl = document.getElementById("status");
  const radios = Array.from(document.querySelectorAll("input[name='cursor-theme']"));

  function normalizeCursorTheme(theme) {
    return theme === "yellow" ? "yellow" : DEFAULT_CURSOR_THEME;
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

  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", isError);
  }

  function setSelectedTheme(theme) {
    const normalized = normalizeCursorTheme(theme);
    radios.forEach((radio) => {
      radio.checked = radio.value === normalized;
    });
  }

  async function loadCurrentTheme() {
    const response = await sendRuntimeMessage({ type: MESSAGE_TYPE_GET_STATE });
    setSelectedTheme(response?.cursorTheme);
  }

  async function onThemeChange(event) {
    const selected = normalizeCursorTheme(event.target.value);

    const response = await sendRuntimeMessage({
      type: MESSAGE_TYPE_SET_CURSOR_THEME,
      cursorTheme: selected
    });

    if (response?.ok) {
      setStatus(`Saved: ${selected === "white" ? "White" : "Yellow"} hand`);
      return;
    }

    setStatus("Could not save setting. Please try again.", true);
  }

  radios.forEach((radio) => {
    radio.addEventListener("change", onThemeChange);
  });

  void loadCurrentTheme().catch(() => {
    setSelectedTheme(DEFAULT_CURSOR_THEME);
    setStatus("Using default setting.");
  });
})();
