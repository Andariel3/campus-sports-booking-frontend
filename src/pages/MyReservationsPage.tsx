import { PageHeading } from "@/components/layout/PageHeading";

export function MyReservationsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeading
        title="Rezervările mele"
        eyebrow="Activitate"
        subtitle="Consultă istoricul și gestionează rezervările tale viitoare."
      />
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-muted-foreground text-sm">Panoul de rezervări proprii este activ.</p>
      </div>
    </div>
  );
}

export default MyReservationsPage;
