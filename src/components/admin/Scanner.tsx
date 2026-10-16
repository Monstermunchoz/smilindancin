"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

type Result = { ok: boolean; message: string; ticket?: { holderName: string; tierName: string; eventTitle: string; code: string } };

/** Contrôle d'accès : scan caméra (BarcodeDetector, Chrome Android / Edge) ou saisie du code. */
export function Scanner({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [res, setRes] = useState<Result | null>(null);
  const [cam, setCam] = useState(false);
  const [camErr, setCamErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);

  async function check(c: string) {
    if (!c.trim() || busy.current) return;
    busy.current = true;
    const r = await fetch("/api/admin/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }) });
    setRes(await r.json());
    if (navigator.vibrate) navigator.vibrate(60);
    setTimeout(() => (busy.current = false), 1500);
  }

  useEffect(() => {
    if (initialCode) check(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cam) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    (async () => {
      const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (!BD) { setCamErr("Scan caméra non supporté par ce navigateur : utilisez l'appareil photo du téléphone (le QR ouvre cette page) ou saisissez le code."); setCam(false); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        const det = new BD({ formats: ["qr_code"] });
        const loop = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            const found = await det.detect(videoRef.current).catch(() => []);
            const raw = found[0]?.rawValue;
            if (raw) { const c = raw.split("/").pop() ?? raw; setCode(c); check(c); }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch { setCamErr("Accès caméra refusé."); setCam(false); }
    })();
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam]);

  return (
    <div className="max-w-md">
      {res && (
        <div className={cn("rounded-[4px] p-6 mb-6 text-center", res.ok ? "bg-emerald-500/15 border border-emerald-400/50" : "bg-pink/15 border border-pink/50")}>
          <p className={cn("t-display text-3xl", res.ok ? "text-emerald-300" : "text-pink")}>{res.ok ? "Entrée OK" : "Refusé"}</p>
          <p className="text-sm mt-2">{res.message}</p>
          {res.ticket && <p className="text-sm text-white/70 mt-3">{res.ticket.holderName} · {res.ticket.tierName}<br /><span className="t-dot">{res.ticket.code}</span></p>}
        </div>
      )}
      {cam && <video ref={videoRef} className="w-full aspect-square object-cover rounded-[4px] bg-black mb-4" muted playsInline />}
      <button onClick={() => { setCamErr(""); setCam((c) => !c); }} className="btn btn-primary w-full !py-4 mb-3">{cam ? "Arrêter la caméra" : "Scanner un QR code"}</button>
      {camErr && <p className="text-xs text-white/60 mb-3">{camErr}</p>}
      <form onSubmit={(e) => { e.preventDefault(); check(code); }} className="flex gap-2">
        <label htmlFor="code" className="sr-only">Code billet</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE DU BILLET" autoCapitalize="characters" autoComplete="off" className="flex-1 w-full min-w-0 bg-white/5 border border-white/15 rounded-full px-5 py-3 t-dot tracking-[0.2em] outline-none focus:border-white" />
        <button className="btn btn-ghost shrink-0">Valider</button>
      </form>
    </div>
  );
}
