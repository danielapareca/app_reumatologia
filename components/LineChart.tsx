'use client';

export interface ChartPoint {
  data: string; // YYYY-MM-DD
  valor: number;
}

// Gráfico de linha simples em SVG (sem biblioteca externa).
export default function LineChart({
  points,
  titulo,
  unidade,
  color = '#B08A38',
}: {
  points: ChartPoint[];
  titulo: string;
  unidade?: string | null;
  color?: string;
}) {
  const pts = [...points]
    .filter((p) => isFinite(p.valor))
    .sort((a, b) => a.data.localeCompare(b.data));
  if (pts.length === 0) return null;

  const W = 320, H = 130, padL = 34, padR = 10, padT = 12, padB = 22;
  const vals = pts.map((p) => p.valor);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  const n = pts.length;

  const x = (i: number) => padL + (n === 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - (v - min) / range) * (H - padT - padB);

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(' ');

  const fmtDate = (d: string) => {
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}` : d;
  };

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: '#fff', boxShadow: 'var(--sh-1)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
        {titulo}{unidade ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> ({unidade})</span> : null}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }} role="img" aria-label={`Evolução de ${titulo}`}>
        {/* eixos */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#E1E7F0" strokeWidth={1} />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#E1E7F0" strokeWidth={1} />
        {/* rótulos min/max */}
        <text x={padL - 4} y={y(max) + 3} textAnchor="end" fontSize={8} fill="#8A98AB">{Math.round(max * 100) / 100}</text>
        <text x={padL - 4} y={y(min) + 3} textAnchor="end" fontSize={8} fill="#8A98AB">{Math.round(min * 100) / 100}</text>
        {/* linha dourada */}
        <path d={line} fill="none" stroke={color} strokeWidth={2} />
        {/* pontos marinho + datas */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.valor)} r={3} fill="#1E3A5F" />
            <text x={x(i)} y={H - padB + 12} textAnchor="middle" fontSize={8} fill="#8A98AB">{fmtDate(p.data)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
