export const NEWSLETTER_STATUS_STORAGE_KEY = "dokiments-newsletter-status-v1";

type NewsletterStatus = "dismissed" | "subscribed";

export const readNewsletterStatus = (): NewsletterStatus | null => {
  try {
    const status = window.localStorage.getItem(NEWSLETTER_STATUS_STORAGE_KEY);

    return status === "dismissed" || status === "subscribed" ? status : null;
  } catch {
    return null;
  }
};

export const writeNewsletterStatus = (status: NewsletterStatus) => {
  window.localStorage.setItem(NEWSLETTER_STATUS_STORAGE_KEY, status);
};
