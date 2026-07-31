import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useClients, useCreateServiceOrder, useJobs, useParts } from '@/api/hooks'
import { problemDetail } from '@/api/mutator'
import { Button, Card, Field, Input, Loading, PageHeader, Select } from '@/components/ui'
import { toBRL } from '@/lib/money'

export function NewServiceOrderPage() {
  const navigate = useNavigate()
  const clients = useClients()
  const jobs = useJobs()
  const parts = useParts()
  const create = useCreateServiceOrder()

  const [clientId, setClientId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [jobIds, setJobIds] = useState<string[]>([])
  const [partQty, setPartQty] = useState<Record<string, number>>({})

  const vehicles = useMemo(
    () => clients.data?.find((c) => c.id === clientId)?.vehicles ?? [],
    [clients.data, clientId],
  )

  const toggleJob = (id: string) =>
    setJobIds((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!vehicleId) return toast.error('Selecione um veículo.')
    if (jobIds.length === 0) return toast.error('Selecione ao menos um serviço.')
    const partsList = Object.entries(partQty)
      .filter(([, q]) => q > 0)
      .map(([partId, quantity]) => ({ partId, quantity }))
    try {
      const os = await create.mutateAsync({ data: { vehicleId, jobIds, parts: partsList } })
      toast.success(`OS #${os.osCode} aberta.`)
      navigate(`/service-orders/${os.id}`)
    } catch (err) {
      toast.error(problemDetail(err))
    }
  }

  if (clients.isLoading || jobs.isLoading || parts.isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Nova ordem de serviço"
        actions={<Link to="/service-orders"><Button variant="secondary">← Voltar</Button></Link>} />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <h3 className="font-semibold text-slate-700">Cliente e veículo</h3>
          <Field label="Cliente">
            <Select value={clientId} onChange={(e) => { setClientId(e.target.value); setVehicleId('') }} required>
              <option value="">Selecione…</option>
              {clients.data?.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.cpf ?? c.cnpj})</option>)}
            </Select>
          </Field>
          <Field label="Veículo" hint={clientId && vehicles.length === 0 ? 'Este cliente não tem veículos — cadastre um na tela do cliente.' : undefined}>
            <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!clientId} required>
              <option value="">Selecione…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.licensePlate} — {v.mark} {v.model}</option>)}
            </Select>
          </Field>
        </Card>

        <Card className="space-y-3 p-4">
          <h3 className="font-semibold text-slate-700">Serviços solicitados</h3>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {jobs.data?.map((j) => (
              <label key={j.id} className="flex items-center justify-between rounded px-2 py-1 hover:bg-slate-50">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={jobIds.includes(j.id)} onChange={() => toggleJob(j.id)} />
                  {j.name}
                </span>
                <span className="text-sm text-slate-500">{toBRL(Number(j.priceCents))}</span>
              </label>
            ))}
            {!jobs.data?.length && <p className="text-sm text-slate-400">Nenhum serviço no catálogo.</p>}
          </div>
        </Card>

        <Card className="space-y-3 p-4 lg:col-span-2">
          <h3 className="font-semibold text-slate-700">Peças (opcional)</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {parts.data?.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2">
                <span className="text-sm">{p.name}<span className="block text-xs text-slate-400">disp: {String(p.quantity)}</span></span>
                <Input type="number" min={0} className="w-20" value={partQty[p.id] ?? ''} placeholder="0"
                  onChange={(e) => setPartQty({ ...partQty, [p.id]: Number(e.target.value) })} />
              </div>
            ))}
            {!parts.data?.length && <p className="text-sm text-slate-400">Nenhuma peça no estoque.</p>}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Abrindo…' : 'Abrir ordem de serviço'}</Button>
        </div>
      </form>
    </div>
  )
}
