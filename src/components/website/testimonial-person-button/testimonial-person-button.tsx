import { TestimonialAvatar } from "@/components/website/testimonial-avatar/testimonial-avatar";
import { cn } from "@/lib/utils";

export interface TestimonialPersonButtonProps {
  /** Background token for the avatar, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  isActive: boolean;
  name: string;
  /** Fires when the active person's autoplay progress bar completes. */
  onProgressEnd?: () => void;
  onSelect: () => void;
  role: string;
}

export const TestimonialPersonButton = ({
  accent,
  className,
  isActive,
  name,
  onProgressEnd,
  onSelect,
  role,
}: TestimonialPersonButtonProps) => {
  return (
    <button
      aria-label={`${name}, ${role}`}
      aria-pressed={isActive}
      className={cn(
        "testimonial-person-button relative flex min-w-56 shrink-0 items-center gap-4 rounded-box border p-3 text-left transition-colors motion-reduce:transition-none lg:min-w-0",
        isActive
          ? "border-transparent bg-white text-nox-noir"
          : "border-white/15 text-white hover:bg-white/10",
        className,
      )}
      onClick={onSelect}
      type="button"
    >
      <TestimonialAvatar
        accent={accent}
        name={name}
      />
      <span aria-hidden>
        <span className="block font-title text-base font-bold">{name}</span>
        <span
          className={cn(
            "block text-sm",
            isActive ? "text-nox-noir/65" : "text-white/60",
          )}
        >
          {role}
        </span>
      </span>
      {isActive ? (
        <span
          aria-hidden
          className="testimonial-progress absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-nox-noir/50"
          onAnimationEnd={onProgressEnd}
        />
      ) : null}
    </button>
  );
};
