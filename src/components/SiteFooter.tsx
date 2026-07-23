import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "/practice", label: "Start practicing" },
  { href: "/guide", label: "How it works" },
  { href: "/settings", label: "Settings" },
] as const;

const principles = [
  "Live 1-on-1 audio",
  "Peer-to-peer & private",
  "No account required",
] as const;

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-[var(--page-border)] bg-[var(--page-surface)]">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-14 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-3">
              <Image
                src="/icon.png"
                alt=""
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 transition group-hover:text-teal-700 dark:text-stone-50 dark:group-hover:text-teal-300">
                Talko
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Practice any language with real people in live audio calls. Find a
              partner instantly, or choose someone already online.
            </p>
          </div>

          <div className="sm:justify-self-end lg:col-span-3 lg:justify-self-start lg:pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-stone-700 transition hover:text-teal-700 dark:text-stone-300 dark:hover:text-teal-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
              Built for speaking
            </p>
            <ul className="mt-4 space-y-2.5">
              {principles.map((item) => (
                <li
                  key={item}
                  className="text-sm text-stone-600 dark:text-stone-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--page-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-400 dark:text-stone-500">
            © {new Date().getFullYear()} Talko
          </p>
          <p className="text-sm text-stone-400 dark:text-stone-500">
            Microphone required · works best with headphones
          </p>
        </div>
      </div>
    </footer>
  );
}
