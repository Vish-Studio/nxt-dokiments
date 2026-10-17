import { cn } from "@/lib/utils";

export interface TestimonialAvatarProps {
  /** Background token, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  name: string;
  size?: "lg" | "md";
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const TestimonialAvatar = ({
  accent,
  className,
  name,
  size = "md",
}: TestimonialAvatarProps) => {
  return (
    <span
      aria-hidden
      className={cn(
        "testimonial-avatar flex shrink-0 items-center justify-center rounded-full font-title font-bold text-nox-noir",
        size === "lg" ? "size-14 text-lg" : "size-10 text-sm",
        accent,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
};
