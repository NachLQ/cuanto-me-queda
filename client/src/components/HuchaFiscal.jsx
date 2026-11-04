import { fmtEur, fmtPct } from '../utils/fiscal'
import { proximosVencimientos } from '../hooks/useCalculadora'

export default function HuchaFiscal({ estado, set, resultado }) {
  const r = resultado
  // A apartar cada mes
  const ivaMes = r.iva
  const irpfMes = r.irpf
  // Acumulado de un trimestre (3 meses)
  const ivaTrim = ivaMes * 3
  const irpfTrim = irpfMes * 3

  const vencimientos = proximosVencimientos(new Date())
  const proximo = vencimientos[0]

  // Comparación: lo que deberías tener apartado para un trimestre vs lo ingresado
  const apartadoIva = Number(estado.apartadoIva) || 0
  const apartadoIrpf = Number(estado.apartadoIrpf) || 0
  const faltaIva = ivaTrim - apartadoIva
  const faltaIrpf = irpfTrim - apartadoIrpf

  return (
    <div className="space-y-6">
      {/* Cuenta atrás */}
      <div className="tarjeta overflow-hidden">
        <div className="bg-slate-800 p-6 text-white">
          <p className="text-sm opacity-80">Próximo vencimiento fiscal</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold">Modelo {proximo.modelo} · {proximo.trimestre}</p>
              <p className="text-sm opacity-80">
                {proximo.fechaReal.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-extrabold leading-none">{proximo.diasRestantes}</p>
              <p className="text-sm opacity-80">días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cuánto apartar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Hucha
          color="iva"
          titulo="Hucha IVA (modelo 303)"
          mensual={ivaMes}
          trimestral={ivaTrim}
          nota="El 21 % que cobras de más al cliente. No es tuyo."
          apartado={apartadoIva}
          falta={faltaIva}
          onApartado={(v) => set('apartadoIva', v)}
        />
        <Hucha
          color="hacienda"
          titulo="Hucha IRPF (modelo 130)"
          mensual={irpfMes}
          trimestral={irpfTrim}
          nota={`Pago a cuenta de tu IRPF (${fmtPct(estado.tipoIrpf)} de lo que facturas).`}
          apartado={apartadoIrpf}
          falta={faltaIrpf}
          onApartado={(v) => set('apartadoIrpf', v)}
        />
      </div>

      {/* Calendario completo */}
      <div className="tarjeta p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Calendario fiscal del año</h3>
        <ul className="divide-y divide-slate-100">
          {vencimientos.map((v, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-slate-800">Modelo {v.modelo} <span className="text-slate-400">·</span> {v.trimestre}</p>
                <p className="text-sm text-slate-500">
                  {v.fechaReal.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${i === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {v.diasRestantes} días
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Hucha({ color, titulo, mensual, trimestral, nota, apartado, falta, onApartado }) {
  const suficiente = falta <= 0
  return (
    <div className={`tarjeta border-t-4 p-6 ${color === 'iva' ? 'border-iva' : 'border-hacienda'}`}>
      <h3 className={`font-bold ${color === 'iva' ? 'text-iva' : 'text-hacienda'}`}>{titulo}</h3>
      <p className="mt-1 text-sm text-slate-500">{nota}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs uppercase text-slate-400">Cada mes</p>
          <p className="text-xl font-bold text-slate-800">{fmtEur(mensual)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs uppercase text-slate-400">Por trimestre</p>
          <p className="text-xl font-bold text-slate-800">{fmtEur(trimestral)}</p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-slate-600">¿Cuánto llevas apartado este trimestre?</span>
        <div className="relative">
          <input
            type="number" min="0" inputMode="decimal"
            className="campo pr-8"
            value={apartado}
            onChange={(e) => onApartado(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
        </div>
      </label>

      <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${suficiente ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
        {suficiente
          ? `✅ Vas sobrado: tienes ${fmtEur(Math.abs(falta))} de colchón.`
          : `⚠️ Te faltan ${fmtEur(falta)} para cubrir el trimestre.`}
      </div>
    </div>
  )
}
