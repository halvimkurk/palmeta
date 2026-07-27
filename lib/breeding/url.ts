export type BreedingMode = "predict" | "target";

export function parseBreedingMode(params: {
  child?: string | null;
  mode?: string | null;
}): BreedingMode {
  if (params.child) return "target";
  if (params.mode === "target") return "target";
  return "predict";
}
