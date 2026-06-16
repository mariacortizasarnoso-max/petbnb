import { lazy, Suspense, useEffect, useState } from "react";
import type { Walker } from "@/data/walkers";

const WalkMap = lazy(() => import("./WalkMap").then((m) => ({ default: m.WalkMap })));

type Props = { walker: Walker; progress: number; showFullRoute?: boolean };

export function WalkMapClient(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-full w-full bg-cream-deep shimmer" />;
  }
  return (
    <Suspense fallback={<div className="h-full w-full bg-cream-deep shimmer" />}>
      <WalkMap {...props} />
    </Suspense>
  );
}
