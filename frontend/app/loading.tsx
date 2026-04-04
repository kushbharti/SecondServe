export default function RootLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
      <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        <p className="text-xs text-muted-foreground">
          Loading FoodRescue Connect…
        </p>
      </div>
    </div>
  );
}

