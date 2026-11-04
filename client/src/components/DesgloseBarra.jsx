import { fmtEur, fmtPct } from '../utils/fiscal'

// Barra horizontal apilada con leyenda.
// segmentos: [{ label, importe, color, pct }]  (color = clase bg-* de Tailwind)
export default function DesgloseBarra({ segmentos, total }) {
  const suma = total || segmentos.reduce((s, x) => s + Math.max(0, x.importe), 0)
  return (
    <div className="space-y-3">
      <div className="flex h-7 w-full overflow-hidden rounded-full bg-slate-200">
        {segmentos.map((s, i) => {
          const w = suma > 0 ? (Math.max(0, s.importe) / suma) * 100 : 0
          return (
            <div
              key={i}
              className={`${s.color} h-full transition-all duration-300`}
              style={{ width: `${w}%` }}
              title={`${s.label}: ${fmtEur(s.importe)}`}
            />
          )
        })}
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {segmentos.map((s, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <span className={`inline-block h-3 w-3 rounded-full ${s.color}`} />
              {s.label}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {fmtEur(s.importe)}
              <span className="ml-2 text-xs font-normal text-slate-400">
                {fmtPct(s.pct ?? (suma > 0 ? s.importe / suma : 0))}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
