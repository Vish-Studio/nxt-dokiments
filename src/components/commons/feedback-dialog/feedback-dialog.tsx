"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import {
  FeedbackThrottledError,
  useSubmitFeedbackMutation,
} from "@/hooks/queries/use-feedback";
import { cn } from "@/lib/utils";
import type { FeedbackType } from "@/types/feedback";
import { MAX_FEEDBACK_MESSAGE } from "@/types/feedback";

type FeedbackValues = {
  message: string;
  type: FeedbackType;
};

/** An inline message shown above the field, and how loudly to say it. */
type Notice = {
  message: string;
  tone: "error" | "notice";
};

/** The two choices, with the wording users see. */
const typeOptions: { label: string; value: FeedbackType }[] = [
  { label: "Feedback", value: "feedback" },
  { label: "Problem", value: "problem" },
];

/** When the counter starts warning rather than merely informing. */
const COUNTER_WARNING_THRESHOLD = 0.9;

export type FeedbackDialogProps = {
  onClose: () => void;
  open: boolean;
  /**
   * Route the user was on when they opened this, stored alongside the message.
   *
   * Supplied by the caller rather than read from `usePathname` here, so the
   * dialog stays independent of the router and can be rendered in a story
   * without one.
   */
  path?: string;
};

/**
 * Collects one piece of feedback — general or a problem report — from the
 * signed-in user, and sends it to `POST /api/feedback`.
 *
 * Self-contained, like `ReauthDialog`: it owns its own fields, its own submission
 * and its own success state. Callers only decide when it is open. On success it
 * stays open and swaps to a confirmation rather than closing, so the user gets a
 * clear acknowledgement instead of a dialog that vanishes and leaves them
 * wondering whether anything was sent.
 *
 * A failure keeps everything the user typed on screen. There is no draft
 * persistence anywhere, so closing on error would destroy the message — the exact
 * moment a user is most likely to have written something detailed.
 */
