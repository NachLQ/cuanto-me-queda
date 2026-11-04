import { useState } from 'react'
import { fmtEur, fmtEur2, fmtPct } from '../utils/fiscal'
import { exportarInformePdf, exportarTarjetaPng } from '../utils/exportar'
import DesgloseBarra from './DesgloseBarra'

export default function Simulador({ estado, set, resultado }) {
  const r = resultado
  const [exportando, setExportando] = useState('')

  const segmentos = [
    { label: 'Neto real (tuyo)', importe: r.neto, color: 'bg-tuyo', pct: r.pctNeto },
    { label: 'Gastos deducibles', importe: r.gastos, color: 'bg-slate-400', pct: r.pctGastos },
    { label: 'Cuota autónomos', importe: r.cuota, color: 'bg-hacienda', pct: r.pctCuota },
    { label: 'IRPF (retención)', importe: r.irpf, color: 'bg-red-400', pct: r.pctIrpf },
  ]

  async function descargar(tipo) {
    try {
      setExportando(tipo)
      // Se genera todo en el navegador: no hace falta servidor.
      if (tipo === 'pdf') await exportarInformePdf(estado, r)
      else await exportarTarjetaPng(estado, r)
    } catch (e) {
      console.error('[exportar]', e)
      alert('No se pudo generar el archivo. Recarga la página e inténtalo de nuevo.')
    } finally {
      setExportando('')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Entradas */}
      <section className="tarjeta p-6 lg:col-span-2">
        <h2 className="mb-1 text-lg font-bold text-slate-800">Escribe lo que facturas</h2>
        <p className="mb-5 text-sm text-slate-500">El resultado se actualiza al teclear.</p>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Facturación mensual (sin IVA)</span>
          <div className="relative">
            <input
              type="number" min="0" inputMode="decimal"
              className="campo pr-8 text-lg font-semibold"
              value={estado.facturacion}
              onChange={(e) => set('facturacion', e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
          </div>
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Gastos deducibles al mes</span>
          <div className="relative">
            <input
              type="number" min="0" inputMode="decimal"
              className="campo pr-8"
              value={estado.gastos}
              onChange={(e) => set('gastos', e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Horas trabajadas al mes (opcional)</span>
          <input
            type="number" min="0" inputMode="decimal"
            className="campo"
            value={estado.horas}
            onChange={(e) => set('horas', e.target.value)}
          />
        </label>

        <p className="mt-5 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
          Tu régimen actual: <strong>{etiquetaRegimen(estado)}</strong> · IRPF{' '}
          <strong>{fmtPct(estado.tipoIrpf)}</strong>. Cámbialo en <em>Configuración</em>.
        </p>
      </section>

      {/* Resultado */}
      <section className="space-y-6 lg:col-span-3">
        <div className="tarjeta overflow-hidden">
          <div className="bg-tuyo p-6 text-white">
            <p className="text-sm font-medium opacity-90">Neto real mensual — lo que de verdad ganas</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight">{fmtEur(r.neto)}</p>
            <p className="mt-1 text-sm opacity-90">
              de {fmtEur(r.facturacion)} facturados · te quedas con {fmtPct(r.pctNeto)}
            </p>
            {r.porHora != null && (
              <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                {fmtEur2(r.porHora)} / hora real
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 sm:grid-cols-4">
            <Dato etiqueta="Cuota" valor={fmtEur(r.cuota)} color="text-hacienda" />
            <Dato etiqueta="IRPF" valor={fmtEur(r.irpf)} color="text-red-400" />
            <Dato etiqueta="Gastos" valor={fmtEur(r.gastos)} color="text-slate-500" />
            <Dato etiqueta="Rend. neto" valor={fmtEur(r.rendimiento)} color="text-slate-700" />
          </div>
        </div>

        <div className="tarjeta p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">¿A dónde va tu facturación?</h3>
          <DesgloseBarra segmentos={segmentos} total={r.facturacion} />
        </div>

        {/* IVA: dinero que pasa por tu cuenta pero NO es tuyo */}
        <div className="tarjeta border-l-4 border-iva p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-iva">IVA apartado (21 %)</p>
              <p className="text-sm text-slate-500">Lo cobras al cliente y se lo debes a Hacienda.</p>
            </div>
            <p className="text-2xl font-extrabold text-iva">{fmtEur(r.iva)}</p>
          </div>
          <p className="mt-2 rounded bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
            ⚠️ Este dinero no es tuyo. No lo gastes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => descargar('pdf')}
            disabled={exportando === 'pdf'}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {exportando === 'pdf' ? 'Generando…' : '📄 Descargar informe PDF'}
          </button>
          <button
            onClick={() => descargar('tarjeta')}
            disabled={exportando === 'tarjeta'}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {exportando === 'tarjeta' ? 'Generando…' : '🖼️ Tarjeta para compartir'}
          </button>
        </div>
      </section>
    </div>
  )
}

function Dato({ etiqueta, valor, color }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{valor}</p>
    </div>
  )
}

function etiquetaRegimen(estado) {
  if (estado.regimen === 'plana') return 'tarifa plana (80 €)'
  if (estado.regimen === 'manual') return 'cuota fija manual'
  return 'cuota por tramos'
}
