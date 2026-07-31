import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useServiceOrders } from '@/api/hooks'
import { Button, Card, EmptyState, Loading, PageHeader, StatusBadge, Table, Td, Th } from '@/components/ui'

export function ServiceOrdersPage() {
  const [page, setPage] = useState(1)
  const pageSize = 15
  const q = useServiceOrders({ page, pageSize })
  const data = q.data

  return (
    <div>
      <PageHeader title="Ordens de serviço" subtitle="Ativas, ordenadas por prioridade de status"
        actions={<Link to="/service-orders/new"><Button>+ Nova OS</Button></Link>} />

      <Card className="p-4">
        {q.isLoading ? <Loading /> : !data?.items?.length ? <EmptyState message="Nenhuma ordem de serviço ativa." /> : (
          <>
            <Table>
              <thead><tr><Th>OS</Th><Th>Status</Th><Th>Serviços</Th><Th>Aberta em</Th><Th /></tr></thead>
              <tbody>
                {data.items.map((o) => (
                  <tr key={o.id}>
                    <Td className="font-medium">#{o.osCode}</Td>
                    <Td><StatusBadge status={o.status} /></Td>
                    <Td className="text-slate-500">{o.requestedJobIds?.length ?? 0}</Td>
                    <Td className="text-slate-500">{o.createdOn ? new Date(o.createdOn).toLocaleString('pt-BR') : '—'}</Td>
                    <Td className="text-right"><Link to={`/service-orders/${o.id}`} className="text-sm text-brand-600 hover:underline">abrir</Link></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{String(data.totalCount)} OS · página {String(data.page)} de {Math.max(1, Number(data.totalPages))}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                <Button variant="secondary" disabled={page >= Number(data.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
