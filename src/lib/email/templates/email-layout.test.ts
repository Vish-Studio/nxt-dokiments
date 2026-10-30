import { createElement } from "react";

import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { EmailLayout } from "./email-layout";

describe("EmailLayout", () => {
  it("renders the heading, body, preview text and button", async () => {
    const html = await render(
      createElement(
        EmailLayout,
        {
          preview: "Jane shared a document",
          heading: "A document was shared with you",
          action: { label: "Open document", href: "https://example.com/x" },
        },
        "Body copy",
      ),
    );

    expect(html).toContain("A document was shared with you");
    expect(html).toContain("Body copy");
    expect(html).toContain("Jane shared a document");
    expect(html).toContain("Open document");
    expect(html).toContain('href="https://example.com/x"');
  });

  it("omits the button when there is no action", async () => {
    const html = await render(
      createElement(EmailLayout, { preview: "p", heading: "h" }),
    );

    // Only the footer link remains.
    expect(html.match(/<a /g)).toHaveLength(1);
  });

  it("shows the hosted PNG logo on a public origin", async () => {
    const html = await render(
      createElement(EmailLayout, { preview: "p", heading: "h" }),
    );

    expect(html).toMatch(/src="https:\/\/[^"]+\/icons\/icon-192\.png"/);
    expect(html).not.toContain("localhost");
  });
});
