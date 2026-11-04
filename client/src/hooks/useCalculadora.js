import { useState, useEffect, useMemo } from 'react'
import { FISCAL } from '../utils/fiscal'

const STORAGE_KEY = 'cmq_estado_v1'

// Estado por defecto = perfil "Marcos" (consolidado), para que la app arranque
// con números realistas en lugar de en blanco.
export const DEFAULTS = {
  nombre: '',
  facturacion: 2800,   // bruto mensual SIN IVA
  gastos: 200,         // gastos deducibles mensuales
  horas: 160,          // horas trabajadas al mes (para el €/hora)
  tipoIrpf: 0.15,      // 0.15 general | 0.07 nuevos autónomos
  regimen: 'tramos',   // 'plana' | 'tramos' | 'manual'
  cuotaManual: 300,    // sólo se usa si regimen === 'manual'
  apartadoIva: 0,      // lo que el usuario YA ha apartado para IVA (hucha)
  apartadoIrpf: 0,     // lo que el usuario YA ha apartado para IRPF (hucha)
}

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULTS, ...guardado }
  } catch {
    return { ...DEFAULTS }
  }
}

// ---------------------------------------------------------------------------
//  Lógica de cálculo pura (reutilizable y testeable)
// ---------------------------------------------------------------------------

// Devuelve la cuota de autónomos según el régimen elegido.
// En 'tramos' usa la CUOTA MÍNIMA del tramo correspondiente al rendimiento neto.
export function calcularCuota(rendimientoNeto, regimen = 'tramos', cuotaManual = 0) {
  if (regimen === 'manual') return Math.max(0, Number(cuotaManual) || 0)
  if (regimen === 'plana') return FISCAL.TARIFA_PLANA
  for (const [max, cuotaMin] of FISCAL.TRAMOS_CUOTA) {
    if (rendimientoNeto <= max) return cuotaMin
  }
  return FISCAL.TRAMOS_CUOTA[FISCAL.TRAMOS_CUOTA.length - 1][1]
}

// Cálculo principal del neto real a partir del estado.
export function calcular(estado) {
  const f = Math.max(0, Number(estado.facturacion) || 0)
  const g = Math.max(0, Number(estado.gastos) || 0)
  const tipoIrpf = Number(estado.tipoIrpf) || 0
  const horas = Math.max(0, Number(estado.horas) || 0)

  const iva = f * FISCAL.IVA_GENERAL                       // no es tuyo
  const rendimiento = Math.max(0, f - g)                   // base para el tramo de cuota
  const cuota = calcularCuota(rendimiento, estado.regimen, estado.cuotaManual)
  const irpf = f * tipoIrpf                                // retención / pago a cuenta
  const neto = f - cuota - irpf - g                        // lo que de verdad te queda

  return {
    facturacion: f,
    iva,
    rendimiento,
    cuota,
    irpf,
    gastos: g,
    neto,
    porHora: horas > 0 ? neto / horas : null,
    horas,
    // porcentajes sobre la facturación (sin IVA)
    pctNeto: f > 0 ? neto / f : 0,
    pctCuota: f > 0 ? cuota / f : 0,
    pctIrpf: f > 0 ? irpf / f : 0,
    pctGastos: f > 0 ? g / f : 0,
    pctIva: FISCAL.IVA_GENERAL,
  }
}

// ---------------------------------------------------------------------------
//  Asalariado equivalente (cálculo INVERSO orientativo)
//  Aproxima qué salario bruto anual produciría el mismo neto que el autónomo.
//  Modelo simplificado: SS empleado 6,35 % + IRPF progresivo estatal aprox 2025
//  con un mínimo personal exento. ORIENTATIVO, no apto para nóminas reales.
// ---------------------------------------------------------------------------
const TRAMOS_IRPF_ASALARIADO = [
  [12450, 0.19],
  [20200, 0.24],
  [35200, 0.30],
  [60000, 0.37],
  [300000, 0.45],
  [Infinity, 0.47],
]
const MINIMO_PERSONAL = 5550
const SS_EMPLEADO = 0.0635

function irpfAsalariado(baseAnual) {
  let prev = 0
  let total = 0
  for (const [techo, tipo] of TRAMOS_IRPF_ASALARIADO) {
    if (baseAnual > prev) {
      total += (Math.min(baseAnual, techo) - prev) * tipo
    }
    prev = techo
    if (baseAnual <= techo) break
  }
  return total
}

export function netoAsalariadoDesdeBruto(brutoAnual) {
  const ss = brutoAnual * SS_EMPLEADO
  const base = Math.max(0, brutoAnual - ss - MINIMO_PERSONAL)
  const irpf = irpfAsalariado(base)
  return brutoAnual - ss - irpf
}

// Búsqueda binaria del bruto anual que iguala el neto objetivo.
export function salarioEquivalente(netoMensualAutonomo) {
  const objetivoAnual = Math.max(0, netoMensualAutonomo) * 12
  if (objetivoAnual <= 0) return { brutoAnual: 0, brutoMensual: 0 }
  let lo = objetivoAnual
  let hi = objetivoAnual * 3 + 12000
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (netoAsalariadoDesdeBruto(mid) < objetivoAnual) lo = mid
    else hi = mid
  }
  const brutoAnual = (lo + hi) / 2
  return { brutoAnual, brutoMensual: brutoAnual / 12 }
}

// ---------------------------------------------------------------------------
//  Calendario fiscal: próxima ocurrencia futura de cada vencimiento.
//  Toma el día/mes de fiscal.js e infiere el año (este o el siguiente).
// ---------------------------------------------------------------------------
export function proximosVencimientos(hoy = new Date()) {
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return FISCAL.VENCIMIENTOS_TRIMESTRALES.map((v) => {
    const [, mes, dia] = v.fecha.split('-').map(Number)
    let fecha = new Date(base.getFullYear(), mes - 1, dia)
    if (fecha < base) fecha = new Date(base.getFullYear() + 1, mes - 1, dia)
    const dias = Math.round((fecha - base) / 86400000)
    return { ...v, fechaReal: fecha, diasRestantes: dias }
  }).sort((a, b) => a.fechaReal - b.fechaReal)
}

// ---------------------------------------------------------------------------
//  Hook principal: estado + persistencia en localStorage + resultado memoizado.
// ---------------------------------------------------------------------------
export function useCalculadora() {
  const [estado, setEstado] = useState(cargar)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  }, [estado])

  const set = (campo, valor) => setEstado((e) => ({ ...e, [campo]: valor }))
  const reset = () => setEstado({ ...DEFAULTS })

  const resultado = useMemo(() => calcular(estado), [estado])

  return { estado, set, setEstado, reset, resultado }
}
