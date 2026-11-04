// Exportación de informe PDF y tarjeta PNG 100% en el navegador.
// Antes lo hacía el servidor con puppeteer (Chromium ~300 MB); ahora se
// renderiza el mismo HTML en un iframe oculto y se captura con html2canvas.
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { fmtEur, fmtEur2, fmtPct } from './fiscal'

function etiquetaRegimen(estado) {
  if (estado.regimen === 'plana') return 'Tarifa plana (80 €/mes)'
  if (estado.regimen === 'manual') return `Cuota fija manual (${fmtEur(estado.cuotaManual)})`
  return 'Cuota por tramos de rendimiento neto (RETA 2025)'
}

function htmlInforme(estado, r) {
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 48px; max-width: 760px; margin: 0 auto; background: #ffffff; }
  h1 { font-size: 26px; font-weight: 800; color: #16a34a; }
  .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; margin-bottom: 32px; }
  .hero { background: #16a34a; color: white; border-radius: 14px; padding: 28px 32px; margin-bottom: 24px; }
  .hero .label { font-size: 13px; opacity: 0.85; font-weight: 500; }
  .hero .amount { font-size: 52px; font-weight: 800; letter-spacing: -1px; margin: 6px 0; }
  .hero .sub { font-size: 14px; opacity: 0.85; }
  .hero .hora { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 14px; font-weight: 600; margin-top: 12px; }
  .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .card { background: #f8fafc; border-radius: 10px; padding: 14px; text-align: center; }
  .card .val { font-size: 22px; font-weight: 700; }
  .card .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
  .verde { color: #16a34a; }
  .rojo { color: #dc2626; }
  .naranja { color: #f97316; }
  .gris { color: #64748b; }
  .bar-wrap { background: #e2e8f0; border-radius: 20px; overflow: hidden; height: 18px; margin-bottom: 12px; display: flex; }
  .bar-seg { height: 100%; }
  .legend { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 24px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .iva-box { background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .iva-box .title { color: #f97316; font-weight: 700; font-size: 15px; }
  .iva-box .note { color: #92400e; font-size: 12px; margin-top: 2px; }
  .iva-box .amount { font-size: 26px; font-weight: 800; color: #f97316; }
  .meta { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #64748b; margin-bottom: 16px; }
  .disclaimer { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px; line-height: 1.6; }
</style>
</head>
<body>
<h1>¿Cuánto Me Queda?${estado.nombre ? ` — ${estado.nombre}` : ''}</h1>
<p class="subtitle">Informe generado el ${fecha} · Los valores son orientativos</p>

<div class="hero">
  <div class="label">Neto real mensual — lo que de verdad te queda</div>
  <div class="amount">${fmtEur(r.neto)}</div>
  <div class="sub">de ${fmtEur(r.facturacion)} facturados · te quedas con ${fmtPct(r.pctNeto)}</div>
  ${r.porHora != null ? `<div class="hora">${fmtEur2(r.porHora)} / hora real</div>` : ''}
</div>

<div class="grid4">
  <div class="card"><div class="val rojo">${fmtEur(r.cuota)}</div><div class="lbl">Cuota autónomos</div></div>
  <div class="card"><div class="val rojo">${fmtEur(r.irpf)}</div><div class="lbl">IRPF (retención)</div></div>
  <div class="card"><div class="val gris">${fmtEur(r.gastos)}</div><div class="lbl">Gastos deducibles</div></div>
  <div class="card"><div class="val gris">${fmtEur(r.rendimiento)}</div><div class="lbl">Rendimiento neto</div></div>
</div>

<div class="bar-wrap">
  <div class="bar-seg" style="width:${(r.pctNeto * 100).toFixed(1)}%;background:#16a34a"></div>
  <div class="bar-seg" style="width:${(r.pctGastos * 100).toFixed(1)}%;background:#94a3b8"></div>
  <div class="bar-seg" style="width:${(r.pctCuota * 100).toFixed(1)}%;background:#dc2626"></div>
  <div class="bar-seg" style="width:${(r.pctIrpf * 100).toFixed(1)}%;background:#f87171"></div>
</div>
<div class="legend">
  <div class="legend-item"><div class="dot" style="background:#16a34a"></div>Neto real (tuyo) — ${fmtEur(r.neto)} · ${fmtPct(r.pctNeto)}</div>
  <div class="legend-item"><div class="dot" style="background:#94a3b8"></div>Gastos deducibles — ${fmtEur(r.gastos)} · ${fmtPct(r.pctGastos)}</div>
  <div class="legend-item"><div class="dot" style="background:#dc2626"></div>Cuota autónomos — ${fmtEur(r.cuota)} · ${fmtPct(r.pctCuota)}</div>
  <div class="legend-item"><div class="dot" style="background:#f87171"></div>IRPF (retención) — ${fmtEur(r.irpf)} · ${fmtPct(r.pctIrpf)}</div>
</div>

<div class="iva-box">
  <div>
    <div class="title">IVA apartado (21%)</div>
    <div class="note">⚠️ Lo cobras al cliente y se lo debes a Hacienda. No lo gastes.</div>
  </div>
  <div class="amount">${fmtEur(r.iva)}</div>
</div>

<div class="meta">
  Configuración: ${etiquetaRegimen(estado)} · IRPF ${fmtPct(estado.tipoIrpf)}${r.porHora != null ? ` · ${estado.horas} horas/mes` : ''}
</div>

<p class="disclaimer">⚠️ Los cálculos son orientativos. Se basan en las tablas de cuotas RETA 2025 y en el tipo de retención IRPF configurado, que puede diferir de tu situación real. Este informe no sustituye el asesoramiento de un gestor o asesor fiscal. Consulta siempre con un profesional para conocer tu situación exacta.</p>
</body>
</html>`
}

function htmlTarjeta(r) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px; height: 1080px; overflow: hidden;
    background: linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f3025 100%);
    font-family: 'Segoe UI', system-ui, sans-serif;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: white;
  }
  .top-label { font-size: 26px; color: #22c55e; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .tagline { font-size: 20px; color: #64748b; margin-bottom: 64px; }
  .row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .row .caption { font-size: 24px; color: #94a3b8; }
  .row .value { font-size: 64px; font-weight: 800; letter-spacing: -2px; color: #f1f5f9; }
  .divider { width: 400px; height: 2px; background: #1e3a2f; margin: 32px 0; border-radius: 2px; }
  .big-label { font-size: 26px; color: #94a3b8; margin-bottom: 12px; }
  .big-amount { font-size: 120px; font-weight: 800; color: #22c55e; letter-spacing: -4px; line-height: 1; }
  .big-pct { font-size: 28px; color: #4ade80; margin-top: 8px; }
  .chips { display: flex; gap: 16px; margin-top: 56px; }
  .chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 10px 24px; font-size: 19px; color: #94a3b8; }
  .chip strong { color: #e2e8f0; }
  .brand { margin-top: 56px; font-size: 20px; color: #334155; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; }
  .iva-note { font-size: 17px; color: #f97316; margin-top: 16px; }
</style>
</head>
<body>
  <div class="top-label">¿Cuánto Me Queda?</div>
  <div class="tagline">Simulador de neto real para autónomos</div>

  <div class="row">
    <div class="caption">Facturo</div>
    <div class="value">${fmtEur(r.facturacion)}/mes</div>
  </div>

  <div class="divider"></div>

  <div class="big-label">Me queda de verdad</div>
  <div class="big-amount">${fmtEur(r.neto)}</div>
  <div class="big-pct">${fmtPct(r.pctNeto)} de lo facturado</div>

  <div class="chips">
    <div class="chip">Cuota <strong>${fmtEur(r.cuota)}</strong></div>
    <div class="chip">IRPF <strong>${fmtEur(r.irpf)}</strong></div>
    <div class="chip">Gastos <strong>${fmtEur(r.gastos)}</strong></div>
  </div>

  ${r.porHora != null ? `<div class="iva-note" style="color:#94a3b8;margin-top:16px">Hora real trabajada: <strong style="color:#e2e8f0">${fmtEur(r.porHora)}</strong></div>` : ''}

  <div class="iva-note">⚠️ IVA aparte (${fmtEur(r.iva)}/mes — no es tuyo)</div>

  <div class="brand">silys · valores orientativos</div>
</body>
</html>`
}

// Renderiza un documento HTML completo en un iframe oculto y lo captura.
async function renderizarACanvas(html, ancho, alto, opciones = {}) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;left:-12000px;top:0;width:${ancho}px;height:${alto}px;border:0;`
  document.body.appendChild(iframe)
  try {
    const doc = iframe.contentDocument
    doc.open()
    doc.write(html)
    doc.close()
    // Margen para que el layout y las fuentes del sistema asienten.
    await new Promise((resolver) => setTimeout(resolver, 250))
    return await html2canvas(doc.body, {
      width: ancho,
      windowWidth: ancho,
      scale: opciones.scale || 2,
      backgroundColor: opciones.fondo ?? '#ffffff',
      logging: false,
    })
  } finally {
    iframe.remove()
  }
}

function descargarDataUrl(dataUrl, nombreArchivo) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = nombreArchivo
  a.click()
}

export async function exportarInformePdf(estado, r) {
  const canvas = await renderizarACanvas(htmlInforme(estado, r), 760, 1200)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const anchoMm = 210
  const altoPaginaMm = 297
  const pxPorMm = canvas.width / anchoMm
  const altoTotalMm = canvas.height / pxPorMm
  // JPEG: el informe es texto sobre fondos planos y en PNG el PDF sale ~15 MB.
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  let offsetMm = 0
  let pagina = 0
  while (offsetMm < altoTotalMm) {
    if (pagina > 0) pdf.addPage()
    pdf.addImage(dataUrl, 'JPEG', 0, -offsetMm, anchoMm, altoTotalMm)
    offsetMm += altoPaginaMm
    pagina += 1
  }
  pdf.save('informe-cuanto-me-queda.pdf')
}

export async function exportarTarjetaPng(estado, r) {
  const canvas = await renderizarACanvas(htmlTarjeta(r), 1080, 1080, { scale: 1, fondo: null })
  descargarDataUrl(canvas.toDataURL('image/png'), 'tarjeta-cuanto-me-queda.png')
}
