import { describe, expect, it } from "vitest";

import { getStarterIntentIds, isChatbotHidden } from "./context";
import { buildChatIntents } from "./intents";

describe("isChatbotHidden", () => {
  it.each(["/sign-in", "/sign-up", "/forgot-password", "/my-documents/shared/abc"])(
    "hides on %s",
    (pathname) => {
      expect(isChatbotHidden(pathname)).toBe(true);
    },
  );

  it.each(["/", "/my-documents", "/marketplace", "/sign-in-help"])(
    "shows on %s",
    (pathname) => {
      expect(isChatbotHidden(pathname)).toBe(false);
    },
  );
});

describe("getStarterIntentIds", () => {
  it("asks visitors the pre-sign-up questions, whatever the page", () => {
    expect(
      getStarterIntentIds({
        pathname: "/my-documents",
        sharingEnabled: true,
        signedIn: false,
      }),
    ).toEqual(["about", "create-invoice", "plans"]);
  });

  it("fits the page for signed-in users", () => {
    const starters = (pathname: string) =>
      getStarterIntentIds({ pathname, sharingEnabled: false, signedIn: true });

    expect(starters("/my-documents")).toContain("download-pdf");
    expect(starters("/my-templates")).toContain("templates");
    expect(starters("/my-clients")).toContain("clients");
    expect(starters("/subscription")).toContain("plans");
    expect(starters("/dashboard")).toEqual([
      "create-invoice",
      "download-pdf",
      "templates",
    ]);
  });

  it("only offers signing while sharing is on", () => {
    expect(
      getStarterIntentIds({
        pathname: "/my-documents",
        sharingEnabled: true,
        signedIn: true,
      }),
    ).toContain("sign-document");
    expect(
      getStarterIntentIds({
        pathname: "/my-documents",
        sharingEnabled: false,
        signedIn: true,
      }),
    ).not.toContain("sign-document");
  });

  it("only returns intents that exist", () => {
    const ids = new Set(
      buildChatIntents({ sharingEnabled: true }).map((intent) => intent.id),
    );
    const pathnames = [
      "/",
      "/dashboard",
      "/my-documents",
      "/marketplace",
      "/my-templates",
      "/my-clients",
      "/subscription",
      "/settings",
    ];

    for (const pathname of pathnames) {
      for (const signedIn of [true, false]) {
        for (const id of getStarterIntentIds({
          pathname,
          sharingEnabled: true,
          signedIn,
        })) {
          expect(ids).toContain(id);
        }
      }
    }
  });
});
