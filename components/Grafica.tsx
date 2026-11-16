export interface Serie {
  nombre: string;
  color: string;
  relleno: string;
  puntos: number[];
}

const W = 600;
const H = 240;

export default function Grafica({ series, max, titulo }: { series: Serie[]; max: number; titulo: string }) {
  const n = series[0].puntos.length - 1;
  const x = (k: number) => (k / n) * W;
  const y = (v: number) => H - 4 - (v / max) * (H - 16);

  return (
    <div className="grafica">
      <div className="claves">
        {series.map((s) => (
          <span key={s.nombre} style={{ ['--c' as string]: s.color }}>{s.nombre}</span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={titulo}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={y(max * f)} y2={y(max * f)} stroke="#dcebe8" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {series.map((s) => {
          const linea = s.puntos.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
          return (
            <g key={s.nombre}>
              <path d={`${linea} L${W} ${H} L0 ${H} Z`} fill={s.relleno} />
              <path d={linea} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
      <div className="eje">
        <span>Hoy</span>
        <span>Mes {Math.round(n / 2)}</span>
        <span>Mes {n}</span>
      </div>
    </div>
  );
}
