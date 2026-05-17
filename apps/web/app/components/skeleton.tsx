export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["92%", "86%", "78%", "88%"];

  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{
            width: i === lines - 1 ? "60%" : widths[i % widths.length],
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--sp-border)] glass-card p-6 ${className}`}
      aria-hidden="true"
    >
      <Skeleton width="40%" height="12px" className="mb-4" />
      <Skeleton width="70%" height="24px" className="mb-3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonErrorRow() {
  return (
    <div className="px-6 py-5" aria-hidden="true">
      <div className="flex items-start gap-2 mb-3">
        <Skeleton width="60px" height="24px" />
        <Skeleton width="50px" height="24px" />
      </div>
      <Skeleton width="80%" height="18px" className="mb-2" />
      <Skeleton width="40%" height="14px" />
    </div>
  );
}

export function SkeletonProjectItem() {
  return (
    <div className="rounded-md border border-transparent px-3 py-3" aria-hidden="true">
      <Skeleton width="60%" height="16px" className="mb-2" />
      <Skeleton width="90%" height="12px" />
    </div>
  );
}
