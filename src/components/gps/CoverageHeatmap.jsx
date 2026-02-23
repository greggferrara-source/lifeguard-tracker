import React, { useEffect, useRef } from "react";

const ZONE_COLORS = {
  covered: "rgba(26,156,91,0.55)",
  partial: "rgba(251,146,60,0.55)",
  uncovered: "rgba(239,68,68,0.45)",
};

// Draws a simple grid-based coverage map using canvas
export default function CoverageHeatmap({ locations = [], activeLocations = [], clockEntries = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw ocean/beach gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#bae6fd");
    grad.addColorStop(0.4, "#e0f2fe");
    grad.addColorStop(1, "#fef9c3");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    if (locations.length === 0) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No location data available", W / 2, H / 2);
      return;
    }

    // Build a grid of cells
    const cols = 6;
    const rows = Math.ceil(locations.length / cols);
    const cellW = W / cols;
    const cellH = (H - 40) / Math.max(rows, 1);

    locations.forEach((loc, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW;
      const y = 40 + row * cellH;

      const guardsHere = clockEntries.filter(e => e.location_id === loc.id).length;
      const minRequired = loc.min_guards_required || 1;
      const coveragePct = Math.min(guardsHere / minRequired, 1);

      let color;
      if (coveragePct >= 1) color = ZONE_COLORS.covered;
      else if (coveragePct > 0) color = ZONE_COLORS.partial;
      else color = ZONE_COLORS.uncovered;

      // Cell background
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cellW - 8, cellH - 8, 10);
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Location name
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      const maxLen = Math.floor(cellW / 7);
      const label = loc.name.length > maxLen ? loc.name.slice(0, maxLen - 1) + "…" : loc.name;
      ctx.fillText(label, x + cellW / 2, y + cellH / 2 - 8);

      // Guards count
      ctx.font = "13px Inter, sans-serif";
      ctx.fillStyle = guardsHere === 0 ? "#dc2626" : "#166534";
      ctx.fillText(`${guardsHere}/${minRequired} guards`, x + cellW / 2, y + cellH / 2 + 10);

      // Status dot
      const dotColor = coveragePct >= 1 ? "#16a34a" : coveragePct > 0 ? "#ea580c" : "#dc2626";
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(x + cellW / 2, y + cellH / 2 + 26, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Legend
    const legendItems = [
      { color: ZONE_COLORS.covered, label: "Fully Staffed" },
      { color: ZONE_COLORS.partial, label: "Partial Coverage" },
      { color: ZONE_COLORS.uncovered, label: "Uncovered" },
    ];
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    legendItems.forEach((item, i) => {
      const lx = 12 + i * 130;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(lx, 10, 16, 16, 3);
      ctx.fill();
      ctx.fillStyle = "#374151";
      ctx.fillText(item.label, lx + 20, 23);
    });
  }, [locations, activeLocations, clockEntries]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={360}
      className="w-full rounded-xl border border-gray-200 shadow-sm"
      style={{ maxHeight: 360 }}
    />
  );
}