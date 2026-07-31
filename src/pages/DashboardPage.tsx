import { Link } from 'react-router-dom'
import { useMonitoringAverage, useServiceOrders } from '@/api/hooks'
import { Card, EmptyState, Loading, PageHeader, StatusBadge, Table, Td, Th } from '@/components/ui'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
    </Card>
  )
}

const fmtMin = (m?: number | string) => {
  const n = Number(m ?? 0)
  return n ? `${n.toFixed(1)} min` : '—'
}

export function DashboardPage() {
  const avg = useMonitoringAverage()
  const orders = useServiceOrders({ page: 1, pageSize: 8 })

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral da oficina" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Tempo médio — Diagnóstico" value={fmtMin(avg.data?.diagnosticMinutes)} />
        <Stat label="Tempo médio — Execução" value={fmtMin(avg.data?.executionMinutes)} />
        <Stat label="Tempo médio — Finalização" value={fmtMin(avg.data?.finalizationMinutes)} />
        <Stat label="OS na amostra" value={String(avg.data?.sampleSize ?? 0)} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Ordens de serviço ativas</h2>
          <Link to="/service-orders" className="text-sm text-brand-600 hover:underline">
            ver todas
          </Link>
        </div>
        {orders.isLoading ? (
          <Loading />
        ) : !orders.data?.items?.length ? (
          <EmptyState message="Nenhuma ordem de serviço ativa." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>OS</Th>
                <Th>Status</Th>
                <Th>Aberta em</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.data.items.map((o) => (
                <tr key={o.id}>
                  <Td className="font-medium">#{o.osCode}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td className="text-slate-500">{o.createdOn ? new Date(o.createdOn).toLocaleString('pt-BR') : '—'}</Td>
                  <Td className="text-right">
                    <Link to={`/service-orders/${o.id}`} className="text-sm text-brand-600 hover:underline">
                      abrir
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
