import { buildPreferenceScorer } from "@/lib/clubPreferences";

describe("club preference scoring", () => {
  it("ranks clubs by their similarity to followed clubs", () => {
    const score = buildPreferenceScorer([{ categories: ["Music"] }, { categories: ["Music", "Academic"] }])!;

    expect(score({ categories: ["Music"] })).toBeGreaterThan(score({ categories: ["Academic"] }));
    expect(score({ categories: ["Academic"] })).toBeGreaterThan(score({ categories: ["Sports"] }));
    expect(score({ categories: ["Music", "Academic"] })).toBeCloseTo(0.9238795);
  });

  it("normalizes followed clubs and ignores duplicate tags", () => {
    const score = buildPreferenceScorer([
      { categories: ["Music", "Music"] },
      { categories: ["Academic", "Sports", "Service", "Arts"] },
    ])!;

    expect(score({ categories: ["Music"] })).toBeGreaterThan(score({ categories: ["Academic"] }));
    expect(score({ categories: ["Music", "Music"] })).toBeCloseTo(score({ categories: ["Music"] }));
  });

  it("separates category and affiliation dimensions and handles missing features", () => {
    const score = buildPreferenceScorer([{ categories: ["Music"] }])!;
    expect(score({ affiliations: ["Music"] })).toBe(0);
    expect(score({})).toBe(0);
    expect(buildPreferenceScorer([])).toBeNull();
    expect(buildPreferenceScorer([{}])).toBeNull();
  });
});
