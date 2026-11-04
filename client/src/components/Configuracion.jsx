import { FISCAL, fmtEur } from '../utils/fiscal'

export default function Configuracion({ estado, set, reset }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="tarjeta p-6">
        <h2 className="text-lg font-bold text-slate-800">Configuración</h2>
        <p className="mb-5 text-sm text-slate-500">Todo se guarda en tu navegador y persiste entre sesiones.</p>

        <Campo label="Nombre para el PDF (opcional)">
          <input
            type="text" className="campo" placeholder="Tu nombre"
            value={estado.nombre}
            onChange={(e) => set('nombre', e.target.value)}
          />
        </Campo>

        <Campo label="Tipo de retención IRPF">
          <div className="flex gap-3">
            <Radio checked={estado.tipoIrpf === FISCAL.IRPF_GENERAL} onChange={() => set('tipoIrpf', FISCAL.IRPF_GENERAL)} label="General (15 %)" />
            <Radio checked={estado.tipoIrpf === FISCAL.IRPF_NUEVOS} onChange={() => set('tipoIrpf', FISCAL.IRPF_NUEVOS)} label="Nuevo autónomo (7 %)" />
          </div>
        </Campo>

        <Campo label="Régimen de cuota de autónomos">
          <div className="space-y-2">
            <Radio checked={estado.regimen === 'plana'} onChange={() => set('regimen', 'plana')} label={`Tarifa plana (${fmtEur(FISCAL.TARIFA_PLANA)}/mes, primeros 12 meses)`} block />
            <Radio checked={estado.regimen === 'tramos'} onChange={() => set('regimen', 'tramos')} label="Por tramos de rendimiento neto (tabla 2025)" block />
            <Radio checked={estado.regimen === 'manual'} onChange={() => set('regimen', 'manual')} label="Cuota fija manual" block />
          </div>
          {estado.regimen === 'manual' && (
            <div className="relative mt-3">
              <input
                type="number" min="0" className="campo pr-8"
                value={estado.cuotaManual}
                onChange={(e) => set('cuotaManual', e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
            </div>
          )}
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Horas trabajadas al mes">
            <input type="number" min="0" className="campo" value={estado.horas} onChange={(e) => set('horas', e.target.value)} />
          </Campo>
          <Campo label="Gastos deducibles al mes">
            <div className="relative">
              <input type="number" min="0" className="campo pr-8" value={estado.gastos} onChange={(e) => set('gastos', e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
            </div>
          </Campo>
        </div>

        <button
          onClick={() => { if (confirm('¿Restablecer todos los valores por defecto?')) reset() }}
          className="mt-2 text-sm font-medium text-red-600 hover:underline"
        >
          Restablecer valores por defecto
        </button>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div className="mb-5">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </div>
  )
}

function Radio({ checked, onChange, label, block }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-slate-800 bg-slate-50 font-semibold text-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} ${block ? 'w-full' : ''}`}>
      <input type="radio" checked={checked} onChange={onChange} className="accent-slate-800" />
      {label}
    </label>
  )
}
