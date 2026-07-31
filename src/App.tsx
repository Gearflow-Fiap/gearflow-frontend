import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/layout/ProtectedRoute'
import { AppLayout } from '@/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage'
import { CatalogPage } from '@/pages/catalog/CatalogPage'
import { InventoryPage } from '@/pages/inventory/InventoryPage'
import { ServiceOrdersPage } from '@/pages/service-orders/ServiceOrdersPage'
import { NewServiceOrderPage } from '@/pages/service-orders/NewServiceOrderPage'
import { ServiceOrderDetailPage } from '@/pages/service-orders/ServiceOrderDetailPage'
import { PublicStatusPage } from '@/pages/PublicStatusPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public-status" element={<PublicStatusPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/service-orders" element={<ServiceOrdersPage />} />
          <Route path="/service-orders/new" element={<NewServiceOrderPage />} />
          <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
