import { describe, expect, it } from "vitest";

import { friendlySupabaseError } from "./error-message";

describe("friendlySupabaseError", () => {
  it("translates duplicate product names", () => {
    expect(
      friendlySupabaseError({
        code: "23505",
        message:
          'duplicate key value violates unique constraint "products_owner_id_name_key"',
      }),
    ).toBe("You already have a product with this name.");
  });

  it("translates duplicate product variants", () => {
    expect(
      friendlySupabaseError({
        code: "23505",
        message:
          'duplicate key value violates unique constraint "product_variants_product_id_variant_name_key"',
      }),
    ).toBe("This product already has a variant with this name.");
  });

  it("translates duplicate suppliers", () => {
    expect(
      friendlySupabaseError({
        code: "23505",
        message:
          'duplicate key value violates unique constraint "suppliers_owner_id_name_key"',
      }),
    ).toBe("You already have a supplier with this name.");
  });

  it("does not expose unknown database messages", () => {
    expect(
      friendlySupabaseError({
        message: "some database internals",
      }),
    ).toBe("Something went wrong. Please try again.");
  });

  it("translates linked-record delete errors", () => {
    expect(
      friendlySupabaseError({
        code: "23503",
        message:
          'update or delete on table "products" violates foreign key constraint "purchase_batches_product_id_fkey"',
      }),
    ).toBe("This record is linked to other data and cannot be changed that way.");
  });
});
