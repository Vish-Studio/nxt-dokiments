"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type SubmitEvent,
} from "react";
import { createPortal } from "react-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { getStarterIntentIds, isChatbotHidden } from "@/lib/chatbot/context";
import {
  chatIntents,
  fallbackAnswer,
  fallbackFollowUps,
  type ChatIntent,
} from "@/lib/chatbot/intents";
import { matchIntent } from "@/lib/chatbot/match-intent";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { useAuthStore } from "@/stores/auth-store";

/** A short pause before replying, so answers don't feel like they appear out of nowhere. */
const REPLY_DELAY_MS = 450;

/** Per-tab, so a refresh keeps the conversation but a new visit starts fresh. */
const STORAGE_KEY = "dokiments-chatbot-messages";

interface ChatMessage {
  id: number;
  role: "user" | "bot";
  text: string;
  /** Intent ids offered as chips under a bot reply. */
  followUps?: string[];
}

/** Nothing to subscribe to: only the server/client split matters. */
const subscribeToNothing = () => () => {};

const intentsById = new Map(chatIntents.map((intent) => [intent.id, intent]));

const starterIcons: Record<string, string> = {
  about: "💡",
  account: "🔑",
  clients: "👥",
  contact: "💬",
  "create-invoice": "🧾",
  "create-quotation": "📄",
  "download-pdf": "📥",
  "edit-document": "✏️",
  plans: "💳",
  privacy: "🔒",
  "sign-document": "✍️",
  "template-vs-document": "🧩",
  templates: "📁",
};

const isChatMessage = (value: unknown): value is ChatMessage => {
  const message = value as Partial<ChatMessage> | null;

  return (
    typeof message?.id === "number" &&
    (message.role === "user" || message.role === "bot") &&
    typeof message.text === "string" &&
    (message.followUps === undefined || Array.isArray(message.followUps))
  );
};

/** Storage can be missing, blocked or hold something stale; any of those means "no history". */
const readStoredMessages = (): ChatMessage[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored: unknown = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) ?? "[]",
    );

    return Array.isArray(stored) ? stored.filter(isChatMessage) : [];
  } catch {
    return [];
  }
};

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

export function ChatbotWidget() {
  // Portals are rendered only after hydration (document.body exists on client).
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const pathname = usePathname();
  const signedIn = useAuthStore((state) => state.status === "authenticated");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  // Nothing renders until after hydration, so reading storage here can't cause a mismatch.
  const [messages, setMessages] = useState<ChatMessage[]>(readStoredMessages);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(
    messages.reduce((next, message) => Math.max(next, message.id + 1), 0),
  );
  const replyTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(replyTimerRef.current), []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or blocked: the conversation just won't survive a refresh.
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

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

  /** Posts the user's message, then Docsy's reply. A known intent skips matching. */
  function ask(value: string, intent?: ChatIntent) {
    const text = value.trim();
    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: nextIdRef.current++, role: "user", text },
    ]);
    setInput("");
    setIsTyping(true);

    replyTimerRef.current = window.setTimeout(() => {
      const match = intent ?? matchIntent(text, chatIntents);
      setMessages((current) => [
        ...current,
        {
          followUps: match?.followUps ?? fallbackFollowUps,
          id: nextIdRef.current++,
          role: "bot",
          text: match?.answer ?? fallbackAnswer,
        },
      ]);
      setIsTyping(false);
    }, REPLY_DELAY_MS);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      ask(input);
    }
  }

  function newConversation() {
    window.clearTimeout(replyTimerRef.current);
    setIsTyping(false);
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  }

  function closePanel() {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  // In-app links navigate client-side; on phones the panel covers the page, so close it.
  const markdownComponents: Components = {
    a: ({ children, href = "" }) =>
      href.startsWith("/") ? (
        <Link
          href={href}
          onClick={() => {
            if (window.matchMedia("(max-width: 639px)").matches) closePanel();
          }}
        >
          {children}
        </Link>
      ) : (
        <a href={href} rel="noreferrer" target="_blank">
          {children}
        </a>
      ),
  };

  const lastMessage = messages.at(-1);
  const followUps =
    !isTyping && lastMessage?.role === "bot"
      ? (lastMessage.followUps ?? [])
          .map((id) => intentsById.get(id))
          .filter((intent): intent is ChatIntent => Boolean(intent))
      : [];

  const starters = getStarterIntentIds({
    pathname,
    sharingEnabled: documentSharingEnabled,
    signedIn,
  })
    .map((id) => intentsById.get(id))
    .filter((intent): intent is ChatIntent => Boolean(intent));

  if (!mounted || isChatbotHidden(pathname)) return null;

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
                disabled={messages.length === 0}
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
                  {starters.map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => ask(intent.label, intent)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[#F0CF79] bg-[#FFF9E8] px-3 py-3 text-left text-sm font-medium text-black transition hover:border-[#FFD066] hover:bg-[#FFF0C6]"
                    >
                      <span className="text-xl" aria-hidden="true">
                        {starterIcons[intent.id] ?? "💬"}
                      </span>
                      <span className="flex-1">{intent.label}</span>
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
                        className={`max-w-[85%] min-w-0 rounded-2xl px-3 py-2.5 text-sm leading-6 wrap-anywhere ${
                          isUser
                            ? "rounded-tr-sm border border-black/20 bg-[#FFD066] text-black"
                            : "rounded-tl-sm border border-black/20 bg-[#FFF9E8] text-black"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        ) : (
                          <div className="min-w-0 [&_a]:text-black [&_a]:underline [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                            <ReactMarkdown
                              components={markdownComponents}
                              remarkPlugins={[remarkGfm]}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
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
                {followUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-10" aria-label="Suggested questions">
                    {followUps.map((intent) => (
                      <button
                        key={intent.id}
                        type="button"
                        onClick={() => ask(intent.label, intent)}
                        className="rounded-full border border-[#F0CF79] bg-white px-3 py-1.5 text-left text-xs font-medium text-black transition hover:border-[#FFD066] hover:bg-[#FFF0C6]"
                      >
                        {intent.label}
                      </button>
                    ))}
                  </div>
                )}
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
                placeholder="Ask a question..."
                aria-label="Message Docsy"
                className="max-h-32 min-h-9 flex-1 resize-y border-0 bg-transparent px-2 py-1.5 text-sm text-black outline-none placeholder:text-black/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFD066] text-black hover:bg-[#F4C04B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendIcon />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-black/60">
              Docsy answers common questions about Dokiments.
            </p>
          </footer>
        </section>
      )}

      {/*
        The launcher has inline position/z-index for visibility even if theme CSS overrides utilities.
        While closed it steps around other things pinned to the bottom of the page:
        - it hides while a bottom notice (cookie consent, install, update) is showing,
          the same "one thing at a time" rule BottomNotices follows;
        - it moves above a page's floating action button instead of covering it.
        Detected with :has() so new pages and notices need no wiring here.
      */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="dokiments-ai-panel"
        aria-label={isOpen ? "Close Docsy" : "Open Docsy"}
        className={`bottom-6 right-6 grid h-16 w-16 place-items-center rounded-full border border-[#E8BA4D] bg-[#FFD066] text-black shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-[#F4C04B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD066] ${
          isOpen
            ? "max-sm:hidden"
            : "[body:has(.cookie-consent,.install-nudge,.app-update-banner)_&]:hidden [body:has(.floating-action-button)_&]:bottom-24 lg:[body:has(.floating-action-button)_&]:bottom-32"
        }`}
        style={{ position: "fixed", zIndex: 2147483647 }}
      >
        <ChatIcon close={isOpen} />
      </button>
    </>,
    document.body
  );
}
