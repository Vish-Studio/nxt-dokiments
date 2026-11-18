import { describe, expect, it } from "vitest";

import {
  MAX_UNANSWERED_LENGTH,
  prepareUnansweredMessage,
  redactPersonalDetails,
} from "./unanswered";

describe("redactPersonalDetails", () => {
  it("replaces email addresses", () => {
    expect(redactPersonalDetails("email me at jo.smith@acme.co.uk please")).toBe(
      "email me at [email] please",
    );
  });

  it("replaces phone and card numbers, however they are spaced", () => {
    expect(redactPersonalDetails("call +230 5 712 3456")).toBe("call [number]");
    expect(redactPersonalDetails("card 4242-4242-4242-4242")).toBe(
      "card [number]",
    );
  });

  it("keeps quantities, years and dates", () => {
    expect(redactPersonalDetails("I sent 25 invoices in 2026")).toBe(
      "I sent 25 invoices in 2026",
    );
    expect(redactPersonalDetails("due 14/11/2026")).toBe("due 14/11/2026");
  });
});

describe("prepareUnansweredMessage", () => {
  it("trims, redacts and clamps", () => {
    expect(prepareUnansweredMessage("  hi a@b.co  ")).toBe("hi [email]");
    expect(
      Array.from(prepareUnansweredMessage("a@b.c ".repeat(100))).length,
    ).toBe(MAX_UNANSWERED_LENGTH);
  });

  it("never splits an emoji", () => {
    const message = prepareUnansweredMessage("🧾".repeat(400));

    expect(Array.from(message)).toHaveLength(MAX_UNANSWERED_LENGTH);
    expect(message).toBe("🧾".repeat(MAX_UNANSWERED_LENGTH));
  });
});
