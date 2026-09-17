export const PUBLIC_LAUNCH_BANNER_STORAGE_KEY =
  "dokiments-public-launch-banner-dismissed-v1";

export const readPublicLaunchBannerDismissed = (): boolean => {
  try {
    return (
      window.localStorage.getItem(PUBLIC_LAUNCH_BANNER_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
};

export const writePublicLaunchBannerDismissed = () => {
  window.localStorage.setItem(PUBLIC_LAUNCH_BANNER_STORAGE_KEY, "true");
};
