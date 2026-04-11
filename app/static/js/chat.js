/**
 * Floating chat widget → calls backend `/api/gemini/chat` (key never leaves the server).
 * Vanilla JS: fetch + async/await, conversation history in memory.
 */
(function () {
  "use strict";

  var CHAT_API_URL =
    (window.CHAT_CONFIG && window.CHAT_CONFIG.chatApiUrl) || "/api/gemini/chat";

  var fab = document.getElementById("chat-fab");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var clearBtn = document.getElementById("chat-clear");
  var messagesEl = document.getElementById("chat-messages");
  var typingEl = document.getElementById("chat-typing");
  var inputEl = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");

  if (!fab || !panel || !messagesEl || !inputEl || !sendBtn) return;

  /** @type {{role: string, text: string}[]} */
  var history = [];
  var busy = false;
  var WELCOME_KEY = "portfolio-chat-welcomed";

  function nowTime() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getLang() {
    return document.documentElement.getAttribute("lang") === "es" ? "es" : "en";
  }

  function t(key) {
    var el = document.querySelector('[data-i18n="' + key + '"]');
    return el ? el.textContent.trim() : "";
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setBusy(on) {
    busy = on;
    inputEl.disabled = on;
    sendBtn.disabled = on;
    typingEl.classList.toggle("is-visible", !!on);
  }

  function appendBubble(role, text) {
    var row = document.createElement("div");
    row.className = "chat-row " + (role === "user" ? "user" : "assistant");

    var wrap = document.createElement("div");
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    var meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = nowTime();

    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    row.appendChild(wrap);
    if (typingEl && typingEl.parentNode === messagesEl) {
      messagesEl.insertBefore(row, typingEl);
    } else {
      messagesEl.appendChild(row);
    }
    scrollToBottom();
  }

  function injectWelcomeIfNeeded() {
    if (sessionStorage.getItem(WELCOME_KEY)) return;
    sessionStorage.setItem(WELCOME_KEY, "1");
    appendBubble("assistant", t("chat_welcome"));
  }

  function clearUi() {
    messagesEl.innerHTML = "";
    sessionStorage.removeItem(WELCOME_KEY);
    history = [];
  }

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      injectWelcomeIfNeeded();
      inputEl.focus();
    }
  }

  fab.addEventListener("click", function () {
    setOpen(!panel.classList.contains("is-open"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      clearUi();
      injectWelcomeIfNeeded();
    });
  }

  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || busy) return;

    inputEl.value = "";
    appendBubble("user", text);
    history.push({ role: "user", text: text });
    setBusy(true);

    try {
      var res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: history.map(function (m) {
            return { role: m.role, parts: [{ text: m.text }] };
          }),
        }),
      });

      var payload = null;
      try {
        payload = await res.json();
      } catch (_e) {
        payload = null;
      }

      if (res.status === 429) {
        appendBubble("assistant", t("chat_err_rate_limit"));
        return;
      }

      if (!res.ok) {
        var detail = payload && payload.detail;
        var code =
          detail && typeof detail === "object" && !Array.isArray(detail)
            ? detail.code
            : null;
        if (code === "MISSING_API_KEY" || res.status === 503) {
          appendBubble("assistant", t("chat_err_missing_key"));
        } else {
          appendBubble("assistant", t("chat_err_connect"));
        }
        return;
      }

      var reply =
        payload && typeof payload.text === "string" ? payload.text : "";
      if (!reply) {
        appendBubble("assistant", t("chat_err_connect"));
        return;
      }

      appendBubble("assistant", reply);
      history.push({ role: "model", text: reply });
    } catch (_err) {
      appendBubble("assistant", t("chat_err_connect"));
    } finally {
      setBusy(false);
      scrollToBottom();
    }
  }

  sendBtn.addEventListener("click", function () {
    sendMessage();
  });

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function refreshChatChrome() {
    inputEl.placeholder = t("chat_placeholder");
    fab.setAttribute("aria-label", t("chat_fab_aria"));
    if (closeBtn) closeBtn.setAttribute("aria-label", t("chat_close_aria"));
    if (clearBtn) clearBtn.setAttribute("aria-label", t("chat_clear_aria"));
    sendBtn.setAttribute("aria-label", t("chat_send"));
  }

  document.addEventListener("portfolio-lang-changed", function () {
    refreshChatChrome();
  });

  refreshChatChrome();
})();
