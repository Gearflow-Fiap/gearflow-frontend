import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateJob, useDeleteJob, useJobs, useUpdateJob } from '@/api/hooks'
import type { JobDto } from '@/api/generated/model'
import { problemDetail } from '@/api/mutator'
import { Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Table, Td, Textarea, Th } from '@/components/ui'
import { centsFromInput, reaisFromCents, toBRL } from '@/lib/money'

export function CatalogPage() {
  const jobs = useJobs()
  const create = useCreateJob()
  const update = useUpdateJob()
  const del = useDeleteJob()

  const [editing, setEditing] = useState<JobDto | null>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const openNew = () => {
    setEditing(null); setName(''); setDescription(''); setPrice(''); setOpen(true)
  }
  const openEdit = (j: JobDto) => {
    setEditing(j); setName(j.name); setDescription(j.description); setPrice(reaisFromCents(Number(j.priceCents))); setOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = { name, description, priceCents: centsFromInput(price) }
    try {
      if (editing) await update.mutateAsync({ id: editing.id, data })
      else await create.mutateAsync({ data })
      toast.success('Serviço salvo.')
      setOpen(false); jobs.refetch()
    } catch (err) { toast.error(problemDetail(err)) }
  }

  const remove = async (j: JobDto) => {
    if (!confirm(`Remover "${j.name}"?`)) return
    try { await del.mutateAsync({ id: j.id }); toast.success('Removido.'); jobs.refetch() }
    catch (err) { toast.error(problemDetail(err)) }
  }

  return (
    <div>
      <PageHeader title="Catálogo de serviços" subtitle="Serviços de mão de obra"
        actions={<Button onClick={openNew}>+ Novo serviço</Button>} />

      <Card className="p-4">
        {jobs.isLoading ? <Loading /> : !jobs.data?.length ? <EmptyState message="Nenhum serviço cadastrado." /> : (
          <Table>
            <thead><tr><Th>Nome</Th><Th>Descrição</Th><Th className="text-right">Preço</Th><Th /></tr></thead>
            <tbody>
              {jobs.data.map((j) => (
                <tr key={j.id}>
                  <Td className="font-medium">{j.name}</Td>
                  <Td className="text-slate-500">{j.description || '—'}</Td>
                  <Td className="text-right">{toBRL(Number(j.priceCents))}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <Button variant="ghost" onClick={() => openEdit(j)}>Editar</Button>
                    <Button variant="ghost" className="text-red-600" onClick={() => remove(j)}>Remover</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} title={editing ? 'Editar serviço' : 'Novo serviço'} onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button form="job-form" type="submit" disabled={create.isPending || update.isPending}>Salvar</Button>
          </>
        }>
        <form id="job-form" onSubmit={submit} className="space-y-4">
          <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Descrição"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></Field>
          <Field label="Preço (R$)"><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150,00" required /></Field>
        </form>
      </Modal>
    </div>
  )
}
