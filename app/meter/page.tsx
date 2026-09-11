import { Illustration } from "@/components/ui/illustration";
import { MeterDashboard } from "@/components/meter-dashboard";

export default function MeterPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
            {"FoX Live Meter"}
          </h1>
          <p className="max-w-md text-[var(--fg-muted)]">
            SLA-gated streaming settlement for live FX rate feeds: the meter only runs while
            the feed is objectively meeting its advertised latency and status SLA.
          </p>
        </div>
        <Illustration id="teamwork" className="h-32 w-32 shrink-0" />
      </section>

      <MeterDashboard />
    </main>
  );
}
