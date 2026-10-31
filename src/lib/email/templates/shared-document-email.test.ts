import { createElement } from "react";

import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import {
  SharedDocumentEmail,
  sharedDocumentEmailSubject,
} from "./shared-document-email";

const props = {
  documentName: "Service agreement",
  senderName: "Jane Doe",
  url: "https://example.com/my-documents?tab=shared",
};

describe("SharedDocumentEmail", () => {
  it("announces a first share with a link to Shared with me", async () => {
    const html = await render(
      createElement(SharedDocumentEmail, { ...props, variant: "shared" }),
    );

    expect(html).toContain("Jane Doe shared a document with you");
    expect(html).toContain("Service agreement");
    expect(html).toContain("Open document");
    expect(html).toContain(
      'href="https://example.com/my-documents?tab=shared"',
    );
    expect(html).toContain("Create an account with this email address");
  });

  it("says the document was updated on a re-share", async () => {
    const html = await render(
      createElement(SharedDocumentEmail, { ...props, variant: "updated" }),
    );

    expect(html).toContain("Jane Doe updated a shared document");
    expect(html).toContain("made changes to");
    expect(html).not.toContain("shared a document with you");
  });

  it("escapes markup in the sender and document names", async () => {
    const html = await render(
      createElement(SharedDocumentEmail, {
        ...props,
        documentName: "<b>Pwned</b>",
        senderName: "<script>x</script>",
        variant: "shared",
      }),
    );

    expect(html).not.toContain("<script>x</script>");
    expect(html).not.toContain("<b>Pwned</b>");
    expect(html).toContain("&lt;b&gt;Pwned&lt;/b&gt;");
  });
});

describe("sharedDocumentEmailSubject", () => {
  it("words the subject per variant", () => {
    expect(sharedDocumentEmailSubject({ ...props, variant: "shared" })).toBe(
      'Jane Doe shared "Service agreement" with you',
    );
    expect(sharedDocumentEmailSubject({ ...props, variant: "updated" })).toBe(
      'Jane Doe updated "Service agreement"',
    );
  });
});
