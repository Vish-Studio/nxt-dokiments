export type CookieConsentChoice = "all" | "necessary";

interface StoredCookieConsent {
  choice: CookieConsentChoice;
  savedAt: string;
  version: 1;
}

export const COOKIE_CONSENT_STORAGE_KEY = "dokiments-cookie-consent-v1";
export const OPEN_COOKIE_SETTINGS_EVENT = "dokiments:open-cookie-settings";

export const readCookieConsent = (): CookieConsentChoice | null => {
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const consent = JSON.parse(stored) as StoredCookieConsent;
    return consent.version === 1 ? consent.choice : null;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (choice: CookieConsentChoice) => {
  const consent: StoredCookieConsent = {
    choice,
    savedAt: new Date().toISOString(),
    version: 1,
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("dokiments:cookie-consent-changed", { detail: consent }));
};
