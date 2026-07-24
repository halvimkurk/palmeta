import type {
  AggregatedStack,
  AggregatedUniqueEffect,
  EffectTag,
  Pal,
  TeamEffects,
} from "@/lib/teams/types";

export function aggregateTeamEffects(pals: (Pal | null)[]): TeamEffects {
  const active = pals.filter((p): p is Pal => p != null);
  const stackMap = new Map<
    string,
    AggregatedStack & { tagSet: Set<EffectTag> }
  >();
  const uniques: AggregatedUniqueEffect[] = [];
  const tagSet = new Set<EffectTag>();

  for (const pal of active) {
    const skill = pal.partnerSkill;
    for (const t of skill.tags) tagSet.add(t);

    if (skill.stackGroup && skill.stackValue != null && skill.stackLabel) {
      const existing = stackMap.get(skill.stackGroup);
      if (existing) {
        existing.value += skill.stackValue;
        existing.sources.push(pal.name);
        for (const t of skill.tags) existing.tagSet.add(t);
      } else {
        stackMap.set(skill.stackGroup, {
          group: skill.stackGroup,
          label: skill.stackLabel,
          value: skill.stackValue,
          unit: skill.stackUnit ?? "",
          sources: [pal.name],
          tags: [...skill.tags],
          tagSet: new Set(skill.tags),
        });
      }
      continue;
    }

    uniques.push({
      palSlug: pal.slug,
      palName: pal.name,
      skillName: skill.name,
      description: skill.description,
      tags: skill.tags,
    });
  }

  const stacks: AggregatedStack[] = [...stackMap.values()].map(
    ({ tagSet: ts, ...rest }) => ({
      ...rest,
      tags: [...ts],
      label: rest.label.replace("{n}", String(rest.value)),
    }),
  );

  stacks.sort((a, b) => a.label.localeCompare(b.label));
  uniques.sort((a, b) => a.palName.localeCompare(b.palName));

  return {
    stacks,
    uniques,
    allTags: [...tagSet].sort(),
  };
}

export function filterEffectsByTag(
  effects: TeamEffects,
  tag: EffectTag | "all",
): TeamEffects {
  if (tag === "all") return effects;
  return {
    stacks: effects.stacks.filter((s) => s.tags.includes(tag)),
    uniques: effects.uniques.filter((u) => u.tags.includes(tag)),
    allTags: effects.allTags,
  };
}
