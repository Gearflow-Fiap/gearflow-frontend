// Aliases amigáveis para os hooks gerados pelo Orval (que têm nomes verbosos método+rota).
export {
  // Auth
  usePostApiIdentityAuthLogin as useLogin,
  usePostApiIdentityAuthRegister as useRegisterStaff,
  usePostApiIdentityAuthRevokeToken as useRevokeToken,

  // Catálogo (Jobs)
  useGetApiCatalogJobs as useJobs,
  useGetApiCatalogJobsId as useJob,
  usePostApiCatalogJobs as useCreateJob,
  usePutApiCatalogJobsId as useUpdateJob,
  useDeleteApiCatalogJobsId as useDeleteJob,

  // Clientes / Veículos
  useGetApiCustomersClients as useClients,
  useGetApiCustomersClientsId as useClient,
  usePostApiCustomersClients as useCreateClient,
  usePutApiCustomersClientsId as useUpdateClient,
  useDeleteApiCustomersClientsId as useDeleteClient,
  useGetApiCustomersClientsIdVehicles as useClientVehicles,
  usePostApiCustomersClientsIdVehicles as useAddVehicle,
  useGetApiCustomersClientsVehiclesId as useVehicle,
  usePutApiCustomersClientsVehiclesId as useUpdateVehicle,
  useDeleteApiCustomersClientsVehiclesId as useDeleteVehicle,

  // Estoque — Peças
  useGetApiInventoryParts as useParts,
  useGetApiInventoryPartsId as usePart,
  usePostApiInventoryParts as useCreatePart,
  usePutApiInventoryPartsId as useUpdatePart,
  useDeleteApiInventoryPartsId as useDeletePart,
  usePatchApiInventoryPartsIdStock as useAddPartStock,

  // Estoque — Insumos
  useGetApiInventoryConsumables as useConsumables,
  useGetApiInventoryConsumablesId as useConsumable,
  usePostApiInventoryConsumables as useCreateConsumable,
  usePutApiInventoryConsumablesId as useUpdateConsumable,
  useDeleteApiInventoryConsumablesId as useDeleteConsumable,
  usePatchApiInventoryConsumablesIdStock as useAddConsumableStock,

  // Ordens de Serviço
  useGetApiWorkshopServiceOrders as useServiceOrders,
  useGetApiWorkshopServiceOrdersId as useServiceOrder,
  useGetApiWorkshopServiceOrdersIdDetails as useServiceOrderDetails,
  useGetApiWorkshopServiceOrdersMonitoringAverage as useMonitoringAverage,
  usePostApiWorkshopServiceOrders as useCreateServiceOrder,
  usePutApiWorkshopServiceOrdersId as useUpdateServiceOrderVehicle,
  useDeleteApiWorkshopServiceOrdersId as useDeactivateServiceOrder,
  usePutApiWorkshopServiceOrdersIdInDiagnostic as useStartDiagnostic,
  usePutApiWorkshopServiceOrdersIdFinalizeDiagnostic as useFinalizeDiagnostic,
  usePutApiWorkshopServiceOrdersIdApproveBudget as useApproveBudget,
  usePutApiWorkshopServiceOrdersIdRejectBudget as useRejectBudget,
  usePutApiWorkshopServiceOrdersIdExecuteJob as useExecuteJob,
  usePutApiWorkshopServiceOrdersIdResumeExecutionFromWaitingParts as useResumeExecution,
  usePutApiWorkshopServiceOrdersIdFinalize as useFinalizeServiceOrder,
  usePutApiWorkshopServiceOrdersIdDeliver as useDeliverServiceOrder,

  // Orçamentos (público)
  useGetApiWorkshopBudgetsId as useBudget,
  usePutApiWorkshopBudgetsIdApprove as useApproveBudgetById,
  usePutApiWorkshopBudgetsIdReject as useRejectBudgetById,

  // Consulta pública (Externals)
  useGetApiExternalsClientIdServiceOrderId as usePublicServiceOrder,
} from './generated/endpoints'
