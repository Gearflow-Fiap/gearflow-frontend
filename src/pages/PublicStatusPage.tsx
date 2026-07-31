import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiExternalsClientIdServiceOrderId } from '@/api/generated/endpoints'
import type { ServiceOrderDto } from '@/api/generated/model'
import { Button, Card, Field, Input, Spinner, StatusBadge } from '@/components/ui'
import { problemDetail } from '@/api/mutator'

export function PublicStatusPage() {
  const [clientId, setClientId] = useState('')
  const [osId, setOsId] = useState('')
  const [result, setResult] = useState<ServiceOrderDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await getApiExternalsClientIdServiceOrderId(clientId, osId)
      setResult(r)
    } catch (err) {
      setError(problemDetail(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Consulta de OS</h1>
        <Link to="/login" className="text-sm text-brand-600 hover:underline">área da oficina →</Link>
      </div>

      <Card className="p-5">
        <form onSubmit={submit} className="space-y-4">
          <Field label="ID do cliente"><Input value={clientId} onChange={(e) => setClientId(e.target.value)} required /></Field>
          <Field label="ID da ordem de serviço"><Input value={osId} onChange={(e) => setOsId(e.target.value)} required /></Field>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Consultando…' : 'Consultar'}</Button>
        </form>
      </Card>

      {(loading || error || result) && (
        <Card className="mt-4 p-5">
          {loading ? <div className="flex justify-center"><Spinner /></div>
            : error ? <p className="text-sm text-red-600">{error}</p>
            : result ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">OS #{String(result.osCode)}</span>
                  <StatusBadge status={result.status} />
                </div>
                <p className="text-sm text-slate-500">Aberta em {result.createdOn ? new Date(result.createdOn).toLocaleString('pt-BR') : '—'}</p>
              </div>
            ) : null}
        </Card>
      )}
    </div>
  )
}
