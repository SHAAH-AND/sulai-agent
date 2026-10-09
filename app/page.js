"use client";

import { useState } from "react";

const GREETING = {
  role: "assistant",
  content: "Hi, I'm Sulai. Ask me about Sulaiman's projects, experience or skills.",
};

export default function Home() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : data.error || "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 16, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 20, margin: "8px 0 16px" }}>Sulai</h1>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#2b5cff" : "#171b24",
              padding: "10px 14px",
              borderRadius: 12,
              maxWidth: "85%",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        {busy && <div style={{ opacity: 0.6 }}>Sulai is typing…</div>}
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Sulaiman's work"
          maxLength={2000}
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #2a2f3a", background: "#0f1218", color: "inherit" }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ padding: "12px 16px", borderRadius: 10, border: 0, background: "#2b5cff", color: "#fff", cursor: "pointer" }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
