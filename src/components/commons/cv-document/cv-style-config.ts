import type { TemplateStyleId } from "@/types/template";

export interface CvStyleConfig {
  avatar: string;
  barFill: string;
  barTrack: string;
  body: string;
  chip: string;
  contact: string;
  header: string;
  jobTitle: string;
  name: string;
  paper: string;
  period: string;
  sectionTitle: string;
}

// Horizontal insets match `templateInsetClassName` so the PDF footer lines up with the content.
export const cvStyleConfig: Record<TemplateStyleId, CvStyleConfig> = {
  brutalist: {
    avatar: "border-2 border-nox-noir bg-white text-nox-noir/40",
    barFill: "bg-nox-noir",
    barTrack: "h-3 border-2 border-nox-noir bg-white",
    body: "p-6",
    chip: "rounded-md border-2 border-nox-noir px-2 py-1 font-semibold",
    contact: "font-medium text-nox-noir",
    header: "border-b-2 border-nox-noir bg-play-pink px-6 py-6",
    jobTitle:
      "font-title text-sm font-black uppercase tracking-widest text-nox-noir",
    name: "font-title text-3xl font-black text-nox-noir",
    paper: "rounded-md border-2 border-nox-noir",
    period:
      "font-title text-[11px] font-black uppercase tracking-wide text-nox-noir/60",
    sectionTitle:
      "border-b-2 border-nox-noir pb-1 font-title text-sm font-black uppercase text-nox-noir",
  },
  classic: {
    avatar: "bg-base-200 text-nox-noir/30",
    barFill: "bg-nox-noir",
    barTrack: "h-1.5 bg-nox-noir/10",
    body: "px-8 pb-8 pt-6",
    chip: "rounded-field border border-steel-mist px-2 py-1",
    contact: "text-nox-noir/70",
    header: "border-b-2 border-nox-noir px-8 pb-6 pt-8",
    jobTitle: "font-title text-base font-semibold text-nox-noir/60",
    name: "font-title text-3xl font-bold text-nox-noir",
    paper: "rounded-box border border-steel-mist",
    period:
      "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    sectionTitle:
      "border-b border-steel-mist pb-1 font-title text-sm font-bold uppercase tracking-wide text-nox-noir",
  },
  minimalist: {
    avatar: "bg-base-200 text-nox-noir/25",
    barFill: "bg-nox-noir",
    barTrack: "h-0.5 bg-nox-noir/10",
    body: "px-10 pb-10 pt-6",
    chip: "rounded-field bg-base-200 px-2 py-1",
    contact: "text-nox-noir/60",
    header: "px-10 pb-6 pt-10",
    jobTitle:
      "font-title text-[11px] font-semibold uppercase tracking-[0.3em] text-nox-noir/40",
    name: "font-title text-4xl font-bold text-nox-noir",
    paper: "rounded-box border border-steel-mist",
    period:
      "font-title text-[11px] font-medium uppercase tracking-wider text-nox-noir/40",
    sectionTitle:
      "font-title text-[11px] font-semibold uppercase tracking-[0.3em] text-nox-noir/40",
  },
  modern: {
    avatar: "bg-white/10 text-white/50",
    barFill: "bg-golden-harvest",
    barTrack: "h-1.5 bg-nox-noir/10",
    body: "p-6",
    chip: "rounded-field bg-nox-noir px-2 py-1 text-white",
    contact: "text-white/80",
    header: "bg-nox-noir px-6 py-6 text-white",
    jobTitle:
      "font-title text-sm font-bold uppercase tracking-widest text-golden-harvest",
    name: "font-title text-3xl font-bold text-white",
    paper: "overflow-hidden rounded-box border border-steel-mist",
    period:
      "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    sectionTitle:
      "border-b-2 border-golden-harvest pb-1 font-title text-sm font-bold uppercase tracking-wide text-nox-noir",
  },
};
