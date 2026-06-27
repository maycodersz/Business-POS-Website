import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getRequiredUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
