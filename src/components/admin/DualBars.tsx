/** Barres empilées vêtements / billets par jour (SVG, sans dépendance). */
export function DualBars({ data, height = 140, format }: { data: { label: string; shop: number; tickets: number }[]; height?: number; format: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.shop + d.tickets));
  const w = 100 / Math.max(1, data.length);
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Ventes par jour">
        {data.map((d, i) => {
          const hs = (d.shop / max) * (height - 8);
          const ht = (d.tickets / max) * (height - 8);
          return (
            <g key={i}>
              <rect x={i * w + w * 0.15} y={height - hs} width={w * 0.7} height={hs} fill="#37548f" rx="0.6"><title>{`${d.label}, vêtements : ${format(d.shop)}`}</title></rect>
              <rect x={i * w + w * 0.15} y={height - hs - ht} width={w * 0.7} height={ht} fill="#a9426b" rx="0.6"><title>{`${d.label}, billets : ${format(d.tickets)}`}</title></rect>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between t-dot text-[10px] text-white/40 mt-1"><span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span></div>
      <div className="flex gap-4 text-xs text-white/60 mt-3"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue" />Vêtements</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-pink" />Billets</span></div>
    </div>
  );
}
