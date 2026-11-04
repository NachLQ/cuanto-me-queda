import { useState } from 'react'
import { useCalculadora } from './hooks/useCalculadora'
import Simulador from './components/Simulador'
import Comparador from './components/Comparador'
import HuchaFiscal from './components/HuchaFiscal'
import Configuracion from './components/Configuracion'

const PESTANAS = [
  { id: 'simulador', label: 'Simulador', icono: '🧮' },
  { id: 'comparador', label: 'Comparador', icono: '⚖️' },
  { id: 'hucha', label: 'Hucha fiscal', icono: '🐷' },
  { id: 'config', label: 'Configuración', icono: '⚙️' },
]

export default function App() {
  const [pestana, setPestana] = useState('simulador')
  const { estado, set, resultado, reset } = useCalculadora()

  return (
    <div className="min-h-screen">
      {/* Cabecera */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
            ¿Cuánto Me Queda? <span className="text-tuyo">💸</span>
          </h1>
          <p className="text-sm text-slate-500">
            Escribe lo que facturas. Te decimos lo que de verdad ganas. Prepárate.
          </p>
        </div>
        {/* Navegación */}
        <nav className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1 overflow-x-auto">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPestana(p.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  pestana === p.id
                    ? 'border-tuyo text-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="mr-1">{p.icono}</span>
                {p.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {pestana === 'simulador' && <Simulador estado={estado} set={set} resultado={resultado} />}
        {pestana === 'comparador' && <Comparador estado={estado} resultado={resultado} />}
        {pestana === 'hucha' && <HuchaFiscal estado={estado} set={set} resultado={resultado} />}
        {pestana === 'config' && <Configuracion estado={estado} set={set} reset={reset} />}
      </main>

      {/* Disclaimer */}
      <footer className="mx-auto max-w-5xl px-4 pb-10">
        <p className="rounded-lg bg-slate-200/60 px-4 py-3 text-center text-xs text-slate-500">
          ⚠️ Los cálculos son orientativos. Consulta con tu gestor para tu situación exacta.
        </p>
      </footer>
    </div>
  )
}
