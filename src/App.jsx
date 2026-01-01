import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";

import LoginPage from "@/features/login/LoginPage";
import Layout from "@/components/layout/Layout";
import PrivateRoute from "@/routes/PrivateRoutes";
import Loading from "@/components/layout/Loading";
import { useAuth } from "./context/AuthContext";

// Lazy-loaded components
const LCPage = lazy(() => import("@/features/lc-management/LCPage"));
const CustomersPage = lazy(() => import("@/features/customers/CustomersPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const LCDetailsPage = lazy(() => import("@/features/lc-management/LCDetailsPage"));
const CustomerDetailsPage = lazy(() => import("@/features/customers/CustomerDetailsPage"));
const StockManagementPage = lazy(() => import("@/features/stock-management/StockManagementPage"));
const WarehouseStockPage = lazy(() => import("@/features/stock-management/WarehouseStockPage"));
const TeamPage = lazy(() => import("@/features/team/TeamPage"));
const SalesDashboardPage = lazy(() => import("@/features/sales/SalesDashboardPage"));
const DailyCashFlowPage = lazy(() => import("@/features/daily-cash-flow/DailyCashFlowPage"));
const AccountsPage = lazy(() => import("@/features/accounts/AccountsPage"));
const LCFormPage = lazy(() => import("@/features/lc-management/LCFormPage"));
const CustomerFormPage = lazy(() => import("@/features/customers/CustomerFormPage"));
const ProductDetailsPage = lazy(() => import("@/features/stock-management/ProductDetailsPage"));
const SaleDetailsPage = lazy(() => import("@/features/sales/SaleDetailsPage"));
const TeamDetailsPage = lazy(() => import("@/features/team/TeamDetailsPage"));
const NotInvoicedSalesPage = lazy(() => import("@/features/sales/NotInvoicedSalesPage"));
const DueInvoicesPage = lazy(() => import("@/features/sales/DueInvoicesPage"));
const PaidInvoicesPage = lazy(() => import("@/features/sales/PaidInvoicesPage"));
const CancelledSalesPage = lazy(() => import("@/features/sales/CancelledSalesPage"));
const DisplayInvoicePage = lazy(() => import("@/features/sales/DisplayInvoicePage"));
const CategorySettingsPage = lazy(() => import("@/features/settings/CategorySettingsPage"));
const UnitsSettingsPage = lazy(() => import("@/features/settings/UnitsSettingsPage"));
const AccountDetailsPage = lazy(() => import("@/features/accounts/AccountDetailsPage"));
const TrashPage = lazy(() => import("./features/trash/TrashPage"));

const createSuspense = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { path: "lc-management", element: createSuspense(LCPage) },
      { path: "customers", element: createSuspense(CustomersPage) },
      {
        path: "settings",
        element: createSuspense(SettingsPage),
        children: [
          { index: true, element: createSuspense(CategorySettingsPage) },
          { path: "units", element: createSuspense(UnitsSettingsPage) },
        ],
      },
      { path: "lc-details/:id", element: createSuspense(LCDetailsPage) },
      { path: "customer-details/:id", element: createSuspense(CustomerDetailsPage) },
      { path: "stock-management", element: createSuspense(StockManagementPage) },
      { path: "stock/:warehouseId", element: createSuspense(WarehouseStockPage) },
      { path: "stock/:warehouseId/product/:productId", element: createSuspense(ProductDetailsPage) },
      { path: "team", element: createSuspense(TeamPage) },
      { path: "team/:id", element: createSuspense(TeamDetailsPage) },
      { index: true, element: createSuspense(SalesDashboardPage) },
      { path: "sales", element: createSuspense(SalesDashboardPage) },
      { path: "sales/not-invoiced", element: createSuspense(NotInvoicedSalesPage) },
      { path: "sales/due-invoices", element: createSuspense(DueInvoicesPage) },
      { path: "sales/paid-invoices", element: createSuspense(PaidInvoicesPage) },
      { path: "sales/cancelled", element: createSuspense(CancelledSalesPage) },
      { path: "sales/:id", element: createSuspense(SaleDetailsPage) },
      { path: "sales/:id/invoice/:invoiceId", element: createSuspense(DisplayInvoicePage) },
      { path: "daily-cash-flow", element: createSuspense(DailyCashFlowPage) },
      { path: "accounts", element: createSuspense(AccountsPage) },
      { path: "accounts/:accountId", element: createSuspense(AccountDetailsPage) },
      { path: "lc-form", element: createSuspense(LCFormPage) },
      { path: "lc-form/:id", element: createSuspense(LCFormPage) },
      { path: "customer-form", element: createSuspense(CustomerFormPage) },
      { path: "customer-form/:id", element: createSuspense(CustomerFormPage) },
      { path: "trash/:moduleName", element: createSuspense(TrashPage) },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#000",
          },
        }}
      />
    </>
  );
};

export default App;
