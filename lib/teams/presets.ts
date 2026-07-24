import presetsJson from "@/data/catalog/team-presets.json";
import type { TeamPreset } from "@/lib/teams/types";

const presets = presetsJson as TeamPreset[];

export function getTeamPresets(): TeamPreset[] {
  return presets;
}

export function getPresetById(id: string): TeamPreset | undefined {
  return presets.find((p) => p.id === id);
}
