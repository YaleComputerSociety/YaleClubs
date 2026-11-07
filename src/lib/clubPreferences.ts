type ClubFeatures = {
  categories?: readonly string[];
  affiliations?: readonly string[];
};

function features(club: ClubFeatures): string[] {
  return Array.from(
    new Set([
      ...(club.categories ?? []).map((value) => `category:${value}`),
      ...(club.affiliations ?? []).map((value) => `affiliation:${value}`),
    ]),
  );
}

/** Build a sparse user vector from normalized followed-club vectors. */
export function buildPreferenceScorer(followedClubs: ClubFeatures[]): ((club: ClubFeatures) => number) | null {
  const preferences = new Map<string, number>();

  for (const club of followedClubs) {
    const clubFeatures = features(club);
    if (clubFeatures.length === 0) continue;
    const weight = 1 / Math.sqrt(clubFeatures.length);
    for (const feature of clubFeatures) {
      preferences.set(feature, (preferences.get(feature) ?? 0) + weight);
    }
  }

  const magnitude = Math.hypot(...preferences.values());
  if (magnitude === 0) return null;

  return (club) => {
    const clubFeatures = features(club);
    if (clubFeatures.length === 0) return 0;
    const dotProduct = clubFeatures.reduce((sum, feature) => sum + (preferences.get(feature) ?? 0), 0);
    return dotProduct / (magnitude * Math.sqrt(clubFeatures.length));
  };
}
