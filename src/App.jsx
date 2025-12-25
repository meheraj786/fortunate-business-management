import React from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import LoginPage from "@/features/login/LoginPage";
import Layout from "@/components/layout/Layout";
import LCPage from "@/features/lc-management/LCPage";
import CustomersPage from "@/features/customers/CustomersPage";
import SettingsPage from "@/features/settings/SettingsPage";
import LCDetailsPage from "@/features/lc-management/LCDetailsPage";
import CustomerDetailsPage from "@/features/customers/CustomerDetailsPage";
import StockManagementPage from "@/features/stock-management/StockManagementPage";
import WarehouseStockPage from "@/features/stock-management/WarehouseStockPage";
import TeamPage from "@/features/team/TeamPage";
import SalesDashboardPage from "@/features/sales/SalesDashboardPage";
import DailyCashFlowPage from "@/features/daily-cash-flow/DailyCashFlowPage";
import AccountsPage from "@/features/accounts/AccountsPage";
import LCFormPage from "@/features/lc-management/LCFormPage";
import CustomerFormPage from "@/features/customers/CustomerFormPage";
import ProductDetailsPage from "@/features/stock-management/ProductDetailsPage";
import SaleDetailsPage from "@/features/sales/SaleDetailsPage";
import TeamDetailsPage from "@/features/team/TeamDetailsPage";
import { Toaster } from "react-hot-toast";

import NotInvoicedSalesPage from "@/features/sales/NotInvoicedSalesPage";
import DueInvoicesPage from "@/features/sales/DueInvoicesPage";
import PaidInvoicesPage from "@/features/sales/PaidInvoicesPage";
import CancelledSalesPage from "@/features/sales/CancelledSalesPage";
import DisplayInvoicePage from "@/features/sales/DisplayInvoicePage";
import CategorySettingsPage from "@/features/settings/CategorySettingsPage";
import UnitsSettingsPage from "@/features/settings/UnitsSettingsPage";
import PrivateRoute from "@/routes/PrivateRoutes";
import AccountDetailsPage from "@/features/accounts/AccountDetailsPage";
import { useAuth } from "./context/AuthContext";

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
      {
        path: "lc-management",
        element: <LCPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
        children: [
          {
            index: true,
            element: <CategorySettingsPage />,
          },
          {
            path: "units",
            element: <UnitsSettingsPage />,
          },
        ],
      },
      {
        path: "lc-details/:id",
        element: <LCDetailsPage />,
      },
      {
        path: "customer-details/:id",
        element: <CustomerDetailsPage />,
      },
      {
        path: "stock-management",
        element: <StockManagementPage />,
      },
      {
        path: "stock/:warehouseId",
        element: <WarehouseStockPage />,
      },
      {
        path: "stock/:warehouseId/product/:productId",
        element: <ProductDetailsPage />,
      },
      {
        path: "team",
        element: <TeamPage />,
      },
      {
        path: "team/:id",
        element: <TeamDetailsPage />,
      },
      {
        index: true,
        element: <SalesDashboardPage />,
      },
      {
        path: "sales",
        element: <SalesDashboardPage />,
      },
      {
        path: "sales/not-invoiced",
        element: <NotInvoicedSalesPage />,
      },
      {
        path: "sales/due-invoices",
        element: <DueInvoicesPage />,
      },
      {
        path: "sales/paid-invoices",
        element: <PaidInvoicesPage />,
      },
      {
        path: "sales/cancelled",
        element: <CancelledSalesPage />,
      },
      {
        path: "sales/:id",
        element: <SaleDetailsPage />,
      },
      {
        path: "sales/:id/invoice/:invoiceId",
        element: <DisplayInvoicePage />,
      },
      {
        path: "daily-cash-flow",
        element: <DailyCashFlowPage />,
      },
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "accounts/:accountId",
        element: <AccountDetailsPage />,
      },
      {
        path: "lc-form",
        element: <LCFormPage />,
      },
      {
        path: "lc-form/:id",
        element: <LCFormPage />,
      },
      {
        path: "customer-form",
        element: <CustomerFormPage />,
      },
      {
        path: "customer-form/:id",
        element: <CustomerFormPage />,
      },
    ],
  },
]);

const App = () => {
  const { user } = useAuth();
  console.log(user, "userrrrrrrrrrrr");
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
