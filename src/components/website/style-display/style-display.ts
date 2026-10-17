const styleAccents = [
  "bg-play-blue",
  "bg-play-purple",
  "bg-golden-harvest",
  "bg-play-teal",
];

/** Stage color for the nth template style; colors repeat once styles outnumber them. */
export const getStyleAccent = (index: number) =>
  styleAccents[index % styleAccents.length];

export const getStyleLabel = (styleId: string) =>
  styleId[0].toUpperCase() + styleId.slice(1);
