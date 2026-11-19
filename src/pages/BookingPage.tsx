import { useParams } from "react-router-dom";
import { PageHeading } from "@/components/layout/PageHeading";

export function BookingPage() {
  const { resourceId } = useParams();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeading
        title="Rezervare teren"
        eyebrow="Disponibilitate"
        subtitle={`Selectează data și intervalul orar dorit pentru facilitatea ${resourceId || ""}`}
      />
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-muted-foreground text-sm">Modulul de disponibilitate și rezervare este activ.</p>
      </div>
    </div>
  );
}

export default BookingPage;
