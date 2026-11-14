
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, type FormEvent } from "react";

export default function ChatTestPage() {
  const [input, setInput] = useState("");

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    transport: new DefaultChatTransport({
        api: "/api/chatbot",
    }),
  });

  const isLoading =
    status === "submitted" ||
    status === "streaming";

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!input.trim() || isLoading) return;

    void sendMessage({ text: input });
    setInput("");
  }

  return (
    <main
      style={{
        maxWidth: 750,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Dokiments AI Assistant</h1>
      <p>Powered by Vercel AI SDK + Ollama</p>

      <div
        style={{
          height: 450,
          overflowY: "auto",
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        {messages.length === 0 && (
          <p>
            Hello! How can I help you today?
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{ marginBottom: 16 }}
          >
            <strong>
              {message.role === "user"
                ? "You"
                : "Dokiments AI"}
            </strong>

            {message.parts.map((part, index) => {
              if (part.type !== "text") {
                return null;
              }

              return (
                <p
                  key={index}
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {part.text}
                </p>
              );
            })}
          </div>
        ))}

        {isLoading && (
          <p>AI is responding...</p>
        )}

        {error && (
          <p role="alert">
            Something went wrong. Check your
            Next.js terminal and Ollama connection.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 10 }}
      >
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Ask Dokiments AI..."
          style={{
            flex: 1,
            padding: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />

        {isLoading ? (
          <button type="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
          >
            Send
          </button>
        )}
      </form>
    </main>
  );

}