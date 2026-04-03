import "./Skeleton.css";

function Block({ width, height }: { width: string; height: string }) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton skeleton-card">
      <div className="skeleton-card-inner">
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
    <div className="skeleton skeleton-court-card">
      <div className="skeleton-court-img">
        <Block width="100%" height="160px" />
      </div>
      <div className="skeleton-court-body">
        <Block width="140px" height="14px" />
        <Block width="100px" height="10px" />
        <Block width="180px" height="24px" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="skeleton skeleton-stat">
      <div className="skeleton-stat-inner">
        <Block width="48px" height="28px" />
        <Block width="100px" height="10px" />
      </div>
    </div>
  );
}
