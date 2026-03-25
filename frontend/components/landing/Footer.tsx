import Link from 'next/link';

export function LandingFooter() {
  return (
    <section className="border-t bg-background py-8">
      <div className="container flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            FoodRescue Connect (Demo)
          </p>
          <p className="max-w-md">
            A frontend-only MVP that demonstrates how technology can bridge the
            gap between surplus food and people who need it most.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Product
            </p>
            <Link href="/donor/dashboard" className="hover:text-foreground">
              Donor dashboard
            </Link>
            <Link href="/recipient/dashboard" className="hover:text-foreground">
              Recipient dashboard
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Company
            </p>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/impact" className="hover:text-foreground">
              Impact
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

