import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
          404 · Page not found
        </p>
        <h1 className="text-2xl font-semibold md:text-3xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-sm text-muted-foreground">
          The link might be broken or the page may have moved. Use the landing
          page to navigate to donor or recipient dashboards.
        </p>
        <div className="flex justify-center gap-3 text-sm">
          <Link
            href="/"
            className="focus-visible-ring inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="focus-visible-ring inline-flex items-center justify-center rounded-full border border-primary/20 bg-background px-5 py-2 text-sm font-semibold text-primary hover:border-primary hover:bg-white"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}

