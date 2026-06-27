import { getRequiredUser } from "@/lib/auth/require-user";

export async function getSuppliers() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, facebook_link, messenger_link, notes, created_at")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
