import { TEAM_SIZE } from "@/lib/teams/types";

/** Encode up to 5 slugs into shareable `team` query value. */
export function encodeTeamParam(slugs: (string | null)[]): string {
  const padded = Array.from({ length: TEAM_SIZE }, (_, i) => slugs[i] ?? "");
  return padded.join(",");
}

/** Parse `?team=a,b,,c,d` into 5 slots (null = empty). */
export function parseTeamParam(raw: string | null | undefined): (string | null)[] {
  const slots: (string | null)[] = Array.from({ length: TEAM_SIZE }, () => null);
  if (!raw?.trim()) return slots;
  const parts = raw.split(",").map((s) => s.trim().toLowerCase());
  for (let i = 0; i < TEAM_SIZE; i++) {
    const part = parts[i];
    slots[i] = part ? part : null;
  }
  return slots;
}

export function teamParamEquals(
  a: (string | null)[],
  b: (string | null)[],
): boolean {
  for (let i = 0; i < TEAM_SIZE; i++) {
    if ((a[i] ?? null) !== (b[i] ?? null)) return false;
  }
  return true;
}
