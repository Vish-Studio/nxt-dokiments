import { describe, expect, it } from "vitest";

import { buildChatIntents, fallbackFollowUps } from "./intents";
import { isOneTypoAway, matchIntent, stem, tokenize } from "./match-intent";

const intents = buildChatIntents({ sharingEnabled: true });

const matchId = (message: string) => matchIntent(message, intents)?.id;

describe("stem", () => {
  it("brings word forms together", () => {
    expect(new Set(["sign", "signs", "signed", "signing"].map(stem))).toEqual(
      new Set(["sign"]),
    );
    expect(stem("invoices")).toBe(stem("invoice"));
    expect(stem("creating")).toBe(stem("create"));
  });

  it("leaves short words alone", () => {
    expect(stem("his")).toBe("his");
    expect(stem("yes")).toBe("yes");
  });
});

describe("tokenize", () => {
  it("drops punctuation, accents and filler words", () => {
    expect(tokenize("Créer   an INVOICE?!")).toEqual(["creer", "invoic"]);
    expect(tokenize("Can't sign")).toEqual(["cant", "sign"]);
  });
});

describe("isOneTypoAway", () => {
  it.each([
    ["invoce", "invoice"],
    ["invoicce", "invoice"],
    ["invoise", "invoice"],
    ["donwload", "download"],
    ["download", "download"],
  ])("%s ~ %s", (a, b) => {
    expect(isOneTypoAway(a, b)).toBe(true);
  });

  it.each([
    ["invce", "invoice"],
    ["dwonlaod", "download"],
    ["plan", "planning"],
  ])("%s ≁ %s", (a, b) => {
    expect(isOneTypoAway(a, b)).toBe(false);
  });
});

describe("matchIntent", () => {
  it.each([
    ["How do I create an invoice?", "create-invoice"],
    ["I need to bill my customer", "create-invoice"],
    ["make a quote for a client", "create-quotation"],
    ["How do I sign a document?", "sign-document"],
    ["Can my client e-sign the contract?", "sign-document"],
    ["how do i sign up", "account"],
    ["I can't sign in", "account"],
    ["forgot my password", "account"],
    ["How do I share my invoice?", "share-document"],
    ["Can I download it as a PDF?", "download-pdf"],
    ["I made a typo, how do I fix it", "edit-document"],
    ["difference between a template and a document", "template-vs-document"],
    ["where are the templates", "templates"],
    ["save customer details", "clients"],
    ["How much does it cost?", "plans"],
    ["Which documents can I create?", "document-types"],
    ["do you support NDAs", "document-types"],
    ["how do i create a contract", "create-document"],
    ["Does it work on my phone?", "mobile"],
    ["is my data safe", "privacy"],
    ["what is dokiments", "about"],
    ["I want to talk to a person", "contact"],
    ["hello", "greeting"],
    ["hi, I want an invoice", "create-invoice"],
    ["thanks!", "thanks"],
  ])("%s → %s", (message, expected) => {
    expect(matchId(message)).toBe(expected);
  });

  it.each([
    ["how do I create an invoce", "create-invoice"],
    ["make a quotaion", "create-quotation"],
    ["donwload pdf", "download-pdf"],
    ["I forgot my pasword", "account"],
    ["where is the marketplce", "templates"],
    ["subscripton prices", "plans"],
  ])("tolerates the typo in %s → %s", (message, expected) => {
    expect(matchId(message)).toBe(expected);
  });

  it("prefers an exact match over a possible typo", () => {
    expect(matchId("how do I contact you")).toBe("contact");
    expect(matchId("write a contract")).toBe("create-document");
    // "great" is one letter from "create", but starts with a different one.
    expect(matchId("great, thanks")).toBe("thanks");
  });

  it("returns null when nothing matches", () => {
    expect(matchIntent("banana", intents)).toBeNull();
    expect(matchIntent("   ", intents)).toBeNull();
  });
});

describe("chat intents", () => {
  it.each([true, false])(
    "only follow up to intents that exist (sharing %s)",
    (sharingEnabled) => {
      const built = buildChatIntents({ sharingEnabled });
      const ids = new Set(built.map((intent) => intent.id));

      expect(ids.size).toBe(built.length);
      for (const intent of built) {
        for (const followUp of intent.followUps) {
          expect(ids).toContain(followUp);
        }
      }
      for (const followUp of fallbackFollowUps) {
        expect(ids).toContain(followUp);
      }
    },
  );

  it("does not point to Share while sharing is off", () => {
    const signing = buildChatIntents({ sharingEnabled: false }).find(
      (intent) => intent.id === "sign-document",
    );

    expect(signing?.answer).not.toContain("**Share**");
    expect(signing?.answer).toContain("Download PDF");
  });

  it("lists the signable document types from the blueprints", () => {
    const signing = intents.find((intent) => intent.id === "sign-document");

    expect(signing?.answer).toContain("Contract");
    expect(signing?.answer).toContain("NDA");
    expect(signing?.answer).not.toContain("Invoice");
  });
});
