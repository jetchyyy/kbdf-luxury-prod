import { Routes, Route } from "react-router-dom";
import { AppShell } from "./core/layout/AppShell";
import { HomePage } from "./features/home/HomePage";
import { TrackPage } from "./features/track/TrackPage";
import { ShopPage } from "./features/shop/ShopPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
import { ContactPage } from "./features/contact/ContactPage";
import { AuthPage } from "./features/auth/AuthPage";
import { CartProvider } from "./features/cart/CartContext";
import { CartDrawer } from "./features/cart/CartDrawer";

// Admin Imports
import { AdminAuthProvider } from "./features/admin/context/AdminAuthContext";
import { AdminAuthGuard } from "./features/admin/AdminAuthGuard";
import { AdminLayout } from "./features/admin/layout/AdminLayout";
import { AdminLoginPage } from "./features/admin/pages/LoginPage";
import { OverviewPage } from "./features/admin/pages/OverviewPage";
import { AnalyticsPage } from "./features/admin/pages/AnalyticsPage";
import { ItemsPage } from "./features/admin/pages/ItemsPage";
import { CategoriesPage as AdminCategoriesPage } from "./features/admin/pages/CategoriesPage";
import { UsersPage } from "./features/admin/pages/UsersPage";
import { RolesPage } from "./features/admin/pages/RolesPage";
import { LeadsPage } from "./features/admin/pages/LeadsPage";
import { ExpensesPage } from "./features/admin/pages/ExpensesPage";
import { PaymentMethodsPage } from "./features/admin/pages/PaymentMethodsPage";
import { SettingsPage } from "./features/admin/pages/SettingsPage";
import { PromoCodesPage } from "./features/admin/pages/PromoCodesPage";

// Superadmin Imports
import { SuperAdminGuard } from "./features/superadmin/SuperAdminGuard";
import { SuperAdminLayout } from "./features/superadmin/layout/SuperAdminLayout";
import { SuperAdminLoginPage } from "./features/superadmin/pages/LoginPage";
import { PlatformDashboardPage } from "./features/superadmin/pages/DashboardPage";
import { TenantsPage } from "./features/superadmin/pages/TenantsPage";
import { TenantDetailPage } from "./features/superadmin/pages/TenantDetailPage";
import { PlatformSettingsPage } from "./features/superadmin/pages/PlatformSettingsPage";

import { CheckoutPage } from "./features/checkout/CheckoutPage";
import { OrdersPage } from "./features/admin/pages/OrdersPage";
import { TenantProvider } from "./core/context/TenantContext";
import { UserAuthProvider } from "./core/context/UserAuthContext";
import { CustomerOrdersPage } from "./features/checkout/CustomerOrdersPage";
import { NotificationProvider } from "./core/context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <AdminAuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <Routes>
            {/* Storefront Routes (wrapped in AppShell with custom navbar/footer) */}
            <Route
              path="/*"
              element={
                <TenantProvider>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/track" element={<TrackPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<CustomerOrdersPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                    </Routes>
                    <CartDrawer />
                  </AppShell>
                </TenantProvider>
              }
            />

          {/* Tenant Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/*"
            element={
              <AdminAuthGuard>
                <AdminLayout>
                  <Routes>
                    <Route index element={<OverviewPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="items" element={<ItemsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="roles" element={<RolesPage />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="payment-methods" element={<PaymentMethodsPage />} />
                    <Route path="promo-codes" element={<PromoCodesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Routes>
                </AdminLayout>
              </AdminAuthGuard>
            }
          />

          {/* Platform Superadmin Routes */}
          <Route path="/odc/login" element={<SuperAdminLoginPage />} />
          <Route
            path="/odc/*"
            element={
              <SuperAdminGuard>
                <SuperAdminLayout>
                  <Routes>
                    <Route index element={<PlatformDashboardPage />} />
                    <Route path="tenants" element={<TenantsPage />} />
                    <Route path="tenants/:id" element={<TenantDetailPage />} />
                    <Route path="settings" element={<PlatformSettingsPage />} />
                  </Routes>
                </SuperAdminLayout>
              </SuperAdminGuard>
            }
          />
        </Routes>
       </CartProvider>
      </UserAuthProvider>
     </AdminAuthProvider>
    </NotificationProvider>
  );
}

export default App;
