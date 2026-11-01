import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { hashedIdempotencyKey } from "./idempotency-key";

describe("hashedIdempotencyKey", () => {
  it("keeps the share email key format", () => {
    const expected = `share-${createHash("sha256")
      .update("doc_1|bob@example.com|1800000000000")
      .digest("hex")}`;

    expect(
      hashedIdempotencyKey(
        "share",
        "doc_1",
        "bob@example.com",
        1_800_000_000_000,
      ),
    ).toBe(expected);
  });

  it("is stable, short and differs per part and per prefix", () => {
    const key = hashedIdempotencyKey("signed", "doc", "uid", 1);

    expect(hashedIdempotencyKey("signed", "doc", "uid", 1)).toBe(key);
    expect(hashedIdempotencyKey("signed", "doc", "uid", 2)).not.toBe(key);
    expect(hashedIdempotencyKey("share", "doc", "uid", 1)).not.toBe(key);
    expect(key).toMatch(/^signed-[0-9a-f]{64}$/);
  });
});
