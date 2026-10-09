import { SYSTEM_PROMPT } from "../../../lib/persona";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = [
  "https://sulaimanhassan-portfolio.vercel.app",
  "https://sulaimanhassan.netlify.app",
  "https://sulaimanhassan.dev",
  "https://www.sulaimanhassan.dev",
  "https://sulai-agent.vercel.app",
  "http://localhost:3000",
];

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

// Accepts [{ role: "user" | "assistant", content: string }] and forwards it to
// your own model through an OpenAI-compatible /chat/completions endpoint.
export async function POST(request) {
  const cors = corsHeaders(request);
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const messages = Array.isArray(body?.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  const clean = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return Response.json({ error: "Send a user message." }, { status: 400, headers: cors });
  }

  const endpoint = process.env.MODEL_ENDPOINT_URL;
  if (!endpoint) {
    return Response.json({
      reply:
        "Sulai's model isn't connected yet. Once the model endpoint is configured, I'll be able to answer questions about Sulaiman's work.",
    }, { status: 200, headers: cors });
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
      return Response.json({ error: "The model endpoint returned an error." }, { status: 502, headers: cors });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ error: "Empty response from model." }, { status: 502, headers: cors });
    }
    return Response.json({ reply }, { status: 200, headers: cors });
  } catch {
    return Response.json({ error: "Could not reach the model endpoint." }, { status: 502, headers: cors });
  }
}
