export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e3e8ef] bg-[#fbfcfd] p-4 transition-shadow hover:shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
