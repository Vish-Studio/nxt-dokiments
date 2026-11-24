"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  detectPushSupport,
  toSubscriptionInput,
  urlBase64ToUint8Array,
} from "@/lib/push/client";

/**
 * Where this device stands with push notifications.
 *
 * - `loading`: still checking the browser. The first render, and always on the server.
 * - `unsupported`: this browser cannot receive push.
 * - `install-required`: iOS in a browser tab; the app must be added to the Home Screen first.
 * - `blocked`: the user denied permission in the browser, so only the browser's
 *   own site settings can undo it. Asking again would do nothing.
 * - `off`: supported and allowed to ask, but not subscribed on this device.
 * - `on`: subscribed on this device.
 */
export type PushStatus =
  "loading" | "unsupported" | "install-required" | "blocked" | "off" | "on";

/** Thrown by `enable` when the user dismisses the permission prompt without choosing. */
export class PushPermissionDismissedError extends Error {
  constructor() {
    super("Notification permission was not granted.");
    this.name = "PushPermissionDismissedError";
  }
}

const sendJson = async (url: string, method: string, body?: unknown) => {
  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method,
  });
  const data = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }

  return data;
};

/**
 * Drives the push notification toggle in Settings for **this device**.
 *
 * The browser is the source of truth for whether this device is subscribed, so
 * the state is read from `pushManager` rather than from the server: a record
 * the server deleted (an expired subscription) is repaired the next time the
 * user turns notifications on.
 *
 * Permission is only requested from `enable`, which the UI calls from a click.
 * Safari and iOS reject permission prompts that are not a direct response to a
 * tap, and an unprompted request on page load is what users learn to block.
 *
 * @returns The current {@link PushStatus} and the actions. `enable`, `disable`
 *   and `sendTest` reject with a user-safe `Error`; `enable` rejects with
 *   {@link PushPermissionDismissedError} when the prompt is dismissed.
 */
export const usePushNotifications = () => {
  const [status, setStatus] = useState<PushStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      const support = detectPushSupport();

      if (support !== "supported") {
        if (!cancelled) setStatus(support);
        return;
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("blocked");
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (!cancelled) {
        setStatus(
          subscription && Notification.permission === "granted" ? "on" : "off",
        );
      }
    };

    void detect().catch(() => {
      if (!cancelled) setStatus("off");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useMutation({
    mutationFn: async () => {
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        setStatus("blocked");
        throw new Error(
          "Notifications are blocked for this site. Allow them in your browser settings.",
        );
      }

      if (permission !== "granted") throw new PushPermissionDismissedError();

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
          ),
          userVisibleOnly: true,
        }));

      try {
        await sendJson(
          "/api/push/subscriptions",
          "POST",
          toSubscriptionInput(subscription),
        );
      } catch (error) {
        // Don't leave a browser subscription the server knows nothing about.
        if (!existing) await subscription.unsubscribe().catch(() => false);
        throw error;
      }

      setStatus("on");
    },
  });

  const disable = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await sendJson("/api/push/subscriptions", "DELETE", {
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }

      setStatus("off");
    },
  });

  const sendTest = useMutation({
    mutationFn: () => sendJson("/api/push/test", "POST"),
  });

  return {
    disable: disable.mutateAsync,
    enable: enable.mutateAsync,
    isDisabling: disable.isPending,
    isEnabling: enable.isPending,
    isSendingTest: sendTest.isPending,
    sendTest: sendTest.mutateAsync,
    status,
  };
};
