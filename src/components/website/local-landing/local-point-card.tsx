import { cn } from "@/lib/utils";

export interface LocalPointCardProps {
  /** One or two sentences. */
  body: string;
  className?: string;
  /** The point's tile colour, e.g. `bg-play-blue`. */
  tone: string;
  title: string;
}

/**
 * One "why it fits here" point on a `LocalLanding` page: a tinted card with a
 * short heading and a sentence. Plain on purpose; the copy carries it.
 */
export const LocalPointCard = ({
  body,
  className,
  title,
  tone,
}: LocalPointCardProps) => (
  <li
    className={cn(
      "local-point-card website-reveal rounded-box p-6 text-nox-noir",
      tone,
      className,
    )}
  >
    <h3 className="font-title text-xl font-bold">{title}</h3>
    <p className="mt-2 text-base leading-7 text-nox-noir/75">{body}</p>
  </li>
);

export default LocalPointCard;
