import { Terminal } from "lucide-react";

export function SupabaseSetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <Terminal className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">
          Supabase setup required
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add your Supabase project URL and anon key before using authentication.
          The project scaffold, layout, and routes are ready.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">
          NEXT_PUBLIC_SUPABASE_URL=your-project-url{"\n"}
          NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
        </pre>
      </section>
    </main>
  );
}
