import { describe, expect, it } from "vitest";
import { parseBreedingMode } from "@/lib/breeding/url";

describe("parseBreedingMode", () => {
  it("defaults to predict", () => {
    expect(parseBreedingMode({})).toBe("predict");
  });

  it("uses child param as target mode", () => {
    expect(parseBreedingMode({ child: "anubis" })).toBe("target");
  });

  it("uses explicit mode=target without a child", () => {
    expect(parseBreedingMode({ mode: "target" })).toBe("target");
  });

  it("prefers child over mode", () => {
    expect(parseBreedingMode({ child: "anubis", mode: "predict" })).toBe("target");
  });
});
