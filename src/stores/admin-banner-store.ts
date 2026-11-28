import { create } from "zustand";

import { type BannerSlide, moveSlide, toDayKey } from "@/lib/admin/marketplace-banner/banner-slide";
import { listSampleBannerSlides } from "@/lib/admin/marketplace-banner/dummy-data";

type AdminBannerState = {
  /** Copies a slide as a new draft placed right after it, and returns the copy's ID. */
  duplicateSlide: (id: string) => string | undefined;
  /** Moves a slide one place within its status group (see `moveSlide`). */
  moveSlide: (id: string, direction: -1 | 1) => void;
  removeSlide: (id: string) => void;
  /** Adds a slide, or replaces the one with the same ID, stamping `updatedAt`. */
  saveSlide: (slide: BannerSlide) => void;
  /** Every slide, in rotation order. */
  slides: BannerSlide[];
};

let copyNumber = 1;

/**
 * The Marketplace banner's slides while the admin portal is open.
 *
 * A store rather than component state because two pages share it: the slides
 * list and the slide editor (`/admin/marketplace-banner/[id]`). It starts from
 * the sample slides and lives for the browser session only, until the banner is
 * stored in Firestore; then these actions become API calls and this becomes a
 * TanStack Query cache, as the rest of the portal's data is.
 */
export const useAdminBannerStore = create<AdminBannerState>((set, get) => ({
  duplicateSlide: (id) => {
    const slides = get().slides;
    const index = slides.findIndex((slide) => slide.id === id);
    if (index === -1) return undefined;

    const copy: BannerSlide = {
      ...slides[index],
      id: `${id}-copy-${copyNumber++}`,
      points: [...slides[index].points],
      state: "draft",
      title: `${slides[index].title} (copy)`.slice(0, 60),
      updatedAt: Date.now(),
    };
    set({ slides: [...slides.slice(0, index + 1), copy, ...slides.slice(index + 1)] });
    return copy.id;
  },
  moveSlide: (id, direction) =>
    set((state) => ({ slides: moveSlide(state.slides, id, direction, toDayKey()) })),
  removeSlide: (id) => set((state) => ({ slides: state.slides.filter((slide) => slide.id !== id) })),
  saveSlide: (slide) =>
    set((state) => {
      const saved = { ...slide, updatedAt: Date.now() };
      const exists = state.slides.some((item) => item.id === slide.id);

      return {
        slides: exists
          ? state.slides.map((item) => (item.id === slide.id ? saved : item))
          : [...state.slides, saved],
      };
    }),
  slides: listSampleBannerSlides(),
}));
