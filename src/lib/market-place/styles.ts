import type { TemplateStyle } from "@/types/template";

export const classic: TemplateStyle = {
  description: "Clean, traditional layout with clearly separated sections.",
  id: "classic",
  name: "Classic",
  tier: "free",
};

export const modern: TemplateStyle = {
  description: "Bold headers and accent blocks for a confident, branded look.",
  id: "modern",
  name: "Modern",
  tier: "silver",
};

export const minimal: TemplateStyle = {
  description: "Spacious, understated typography for a premium feel.",
  id: "minimal",
  name: "Minimal",
  tier: "gold",
};

export const templateStyles: TemplateStyle[] = [classic, modern, minimal];
