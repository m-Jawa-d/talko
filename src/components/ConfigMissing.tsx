import { AlertTriangle } from "lucide-react";

export function ConfigMissing() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-400/30 dark:bg-amber-400/10">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-50">
            Connect Supabase
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Add your project keys to{" "}
            <code className="text-stone-800 dark:text-stone-100">.env.local</code>{" "}
            (and Vercel env vars for deploy):
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-stone-700 ring-1 ring-stone-200 dark:bg-stone-950 dark:text-stone-300 dark:ring-white/10">
            {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
          </pre>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
            In Supabase → Project Settings → API. Realtime Presence + Broadcast
            need no database tables for this MVP.
          </p>
        </div>
      </div>
    </div>
  );
}
