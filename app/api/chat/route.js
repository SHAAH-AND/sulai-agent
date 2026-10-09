import { SYSTEM_PROMPT } from "../../../lib/persona";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

// Accepts [{ role: "user" | "assistant", content: string }] and forwards it to
// your own model through an OpenAI-compatible /chat/completions endpoint.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  const clean = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return Response.json({ error: "Send a user message." }, { status: 400 });
  }

  const endpoint = process.env.MODEL_ENDPOINT_URL;
  if (!endpoint) {
    return Response.json({
      reply:
        "Sulai's model isn't connected yet. Once the model endpoint is configured, I'll be able to answer questions about Sulaiman's work.",
    });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.MODEL_API_KEY ? { Authorization: `Bearer ${process.env.MODEL_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || "sulai",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      return Response.json({ error: "The model endpoint returned an error." }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ error: "Empty response from model." }, { status: 502 });
    }
    return Response.json({ reply });
  } catch {
    return Response.json({ error: "Could not reach the model endpoint." }, { status: 502 });
  }
}
