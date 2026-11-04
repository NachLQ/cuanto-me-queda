---
tags: [proyectos, activo, readme]
---
# ¿Cuánto Me Queda? — Simulador de neto real para autónomos

Escribe lo que facturas. La app te dice lo que de verdad ganas y cuánto debes apartar para Hacienda.

---

## Qué incluye

- **Simulador** — neto real al teclear, desglose visual, €/hora real
- **Comparador** — ¿y si facturo más? ¿y si subo tarifas un 10%? ¿asalariado equivalente?
- **Hucha fiscal** — cuánto apartar para IVA e IRPF, calendario de vencimientos trimestrales
- **Configuración** — régimen de cuotas (tarifa plana, tramos RETA 2025, manual), tipo IRPF, gastos
- **Exportar PDF** — informe completo con tu desglose, listo para enviar a tu gestor
- **Tarjeta para compartir** — imagen 1080×1080 px para LinkedIn, Instagram o WhatsApp

---

## Instalación paso a paso

### Paso 1 — Instala Node.js

Node.js es el motor que necesita la app para funcionar. Si ya lo tienes instalado (versión 18 o superior), salta al Paso 2.

**Windows:**
1. Ve a [https://nodejs.org](https://nodejs.org) y descarga la versión **LTS** (la recomendada, botón verde grande).
2. Abre el instalador `.msi` descargado y sigue los pasos (siguiente → siguiente → instalar). No cambies ninguna opción.
3. Cuando termine, abre el **Símbolo del sistema** (busca "cmd" en el menú Inicio) y escribe:
   ```
   node --version
   ```
   Si ves algo como `v20.14.0`, Node está instalado correctamente.

**Mac:**
1. Ve a [https://nodejs.org](https://nodejs.org) y descarga el instalador **LTS** para macOS.
2. Abre el `.pkg` descargado y sigue los pasos.
3. Abre la app **Terminal** y escribe `node --version` para verificar.

   Alternativa si usas Homebrew:
   ```
   brew install node
   ```

**Linux / WSL (Ubuntu o Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

---

### Paso 2 — Descarga e instala la app

1. Descomprime el ZIP en la carpeta donde quieras tener la app (por ejemplo, `Documentos/cuanto-me-queda`).

2. Abre la terminal en esa carpeta:
   - **Windows:** haz clic derecho dentro de la carpeta → "Abrir en Terminal" (o "Abrir ventana de PowerShell aquí").
   - **Mac:** clic derecho en la carpeta → "Nuevo Terminal en la carpeta".
   - **Linux/WSL:** `cd` hasta la carpeta.

3. Ejecuta este comando (instala todas las dependencias, tarda 2-4 minutos la primera vez):
   ```
   npm run setup
   ```

---

### Paso 3 — Arranca la app

```
npm start
```

Abre tu navegador y ve a **http://localhost:3001**

La app arranca con datos de ejemplo para que puedas ver cómo funciona. Cambia los números y el resultado se actualiza al instante.

---

### Nota sobre el PDF y la tarjeta (primera vez)

La primera vez que pulses **"Descargar informe PDF"** o **"Tarjeta para compartir"**, la app descarga automáticamente el navegador interno que necesita para generar los archivos. Esto puede tardar entre 1 y 5 minutos dependiendo de tu conexión y ocurre una sola vez.

A partir de ahí, PDF y tarjeta se generan en segundos.

---

## Arranque en modo desarrollo (opcional)

Si quieres modificar el código, usa este comando en lugar de `npm start`:

```
npm run dev
```

Esto abre el cliente en **http://localhost:5173** con recarga automática al guardar cambios.

---

## Si usas Linux o WSL (solo desarrolladores)

La primera vez que generes un PDF en Linux o WSL, puede aparecer un error de librería del sistema. Solución en una línea:

```bash
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

Esto no afecta a usuarios de Windows, donde todo funciona sin pasos extra.

---

## Actualizar las tablas fiscales

Los valores de cuotas RETA e IPC se actualizan anualmente. Están en:

- `server/config/fiscal.js` → fuente de verdad (servidor + cálculos PDF/tarjeta)
- `client/src/utils/fiscal.js` → copia para el navegador (mantener sincronizada)

Ambos archivos tienen comentarios que indican qué cambiar y de dónde vienen los datos (RETA 2025, AEAT).

---

## Fórmulas utilizadas

**Neto real:**
```
neto = facturacion - cuota_autonomos - (facturacion × tipo_irpf) - gastos_deducibles
```

**Cuota de autónomos (tramos RETA 2025):**
Se calcula sobre el rendimiento neto (`facturacion - gastos`). La tabla de tramos está en `server/config/fiscal.js` y es actualizable.

**IVA:** 21% de la facturación. No es tuyo — se lo debes a Hacienda.

**€/hora real:** `neto / horas_trabajadas_al_mes`

**Asalariado equivalente (Comparador):** búsqueda binaria del salario bruto anual que, tras SS empleado (6,35%) e IRPF estatal progresivo aproximado, produce el mismo neto mensual. Orientativo — no incluye situación familiar ni comunidad autónoma.

---

## Aviso importante

Los cálculos son **orientativos**. Se basan en las tablas de cuotas RETA 2025 y en el tipo de retención IRPF configurado, que puede diferir de tu situación real según tu comunidad autónoma, deducciones, régimen especial o situación familiar. Este simulador no sustituye el asesoramiento de un gestor o asesor fiscal cualificado.

---

*Desarrollado por Silys · silys.pro*
