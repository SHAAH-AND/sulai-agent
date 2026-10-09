# sulai-agent

**Sulai** is a free, self-hosted AI assistant for [sulaimanhassan.netlify.app](https://sulaimanhassan.netlify.app). It answers visitors' questions about Sulaiman's projects, experience and skills.

## Architecture

```
Browser (chat UI)
   │  POST /api/chat
   ▼
Vercel (Next.js app + API route)     ← hosts the UI and server route
   │  OpenAI-compatible /chat/completions
   ▼
Your fine-tuned model                ← runs on a GPU host (see below)
```

- **Vercel** hosts the chat UI and the `/api/chat` route. Serverless functions can't run a language model themselves (no GPU, strict memory and time limits), so the model lives elsewhere.
- **Model host:** any service that exposes an OpenAI-compatible chat endpoint, such as Hugging Face Inference Endpoints, Modal, RunPod, or a self-hosted vLLM server.
- **Knowledge:** `lib/persona.js` holds the facts Sulai answers from. Update it when projects or roles change.

## Getting started

```bash
npm install
cp .env.example .env.local   # set MODEL_ENDPOINT_URL, MODEL_API_KEY, MODEL_NAME
npm run dev
```

Without `MODEL_ENDPOINT_URL` set, the app still runs and shows a "model not connected yet" reply.

## Deploy

1. Import this repo into Vercel.
2. Add the three `MODEL_*` variables under Project Settings → Environment Variables.
3. Deploy, then link the Vercel domain from the portfolio site.

## Roadmap

- [ ] Choose and deploy the base model on a GPU host
- [ ] Build a fine-tuning dataset from the portfolio content
- [ ] Stream responses
- [ ] Embed the chat widget on the portfolio site
- [ ] Log anonymized questions to improve answers
