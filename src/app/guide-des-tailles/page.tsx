import type { Metadata } from "next";
export const metadata: Metadata = { title: "Guide des tailles" };
const rows = ["XS", "S", "M", "L", "XL", "XXL"];
export default function SizeGuide() {
  return (
    <div className="container-x pt-28 md:pt-36 max-w-3xl">
      <h1 className="m-center t-display text-[clamp(34px,6vw,88px)] leading-[0.85]">Guide des tailles</h1>
      <p className="text-white/65 mt-6">Tailles disponibles : XS à XXL sur toute la collection. Les mensurations exactes (tour de poitrine, longueur) doivent être fournies par la marque, le tableau ci-dessous est à compléter.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="t-label text-white/50 text-left"><th className="py-3 pr-4">Taille</th><th className="py-3 pr-4">Tour de poitrine (cm)</th><th className="py-3 pr-4">Longueur (cm)</th><th className="py-3">Coupe</th></tr></thead>
          <tbody className="divide-y divide-white/10">{rows.map((r) => <tr key={r}><td className="py-3 pr-4 font-semibold">{r}</td><td className="py-3 pr-4 text-white/40">à compléter</td><td className="py-3 pr-4 text-white/40">à compléter</td><td className="py-3 text-white/60">Classic : ajustée · Oversize : ample · Crop top : courte</td></tr>)}</tbody>
        </table>
      </div>
      <p className="text-sm text-white/55 mt-6">Conseil : pour l'oversize et le sweat, prenez votre taille habituelle, le tombé est volontairement ample. Entre deux tailles pour le classic, prenez la taille au-dessus.</p>
    </div>
  );
}
