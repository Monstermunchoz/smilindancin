/** Mini graphique SVG (barres) — sans dépendance. */
export function BarChart({ data, height = 120, format = (v: number) => String(v) }: { data: { label: string; value: number }[]; height?: number; format?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Graphique">
        <defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#67a7dc" /><stop offset="1" stopColor="#a9426b" /></linearGradient></defs>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 10);
          return <rect key={i} x={i * w + w * 0.15} y={height - h} width={w * 0.7} height={h} fill="url(#bar)" rx="1"><title>{d.label} : {format(d.value)}</title></rect>;
        })}
      </svg>
      <div className="flex justify-between t-dot text-[10px] text-white/40 mt-1"><span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span></div>
    </div>
  );
}
