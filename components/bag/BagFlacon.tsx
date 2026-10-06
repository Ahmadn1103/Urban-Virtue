/* eslint-disable @next/next/no-img-element -- data-URL snapshot of the 3D flacon (lib/flaconStills) */
import type { BagLine } from "@/lib/bag";

type Props = {
  line: BagLine;
  src?: string; // still of the studio's 3D flacon, once rendered
  failed: boolean; // WebGL unavailable
};

export default function BagFlacon({ line, src, failed }: Props) {
  return (
    <div className="bag-flacon" role="img" aria-label={`${line.name} flacon, ${line.size.label}`}>
      {src ? (
        <img className="bag-flacon-img" src={src} alt="" width={180} height={240} />
      ) : failed ? (
        // Static stand-in: one band per note, as poured
        <div className="bag-flacon-still" aria-hidden="true">
          <span className="bag-flacon-cap" />
          <span className="bag-flacon-glass">
            {[...line.notes].reverse().map((n) => (
              <i key={n.id} style={{ background: n.color }} />
            ))}
          </span>
        </div>
      ) : (
        <div className="flacon-skeleton" aria-hidden="true">
          <span className="flacon-skeleton-cap" />
          <span className="flacon-skeleton-body" />
        </div>
      )}
    </div>
  );
}
