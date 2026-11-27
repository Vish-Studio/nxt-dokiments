/** One link in the website's navigation. */
export type WebsiteNavItem = {
  /** A homepage section anchor (`/#workflow`), so it also works from other pages. */
  href: string;
  label: string;
};

/**
 * The header's links, shared by the desktop bar and the phone menu. Kept to
 * five short labels in the order the sections appear on the homepage, so the
 * bar never crowds the logo and auth buttons at `lg` (1024px). Secondary
 * sections (use cases, clients, mobile) are linked from the footer instead.
 */
export const headerNavItems: WebsiteNavItem[] = [
  { href: "/#workflow", label: "How it works" },
  { href: "/#overview", label: "Features" },
  { href: "/#cvs", label: "CVs" },
  { href: "/#marketplace", label: "Templates" },
  { href: "/#faq", label: "FAQ" },
];

/** The footer's "Product" column: every homepage section worth jumping to. */
export const footerProductLinks: WebsiteNavItem[] = [
  { href: "/#workflow", label: "How it works" },
  { href: "/#overview", label: "Features" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/#clients", label: "Clients" },
  { href: "/#cvs", label: "CVs for students" },
  { href: "/#marketplace", label: "Templates" },
  { href: "/#faq", label: "FAQ" },
  // A crawlable link to the local landing page, from every public page.
  { href: "/invoice-maker-mauritius", label: "Invoicing in Mauritius" },
];
