// =============================================================================
//  Valores fiscales para cálculo en tiempo real en el navegador.
//  Todos los valores son ORIENTATIVOS — revisar cada año. Fuente: RETA, AEAT.
//  Tramos de cuota verificados 2026-07-23: la Seguridad Social mantiene los
//  mismos 15 tramos y cuotas de 2025 para 2026 (congelados, sin cambios),
//  según Orden PJC/297/2026 — no hace falta tocar TRAMOS_CUOTA todavía.
//  Revisar de nuevo antes de 2027.
// =============================================================================
export const FISCAL = {
  IVA_GENERAL: 0.21,
  IRPF_GENERAL: 0.15,
  IRPF_NUEVOS: 0.07,
  TARIFA_PLANA: 80,
  TRAMOS_CUOTA: [
    [670,      225, 290],
    [900,      270, 350],
    [1166,     284, 366],
    [1300,     294, 376],
    [1500,     294, 484],
    [1700,     310, 500],
    [1850,     315, 520],
    [2030,     320, 530],
    [2330,     330, 550],
    [2760,     340, 590],
    [3190,     350, 610],
    [3620,     360, 630],
    [4050,     370, 650],
    [6000,     390, 740],
    [Infinity, 420, 1267],
  ],
  // Solo se usan mes y día (ver proximosVencimientos en useCalculadora.js,
  // que infiere el año real en cada cálculo) — el año de abajo es cosmético,
  // pero se mantiene actualizado para que el propio archivo no parezca abandonado.
  VENCIMIENTOS_TRIMESTRALES: [
    { modelo: '303/130', trimestre: 'Q1',    fecha: '2026-04-20' },
    { modelo: '303/130', trimestre: 'Q2',    fecha: '2026-07-20' },
    { modelo: '303/130', trimestre: 'Q3',    fecha: '2026-10-20' },
    { modelo: '303/130', trimestre: 'Q4',    fecha: '2027-01-30' },
    { modelo: '390/100', trimestre: 'Anual', fecha: '2027-01-30' },
  ],
}

export const fmtEur = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  )

export const fmtEur2 = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0,
  )

export const fmtPct = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
