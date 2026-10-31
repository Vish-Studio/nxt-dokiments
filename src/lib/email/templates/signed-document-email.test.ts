import { createElement } from "react";

import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import {
  SignedDocumentEmail,
  signedDocumentEmailSubject,
} from "./signed-document-email";

const props = {
  documentName: "Service agreement",
  signedAtLabel: "31 Oct 2026, 21:30 UTC",
  signerName: "Bob Smith",
  url: "https://example.com/my-documents/shared/abc",
};

describe("SignedDocumentEmail", () => {
  it("says who signed what and when, with a link to the shared copy", async () => {
    const html = await render(createElement(SignedDocumentEmail, props));

    expect(html).toContain("Bob Smith signed your document");
    expect(html).toContain("Service agreement");
    expect(html).toContain("31 Oct 2026, 21:30 UTC");
    expect(html).toContain("Open document");
    expect(html).toContain(
      'href="https://example.com/my-documents/shared/abc"',
    );
  });

  it("escapes markup in the signer and document names", async () => {
    const html = await render(
      createElement(SignedDocumentEmail, {
        ...props,
        documentName: "<b>Pwned</b>",
        signerName: "<script>x</script>",
      }),
    );

    expect(html).not.toContain("<script>x</script>");
    expect(html).not.toContain("<b>Pwned</b>");
    expect(html).toContain("&lt;b&gt;Pwned&lt;/b&gt;");
  });
});

describe("signedDocumentEmailSubject", () => {
  it("names the signer and the document", () => {
    expect(signedDocumentEmailSubject(props)).toBe(
      'Bob Smith signed "Service agreement"',
    );
  });
});
