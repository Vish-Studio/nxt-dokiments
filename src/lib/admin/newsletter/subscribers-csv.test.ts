import { describe, expect, it } from "vitest";

import type { NewsletterSubscriber } from "@/types/admin";

import { toSubscribersCsv } from "./subscribers-csv";

const subscriber = (overrides: Partial<NewsletterSubscriber> = {}): NewsletterSubscriber => ({
  createdAt: Date.UTC(2026, 10, 28),
  email: "reader@x.test",
  id: "abc",
  status: "subscribed",
  ...overrides,
});

describe("toSubscribersCsv", () => {
  it("starts with a header row", () => {
    expect(toSubscribersCsv([]).split("\n")[0]).toBe("email,subscribed_at,status");
  });

  it("writes one quoted line per subscriber", () => {
    expect(toSubscribersCsv([subscriber()]).split("\n")[1]).toBe(
      '"reader@x.test","2026-11-28T00:00:00.000Z","subscribed"',
    );
  });

  it("leaves an unknown date empty", () => {
    expect(toSubscribersCsv([subscriber({ createdAt: null })])).toContain('"reader@x.test","",');
  });

  it("neutralises a value that would run as a spreadsheet formula", () => {
    expect(toSubscribersCsv([subscriber({ email: "=HYPERLINK(\"x\")@x.test" })])).toContain(`"'=HYPERLINK(""x"")@x.test"`);
  });
});
