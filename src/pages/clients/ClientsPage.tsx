import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useClients, useCreateClient, useDeleteClient } from '@/api/hooks'
import { problemDetail } from '@/api/mutator'
import { Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Table, Td, Th } from '@/components/ui'

const emptyForm = {
  doc: '', docType: 'cpf' as 'cpf' | 'cnpj', name: '', email: '', phone: '',
  street: '', city: '', state: '', country: 'Brasil', zipCode: '',
}

export function ClientsPage() {
  const clients = useClients()
  const create = useCreateClient()
  const del = useDeleteClient()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState(emptyForm)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = {
      cpf: f.docType === 'cpf' ? f.doc : null,
      cnpj: f.docType === 'cnpj' ? f.doc : null,
      name: f.name, email: f.email, phone: f.phone,
      address: { street: f.street, city: f.city, state: f.state, country: f.country, zipCode: f.zipCode },
    }
    try {
      await create.mutateAsync({ data })
      toast.success('Cliente criado.'); setOpen(false); setF(emptyForm); clients.refetch()
    } catch (err) { toast.error(problemDetail(err)) }
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remover "${name}" e seus veículos?`)) return
    try { await del.mutateAsync({ id }); toast.success('Removido.'); clients.refetch() } catch (err) { toast.error(problemDetail(err)) }
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Clientes da oficina e seus veículos"
        actions={<Button onClick={() => { setF(emptyForm); setOpen(true) }}>+ Novo cliente</Button>} />

      <Card className="p-4">
        {clients.isLoading ? <Loading /> : !clients.data?.length ? <EmptyState message="Nenhum cliente." /> : (
          <Table>
            <thead><tr><Th>Nome</Th><Th>Documento</Th><Th>Contato</Th><Th className="text-right">Veículos</Th><Th /></tr></thead>
            <tbody>
              {clients.data.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium"><Link to={`/clients/${c.id}`} className="text-brand-600 hover:underline">{c.name}</Link></Td>
                  <Td className="text-slate-500">{c.cpf ?? c.cnpj ?? '—'}</Td>
                  <Td className="text-slate-500">{c.email}<span className="block text-xs">{c.phone}</span></Td>
                  <Td className="text-right">{c.vehicles?.length ?? 0}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <Link to={`/clients/${c.id}`}><Button variant="ghost">Abrir</Button></Link>
                    <Button variant="ghost" className="text-red-600" onClick={() => remove(c.id, c.name)}>Remover</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} title="Novo cliente" onClose={() => setOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button form="client-form" type="submit" disabled={create.isPending}>Salvar</Button></>}>
        <form id="client-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Field label="Tipo de documento">
            <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={f.docType} onChange={(e) => setF({ ...f, docType: e.target.value as 'cpf' | 'cnpj' })}>
              <option value="cpf">CPF</option><option value="cnpj">CNPJ</option>
            </select>
          </Field>
          <Field label={f.docType.toUpperCase()}><Input value={f.doc} onChange={(e) => setF({ ...f, doc: e.target.value })} required /></Field>
          <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
          <Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
          <Field label="Telefone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Rua"><Input value={f.street} onChange={(e) => setF({ ...f, street: e.target.value })} /></Field>
          <Field label="Cidade"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
          <Field label="UF"><Input value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} /></Field>
          <Field label="CEP"><Input value={f.zipCode} onChange={(e) => setF({ ...f, zipCode: e.target.value })} /></Field>
        </form>
      </Modal>
    </div>
  )
}
