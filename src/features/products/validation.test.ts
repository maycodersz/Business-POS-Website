import { describe, expect, it } from "vitest";

import { productFormSchema } from "./validation";

describe("productFormSchema", () => {
  it("normalizes optional initial variants while adding a product", () => {
    const parsed = productFormSchema.safeParse({
      name: "  Wireless Mouse  ",
      description: "  2.4GHz mouse  ",
      initial_variant_names: ["  Black  ", " Red ", ""],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data).toEqual({
      name: "Wireless Mouse",
      description: "2.4GHz mouse",
      initial_variant_names: ["Black", "Red"],
    });
  });

  it("normalizes missing initial variants to an empty list", () => {
    const parsed = productFormSchema.safeParse({
      name: "Wireless Mouse",
      description: "",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data.initial_variant_names).toEqual([]);
  });
});
