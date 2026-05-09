import React, { useRef, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70; // px of pull needed to trigger

export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      if (el.scrollTop === 0) startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPulling(true);
        setPullDist(Math.min(dy, THRESHOLD + 30));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDist >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPullDist(THRESHOLD);
        await onRefresh?.();
        setRefreshing(false);
      }
      startY.current = null;
      setPulling(false);
      setPullDist(0);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDist, refreshing, onRefresh]);

  const progress = Math.min(pullDist / THRESHOLD, 1);

  return (
    <div ref={containerRef} className={`overflow-auto relative ${className}`} style={{ WebkitOverflowScrolling: "touch" }}>
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: `${Math.min(pullDist, THRESHOLD)}px` }}
        >
          <div className={`w-8 h-8 rounded-full bg-[#1a9c5b] flex items-center justify-center shadow-md transition-transform ${refreshing ? "scale-100" : ""}`}
            style={{ opacity: progress, transform: `scale(${0.5 + progress * 0.5}) rotate(${progress * 180}deg)` }}>
            <RefreshCw className={`w-4 h-4 text-white ${refreshing ? "animate-spin" : ""}`} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}