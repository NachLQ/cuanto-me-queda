import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const distPath = join(__dirname, '../client/dist')

app.use(express.json({ limit: '1mb' }))

// Archivos del cliente (build de producción)
if (existsSync(distPath)) {
  app.use(express.static(distPath))
} else {
  console.warn('⚠️  client/dist no existe. Ejecuta "npm run build" para generarlo.')
}

// SPA fallback
app.get('*', (_req, res) => {
  const index = join(distPath, 'index.html')
  if (existsSync(index)) {
    res.sendFile(index)
  } else {
    res.status(503).send('Ejecuta "npm run build" y reinicia el servidor.')
  }
})

app.listen(PORT, () => {
  console.log(`✅  ¿Cuánto Me Queda? → http://localhost:${PORT}`)
})
