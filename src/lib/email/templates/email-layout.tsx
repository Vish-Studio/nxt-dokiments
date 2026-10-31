import type { ReactNode } from "react";

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

import { siteName, siteUrl } from "@/lib/seo/site";

export interface EmailLayoutProps {
  /** Inbox preview text shown next to the subject. Keep it under ~90 characters. */
  preview: string;
  /** Title at the top of the message. */
  heading: string;
  /** Body content. Use `Text` from `@react-email/components` for paragraphs. */
  children?: ReactNode;
  /** Optional call to action, rendered as a button under the body. `href` must be absolute. */
  action?: { label: string; href: string };
}

/**
 * Origin used for the logo and footer link. Falls back to production when
 * `siteUrl` is localhost, because a recipient's mail client can't reach it.
 */
const publicOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(siteUrl)
  ? "https://www.dokiments.com"
  : siteUrl;

/** Hosted PNG of the "D" mark, from `public/icons`. Must stay publicly reachable. */
const logoSrc = `${publicOrigin}/icons/icon-192.png`;

/** Loads Urbanist (body) and Raleway (logo) where supported, e.g. Apple Mail and iOS Mail. */
const fontsHref =
  "https://fonts.googleapis.com/css2?family=Raleway:wght@900&family=Urbanist:wght@400;600;700&display=swap";

/** Urbanist like the app, with web-safe fallbacks for clients that ignore web fonts. */
const font = "Urbanist, Arial, Helvetica, sans-serif";
const logoFont = "Raleway, Arial, Helvetica, sans-serif";

/**
 * Inline style objects, because mail clients drop most `<style>` blocks and
 * classes. Colours mirror the app theme tokens in `globals.css`: `nox-noir`
 * `#141414`, `golden-harvest` `#ffd066` and base `#f6f6f6`.
 */
const styles = {
  body: {
    backgroundColor: "#f6f6f6",
    fontFamily: font,
    margin: 0,
    padding: "24px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "2px solid #141414",
    borderRadius: "12px",
    maxWidth: "560px",
    padding: "32px",
  },
  logoTile: {
    backgroundColor: "#ffd066",
    borderRadius: "10px",
    height: "44px",
    textAlign: "center",
    verticalAlign: "middle",
    width: "44px",
  },
  logoImage: {
    display: "inline-block",
    margin: "0 auto",
    verticalAlign: "middle",
  },
  wordmarkCell: {
    paddingLeft: "12px",
    verticalAlign: "middle",
  },
  wordmark: {
    color: "#141414",
    fontFamily: logoFont,
    fontSize: "22px",
    fontWeight: 900,
    lineHeight: "28px",
    margin: 0,
  },
  heading: {
    color: "#141414",
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "30px",
    margin: "28px 0 16px",
  },
  content: {
    color: "#141414",
    fontSize: "15px",
    lineHeight: "24px",
  },
  button: {
    backgroundColor: "#141414",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    padding: "12px 20px",
    textDecoration: "none",
  },
  footer: {
    color: "#6b6b6b",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "32px 0 0",
  },
  footerLink: {
    color: "#6b6b6b",
    textDecoration: "underline",
  },
} as const;

/**
 * Shared shell for every transactional email: logo header, heading, body,
 * optional button and footer. Build each email on this so they stay visually
 * consistent with the app (gold logo tile, Urbanist type, rounded `#141414`
 * primary button).
 *
 * Limits to respect, as mail clients are far less capable than browsers: inline
 * styles only, a hosted PNG (never SVG) for the logo, and absolute URLs. The
 * layout opts out of automatic dark-mode colour inversion so it renders as
 * designed; the gold tile keeps the black logo legible either way.
 *
 * @example
 * <EmailLayout
 *   preview="Jane shared a document with you"
 *   heading="A document is waiting for your signature"
 *   action={{ label: "Open document", href: `${siteUrl}/my-documents?tab=shared` }}
 * >
 *   <Text>Jane shared a document with you on Dokiments.</Text>
 * </EmailLayout>
 */
export const EmailLayout = ({
  preview,
  heading,
  children,
  action,
}: EmailLayoutProps) => (
  <Html lang="en">
    <Head>
      <meta
        name="color-scheme"
        content="light"
      />
      <meta
        name="supported-color-schemes"
        content="light"
      />
      <link
        href={fontsHref}
        rel="stylesheet"
      />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Row>
          <Column style={styles.logoTile}>
            <Img
              src={logoSrc}
              alt=""
              width={28}
              height={28}
              style={styles.logoImage}
            />
          </Column>
          <Column style={styles.wordmarkCell}>
            <Text style={styles.wordmark}>{siteName}</Text>
          </Column>
        </Row>
        <Text style={styles.heading}>{heading}</Text>
        <Section style={styles.content}>{children}</Section>
        {action ? (
          <Section style={{ margin: "24px 0 0" }}>
            <Button
              href={action.href}
              style={styles.button}
            >
              {action.label}
            </Button>
          </Section>
        ) : null}
        <Text style={styles.footer}>
          You received this email because of activity on your {siteName}{" "}
          account.{" "}
          <Link
            href={publicOrigin}
            style={styles.footerLink}
          >
            {new URL(publicOrigin).host}
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);
