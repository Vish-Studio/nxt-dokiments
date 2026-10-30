# Transactional email

Email is sent through [Resend](https://resend.com). `src/lib/email/` is the only place that knows about it, so features call one function and never touch the provider.

| File | Role |
| --- | --- |
| `config.ts` | Reads env vars and resolves the mode (below). `hasEmailConfig()` is the guard. |
| `send-email.ts` | `sendEmail({ to, subject, react, idempotencyKey?, replyTo? })`. The only module importing `resend`. |
| `templates/email-layout.tsx` | Shared shell (logo header, heading, body, optional button, footer). Inline styles only. |

## Environment variables

All are server-only. Never prefix them with `NEXT_PUBLIC_`.

| Variable | Notes |
| --- | --- |
| `RESEND_API_KEY` | Send-only key limited to the sending domain. Mark it **Sensitive** in Vercel and use a different key for Production and Preview. |
| `EMAIL_FROM` | `Name <address>` on the verified domain. Defaults to `Dokiments <notifications@mail.dokiments.com>`. |
| `EMAIL_REPLY_TO` | Optional. A monitored inbox. The sending subdomain cannot receive mail. |
| `EMAIL_PREVIEW_ALLOW_LIST` | Comma-separated recipients allowed outside Production. Leave unset in Production. |

Local `.env.local` (quote `EMAIL_FROM` because of the spaces and angle brackets):

```bash
RESEND_API_KEY=re_xxxxxxxx          # the Preview/dev key, never the Production one
EMAIL_FROM="Dokiments <notifications@mail.dokiments.com>"
EMAIL_REPLY_TO=support@dokiments.com
EMAIL_PREVIEW_ALLOW_LIST=you@example.com,teammate@example.com,delivered@resend.dev
```

In Vercel, enter the values without quotes. Only `RESEND_API_KEY` is **Sensitive**. Set `EMAIL_PREVIEW_ALLOW_LIST` for Preview only.

## Modes

| Mode | When | Behaviour |
| --- | --- | --- |
| `disabled` | No `RESEND_API_KEY` | Nothing is sent, and a log line says so. The app keeps working. |
| `restricted` | Key set and `VERCEL_ENV` is not `production` (Preview, local) | Only recipients on `EMAIL_PREVIEW_ALLOW_LIST` are sent. Everyone else is blocked, so a test can never email a real user. |
| `live` | Key set and `VERCEL_ENV=production` | Sends to any recipient. The allow-list is ignored. |

## `sendEmail` contract

```ts
type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement; // rendered to HTML and plain text
  idempotencyKey?: string; // the same key is delivered once
  replyTo?: string; // overrides EMAIL_REPLY_TO for this message
};

type SendEmailResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "disabled" | "blocked" | "invalid-recipient" | "provider-error";
    };
```

It never throws. A caller decides what a failed send means, and it must not fail the request that triggered the email. It logs only a masked recipient (`j***@example.com`).

| `reason` | Cause | Typical handling |
| --- | --- | --- |
| `disabled` | No `RESEND_API_KEY`. | Ignore. Email is switched off here. |
| `blocked` | Not on `EMAIL_PREVIEW_ALLOW_LIST` outside Production. | Ignore. This is the safety net working. |
| `invalid-recipient` | The address is malformed. | Ignore, or surface a validation error earlier. |
| `provider-error` | Resend rejected the call or the network failed. | Log. Do not retry in a loop, and let the idempotency key cover a retry. |

### Sending from a route

Send after the response so the user never waits on the provider. Next's `after()` keeps the function alive until the send finishes.

```ts
import { after } from "next/server";
import { createElement } from "react";

import { sendEmail } from "@/lib/email/send-email";
import { SharedDocumentEmail } from "@/lib/email/templates/shared-document-email";

after(async () => {
  const result = await sendEmail({
    to: recipientEmail,
    subject: `${senderName} shared a document with you`,
    react: createElement(SharedDocumentEmail, { senderName, url }),
    idempotencyKey: `share-${shareId}-${recipientEmail}-${lastSharedAt}`,
  });

  if (!result.ok && result.reason === "provider-error") {
    console.error("[share] email failed", { shareId });
  }
});
```

`SharedDocumentEmail` is illustrative; it arrives with the share email story.

### The idempotency key

Build it from what makes the email logically unique, never from a timestamp taken at send time. A retried request then reuses the key and Resend delivers once, while a genuine re-share (new `lastSharedAt`) gets a new key and sends again.

## Writing a template

Build it on `EmailLayout` and keep to what mail clients support:

- Inline styles only. The font stack is Urbanist (loaded via a Google Fonts link where supported) with an Arial fallback.
- No SVG for the logo, as many clients block it. The layout uses the hosted PNG `/icons/icon-192.png` on a gold tile, served from the public site origin (production when `NEXT_PUBLIC_SITE_URL` is localhost).
- The layout sets `color-scheme: light` so clients don't invert colours automatically.
- Absolute URLs built from `siteUrl` (`src/lib/seo/site.ts`).

```tsx
import { Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

export interface SharedDocumentEmailProps {
  senderName: string;
  url: string;
}

export const SharedDocumentEmail = ({
  senderName,
  url,
}: SharedDocumentEmailProps) => (
  <EmailLayout
    preview={`${senderName} shared a document with you`}
    heading="A document is waiting for your signature"
    action={{ label: "Open document", href: url }}
  >
    <Text>{senderName} shared a document with you on Dokiments.</Text>
  </EmailLayout>
);
```

`EmailLayout` props:

| Prop | Required | Purpose |
| --- | --- | --- |
| `preview` | Yes | Inbox preview text shown next to the subject. |
| `heading` | Yes | Title at the top of the message. |
| `children` | No | Body content. Use `Text` from `@react-email/components` for paragraphs. |
| `action` | No | `{ label, href }`, rendered as a button under the body. |

## Resend setup (one time)

1. Add the domain `mail.dokiments.com` in Resend (region North Virginia). Leave **Enable receiving** off and untick click and open tracking.
2. Publish the DNS records Resend lists (DKIM, SPF and MX on the `send` name), plus a `_dmarc` TXT of `v=DMARC1; p=none;`, and wait for **Verified**.
3. Create two API keys with **Sending access** limited to that domain, one for Production and one for Preview and local.
4. Set the variables above in Vercel per environment, then redeploy. Env changes apply only to new deployments.
5. Send a test message and check the headers show SPF, DKIM and DMARC all passing.

```bash
export RESEND_API_KEY="re_..."   # the Preview/dev key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Dokiments <notifications@mail.dokiments.com>","to":["you@example.com"],"subject":"Resend test","text":"It works."}'
unset RESEND_API_KEY
```

A response containing an `id` means it was accepted. In Gmail, **Show original** lists the SPF, DKIM and DMARC results.

Resend's `delivered@resend.dev`, `bounced@resend.dev` and `complained@resend.dev` are safe test recipients.

### Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Domain stuck on **Pending** | A record name has the domain doubled (`resend._domainkey.mail.dokiments.com.dokiments.com`), or the value has stray quotes. On Cloudflare, records must be **DNS only**. |
| `403` domain not verified | The `from` address is not on the verified domain. |
| Lands in spam | DNS still propagating, or a second SPF record exists on the same name. |
| No email in Preview, and a `blocked` log line | The recipient is not in `EMAIL_PREVIEW_ALLOW_LIST`. |
| No email and a `disabled` log line | `RESEND_API_KEY` is missing in that environment, or the deployment predates the variable. |

## Limits

The Resend free plan allows 100 emails per day and 3,000 per month. Callers that send on user actions need their own rate limiting; that is part of the share email story.

## Testing

Node tests live next to the code (`*.test.ts`, which is what the Node project matches) and mock `resend`. They cover the three modes, the allow-list, idempotency pass-through and the layout.

```bash
npx vitest run --project node src/lib/email
```

Tests that exercise a feature calling `sendEmail` should mock our wrapper, not Resend:

```ts
const sendEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/email/send-email", () => ({ sendEmail: sendEmailMock }));

sendEmailMock.mockResolvedValue({ ok: true, id: "email_1" });
// ...run the feature, then:
expect(sendEmailMock).toHaveBeenCalledWith(
  expect.objectContaining({ to: "jane@example.com" }),
);
```

Test files that render a template must be `.ts` (the Node project does not match `.tsx`), so build elements with `createElement`:

```ts
import { render } from "@react-email/render";
import { createElement } from "react";

const html = await render(createElement(EmailLayout, { preview: "p", heading: "h" }));
```
