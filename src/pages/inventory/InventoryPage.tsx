import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import {
  useAddConsumableStock, useAddPartStock, useConsumables, useCreateConsumable, useCreatePart,
  useDeleteConsumable, useDeletePart, useParts, useUpdateConsumable, useUpdatePart,
} from '@/api/hooks'
import type { ConsumableDto, PartDto } from '@/api/generated/model'
import { problemDetail } from '@/api/mutator'
import { Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Table, Td, Th } from '@/components/ui'
import { centsFromInput, reaisFromCents, toBRL } from '@/lib/money'

function LowBadge({ below }: { below?: boolean }) {
  return below ? <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">baixo</span> : null
}

function PartsTab() {
  const parts = useParts()
  const create = useCreatePart(); const update = useUpdatePart(); const del = useDeletePart(); const addStock = useAddPartStock()
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<PartDto | null>(null)
  const [f, setF] = useState({ name: '', description: '', partNumber: '', manufacturer: '', price: '', quantity: '' })
  const [stockFor, setStockFor] = useState<PartDto | null>(null); const [stockQty, setStockQty] = useState('')

  const openNew = () => { setEditing(null); setF({ name: '', description: '', partNumber: '', manufacturer: '', price: '', quantity: '' }); setOpen(true) }
  const openEdit = (p: PartDto) => { setEditing(p); setF({ name: p.name, description: p.description, partNumber: p.partNumber, manufacturer: p.manufacturer, price: reaisFromCents(Number(p.priceCents)), quantity: String(p.quantity) }); setOpen(true) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = { name: f.name, description: f.description, partNumber: f.partNumber, manufacturer: f.manufacturer, priceCents: centsFromInput(f.price), quantity: Number(f.quantity) }
    try {
      if (editing) await update.mutateAsync({ id: editing.id, data }); else await create.mutateAsync({ data })
      toast.success('Peça salva.'); setOpen(false); parts.refetch()
    } catch (err) { toast.error(problemDetail(err)) }
  }
  const remove = async (p: PartDto) => { if (!confirm(`Remover "${p.name}"?`)) return; try { await del.mutateAsync({ id: p.id }); toast.success('Removida.'); parts.refetch() } catch (err) { toast.error(problemDetail(err)) } }
  const submitStock = async (e: FormEvent) => { e.preventDefault(); if (!stockFor) return; try { await addStock.mutateAsync({ id: stockFor.id, data: { quantity: Number(stockQty) } }); toast.success('Estoque reposto.'); setStockFor(null); setStockQty(''); parts.refetch() } catch (err) { toast.error(problemDetail(err)) } }

  return (
    <Card className="p-4">
      <div className="mb-3 flex justify-end"><Button onClick={openNew}>+ Nova peça</Button></div>
      {parts.isLoading ? <Loading /> : !parts.data?.length ? <EmptyState message="Nenhuma peça." /> : (
        <Table>
          <thead><tr><Th>Peça</Th><Th>Fabricante</Th><Th className="text-right">Preço</Th><Th className="text-right">Disp.</Th><Th className="text-right">Reserv.</Th><Th /></tr></thead>
          <tbody>
            {parts.data.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}<span className="block text-xs text-slate-400">{p.partNumber}</span></Td>
                <Td className="text-slate-500">{p.manufacturer || '—'}</Td>
                <Td className="text-right">{toBRL(Number(p.priceCents))}</Td>
                <Td className="text-right">{String(p.quantity)}<LowBadge below={p.belowMinimum} /></Td>
                <Td className="text-right text-slate-500">{String(p.reservedQuantity)}</Td>
                <Td className="text-right whitespace-nowrap">
                  <Button variant="ghost" onClick={() => setStockFor(p)}>+ estoque</Button>
                  <Button variant="ghost" onClick={() => openEdit(p)}>Editar</Button>
                  <Button variant="ghost" className="text-red-600" onClick={() => remove(p)}>Remover</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={editing ? 'Editar peça' : 'Nova peça'} onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button form="part-form" type="submit">Salvar</Button></>}>
        <form id="part-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
          <Field label="Número da peça"><Input value={f.partNumber} onChange={(e) => setF({ ...f, partNumber: e.target.value })} /></Field>
          <Field label="Fabricante"><Input value={f.manufacturer} onChange={(e) => setF({ ...f, manufacturer: e.target.value })} /></Field>
          <Field label="Descrição"><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Preço (R$)"><Input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="80,00" required /></Field>
          <Field label="Quantidade"><Input type="number" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} required /></Field>
        </form>
      </Modal>

      <Modal open={!!stockFor} title={`Repor estoque — ${stockFor?.name ?? ''}`} onClose={() => setStockFor(null)}
        footer={<><Button variant="secondary" onClick={() => setStockFor(null)}>Cancelar</Button><Button form="part-stock" type="submit">Adicionar</Button></>}>
        <form id="part-stock" onSubmit={submitStock}><Field label="Quantidade a adicionar"><Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} autoFocus required /></Field></form>
      </Modal>
    </Card>
  )
}

