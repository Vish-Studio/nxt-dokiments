
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

import { createOpenAICompatible } from
  "@ai-sdk/openai-compatible";

// Connect Vercel AI SDK to local Ollama
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL:
    process.env.OLLAMA_BASE_URL ??
    "http://127.0.0.1:11434/v1",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  if (
    !Array.isArray(body.messages) ||
    body.messages.length > 30
  ) {
    return Response.json(
      { error: "Invalid conversation." },
      { status: 400 }
    );
  }

  const messages = body.messages as UIMessage[];

  const result = streamText({
    model: ollama.chatModel(
      process.env.OLLAMA_MODEL ?? "qwen3:latest"
    ),

    system: `
You are Docsy, an intelligent AI powered assistant
for the Dokiments document management platform.

Your responsibilities:
1. Answer questions about Dokiments.
2. Help users understand business documents.
3. Guide users through creating invoices and quotations.
4. Collect missing document information when needed.
5. Never claim to have saved a document.

Be concise, professional, and helpful.
Do not invent platform features.

Use non-thinking mode for straightforward requests.
/no_think
`,

    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();

}