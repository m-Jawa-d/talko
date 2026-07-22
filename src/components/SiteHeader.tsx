import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export { SiteFooter } from "@/components/SiteFooter";

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
          Language practice
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
