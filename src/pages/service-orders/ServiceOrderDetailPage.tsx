import { FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useApproveBudget, useConsumables, useDeactivateServiceOrder, useDeliverServiceOrder, useExecuteJob,
  useFinalizeDiagnostic, useFinalizeServiceOrder, useRejectBudget, useResumeExecution,
  useServiceOrderDetails, useStartDiagnostic, useUpdateServiceOrderVehicle,
} from '@/api/hooks'
import { problemDetail } from '@/api/mutator'
import { Button, Card, Field, Input, Loading, Modal, PageHeader, Select, StatusBadge, Table, Td, Th } from '@/components/ui'
import { toBRL } from '@/lib/money'

export function ServiceOrderDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const details = useServiceOrderDetails(id)
  const consumables = useConsumables()

  const startDiag = useStartDiagnostic()
  const finalizeDiag = useFinalizeDiagnostic()
  const approve = useApproveBudget()
  const reject = useRejectBudget()
  const executeJob = useExecuteJob()
  const resume = useResumeExecution()
  const finalize = useFinalizeServiceOrder()
  const deliver = useDeliverServiceOrder()
  const deactivate = useDeactivateServiceOrder()
  const updateVehicle = useUpdateServiceOrderVehicle()

  const [diagOpen, setDiagOpen] = useState(false)
  const [diagRows, setDiagRows] = useState<{ consumableId: string; quantity: string }[]>([])
  const [vehOpen, setVehOpen] = useState(false)
  const [newVehicleId, setNewVehicleId] = useState('')

  const refetch = () => details.refetch()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function act(m: { mutateAsync: (v: any) => Promise<any> }, vars: any, msg: string) {
    try { await m.mutateAsync(vars); toast.success(msg); refetch() }
    catch (err) { toast.error(problemDetail(err)) }
  }

  const submitDiag = async (e: FormEvent) => {
    e.preventDefault()
    const list = diagRows.filter((r) => r.consumableId && Number(r.quantity) > 0)
      .map((r) => ({ consumableId: r.consumableId, quantity: Number(r.quantity) }))
    await act(finalizeDiag, { id, data: { consumables: list } }, 'Diagnóstico finalizado — orçamento gerado.')
    setDiagOpen(false); setDiagRows([])
  }
  const submitVehicle = async (e: FormEvent) => {
    e.preventDefault()
    await act(updateVehicle, { id, data: { vehicleId: newVehicleId } }, 'Veículo atualizado.')
    setVehOpen(false); setNewVehicleId('')
  }
  const doDeactivate = async () => {
    if (!confirm('Desativar esta OS?')) return
    try { await deactivate.mutateAsync({ id }); toast.success('OS desativada.'); navigate('/service-orders') }
    catch (err) { toast.error(problemDetail(err)) }
  }

  if (details.isLoading) return <Loading />
  const d = details.data
  if (!d?.order) return <p className="text-slate-500">Ordem de serviço não encontrada.</p>
  const o = d.order
  const b = d.budget
  const s = o.status ?? ''
  const editable = s === 'Received' || s === 'InDiagnostic'

  return (
    <div>
      <PageHeader title={`OS #${o.osCode}`}
        actions={<Link to="/service-orders"><Button variant="secondary">← Voltar</Button></Link>} />
      <div className="mb-4 flex items-center gap-3"><StatusBadge status={s} /><span className="text-sm text-slate-500">Aberta em {o.createdOn ? new Date(o.createdOn).toLocaleString('pt-BR') : '—'}</span></div>

      {/* Ações do ciclo de vida */}
      <Card className="mb-6 flex flex-wrap gap-2 p-4">
        {s === 'Received' && <Button onClick={() => act(startDiag, { id }, 'Diagnóstico iniciado.')}>Iniciar diagnóstico</Button>}
        {s === 'InDiagnostic' && <Button onClick={() => { setDiagRows([]); setDiagOpen(true) }}>Finalizar diagnóstico</Button>}
        {s === 'AwaitingApproval' && <>
          <Button onClick={() => act(approve, { id }, 'Orçamento aprovado.')}>Aprovar orçamento</Button>
          <Button variant="danger" onClick={() => act(reject, { id }, 'Orçamento rejeitado.')}>Rejeitar orçamento</Button>
        </>}
        {s === 'AwaitingPartsOrConsumables' && <Button onClick={() => act(resume, { id }, 'Execução retomada.')}>Retomar execução</Button>}
        {s === 'InExecution' && <Button onClick={() => act(finalize, { id }, 'OS finalizada.')}>Finalizar OS</Button>}
        {s === 'Finalized' && <Button onClick={() => act(deliver, { id }, 'Veículo entregue.')}>Entregar</Button>}
        {editable && <Button variant="secondary" onClick={() => setVehOpen(true)}>Trocar veículo</Button>}
        {editable && <Button variant="ghost" className="text-red-600" onClick={doDeactivate}>Desativar</Button>}
        {(s === 'Delivered' || s === 'Canceled') && <span className="text-sm text-slate-400">OS encerrada.</span>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orçamento */}
        <Card className="p-4">
          <h3 className="mb-3 font-semibold text-slate-700">Orçamento</h3>
          {!b ? <p className="text-sm text-slate-400">Ainda não gerado (finalize o diagnóstico).</p> : (
            <>
              <Table>
                <thead><tr><Th>Item</Th><Th className="text-right">Valor</Th><Th /></tr></thead>
                <tbody>
                  {b.jobs?.map((j) => (
                    <tr key={j.id}>
                      <Td>Serviço {j.isExecuted ? '✓' : ''}</Td>
                      <Td className="text-right">{toBRL(Number(j.priceCents))}</Td>
                      <Td className="text-right">
                        {s === 'InExecution' && !j.isExecuted &&
                          <Button variant="ghost" onClick={() => act(executeJob, { id, data: { budgetJobId: j.id } }, 'Serviço executado.')}>executar</Button>}
                      </Td>
                    </tr>
                  ))}
                  {b.parts?.map((p, i) => (
                    <tr key={`p${i}`}><Td>Peça ×{String(p.quantity)}</Td><Td className="text-right">{toBRL(Number(p.priceCents) * Number(p.quantity))}</Td><Td /></tr>
                  ))}
                  {b.consumables?.map((c, i) => (
                    <tr key={`c${i}`}><Td>Insumo ×{String(c.quantity)}</Td><Td className="text-right">{toBRL(Number(c.priceCents))}</Td><Td /></tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm text-slate-500">
                  {b.isApproved === true ? 'Aprovado' : b.isApproved === false ? 'Rejeitado' : 'Aguardando revisão'}
                </span>
                <span className="text-lg font-semibold">{toBRL(Number(b.totalPriceCents))}</span>
              </div>
            </>
          )}
        </Card>

        {/* Timeline */}
        <Card className="p-4">
          <h3 className="mb-3 font-semibold text-slate-700">Histórico</h3>
          <ol className="space-y-3">
            {o.history?.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <div className="flex items-center gap-2"><StatusBadge status={h.status} /><span className="text-xs text-slate-400">{h.createdOn ? new Date(h.createdOn).toLocaleString('pt-BR') : ''}</span></div>
                  <p className="text-sm text-slate-600">{h.message}</p>
                  <p className="text-xs text-slate-400">por {h.changedByType}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Modal finalizar diagnóstico (insumos opcionais) */}
      <Modal open={diagOpen} title="Finalizar diagnóstico" onClose={() => setDiagOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setDiagOpen(false)}>Cancelar</Button><Button form="diag-form" type="submit">Gerar orçamento</Button></>}>
        <form id="diag-form" onSubmit={submitDiag} className="space-y-3">
          <p className="text-sm text-slate-500">Insumos usados no diagnóstico (opcional):</p>
          {diagRows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Select value={r.consumableId} onChange={(e) => setDiagRows(diagRows.map((x, j) => j === i ? { ...x, consumableId: e.target.value } : x))}>
                <option value="">Insumo…</option>
                {consumables.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Input type="number" step="0.001" className="w-24" placeholder="qtd" value={r.quantity}
                onChange={(e) => setDiagRows(diagRows.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))} />
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => setDiagRows([...diagRows, { consumableId: '', quantity: '' }])}>+ insumo</Button>
        </form>
      </Modal>

      {/* Modal trocar veículo */}
      <Modal open={vehOpen} title="Trocar veículo" onClose={() => setVehOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setVehOpen(false)}>Cancelar</Button><Button form="veh-form" type="submit">Salvar</Button></>}>
        <form id="veh-form" onSubmit={submitVehicle}>
          <Field label="ID do veículo" hint="Copie o id de um veículo do cliente (tela do cliente).">
            <Input value={newVehicleId} onChange={(e) => setNewVehicleId(e.target.value)} required />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
