"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { TEAM_SIZE } from "@/lib/teams/types";
import { teamParamEquals } from "@/lib/teams/url";

export type SavedTeam = {
  id: string;
  name: string;
  /** Up to 5 pal slugs; empty string = empty slot (order preserved). */
  team: string[];
  updatedAt: string;
};

type SavedTeamsState = {
  version: 1;
  teams: SavedTeam[];
  /** Client-only; not persisted. */
  _hasHydrated: boolean;
};

type SavedTeamsActions = {
  saveTeam: (name: string, slots: (string | null)[]) => SavedTeam | null;
  updateTeam: (id: string, slots: (string | null)[]) => void;
  renameTeam: (id: string, name: string) => void;
  deleteTeam: (id: string) => void;
};

type PersistedSavedTeams = Omit<SavedTeamsState, "_hasHydrated">;

export const MAX_SAVED_TEAMS = 12;
const STORAGE_KEY = "paldex-saved-teams-v1";
const LEGACY_STORAGE_KEYS = ["palforge-saved-teams-v1"] as const;

const initial: SavedTeamsState = {
  version: 1,
  teams: [],
  _hasHydrated: false,
};

const ssrSafeStorage: PersistStorage<PersistedSavedTeams> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      let raw = localStorage.getItem(name);
      if (!raw && name === STORAGE_KEY) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          raw = localStorage.getItem(legacyKey);
          if (raw) {
            localStorage.setItem(name, raw);
            localStorage.removeItem(legacyKey);
            break;
          }
        }
      }
      return raw
        ? (JSON.parse(raw) as { state: PersistedSavedTeams; version?: number })
        : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

function markHydrated() {
  useSavedTeamsStore.setState({ _hasHydrated: true });
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 40);
}

function slotsToTeam(slots: (string | null)[]): string[] {
  return Array.from({ length: TEAM_SIZE }, (_, i) => {
    const s = slots[i];
    return s ? s.toLowerCase() : "";
  });
}

function teamToSlots(team: string[]): (string | null)[] {
  return Array.from({ length: TEAM_SIZE }, (_, i) => {
    const s = team[i];
    return s ? s.toLowerCase() : null;
  });
}

function teamHasPals(team: string[]): boolean {
  return team.some((s) => Boolean(s));
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `team-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function findSavedTeamMatching(
  teams: SavedTeam[],
  slots: (string | null)[],
): SavedTeam | undefined {
  const normalized = teamToSlots(slotsToTeam(slots));
  return teams.find((t) => teamParamEquals(teamToSlots(t.team), normalized));
}

export const useSavedTeamsStore = create<SavedTeamsState & SavedTeamsActions>()(
  persist(
    (set, get) => ({
      ...initial,
      saveTeam: (name, slots) => {
        const trimmed = normalizeName(name);
        const team = slotsToTeam(slots);
        if (!trimmed || !teamHasPals(team)) return null;

        const existing = get().teams;
        if (existing.length >= MAX_SAVED_TEAMS) return null;

        const entry: SavedTeam = {
          id: newId(),
          name: trimmed,
          team,
          updatedAt: new Date().toISOString(),
        };
        set({ teams: [entry, ...existing] });
        return entry;
      },
      updateTeam: (id, slots) => {
        const team = slotsToTeam(slots);
        if (!teamHasPals(team)) return;
        set({
          teams: get().teams.map((t) =>
            t.id === id
              ? { ...t, team, updatedAt: new Date().toISOString() }
              : t,
          ),
        });
      },
      renameTeam: (id, name) => {
        const trimmed = normalizeName(name);
        if (!trimmed) return;
        set({
          teams: get().teams.map((t) =>
            t.id === id
              ? { ...t, name: trimmed, updatedAt: new Date().toISOString() }
              : t,
          ),
        });
      },
      deleteTeam: (id) => {
        set({ teams: get().teams.filter((t) => t.id !== id) });
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      storage: ssrSafeStorage,
      partialize: (state): PersistedSavedTeams => ({
        version: state.version,
        teams: state.teams,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn("[paldex] saved teams rehydrate failed", error);
        }
        markHydrated();
      },
    },
  ),
);

/** Kick off client rehydrate once (mirrors progress store). */
export function useSavedTeamsHydrated() {
  const hydrated = useSavedTeamsStore((s) => s._hasHydrated);

  useEffect(() => {
    const api = useSavedTeamsStore.persist;
    const finish = () => markHydrated();

    if (!api) {
      finish();
      return;
    }

    if (api.hasHydrated()) {
      finish();
      return;
    }

    const unsub = api.onFinishHydration(finish);
    void Promise.resolve(api.rehydrate()).catch(() => finish());

    const t = window.setTimeout(finish, 50);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  return hydrated;
}

export { teamToSlots, slotsToTeam };
