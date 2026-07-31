// Baixa o OpenAPI do backend para openapi.json (fonte do Orval).
import { writeFileSync } from 'node:fs'

const url = process.env.OPENAPI_URL || 'http://localhost:8080/openapi/v1.json'

try {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.text()
  writeFileSync('openapi.json', json)
  console.log(`✓ openapi.json atualizado de ${url}`)
} catch (err) {
  console.error(`✗ Falha ao buscar o OpenAPI em ${url}: ${err.message}`)
  console.error('  Suba o backend (docker compose up -d --build) e tente de novo.')
  process.exit(1)
}
