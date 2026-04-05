function Block({ width, height }: { width: string; height: string }) {
  return (
    <div
      className="bg-[rgba(255,255,255,0.03)] rounded-md"
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border overflow-hidden relative min-w-[300px] h-[220px] rounded-2xl shrink-0 after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.04)] after:to-transparent after:animate-shimmer">
      <div className="p-5 flex flex-col gap-3">
        <Block width="80px" height="12px" />
        <Block width="160px" height="14px" />
        <Block width="200px" height="10px" />
        <Block width="100%" height="28px" />
        <Block width="100%" height="32px" />
      </div>
    </div>
  );
}

export function SkeletonCourtCard() {
  return (
    <div className="bg-surface border border-border overflow-hidden relative rounded-2xl after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.04)] after:to-transparent after:animate-shimmer">
      <div className="h-40">
        <Block width="100%" height="160px" />
      </div>
      <div className="px-[18px] pt-4 pb-[18px] flex flex-col gap-2">
        <Block width="140px" height="14px" />
        <Block width="100px" height="10px" />
        <Block width="180px" height="24px" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-surface border border-border overflow-hidden relative rounded-[14px] h-[90px] after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.04)] after:to-transparent after:animate-shimmer">
      <div className="p-[18px] flex flex-col gap-2">
        <Block width="48px" height="28px" />
        <Block width="100px" height="10px" />
      </div>
    </div>
  );
}
