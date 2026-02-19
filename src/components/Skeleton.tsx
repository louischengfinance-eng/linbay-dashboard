"use client";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card rounded-xl p-5 ${className}`}>
      <div className="skeleton-line h-3 w-24 mb-3 rounded" />
      <div className="skeleton-line h-8 w-36 rounded" />
      <div className="skeleton-line h-3 w-20 mt-2 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="skeleton-line h-4 w-40 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton-line h-4 flex-1 rounded" style={{ animationDelay: `${(i * cols + j) * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 page-enter">
      <div className="text-center py-4">
        <div className="skeleton-line h-12 w-64 mx-auto rounded mb-2" />
        <div className="skeleton-line h-3 w-48 mx-auto rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="glass-card rounded-xl p-5">
        <div className="skeleton-line h-4 w-32 rounded mb-4" />
        <div className="skeleton-line h-[300px] w-full rounded" />
      </div>
    </div>
  );
}
