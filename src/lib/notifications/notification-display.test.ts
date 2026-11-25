import { describe, expect, it } from "vitest";

import {
  formatNotificationAge,
  groupNotifications,
  notificationAccent,
} from "@/lib/notifications/notification-display";
import type { AppNotification } from "@/types/notification";

const notification = (
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  createdAt: 0,
  id: "template:modern-invoice",
  kind: "template",
  read: false,
  title: "New template: Invoice",
  ...overrides,
});

describe("notificationAccent", () => {
  it("gives each known kind its own accent", () => {
    expect(notificationAccent("template")).toBe("purple");
    expect(notificationAccent("document-shared")).toBe("blue");
    expect(notificationAccent("document-signed")).toBe("green");
    expect(notificationAccent("app-update")).toBe("amber");
  });

  it("falls back to neutral for a kind it has never seen", () => {
    expect(notificationAccent("invoice-overdue")).toBe("neutral");
  });
});

describe("formatNotificationAge", () => {
  const now = 10 * 24 * 60 * 60_000;

  it("says just now inside the first minute", () => {
    expect(formatNotificationAge(now - 30_000, now)).toBe("Just now");
  });

  it("counts minutes, then hours, then days", () => {
    expect(formatNotificationAge(now - 5 * 60_000, now)).toBe("5m ago");
    expect(formatNotificationAge(now - 3 * 60 * 60_000, now)).toBe("3h ago");
    expect(formatNotificationAge(now - 2 * 24 * 60 * 60_000, now)).toBe(
      "2d ago",
    );
  });

  it("never goes negative when the clock is slightly behind the server", () => {
    expect(formatNotificationAge(now + 60_000, now)).toBe("Just now");
  });
});

describe("groupNotifications", () => {
  it("puts unread under New and read under Earlier, keeping order", () => {
    const groups = groupNotifications([
      notification({ id: "a" }),
      notification({ id: "b", read: true }),
      notification({ id: "c" }),
      notification({ id: "d", read: true }),
    ]);

    expect(groups.map(({ label }) => label)).toEqual(["New", "Earlier"]);
    expect(groups[0].notifications.map(({ id }) => id)).toEqual(["a", "c"]);
    expect(groups[1].notifications.map(({ id }) => id)).toEqual(["b", "d"]);
  });

  it("leaves out a section with nothing in it", () => {
    expect(
      groupNotifications([notification({ read: true })]).map(
        ({ label }) => label,
      ),
    ).toEqual(["Earlier"]);
    expect(
      groupNotifications([notification()]).map(({ label }) => label),
    ).toEqual(["New"]);
  });

  it("returns no sections for an empty list", () => {
    expect(groupNotifications([])).toEqual([]);
  });
});
