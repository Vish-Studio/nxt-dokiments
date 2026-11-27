/**
 * The colour families a status can take. Each one means the same thing in
 * every list, so a status reads the same wherever it appears:
 * - `golden`: waiting on someone (awaiting signature, pending).
 * - `blue`: seen, still to act (viewed).
 * - `green`: done (signed).
 * - `teal`: came in to the user (received).
 * - `grey`: nothing in progress (not shared, revoked, not opened).
 */
export type StatusTone = "blue" | "golden" | "green" | "grey" | "teal";

/**
 * The tinted pill background per tone. Text is always nox-noir (grey: 70%),
 * because the pastel tints and `text-success` on its tint fail contrast
 * (2.79:1); the dot carries the colour instead.
 */
export const statusPillToneClassName: Record<StatusTone, string> = {
  blue: "bg-play-blue/35 text-nox-noir",
  golden: "bg-golden-harvest/35 text-nox-noir",
  green: "bg-success/15 text-nox-noir",
  grey: "bg-base-200 text-nox-noir/70",
  teal: "bg-play-teal/30 text-nox-noir",
};

/**
 * The grey tone's pill on a grey surface (e.g. the company page's
 * `bg-base-200` rows), where `bg-base-200` would leave no visible pill.
 */
export const statusPillGreyOnGreyClassName = "bg-base-100 text-nox-noir/70";

/**
 * The dot colour per tone. Grey uses nox-noir/40, not steel-mist, which is
 * almost invisible on white.
 */
export const statusDotToneClassName: Record<StatusTone, string> = {
  blue: "bg-play-blue",
  golden: "bg-golden-harvest",
  green: "bg-success",
  grey: "bg-nox-noir/40",
  teal: "bg-play-teal",
};
