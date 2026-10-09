/* Sulai chat widget. Mounts into #sulai-root on any page that loads this script. */
(function () {
  var script = document.currentScript;
  var origin = script && script.src ? new URL(script.src).origin : window.location.origin;
  var ENDPOINT = origin + "/api/chat";

  var SUGGESTIONS = [
    "What does Sulaiman build?",
    "Tell me about Muster",
    "Cloud and Zoho experience",
    "How can I contact him?",
  ];

  var GREETING =
    "Hi, I'm Sulai. Ask me about Sulaiman's projects, experience or skills.";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Escape first, then add a small safe subset of markdown: **bold**, [links](url), line breaks.
  function format(text) {
    var out = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    out = out.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, function (_, label, href) {
      return '<a href="' + href + '" target="_blank" rel="noopener">' + label + "</a>";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return out.replace(/\n/g, "<br>");
  }

  function mount(root) {
    root.classList.add("sulai");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Ask Sulai, AI assistant");

    var head = el("div", "sulai-head");
    var orb = el("div", "sulai-orb");
    orb.setAttribute("aria-hidden", "true");
    var title = el("div", "sulai-title");
    title.appendChild(el("h2", null, "Sulai"));
    var status = el("div", "sulai-status");
    status.appendChild(el("span", "sulai-dot"));
    status.appendChild(document.createTextNode("online · AI assistant for Sulaiman's work"));
    title.appendChild(status);
    head.appendChild(orb);
    head.appendChild(title);

    var chips = el("div", "sulai-chips");
    SUGGESTIONS.forEach(function (text) {
      var chip = el("button", "sulai-chip", text);
      chip.type = "button";
      chip.addEventListener("click", function () {
        send(text);
      });
      chips.appendChild(chip);
    });

    var log = el("div", "sulai-log");
    log.setAttribute("aria-live", "polite");

    var form = el("form", "sulai-form");
    var input = el("input", "sulai-input");
    input.type = "text";
    input.name = "message";
    input.placeholder = "Ask about Sulaiman's work";
    input.maxLength = 2000;
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Your question");
    var send_ = el("button", "sulai-send");
    send_.type = "submit";
    send_.setAttribute("aria-label", "Send message");
    send_.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
    form.appendChild(input);
    form.appendChild(send_);

    var foot = el("p", "sulai-foot", "Answers come from Sulaiman's public profile. Replies may be imperfect.");

    root.appendChild(head);
    root.appendChild(chips);
    root.appendChild(log);
    root.appendChild(form);
    root.appendChild(foot);

    var history = [];
    var busy = false;

    function addMessage(role, text, extraClass) {
      var bubble = el("div", "sulai-msg sulai-msg--" + role + (extraClass ? " " + extraClass : ""));
      bubble.innerHTML = format(text);
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
      return bubble;
    }

    function setBusy(value) {
      busy = value;
      send_.disabled = value;
      input.disabled = value;
    }

    async function send(text) {
      var message = (text || input.value || "").trim();
      if (!message || busy) return;
      input.value = "";
      chips.hidden = true;
      addMessage("user", message);
      history.push({ role: "user", content: message });

      var typing = el("div", "sulai-msg sulai-msg--bot");
      typing.innerHTML = '<span class="sulai-typing"><span></span><span></span><span></span></span>';
      typing.setAttribute("aria-label", "Sulai is typing");
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      setBusy(true);

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 60000);
      try {
        var res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-20) }),
          signal: controller.signal,
        });
        var data = await res.json().catch(function () { return {}; });
        typing.remove();
        if (res.ok && data.reply) {
          addMessage("bot", data.reply);
          history.push({ role: "assistant", content: data.reply });
        } else {
          addMessage("bot", data.error || "Something went wrong. Please try again.", "sulai-msg--error");
          history.pop();
        }
      } catch (err) {
        typing.remove();
        var msg = err && err.name === "AbortError"
          ? "That took too long. Please try again."
          : "Network error. Please try again.";
        addMessage("bot", msg, "sulai-msg--error");
        history.pop();
      } finally {
        clearTimeout(timer);
        setBusy(false);
        input.focus();
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send();
    });

    addMessage("bot", GREETING);
  }

  function reveal(node) {
    if (!("IntersectionObserver" in window)) {
      node.classList.add("is-visible");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          io.disconnect();
        }
      });
    }, { threshold: 0.15 });
    io.observe(node);
  }

  function init() {
    var root = document.getElementById("sulai-root");
    if (!root) {
      root = el("div", null);
      root.id = "sulai-root";
      document.body.appendChild(root);
    }
    mount(root);
    reveal(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
