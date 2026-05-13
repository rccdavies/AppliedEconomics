/** Stable across Node SSR and browsers — avoids hydration mismatches from default locale. */
const instantFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "UTC",
});

export function formatInstantUtc(iso: string): string {
  return `${instantFormatter.format(new Date(iso))} UTC`;
}
