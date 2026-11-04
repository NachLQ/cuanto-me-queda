import { useState } from 'react'
import { fmtEur, fmtPct } from '../utils/fiscal'
import { calcular, salarioEquivalente } from '../hooks/useCalculadora'

export default function Comparador({ estado, resultado }) {
  const [incremento, setIncremento] = useState(500)
  const base = resultado

  // Escenario 1: facturo X€ más
  const escMas = calcular({ ...estado, facturacion: Number(estado.facturacion) + Number(incremento) })
  // Escenario 2: subo tarifas un 10%
  const escSubida = calcular({ ...estado, facturacion: Number(estado.facturacion) * 1.1 })
  // Asalariado equivalente
  const sal = salarioEquivalente(base.neto)

  return (
    <div className="space-y-6">
      <div className="tarjeta p-6">
        <h2 className="text-lg font-bold text-slate-800">¿Y si facturara más?</h2>
        <p className="mb-5 text-sm text-slate-500">Mueve el incremento y mira cuánto acaba siendo tuyo de verdad.</p>

        <label className="mb-2 block text-sm font-medium text-slate-600">
          Incremento de facturación: <strong className="text-slate-800">{fmtEur(incremento)} / mes</strong>
        </label>
        <input
          type="range" min="0" max="3000" step="50"
          value={incremento}
          onChange={(e) => setIncremento(Number(e.target.value))}
          className="w-full accent-tuyo"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Escenario titulo="Ahora" neto={base.neto} factur={base.facturacion} />
          <Escenario titulo={`+${fmtEur(incremento)}`} neto={escMas.neto} factur={escMas.facturacion} destacado />
          <div className="flex flex-col justify-center rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">De ese extra, te quedas</p>
            <p className="mt-1 text-2xl font-extrabold text-tuyo">{fmtEur(escMas.neto - base.neto)}</p>
            <p className="text-xs text-slate-500">
              {incremento > 0 ? fmtPct((escMas.neto - base.neto) / incremento) : '—'} del incremento
            </p>
          </div>
        </div>
      </div>

      <div className="tarjeta p-6">
        <h2 className="text-lg font-bold text-slate-800">¿Y si subo tarifas un 10 %?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Escenario titulo="Tarifa actual" neto={base.neto} factur={base.facturacion} />
          <Escenario titulo="+10 % tarifas" neto={escSubida.neto} factur={escSubida.facturacion} destacado />
          <div className="flex flex-col justify-center rounded-xl bg-green-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Neto adicional al mes</p>
            <p className="mt-1 text-2xl font-extrabold text-tuyo">+{fmtEur(escSubida.neto - base.neto)}</p>
            <p className="text-xs text-slate-500">{fmtEur((escSubida.neto - base.neto) * 12)} al año</p>
          </div>
        </div>
      </div>

      <div className="tarjeta p-6">
        <h2 className="text-lg font-bold text-slate-800">Asalariado equivalente</h2>
        <p className="mb-4 text-sm text-slate-500">
          ¿Qué salario bruto en nómina te dejaría el mismo neto que ganas como autónomo?
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Tu neto autónomo</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{fmtEur(base.neto)}/mes</p>
            <p className="text-xs text-slate-500">{fmtEur(base.neto * 12)} al año</p>
          </div>
          <div className="rounded-xl bg-slate-800 p-5 text-center text-white">
            <p className="text-xs uppercase tracking-wide opacity-80">Salario bruto equivalente</p>
            <p className="mt-1 text-2xl font-extrabold">{fmtEur(sal.brutoAnual)}/año</p>
            <p className="text-xs opacity-80">≈ {fmtEur(sal.brutoMensual)} brutos/mes (12 pagas)</p>
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cálculo inverso muy orientativo (SS 6,35 % + IRPF estatal aproximado, mínimo personal). No incluye
          situación familiar ni reducciones específicas. Consulta con tu gestor.
        </p>
      </div>
    </div>
  )
}

function Escenario({ titulo, neto, factur, destacado }) {
  return (
    <div className={`rounded-xl p-4 text-center ${destacado ? 'bg-green-50 ring-1 ring-tuyo/30' : 'bg-slate-50'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{titulo}</p>
      <p className={`mt-1 text-2xl font-extrabold ${destacado ? 'text-tuyo' : 'text-slate-800'}`}>{fmtEur(neto)}</p>
      <p className="text-xs text-slate-500">facturando {fmtEur(factur)}</p>
    </div>
  )
}
