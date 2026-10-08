import type { OnboardingStepData } from "./onboarding-steps";

export interface OnboardingStepProps
  extends Pick<OnboardingStepData, "description" | "points" | "title"> {
  /** Text above the title. */
  eyebrow: string;
  /** Id for the heading, so the dialog can be labelled by the current step. */
  titleId: string;
}

/**
 * The text side of one onboarding step, to the right of the image container like
 * the form column on the sign-in page.
 *
 * Three clearly separate levels, so the title never blends into the copy: a large
 * bold title, a darker lead sentence, then points with a bold label over a
 * lighter explanation.
 */
export const OnboardingStep = ({
  description,
  eyebrow,
  points,
  title,
  titleId,
}: OnboardingStepProps) => (
  <div className="onboarding-step">
    <div aria-live="polite">
      <p className="font-title text-xs font-bold uppercase tracking-wider text-nox-noir/50">
        {eyebrow}
      </p>
      <h2
        className="mt-4 font-title text-3xl leading-tight font-bold tracking-tight text-nox-noir md:text-4xl"
        id={titleId}
      >
        {title}
      </h2>
    </div>
    <p className="mt-3 text-base leading-7 text-nox-noir/75">{description}</p>

    <ol className="mt-6 grid gap-4">
      {points.map((point, index) => (
        <li
          className="flex items-start gap-3"
          key={point.title}
        >
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-nox-noir font-title text-xs font-bold text-white"
          >
            {index + 1}
          </span>
          <div>
            <p className="font-title text-base font-bold text-nox-noir">
              {point.title}
            </p>
            <p className="mt-0.5 text-sm leading-6 text-nox-noir/65">
              {point.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </div>
);