export const FeedbackDialog = ({ onClose, open, path }: FeedbackDialogProps) => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSent, setIsSent] = useState(false);
  const { isPending, mutate: submitFeedback } = useSubmitFeedbackMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<FeedbackValues>({
    defaultValues: { message: "", type: "feedback" },
  });

  // `useWatch` rather than `watch(...)`: these two need to re-render on every
  // keystroke and every toggle, and `watch` is a plain function the React Compiler
  // cannot reason about (it warns about exactly this).
  const used = useWatch({ control, name: "message" }).length;
  const selectedType = useWatch({ control, name: "type" });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // `typeof document` guards the `createPortal` target below during SSR. It can
  // only matter for a caller that mounts this already-open, since `open` starts
  // false in the app and is only flipped by a click.
  if (!open || typeof document === "undefined") {
    return null;
  }

  /**
   * Closes and clears everything, so reopening starts fresh rather than showing
   * the confirmation — or the error — from last time.
   */
  const close = () => {
    reset({ message: "", type: "feedback" });
    setNotice(null);
    setIsSent(false);
    onClose();
  };

  const submit = handleSubmit((values) => {
    setNotice(null);

    submitFeedback(
      { message: values.message, path, type: values.type },
      {
        onError: (error) => {
          setNotice({
            message:
              error instanceof Error
                ? error.message
                : "Unable to send your feedback right now.",
            // A throttle is not a failure: nothing was lost and nothing is
            // broken, so it should not be dressed in the same red as one.
            tone:
              error instanceof FeedbackThrottledError ? "notice" : "error",
          });
        },
        onSuccess: () => setIsSent(true),
      },
    );
  });

  /**
   * Rendered into `document.body` rather than in place.
   *
   * `SidebarFeedback` lives inside the sidebar, which animates its mobile drawer
   * with `translate-x-*`. Any non-`none` `transform` makes an element the
   * containing block for its `position: fixed` descendants, so `inset-0` here
   * resolved to the sidebar's own narrow column instead of the viewport — the
   * dialog rendered *inside* the sidebar. A portal is the fix rather than
   * un-transforming the sidebar, because a modal should not depend on where it
   * happens to be mounted.
   *
   * `z-80` for the same reason: the sidebar is `z-70`, and as a sibling of the app
   * root this now competes with it directly.
   */
  return createPortal(
    <div
      aria-label="Send feedback"
      aria-modal="true"
      className="fixed inset-0 z-80 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-nox-noir/55"
        disabled={isPending}
        onClick={close}
        type="button"
      />

      {isSent ? (
        <div className="relative z-10 w-full max-w-md rounded-box border border-steel-mist bg-base-100 p-6 text-center">
          <CheckCircleIcon
            aria-hidden
            className="mx-auto text-success"
            size={40}
            weight="fill"
          />
          <h3 className="mt-3 font-title text-lg font-bold text-nox-noir">
            Thank you — message sent
          </h3>
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">
            We read everything that comes through here. If you have hit a problem
            we can reproduce, it goes straight onto the list.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              autoFocus
              onClick={close}
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="relative z-10 w-full max-w-md rounded-box border border-steel-mist bg-base-100 p-6"
          onSubmit={submit}
        >
          <h3 className="font-title text-lg font-bold text-nox-noir">
            Share your thoughts
          </h3>
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">
            An idea to make Dokiments better, a problem you have run into, or
            anything else on your mind — we read every message.
          </p>

          {notice ? (
            <div
              className={cn(
                "mt-4 rounded-box px-4 py-3 text-sm",
                notice.tone === "error"
                  ? "bg-error/10 text-error"
                  : "bg-base-200 text-nox-noir/70",
              )}
              role="alert"
            >
              {notice.message}
            </div>
          ) : null}

          {/* A radiogroup rather than the shared `TabMenu`: this is a form field
              choosing a value, not a tab switching a panel, so native radios give
              the right semantics and arrow-key navigation for free. Styled to
              match `TabMenu` so it still reads as the same control. */}
          <fieldset className="mt-5">
            <legend className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
              Type
            </legend>
            <div className="mt-2 flex gap-1 rounded-box bg-base-200 p-1">
              {typeOptions.map((option) => {
                const isSelected = option.value === selectedType;

                return (
                  <label
                    className="flex-1 cursor-pointer"
                    key={option.value}
                  >
                    <input
                      className="peer sr-only"
                      disabled={isPending}
                      type="radio"
                      value={option.value}
                      {...register("type")}
                    />
                    {/* Selected state branched in JS, exactly as `TabMenu` does it,
                        rather than with a `peer-checked:` variant. The hover colour
                        then only exists on the unselected branch, so it cannot
                        collide with the selected one — a `hover:` and a
                        `peer-checked:` rule for the same property leave the winner
                        up to Tailwind's output order, and hover won, turning the
                        selected label dark on its own dark pill.

                        `peer-focus-visible` stays a variant: the focus ring has to
                        react to the visually-hidden input, which only the peer
                        relationship can see. */}
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-box px-3 py-2 font-title text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-nox-noir/30",
                        isSelected
                          ? "bg-nox-noir text-white"
                          : "text-nox-noir/55 hover:bg-base-100/55 hover:text-nox-noir",
                      )}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <label
              className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45"
              htmlFor="feedback-message"
            >
              Message
            </label>
            <textarea
              aria-describedby="feedback-message-counter"
              aria-invalid={errors.message ? "true" : "false"}
              autoFocus
              className="textarea mt-2 min-h-32 w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15"
              disabled={isPending}
              id="feedback-message"
              // Matches what the server enforces, so a long message is stopped
              // here rather than rejected after the user has finished writing.
              maxLength={MAX_FEEDBACK_MESSAGE}
              placeholder="Tell us what is on your mind..."
              {...register("message", {
                required: "Please write a message before sending.",
                validate: (value) =>
                  value.trim().length > 0 ||
                  "Please write a message before sending.",
              })}
            />
            <div className="mt-2 flex items-start justify-between gap-3">
              <span
                className="text-sm text-error"
                role={errors.message ? "alert" : undefined}
              >
                {errors.message?.message}
              </span>
              <span
                className={cn(
                  "shrink-0 text-xs tabular-nums",
                  used >= MAX_FEEDBACK_MESSAGE * COUNTER_WARNING_THRESHOLD
                    ? "text-error"
                    : "text-nox-noir/45",
                )}
                id="feedback-message-counter"
              >
                {used} / {MAX_FEEDBACK_MESSAGE}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs leading-5 text-nox-noir/45">
              Your feedback shapes what we build next.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                disabled={isPending}
                onClick={close}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                size="sm"
                type="submit"
              >
                {isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>,
    document.body,
  );
};
