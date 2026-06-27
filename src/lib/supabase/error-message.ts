type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

const constraintMessages: Record<string, string> = {
  products_owner_id_name_key: "You already have a product with this name.",
  product_variants_product_id_variant_name_key:
    "This product already has a variant with this name.",
  suppliers_owner_id_name_key: "You already have a supplier with this name.",
};

function constraintName(message: string) {
  return message.match(/constraint "([^"]+)"/)?.[1] ?? null;
}

export function friendlySupabaseError(
  error: SupabaseErrorLike | null | undefined,
  fallback = "Something went wrong. Please try again.",
) {
  const message = error?.message ?? "";
  const constraint = constraintName(message);

  if (constraint && constraintMessages[constraint]) {
    return constraintMessages[constraint];
  }

  if (error?.code === "23505" || message.includes("duplicate key value")) {
    return "This already exists. Use a different name.";
  }

  if (error?.code === "23503" || message.includes("foreign key constraint")) {
    return "This record is linked to other data and cannot be changed that way.";
  }

  if (error?.code === "23514" || message.includes("check constraint")) {
    return "One of the values is outside the allowed range.";
  }

  if (error?.code === "42501" || message.includes("permission denied")) {
    return "You do not have permission to do that.";
  }

  if (message.includes("Not enough stock")) {
    return "There is not enough stock for this action.";
  }

  if (message.includes("Could not find the function")) {
    return "This action is not available yet. Please refresh and try again.";
  }

  if (message.includes("JWT") || message.includes("not authenticated")) {
    return "Your session expired. Please sign in again.";
  }

  return fallback;
}
