import { describe, expect, it } from "vitest";
import {
  findSavedTeamMatching,
  slotsToTeam,
  teamToSlots,
  type SavedTeam,
} from "@/lib/teams/savedStore";

describe("saved teams helpers", () => {
  it("preserves empty middle slots", () => {
    const slots = ["gobfin", null, "anubis", null, "jetragon"];
    expect(slotsToTeam(slots)).toEqual(["gobfin", "", "anubis", "", "jetragon"]);
    expect(teamToSlots(slotsToTeam(slots))).toEqual(slots);
  });

  it("matches saved team by slot order", () => {
    const teams: SavedTeam[] = [
      {
        id: "1",
        name: "Boss",
        team: ["gobfin", "anubis", "", "", ""],
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(
      findSavedTeamMatching(teams, ["gobfin", "anubis", null, null, null])?.id,
    ).toBe("1");
    expect(
      findSavedTeamMatching(teams, ["gobfin", null, "anubis", null, null]),
    ).toBeUndefined();
  });
});
