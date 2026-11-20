import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("combina clases", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("resuelve conflictos de Tailwind quedándose con la última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignora valores falsy", () => {
    const isHidden = false;
    expect(cn("block", isHidden && "hidden", undefined, null)).toBe("block");
  });
});
