import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SiteHeaderProps {
  action?: React.ReactNode;
}

export function SiteHeader({ action }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="group inline-flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 transition group-hover:text-teal-700 dark:text-stone-50 dark:group-hover:text-teal-300">
          Talko
        </span>
        <span className="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">
          English practice
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {action}
        <ThemeToggle />
      </div>
    </header>
  );
}

export function SiteNavPill({
  href,
  children,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const className =
    "inline-flex items-center rounded-full border border-stone-900/15 bg-white/70 px-4 py-2 text-sm font-medium text-stone-800 backdrop-blur-sm transition hover:border-stone-900/30 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/25 dark:hover:bg-white/10";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-[var(--page-border)] bg-[var(--page-surface)]/90 py-5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-6 sm:flex-row sm:gap-6">
        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          Live English practice · peer-to-peer audio · private 1-on-1 calls
        </p>
        <Link
          href="/guide"
          className="text-sm font-medium text-stone-600 underline-offset-4 transition hover:text-stone-900 hover:underline dark:text-stone-400 dark:hover:text-stone-100"
        >
          How it works
        </Link>
      </div>
    </footer>
  );
}
