export const STATUS_LABEL: Record<string, string> = {
  Received: 'Recebida',
  InDiagnostic: 'Em diagnóstico',
  AwaitingApproval: 'Aguardando aprovação',
  InExecution: 'Em execução',
  AwaitingPartsOrConsumables: 'Aguardando peças/insumos',
  Finalized: 'Finalizada',
  Delivered: 'Entregue',
  Canceled: 'Cancelada',
}

export const STATUS_CLASS: Record<string, string> = {
  Received: 'bg-slate-100 text-slate-700',
  InDiagnostic: 'bg-amber-100 text-amber-800',
  AwaitingApproval: 'bg-blue-100 text-blue-800',
  InExecution: 'bg-indigo-100 text-indigo-800',
  AwaitingPartsOrConsumables: 'bg-orange-100 text-orange-800',
  Finalized: 'bg-emerald-100 text-emerald-800',
  Delivered: 'bg-green-100 text-green-800',
  Canceled: 'bg-red-100 text-red-800',
}

export const statusLabel = (s?: string) => (s ? STATUS_LABEL[s] ?? s : '—')
export const statusClass = (s?: string) => (s ? STATUS_CLASS[s] ?? 'bg-slate-100 text-slate-700' : '')
