/**
 * Client-safe team helpers. Catalog JSON lives in `./catalog` (server-only).
 */
export {
  filterPals,
  getEffectTagOptions,
  getWorkOptions,
  parsePalSort,
  parseWorkId,
  sortPals,
  topWorks,
  type PalFilters,
  type PalSort,
} from "@/lib/teams/query";

export { aggregateTeamEffects, filterEffectsByTag } from "@/lib/teams/effects";
export { encodeTeamParam, parseTeamParam } from "@/lib/teams/url";
export {
  findSavedTeamMatching,
  MAX_SAVED_TEAMS,
  teamToSlots,
  useSavedTeamsHydrated,
  useSavedTeamsStore,
  type SavedTeam,
} from "@/lib/teams/savedStore";
export * from "@/lib/teams/types";
