import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAddVehicle, useClient, useDeleteVehicle, useUpdateVehicle } from '@/api/hooks'
import type { VehicleDto } from '@/api/generated/model'
import { problemDetail } from '@/api/mutator'
import { Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Table, Td, Th } from '@/components/ui'

const emptyVehicle = { licensePlate: '', mark: '', model: '', color: '', yearFabrication: '', yearModel: '' }

export function ClientDetailPage() {
  const { id = '' } = useParams()
  const client = useClient(id)
  const add = useAddVehicle(); const update = useUpdateVehicle(); const del = useDeleteVehicle()
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<VehicleDto | null>(null)
  const [f, setF] = useState(emptyVehicle)

  const openNew = () => { setEditing(null); setF(emptyVehicle); setOpen(true) }
  const openEdit = (v: VehicleDto) => { setEditing(v); setF({ licensePlate: v.licensePlate, mark: v.mark, model: v.model, color: v.color, yearFabrication: String(v.yearFabrication), yearModel: String(v.yearModel) }); setOpen(true) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = { licensePlate: f.licensePlate, mark: f.mark, model: f.model, color: f.color, yearFabrication: Number(f.yearFabrication), yearModel: Number(f.yearModel) }
    try {
      // NOTA: cast temporário — no backend antigo dois DTOs se chamavam UpdateVehicleRequest
      // (colisão de schema). Já renomeado no backend; após rebuild + `npm run generate`, remova o cast.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (editing) await update.mutateAsync({ id: editing.id, data } as any)
      else await add.mutateAsync({ id, data })
      toast.success('Veículo salvo.'); setOpen(false); client.refetch()
    } catch (err) { toast.error(problemDetail(err)) }
  }
  const remove = async (v: VehicleDto) => {
    if (!confirm(`Remover ${v.licensePlate}?`)) return
    try { await del.mutateAsync({ id: v.id }); toast.success('Removido.'); client.refetch() } catch (err) { toast.error(problemDetail(err)) }
  }

  if (client.isLoading) return <Loading />
  const c = client.data
  if (!c) return <EmptyState message="Cliente não encontrado." />

  return (
    <div>
      <PageHeader title={c.name} subtitle={`${c.cpf ?? c.cnpj ?? ''} · ${c.email}`}
        actions={<Link to="/clients"><Button variant="secondary">← Voltar</Button></Link>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-2 font-semibold text-slate-700">Contato</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="inline text-slate-400">Telefone: </dt><dd className="inline">{c.phone || '—'}</dd></div>
            <div><dt className="inline text-slate-400">Endereço: </dt><dd className="inline">{[c.address?.street, c.address?.city, c.address?.state].filter(Boolean).join(', ') || '—'}</dd></div>
            <div><dt className="inline text-slate-400">CEP: </dt><dd className="inline">{c.address?.zipCode || '—'}</dd></div>
          </dl>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Veículos</h3>
            <Button onClick={openNew}>+ Adicionar veículo</Button>
          </div>
          {!c.vehicles?.length ? <EmptyState message="Nenhum veículo." /> : (
            <Table>
              <thead><tr><Th>Placa</Th><Th>Veículo</Th><Th>Ano</Th><Th /></tr></thead>
              <tbody>
                {c.vehicles.map((v) => (
                  <tr key={v.id}>
                    <Td className="font-medium">{v.licensePlate}</Td>
                    <Td>{[v.mark, v.model, v.color].filter(Boolean).join(' ')}</Td>
                    <Td className="text-slate-500">{String(v.yearFabrication)}/{String(v.yearModel)}</Td>
                    <Td className="text-right whitespace-nowrap">
                      <Button variant="ghost" onClick={() => openEdit(v)}>Editar</Button>
                      <Button variant="ghost" className="text-red-600" onClick={() => remove(v)}>Remover</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Modal open={open} title={editing ? 'Editar veículo' : 'Novo veículo'} onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button form="vehicle-form" type="submit">Salvar</Button></>}>
        <form id="vehicle-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Field label="Placa"><Input value={f.licensePlate} onChange={(e) => setF({ ...f, licensePlate: e.target.value })} required /></Field>
          <Field label="Marca"><Input value={f.mark} onChange={(e) => setF({ ...f, mark: e.target.value })} /></Field>
          <Field label="Modelo"><Input value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} /></Field>
          <Field label="Cor"><Input value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} /></Field>
          <Field label="Ano fabricação"><Input type="number" value={f.yearFabrication} onChange={(e) => setF({ ...f, yearFabrication: e.target.value })} /></Field>
          <Field label="Ano modelo"><Input type="number" value={f.yearModel} onChange={(e) => setF({ ...f, yearModel: e.target.value })} /></Field>
        </form>
      </Modal>
    </div>
  )
}
