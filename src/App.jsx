import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";

import LoginPage from "@/features/login/LoginPage";
import Layout from "@/components/layout/Layout";
import PrivateRoute from "@/routes/PrivateRoutes";
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
const AddTeamMemForm = lazy(() => import("@/features/team/AddTeamMemForm"));
const SalesDashboardPage = lazy(() => import("@/features/sales/SalesDashboardPage"));
const DailyCashFlowPage = lazy(() => import("@/features/daily-cash-flow/DailyCashFlowPage"));
const AccountsPage = lazy(() => import("@/features/accounts/AccountsPage"));
const LCFormPage = lazy(() => import("@/features/lc-management/LCFormPage"));
const CustomerFormPage = lazy(() => import("@/features/customers/CustomerFormPage"));
const ProductDetailsPage = lazy(() => import("@/features/stock-management/ProductDetailsPage"));
const SaleDetailsPage = lazy(() => import("@/features/sales/SaleDetailsPage"));
const EditTeamMemForm = lazy(() => import("@/features/team/EditTeamMemForm"));
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
      { path: "lc-management", element: <LCPage /> },
      { path: "customers", element: <CustomersPage /> },
      {
        path: "settings",
        element: <SettingsPage />,
        children: [
          { index: true, element: <CategorySettingsPage /> },
          { path: "units", element: <UnitsSettingsPage /> },
        ],
      },
      { path: "team", element: <TeamPage /> },
      { path: "team/add", element: <AddTeamMemForm /> },
      { path: "team/edit/:id", element: <EditTeamMemForm /> },
      { path: "team/:id", element: <TeamDetailsPage /> },
      { path: "lc-details/:id", element: <LCDetailsPage /> },
      { path: "customer-details/:id", element: <CustomerDetailsPage /> },
      { path: "stock-management", element: <StockManagementPage /> },
      { path: "stock/:warehouseId", element: <WarehouseStockPage /> },
      { path: "stock/:warehouseId/product/:productId", element: <ProductDetailsPage /> },
      { index: true, element: <SalesDashboardPage /> },
      { path: "sales", element: <SalesDashboardPage /> },
      { path: "sales/not-invoiced", element: <NotInvoicedSalesPage /> },
      { path: "sales/due-invoices", element: <DueInvoicesPage /> },
      { path: "sales/paid-invoices", element: <PaidInvoicesPage /> },
      { path: "sales/cancelled", element: <CancelledSalesPage /> },
      { path: "sales/:id", element: <SaleDetailsPage /> },
      { path: "sales/:id/invoice/:invoiceId", element: <DisplayInvoicePage /> },
      { path: "daily-cash-flow", element: <DailyCashFlowPage /> },
      { path: "accounts", element: <AccountsPage /> },
      { path: "accounts/:accountId", element: <AccountDetailsPage /> },
      { path: "lc-form", element: <LCFormPage /> },
      { path: "lc-form/:id", element: <LCFormPage /> },
      { path: "customer-form", element: <CustomerFormPage /> },
      { path: "customer-form/:id", element: <CustomerFormPage /> },
      { path: "trash/:moduleName", element: <TrashPage /> },
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
