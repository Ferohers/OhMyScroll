(() => {
  "use strict";

  const api = globalThis.browser ?? globalThis.chrome;
  const STORAGE_KEY_ENABLED = "ohMyScrollEnabled";
  const STORAGE_KEY_CURSOR_THEME = "ohMyScrollCursorTheme";
  const STORAGE_KEY_MIDDLE_CLICK = "ohMyScrollMiddleClickEnabled";
  const STORAGE_KEY_AUTO_SPEED = "ohMyScrollAutoSpeed";
  const DEFAULT_CURSOR_THEME = "white";

  const MESSAGE_TYPE_STATE = "OH_MY_SCROLL_STATE";
  const MESSAGE_TYPE_GET_STATE = "OH_MY_SCROLL_GET_STATE";
  const MESSAGE_TYPE_SET_CURSOR_THEME = "OH_MY_SCROLL_SET_CURSOR_THEME";
  const MESSAGE_TYPE_TOGGLE_ENABLED = "OH_MY_SCROLL_TOGGLE_ENABLED";
  const MESSAGE_TYPE_SET_MIDDLE_CLICK = "OH_MY_SCROLL_SET_MIDDLE_CLICK";
  const MESSAGE_TYPE_SET_AUTO_SPEED = "OH_MY_SCROLL_SET_AUTO_SPEED";

  if (!api) {
    return;
  }

  function readStorage(key) {
    if (!api.storage?.local) {
      return Promise.resolve({});
    }

    return new Promise((resolve) => {
      const onValue = (value) => resolve(value ?? {});

      try {
        const maybePromise = api.storage.local.get(key, onValue);
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(onValue).catch(() => resolve({}));
        }
      } catch {
        resolve({});
      }
    });
  }

  function writeStorage(value) {
    if (!api.storage?.local) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        const maybePromise = api.storage.local.set(value, () => resolve());
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(() => resolve()).catch(() => resolve());
        }
      } catch {
        resolve();
      }
    });
  }

  function queryTabs(queryInfo) {
    if (!api.tabs?.query) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      const onTabs = (tabs) => resolve(Array.isArray(tabs) ? tabs : []);

      try {
        const maybePromise = api.tabs.query(queryInfo, onTabs);
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(onTabs).catch(() => resolve([]));
        }
      } catch {
        resolve([]);
      }
    });
  }

  function sendMessageToTab(tabId, message) {
    if (!api.tabs?.sendMessage) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        const maybePromise = api.tabs.sendMessage(tabId, message, () => resolve());
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(() => resolve()).catch(() => resolve());
        }
      } catch {
        resolve();
      }
    });
  }

  function setBadge(enabled) {
    if (!api.action) {
      return Promise.resolve();
    }

    const text = enabled ? "ON" : "OFF";
    const color = enabled ? "#0f766e" : "#64748b";

    return Promise.all([
      new Promise((resolve) => {
        try {
          const maybePromise = api.action.setBadgeText({ text }, () => resolve());
          if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.then(() => resolve()).catch(() => resolve());
          }
        } catch {
          resolve();
        }
      }),
      new Promise((resolve) => {
        try {
          const maybePromise = api.action.setBadgeBackgroundColor({ color }, () => resolve());
          if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.then(() => resolve()).catch(() => resolve());
          }
        } catch {
          resolve();
        }
      })
    ]).then(() => undefined);
  }

  function normalizeCursorTheme(theme) {
    return theme === "yellow" ? "yellow" : DEFAULT_CURSOR_THEME;
  }

  async function readState() {
    const value = await readStorage([
      STORAGE_KEY_ENABLED,
      STORAGE_KEY_CURSOR_THEME,
      STORAGE_KEY_MIDDLE_CLICK,
      STORAGE_KEY_AUTO_SPEED
    ]);
    return {
      enabled: value?.[STORAGE_KEY_ENABLED] !== false,
      cursorTheme: normalizeCursorTheme(value?.[STORAGE_KEY_CURSOR_THEME]),
      middleClickEnabled: value?.[STORAGE_KEY_MIDDLE_CLICK] !== false,
      autoSpeed: typeof value?.[STORAGE_KEY_AUTO_SPEED] === "number" ? value[STORAGE_KEY_AUTO_SPEED] : 3
    };
  }

  async function broadcastState(extensionState) {
    const tabs = await queryTabs({});
    await Promise.all(
      tabs
        .filter((tab) => Number.isInteger(tab.id))
        .map((tab) => sendMessageToTab(tab.id, { type: MESSAGE_TYPE_STATE, ...extensionState }))
    );
  }

  async function updateEnabled(enabled) {
    const nextEnabled = Boolean(enabled);
    await writeStorage({ [STORAGE_KEY_ENABLED]: nextEnabled });
    const nextState = await readState();
    await setBadge(nextEnabled);
    await broadcastState(nextState);
  }

  async function updateCursorTheme(cursorTheme) {
    const nextTheme = normalizeCursorTheme(cursorTheme);
    await writeStorage({ [STORAGE_KEY_CURSOR_THEME]: nextTheme });
    await broadcastState(await readState());
  }

  async function updateMiddleClick(enabled) {
    await writeStorage({ [STORAGE_KEY_MIDDLE_CLICK]: Boolean(enabled) });
    await broadcastState(await readState());
  }

  async function updateAutoSpeed(speed) {
    const safeSpeed = Math.max(1, Math.min(10, parseInt(speed, 10) || 3));
    await writeStorage({ [STORAGE_KEY_AUTO_SPEED]: safeSpeed });
    // No broadcast needed — speed is per-tab and popup sends directly
  }

  async function initialize() {
    const extensionState = await readState();
    await setBadge(extensionState.enabled);
  }

  if (api.runtime?.onInstalled) {
    api.runtime.onInstalled.addListener(() => {
      void initialize();
    });
  }

  if (api.runtime?.onStartup) {
    api.runtime.onStartup.addListener(() => {
      void initialize();
    });
  }

  // Keep the action click handler for backwards-compatibility.
  // When default_popup is set, this won't fire — but if someone removes
  // the popup, it'll still toggle the extension.
  if (api.action?.onClicked) {
    api.action.onClicked.addListener(async () => {
      const extensionState = await readState();
      await updateEnabled(!extensionState.enabled);
    });
  }

  if (api.runtime?.onMessage) {
    api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === MESSAGE_TYPE_GET_STATE) {
        readState()
          .then((extensionState) => sendResponse(extensionState))
          .catch(() =>
            sendResponse({
              enabled: true,
              cursorTheme: DEFAULT_CURSOR_THEME,
              middleClickEnabled: true,
              autoSpeed: 3
            })
          );
        return true;
      }

      if (message?.type === MESSAGE_TYPE_SET_CURSOR_THEME) {
        updateCursorTheme(message.cursorTheme)
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: false }));
        return true;
      }

      if (message?.type === MESSAGE_TYPE_TOGGLE_ENABLED) {
        updateEnabled(message.enabled)
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: false }));
        return true;
      }

      if (message?.type === MESSAGE_TYPE_SET_MIDDLE_CLICK) {
        updateMiddleClick(message.enabled)
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: false }));
        return true;
      }

      if (message?.type === MESSAGE_TYPE_SET_AUTO_SPEED) {
        updateAutoSpeed(message.speed)
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: false }));
        return true;
      }

      return false;
    });
  }

  void initialize();
})();