function ConsumablesTab() {
  const items = useConsumables()
  const create = useCreateConsumable(); const update = useUpdateConsumable(); const del = useDeleteConsumable(); const addStock = useAddConsumableStock()
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<ConsumableDto | null>(null)
  const [f, setF] = useState({ name: '', price: '', quantity: '' })
  const [stockFor, setStockFor] = useState<ConsumableDto | null>(null); const [stockQty, setStockQty] = useState('')

  const openNew = () => { setEditing(null); setF({ name: '', price: '', quantity: '' }); setOpen(true) }
  const openEdit = (c: ConsumableDto) => { setEditing(c); setF({ name: c.name, price: reaisFromCents(Number(c.unitPriceCents)), quantity: String(c.quantity) }); setOpen(true) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = { name: f.name, unitPriceCents: centsFromInput(f.price), quantity: Number(f.quantity) }
    try { if (editing) await update.mutateAsync({ id: editing.id, data }); else await create.mutateAsync({ data }); toast.success('Insumo salvo.'); setOpen(false); items.refetch() } catch (err) { toast.error(problemDetail(err)) }
  }
  const remove = async (c: ConsumableDto) => { if (!confirm(`Remover "${c.name}"?`)) return; try { await del.mutateAsync({ id: c.id }); toast.success('Removido.'); items.refetch() } catch (err) { toast.error(problemDetail(err)) } }
  const submitStock = async (e: FormEvent) => { e.preventDefault(); if (!stockFor) return; try { await addStock.mutateAsync({ id: stockFor.id, data: { quantity: Number(stockQty) } }); toast.success('Estoque reposto.'); setStockFor(null); setStockQty(''); items.refetch() } catch (err) { toast.error(problemDetail(err)) } }

  return (
    <Card className="p-4">
      <div className="mb-3 flex justify-end"><Button onClick={openNew}>+ Novo insumo</Button></div>
      {items.isLoading ? <Loading /> : !items.data?.length ? <EmptyState message="Nenhum insumo." /> : (
        <Table>
          <thead><tr><Th>Insumo</Th><Th className="text-right">Preço un.</Th><Th className="text-right">Disp.</Th><Th className="text-right">Reserv.</Th><Th /></tr></thead>
          <tbody>
            {items.data.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-right">{toBRL(Number(c.unitPriceCents))}</Td>
                <Td className="text-right">{String(c.quantity)}<LowBadge below={c.belowMinimum} /></Td>
                <Td className="text-right text-slate-500">{String(c.reservedQuantity)}</Td>
                <Td className="text-right whitespace-nowrap">
                  <Button variant="ghost" onClick={() => setStockFor(c)}>+ estoque</Button>
                  <Button variant="ghost" onClick={() => openEdit(c)}>Editar</Button>
                  <Button variant="ghost" className="text-red-600" onClick={() => remove(c)}>Remover</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={editing ? 'Editar insumo' : 'Novo insumo'} onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button form="cons-form" type="submit">Salvar</Button></>}>
        <form id="cons-form" onSubmit={submit} className="space-y-4">
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
          <Field label="Preço unitário (R$)"><Input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="20,00" required /></Field>
          <Field label="Quantidade"><Input type="number" step="0.001" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} required /></Field>
        </form>
      </Modal>

      <Modal open={!!stockFor} title={`Repor estoque — ${stockFor?.name ?? ''}`} onClose={() => setStockFor(null)}
        footer={<><Button variant="secondary" onClick={() => setStockFor(null)}>Cancelar</Button><Button form="cons-stock" type="submit">Adicionar</Button></>}>
        <form id="cons-stock" onSubmit={submitStock}><Field label="Quantidade a adicionar"><Input type="number" step="0.001" value={stockQty} onChange={(e) => setStockQty(e.target.value)} autoFocus required /></Field></form>
      </Modal>
    </Card>
  )
}

export function InventoryPage() {
  const [tab, setTab] = useState<'parts' | 'consumables'>('parts')
  return (
    <div>
      <PageHeader title="Estoque" subtitle="Peças e insumos" />
      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'parts' ? 'primary' : 'secondary'} onClick={() => setTab('parts')}>Peças</Button>
        <Button variant={tab === 'consumables' ? 'primary' : 'secondary'} onClick={() => setTab('consumables')}>Insumos</Button>
      </div>
      {tab === 'parts' ? <PartsTab /> : <ConsumablesTab />}
    </div>
  )
}
