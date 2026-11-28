import { describe, expect, it } from "vitest";

import {
  type BannerSlide,
  bannerDestinations,
  createBannerSlide,
  getSlideStatus,
  moveSlide,
  toDayKey,
  validateBannerSlide,
  visibleBannerPoints,
} from "./banner-slide";

const TODAY = "2026-11-28";

const slide = (overrides: Partial<BannerSlide> = {}): BannerSlide => ({
  ...createBannerSlide("s1", 0),
  detail: "One short sentence.",
  state: "published",
  title: "A clear benefit.",
  ...overrides,
});

describe("getSlideStatus", () => {
  it("keeps a draft a draft whatever its dates", () => {
    expect(getSlideStatus(slide({ showFrom: "2026-01-01", state: "draft" }), TODAY)).toBe("draft");
  });

  it("is live with no dates", () => {
    expect(getSlideStatus(slide(), TODAY)).toBe("live");
  });

  it("is scheduled before its first day and live on it", () => {
    expect(getSlideStatus(slide({ showFrom: "2026-11-29" }), TODAY)).toBe("scheduled");
    expect(getSlideStatus(slide({ showFrom: TODAY }), TODAY)).toBe("live");
  });

  it("is still live on its last day and ended after it", () => {
    expect(getSlideStatus(slide({ showUntil: TODAY }), TODAY)).toBe("live");
    expect(getSlideStatus(slide({ showUntil: "2026-11-27" }), TODAY)).toBe("ended");
  });
});

describe("visibleBannerPoints", () => {
  it("drops blanks and trims the rest", () => {
    expect(visibleBannerPoints(["  Clean PDF ", "", "   "])).toEqual(["Clean PDF"]);
  });

  it("drops repeats so list keys never collide", () => {
    expect(visibleBannerPoints(["Clean PDF", "Clean PDF "])).toEqual(["Clean PDF"]);
  });

  it("shows at most three points", () => {
    expect(visibleBannerPoints(["a", "b", "c", "d"])).toEqual(["a", "b", "c"]);
  });
});

describe("validateBannerSlide", () => {
  it("accepts a complete slide", () => {
    expect(validateBannerSlide(slide())).toEqual({});
  });

  it("asks for a title", () => {
    expect(validateBannerSlide(slide({ title: "   " })).title).toBe("Add a title.");
  });

  it("refuses a title too long for the slide", () => {
    expect(validateBannerSlide(slide({ title: "x".repeat(61) })).title).toMatch(/under 60/);
  });

  it("only lets the button open a page from the list", () => {
    expect(validateBannerSlide(slide({ actionHref: "https://example.com" })).actionHref).toBeDefined();
    expect(validateBannerSlide(slide({ actionHref: bannerDestinations[3].href })).actionHref).toBeUndefined();
  });

  it("refuses a last day before the first", () => {
    expect(validateBannerSlide(slide({ showFrom: "2026-12-10", showUntil: "2026-12-01" })).showUntil).toBeDefined();
  });

  it("refuses a list item too long for one line", () => {
    expect(validateBannerSlide(slide({ points: ["x".repeat(29)] })).points).toBeDefined();
  });
});

describe("moveSlide", () => {
  const slides = [
    slide({ id: "a" }),
    slide({ id: "draft", state: "draft" }),
    slide({ id: "b" }),
    slide({ id: "c" }),
  ];

  it("moves a live slide past a draft to the previous live one", () => {
    expect(moveSlide(slides, "b", -1, TODAY).map((s) => s.id)).toEqual(["b", "draft", "a", "c"]);
  });

  it("leaves the order alone when the slide is already first", () => {
    expect(moveSlide(slides, "a", -1, TODAY).map((s) => s.id)).toEqual(["a", "draft", "b", "c"]);
  });

  it("does not change the array it was given", () => {
    moveSlide(slides, "c", -1, TODAY);
    expect(slides.map((s) => s.id)).toEqual(["a", "draft", "b", "c"]);
  });
});

describe("createBannerSlide", () => {
  it("starts as a draft that opens the Marketplace", () => {
    const created = createBannerSlide("new", 0);
    expect(created.state).toBe("draft");
    expect(created.actionHref).toBe(bannerDestinations[0].href);
  });
});

describe("toDayKey", () => {
  it("pads the month and day", () => {
    expect(toDayKey(new Date(2026, 0, 5, 12).getTime())).toBe("2026-01-05");
  });
});
