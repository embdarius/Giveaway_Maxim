export const campaign = {
  id: "la-maxim-2026",
  venue: "La MAXIM",
  location: "Răstolțu Mare, Sălaj",
  maxGuests: 70,
  opensAt: "2026-11-02T00:00:00+02:00",
  closesAt: "2026-12-03T00:00:00+02:00",
  deadlineLabel: "2 decembrie 2026, ora 23:59",
  prizeDetail: "Premiul include folosirea cabanei și decor.",
  rulesVersion: "2026-11-02-v1",
  privacyVersion: "2026-11-02-v1",
} as const;

export function campaignStatus(
  now: number = Date.now(),
): "upcoming" | "open" | "closed" {
  if (now < Date.parse(campaign.opensAt)) return "upcoming";
  return now >= Date.parse(campaign.closesAt) ? "closed" : "open";
}

export function countdownParts(now: number) {
  const seconds = Math.max(
    0,
    Math.floor((Date.parse(campaign.closesAt) - now) / 1000),
  );
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}
