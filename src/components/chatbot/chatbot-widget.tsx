"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Keep using the existing, working Next.js + Ollama endpoint.
const transport = new DefaultChatTransport({ api: "/api/chatbot" });

const suggestions = [
  {
    label: "Create an invoice",
    icon: "🧾",
    prompt: "Help me prepare an invoice. Ask me for the details one question at a time.",
  },
  {
    label: "Create a quotation",
    icon: "📄",
    prompt: "Help me prepare a professional quotation. Ask for the necessary details one at a time.",
  },
  {
    label: "Find a template",
    icon: "📁",
    prompt: "Help me choose the right Dokiments document template for my needs.",
  },
] as const;

function ChatIcon({ close = false }: { close?: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {close ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
      )}
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 7-7 7 7M12 19V5" />
    </svg>
  );
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    clearError,
    stop,
    regenerate,
  } = useChat({ transport });

  const isBusy = status === "submitted" || status === "streaming";

  // Portals are rendered only after hydration (document.body exists on client).
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, status, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen]);

  function submitText(value: string) {
    const text = value.trim();
    if (!text || isBusy) return;
    clearError();
    void sendMessage({ text });
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitText(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitText(input);
    }
  }

  function newConversation() {
    if (isBusy) return;
    setMessages([]);
    clearError();
    setInput("");
    textareaRef.current?.focus();
  }

  function closePanel() {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {isOpen && (
        <section
          id="dokiments-ai-panel"
          aria-label="Docsy chat"
          className="fixed bottom-24 right-6 flex h-[min(640px,calc(100dvh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none max-sm:border-0"
          style={{ position: "fixed", zIndex: 2147483646 }}
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 bg-[#FFD066] px-4 py-4 text-black">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/10 text-xl text-black">
                ✦
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight text-black">
                  Docsy
                </h2>
                <p className="mt-1 flex items-center gap-2 text-xs text-black/70">
                  <span className="h-2 w-2 rounded-full bg-black" />
                  Your document assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={newConversation}
                disabled={isBusy || messages.length === 0}
                aria-label="New conversation"
                title="New conversation"
                className="grid h-9 w-9 place-items-center rounded-lg text-xl text-black transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close chat"
                className="grid h-9 w-9 place-items-center rounded-lg text-xl text-black transition hover:bg-black/10"
              >
                ×
              </button>
            </div>
          </header>

          {/* Chat messages */}
          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 py-5"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF3D2] text-3xl text-black">
                  ✦
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black">
                  Hi there! <span className="block text-black">How can I help?</span>
                </h3>
                <p className="text-sm leading-6 text-black/75">
                  Ask about Dokiments or get help preparing your next business document.
                </p>
                <p className="mt-4 text-xs font-bold tracking-widest text-black/60">
                  GET STARTED
                </p>
                <div className="flex w-full flex-col gap-2">
                  {suggestions.map(({ label, prompt, icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => submitText(prompt)}
                      disabled={isBusy}
                      className="flex w-full items-center gap-3 rounded-xl border border-[#F0CF79] bg-[#FFF9E8] px-3 py-3 text-left text-sm font-medium text-black transition hover:border-[#FFD066] hover:bg-[#FFF0C6] disabled:opacity-50"
                    >
                      <span className="text-xl" aria-hidden="true">{icon}</span>
                      <span className="flex-1">{label}</span>
                      <span className="text-black" aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#FFF3D2] text-black"
                          aria-hidden="true"
                        >
                          ✦
                        </span>
                      )}
                      <div
                        className={`max-w-[85%] min-w-0 overflow-wrap-anywhere rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                          isUser
                            ? "rounded-tr-sm border border-black/20 bg-[#FFD066] text-black"
                            : "rounded-tl-sm border border-black/20 bg-[#FFF9E8] text-black"
                        }`}
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {message.parts.map((part, index) => {
                          if (part.type !== "text") return null;
                          if (isUser) {
                            return <p key={index} className="whitespace-pre-wrap">{part.text}</p>;
                          }
                          return (
                            <div key={index} className="min-w-0 [&_a]:text-black [&_a]:underline [&_code]:break-words [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#FFF0C6] [&_pre]:p-3 [&_pre]:text-black [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {status === "submitted" && (
                  <div className="flex items-center gap-2" aria-label="Docsy is responding">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FFF3D2] text-black">✦</span>
                    <span className="flex items-center gap-1 rounded-xl bg-[#FFF9E8] px-4 py-3">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="h-2 w-2 animate-bounce rounded-full bg-black"
                          style={{ animationDelay: `${n * 150}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <p>Could not get a response. Check the Ollama server and try again.</p>
                <button
                  type="button"
                  disabled={isBusy || messages.length === 0}
                  onClick={() => void regenerate()}
                  className="mt-2 rounded-md border border-red-200 bg-white px-3 py-1.5 font-semibold hover:bg-red-100 disabled:opacity-50"
                >
                  Retry response
                </button>
              </div>
            )}
          </div>

          {/* Composer */}
          <footer className="shrink-0 border-t border-black/10 bg-white px-3 pb-3 pt-3 max-sm:pb-[max(12px,env(safe-area-inset-bottom))]">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-xl border border-black/20 bg-white p-2 shadow-sm focus-within:border-[#FFD066] focus-within:ring-2 focus-within:ring-[#FFD066]"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Docsy..."
                aria-label="Message Docsy"
                className="max-h-32 min-h-9 flex-1 resize-y border-0 bg-transparent px-2 py-1.5 text-sm text-black outline-none placeholder:text-black/50 focus:outline-none"
              />
              {isBusy ? (
                <button
                  type="button"
                  aria-label="Stop response"
                  onClick={() => void stop()}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFD066] text-black hover:bg-[#F4C04B]"
                >
                  <span className="h-3.5 w-3.5 rounded-sm bg-black" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFD066] text-black hover:bg-[#F4C04B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <SendIcon />
                </button>
              )}
            </form>
            <p className="mt-2 text-center text-[11px] text-black/60">
              AI can make mistakes. Review document details.
            </p>
          </footer>
        </section>
      )}

      {/* The launcher has inline position/z-index for visibility even if theme CSS overrides utilities. */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="dokiments-ai-panel"
        aria-label={isOpen ? "Close Docsy" : "Open Docsy"}
        className={`grid h-16 w-16 place-items-center rounded-full border border-[#E8BA4D] bg-[#FFD066] text-black shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#F4C04B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD066] ${isOpen ? "max-sm:hidden" : ""}`}
        style={{ position: "fixed", right: 24, bottom: 24, zIndex: 2147483647 }}
      >
        <ChatIcon close={isOpen} />
      </button>
    </>,
    document.body
  );

}
