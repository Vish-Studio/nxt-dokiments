export interface ProfileFeedbackBannerProps {
  feedback: {
    message: string;
    tone: "error" | "success";
  } | null;
}

export const ProfileFeedbackBanner = ({ feedback }: ProfileFeedbackBannerProps) => {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.tone === "success"
          ? "profile-feedback-banner rounded-box bg-success/10 px-4 py-3 text-sm text-success"
          : "profile-feedback-banner rounded-box bg-error/10 px-4 py-3 text-sm text-error"
      }
      role="status"
    >
      {feedback.message}
    </div>
  );
};
