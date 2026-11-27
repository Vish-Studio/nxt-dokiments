import { describe, expect, it } from "vitest";

import type { Client } from "@/types/client";

import { clientFromDocument, findSavedClient } from "./client-from-document";

const complete = {
  toAddress: " 3 Royal Road, Rose Hill ",
  toBrn: "C123",
  toEmail: "hello@northline.mu",
  toName: " Northline Studio ",
  toPhone: "+230 5 712 0044",
};

const saved: Client = {
  address: "",
  brn: "",
  companyName: "Acme Co.",
  createdAt: 1,
  email: "accounts@acme.co",
  id: "client_acme",
  name: "Jo Smith",
  nationalId: "",
  phone: "+230 5 000 0000",
  updatedAt: 1,
};

describe("clientFromDocument", () => {
  it("builds a trimmed client from the document's client fields", () => {
    expect(clientFromDocument(complete)).toEqual({
      ok: true,
      input: {
        address: "3 Royal Road, Rose Hill",
        brn: "C123",
        companyName: "Northline Studio",
        email: "hello@northline.mu",
        name: "Northline Studio",
        nationalId: "",
        phone: "+230 5 712 0044",
      },
    });
  });

  it("reads an NDA's receiving party", () => {
    const result = clientFromDocument({
      partyTwo: "Blue Harbour",
      partyTwoAddress: "Port Louis",
      toEmail: "ravi@blueharbour.mu",
      toPhone: "123",
    });
    expect(result.ok && result.input.address).toBe("Port Louis");
  });

  it("lists every required field that is missing or invalid", () => {
    expect(clientFromDocument({})).toEqual({
      ok: false,
      missing: ["name", "email", "phone"],
    });
    expect(
      clientFromDocument({ ...complete, toEmail: "not an email" }),
    ).toEqual({
      ok: false,
      missing: ["email"],
    });
  });
});

describe("findSavedClient", () => {
  it("matches by email or name, ignoring case", () => {
    expect(findSavedClient([saved], { toEmail: "ACCOUNTS@acme.co" })).toBe(
      saved,
    );
    expect(findSavedClient([saved], { toName: " acme co. " })).toBe(saved);
    expect(findSavedClient([saved], { toName: "jo smith" })).toBe(saved);
  });

  it("finds nothing for a new client or an empty block", () => {
    expect(findSavedClient([saved], complete)).toBeUndefined();
    expect(findSavedClient([saved], {})).toBeUndefined();
  });
});
