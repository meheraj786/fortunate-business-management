import React, { Suspense, lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getSalesSummaryTable } from "@/api/sales.api";
import { getLCSummary } from "@/api/lc.api";
import { getCustomersSummary } from "@/api/customer.api";
import { getAllAccounts } from "@/api/account.api";

import { useAuth } from "@/hooks/useAuth";

import LoginPage from "@/features/login/LoginPage";
import Layout from "@/components/layout/Layout";
import PrivateRoute from "@/routes/PrivateRoutes";

// Auto-reload once if a lazy chunk fails to load (stale cache after deploy)
const lazyWithRetry = (importFn) =>
  lazy(() =>
    importFn().catch(() => {
      const hasReloaded = sessionStorage.getItem("chunk_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload", "1");
        window.location.reload();
        return new Promise(() => { }); // never resolves — page is reloading
      }
      sessionStorage.removeItem("chunk_reload");
      return importFn(); // retry once more, let it throw naturally if still broken
    }),
  );

// Lazy-loaded components
const LCPage = lazyWithRetry(() => import("@/features/lc-management/LCPage"));
const CustomersPage = lazyWithRetry(() => import("@/features/customers/CustomersPage"));
const SettingsPage = lazyWithRetry(() => import("@/features/settings/SettingsPage"));
const LCDetailsPage = lazyWithRetry(
  () => import("@/features/lc-management/LCDetailsPage"),
);
const CustomerDetailsPage = lazyWithRetry(
  () => import("@/features/customers/CustomerDetailsPage"),
);
const StockManagementPage = lazyWithRetry(
  () => import("@/features/stock-management/StockManagementPage"),
);
const WarehouseStockPage = lazyWithRetry(
  () => import("@/features/stock-management/WarehouseStockPage"),
);
const TeamPage = lazyWithRetry(() => import("@/features/team/TeamPage"));
const AddTeamMemForm = lazyWithRetry(() => import("@/features/team/AddTeamMemForm"));
const SalesDashboardPage = lazyWithRetry(
  () => import("@/features/sales/SalesDashboardPage"),
);
const DailyCashFlowPage = lazyWithRetry(
  () => import("@/features/daily-cash-flow/DailyCashFlowPage"),
);
const AccountsPage = lazyWithRetry(() => import("@/features/accounts/AccountsPage"));
const LCFormPage = lazyWithRetry(() => import("@/features/lc-management/LCFormPage"));
const CustomerFormPage = lazyWithRetry(
  () => import("@/features/customers/CustomerFormPage"),
);
const ProductDetailsPage = lazyWithRetry(
  () => import("@/features/stock-management/ProductDetailsPage"),
);
const SaleDetailsPage = lazyWithRetry(() => import("@/features/sales/SaleDetailsPage"));
const EditTeamMemForm = lazyWithRetry(() => import("@/features/team/EditTeamMemForm"));
const TeamDetailsPage = lazyWithRetry(() => import("@/features/team/TeamDetailsPage"));
const NotInvoicedSalesPage = lazyWithRetry(
  () => import("@/features/sales/NotInvoicedSalesPage"),
);
const DueInvoicesPage = lazyWithRetry(() => import("@/features/sales/DueInvoicesPage"));
const PaidInvoicesPage = lazyWithRetry(
  () => import("@/features/sales/PaidInvoicesPage"),
);
const CancelledSalesPage = lazyWithRetry(
  () => import("@/features/sales/CancelledSalesPage"),
);
const DisplayInvoicePage = lazyWithRetry(
  () => import("@/features/sales/DisplayInvoicePage"),
);
const CategorySettingsPage = lazyWithRetry(
  () => import("@/features/settings/CategorySettingsPage"),
);
const UnitsSettingsPage = lazyWithRetry(
  () => import("@/features/settings/UnitsSettingsPage"),
);
const GeneralSettingsPage = lazyWithRetry(
  () => import("@/features/settings/GeneralSettingsPage"),
);
const WipeoutSettingsPage = lazyWithRetry(
  () => import("@/features/settings/WipeoutSettingsPage"),
);
const BackupSettings = lazyWithRetry(() => import("@/features/settings/BackupSettings"));
const AccountDetailsPage = lazyWithRetry(
  () => import("@/features/accounts/AccountDetailsPage"),
);
const TrashPage = lazyWithRetry(() => import("./features/trash/TrashPage"));
const AuditLogsPage = lazyWithRetry(
  () => import("@/features/settings/AuditLogsPage"),
);
const AdvancePaymentsPage = lazyWithRetry(
  () => import("@/features/advance-payments/AdvancePaymentsPage"),
);
const AdvancePaymentDetailsPage = lazyWithRetry(
  () => import("@/features/advance-payments/AdvancePaymentDetailsPage"),
);
const ReportsPage = lazyWithRetry(
  () => import("@/features/reports/ReportsPage"),
);
const DueCustomersReport = lazyWithRetry(
  () => import("@/features/reports/DueCustomersReport"),
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
      { path: "lc-management", element: <LCPage /> },
      { path: "customers", element: <CustomersPage /> },
      {
        path: "settings",
        element: <SettingsPage />,
        children: [
          { index: true, element: <CategorySettingsPage /> },
          { path: "units", element: <UnitsSettingsPage /> },
          { path: "general", element: <GeneralSettingsPage /> },
          { path: "wipeout", element: <WipeoutSettingsPage /> },
          { path: "backup", element: <BackupSettings /> },
          { path: "audit-logs", element: <AuditLogsPage /> },
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
      {
        path: "stock/:warehouseId/product/:productId",
        element: <ProductDetailsPage />,
      },
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
      { path: "advance-payments", element: <AdvancePaymentsPage /> },
      { path: "advance-payments/:id", element: <AdvancePaymentDetailsPage /> },
      {
        path: "reports",
        element: <ReportsPage />,
        children: [
          { index: true, element: <DueCustomersReport /> },
        ],
      },
      { path: "trash/:moduleName", element: <TrashPage /> },
    ],
  },
]);

const App = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const staleTime = 5 * 60 * 1000;
    // Warm up the dashboard data
    queryClient.prefetchQuery({
      queryKey: ["sales", "summary", {}],
      queryFn: async () => (await getSalesSummaryTable({})).data,
      staleTime,
    });
    queryClient.prefetchQuery({
      queryKey: ["lcs", "summary", {}],
      queryFn: async () => (await getLCSummary({})).data,
      staleTime,
    });
    queryClient.prefetchQuery({
      queryKey: ["customers", "summary", {}],
      queryFn: async () => (await getCustomersSummary({})).data,
      staleTime,
    });
    queryClient.prefetchQuery({
      queryKey: ["accounts"],
      queryFn: async () => (await getAllAccounts()).data,
      staleTime,
    });
  }, [queryClient]);

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
