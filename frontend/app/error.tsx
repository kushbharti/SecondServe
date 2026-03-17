'use client';

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred while loading this page. Refresh to try
            again. In a production deployment, this would also be logged for
            further investigation.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}

