import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { SupabaseSetupNotice } from "@/components/ui/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="hidden flex-1 border-r border-slate-200 bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-lg font-semibold">Cigarette POS</p>
          <h1 className="mt-10 max-w-xl text-4xl font-semibold leading-tight">
            Track every purchase, sale, expense, and peso of profit.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            A private control panel for a personal reselling workflow.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Built for one owner, one inventory, and clear business numbers.
        </p>
      </section>

      <section className="flex min-h-screen flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Private workspace</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Sign in to Cigarette POS
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Public registration is intentionally omitted for this personal admin
            app.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
