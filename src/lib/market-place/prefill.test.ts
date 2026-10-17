import { describe, expect, it } from "vitest";

import type { AuthUser } from "@/types/auth";
import type { TemplateField } from "@/types/template";

import { senderPrefillValues } from "./prefill";

const fields: TemplateField[] = [
  { key: "fromName", label: "From", type: "text" },
  { key: "fromEmail", label: "Sender email", type: "text" },
];

const user: AuthUser = {
  displayName: "Anthony",
  email: "anthony@dokiments.com",
  provider: "password",
  role: "free",
  uid: "uid",
};

describe("senderPrefillValues", () => {
  it("uses the sign-in email when no business email is set", () => {
    expect(senderPrefillValues(user, fields).fromEmail).toBe(
      "anthony@dokiments.com",
    );
  });

  it("prefers the business email when one is set", () => {
    expect(
      senderPrefillValues({ ...user, businessEmail: "hello@northline.com" }, fields)
        .fromEmail,
    ).toBe("hello@northline.com");
  });
});
