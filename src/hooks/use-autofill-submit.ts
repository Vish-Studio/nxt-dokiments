"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * How often the watched fields are sampled.
 *
 * A fill has to be noticed from the values themselves rather than from an event:
 * iOS AutoFill writes to the fields the user is not focused on without an event
 * React can see, and whether WebKit fires a native one for a given AutoFill
 * provider is not something we can rely on. Two string reads per tick is cheap
 * enough that polling is the honest way to catch every provider.
 */
const SAMPLE_INTERVAL_MS = 250;

/** Gestures that establish the user is present, before anything auto-submits. */
const INTERACTION_EVENTS = ["keydown", "pointerdown", "touchstart"] as const;

/**
 * Submits a form as soon as a password manager fills it, so choosing a saved
 * login is all it takes to sign in.
 *
 * Nothing in the platform does this: Apple Passwords (and every other manager)
 * fills the fields and stops, leaving the user to press the button themselves.
 *
 * A fill is told apart from typing by where the keyboard focus was. Typing needs
 * focus, so a field whose value moved while it was *not* the focused element was
 * written by something other than the user's hands — which is exactly what
 * filling a login does to whichever of the two fields the user is not sitting in.
 * Pasting into the focused field is deliberately not treated as a fill.
 *
 * Two further conditions keep it from firing when the user has not asked for it:
 *
 * - A real gesture must have reached the form first, so credentials Safari
 *   restores on page load can never sign someone straight back in — which would
 *   make signing out look broken.
 * - It arms once. Any submit at all, this one included, disarms it, so a fill
 *   racing a tap on the button cannot send the credentials twice.
 *
 * Submission goes through `requestSubmit()` rather than a callback, so it takes
 * the form's own `onSubmit` path — the same validation and autofill
 * reconciliation as the button. Needs `HTMLFormElement.requestSubmit`, so iOS 16
 * and up; older versions keep the manual button and lose nothing else.
 *
 * @param formRef - Ref to the `<form>` to watch and submit.
 * @param fieldNames - `name` of every field that must be filled before
 *   submitting. All of them have to be non-empty, so a manager that fills only
 *   the password on a blank email stays quiet.
 */
export const useAutofillSubmit = (
  formRef: RefObject<HTMLFormElement | null>,
  fieldNames: readonly string[],
) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = fieldNames
      .map((name) => form.elements.namedItem(name))
      .filter(
        (element): element is HTMLInputElement =>
          element instanceof HTMLInputElement,
      );
    // A name that resolved to nothing means the caller and the markup disagree;
    // sitting out is better than half-watching the form.
    if (inputs.length !== fieldNames.length) return;

    let hasInteracted = false;
    let isDisarmed = false;
    let previous = inputs.map((input) => input.value);

    const noteInteraction = () => {
      hasInteracted = true;
    };
    const noteInput = (event: Event) => {
      const { target } = event;
      if (!(target instanceof HTMLInputElement)) return;
      /**
       * Typing and pasting dispatch input events, and baselining what they wrote
       * keeps moving focus afterwards from making an ordinary edit look like a
       * fill. Only the field the user is actually sitting in may be baselined
       * though: a fill writes to the field they are *not* in, and some providers
       * dispatch an input event when they do, so baselining on the event alone
       * would hide the very thing this hook watches for.
       */
      if (target !== document.activeElement) return;

      const index = inputs.indexOf(target);
      if (index === -1) return;

      previous[index] = target.value;
    };
    const disarm = () => {
      isDisarmed = true;
    };

    for (const type of INTERACTION_EVENTS) {
      form.addEventListener(type, noteInteraction);
    }
    form.addEventListener("input", noteInput);
    form.addEventListener("submit", disarm);

    const timer = window.setInterval(() => {
      const current = inputs.map((input) => input.value);
      const wasFilled = current.some(
        (value, index) =>
          value !== previous[index] && inputs[index] !== document.activeElement,
      );
      // Sampled unconditionally, so a change already accounted for can never be
      // read as a fresh fill on a later tick.
      previous = current;

      if (isDisarmed || !hasInteracted || !wasFilled) return;
      if (!current.every((value) => value.length > 0)) return;

      isDisarmed = true;
      form.requestSubmit();
    }, SAMPLE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      form.removeEventListener("input", noteInput);
      form.removeEventListener("submit", disarm);
      for (const type of INTERACTION_EVENTS) {
        form.removeEventListener(type, noteInteraction);
      }
    };
  }, [fieldNames, formRef]);
};
