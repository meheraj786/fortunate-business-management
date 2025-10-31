import React from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Layout from "./components/layout/Layout";
import LC from "./pages/lc_management/LC";
import Customers from "./pages/customer_management/Customers";
import Settings from "./pages/Settings/Settings";
import LCdetails from "./pages/lc_management/LCdetails";
import CustomerDetails from "./pages/customer_management/CustomerDetails";
import Stock from "./pages/stock_management/StockManagement";
import WarehouseStock from "./pages/stock_management/WarehouseStock";
import Team from "./pages/Team/Team";
import Sales from "./pages/Sales/Sales";
import DailyCashFlow from "./pages/DailyCashFlow/DailyCashFlow";
import Banking from "./pages/Banking/Banking";
import LCform from "./pages/lc_management/LCform";
import CustomerForm from "./pages/customer_management/CustomerForm";
import ProductDetails from "./pages/stock_management/ProductDetails";
import SaleDetails from "./pages/Sales/SaleDetails";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import TeamDetails from "./pages/Team/TeamDetails";
import { Toaster } from "react-hot-toast";

import NotInvoicedSales from "./pages/Sales/NotInvoicedSales";
import DueInvoices from "./pages/Sales/DueInvoices";
import PaidInvoices from "./pages/Sales/PaidInvoices";
import CancelledSales from "./pages/Sales/CancelledSales";
import DisplayInvoice from "./pages/Sales/DisplayInvoice";
import CategorySettings from "./pages/Settings/CategorySettings";
import UnitsSettings from "./pages/Settings/UnitsSettings";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "lc-management",
        element: <LC />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "settings",
        element: <Settings />,
        children: [
          {
            index: true,
            element: <CategorySettings />,
          },
          {
            path: "units",
            element: <UnitsSettings />,
          },
        ],
      },
      {
        path: "lc-details/:id",
        element: <LCdetails />,
      },
      {
        path: "customer-details/:id",
        element: <CustomerDetails />,
      },
      {
        path: "stock-management",
        element: <Stock />,
      },
      {
        path: "stock/:warehouseId",
        element: <WarehouseStock />,
      },
      {
        path: "stock/product/:productId",
        element: <ProductDetails />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "team/:id",
        element: <TeamDetails />,
      },
      {
        path: "sales",
        element: <Sales />,
      },
      {
        path: "sales/not-invoiced",
        element: <NotInvoicedSales />,
      },
      {
        path: "sales/due-invoices",
        element: <DueInvoices />,
      },
      {
        path: "sales/paid-invoices",
        element: <PaidInvoices />,
      },
      {
        path: "sales/cancelled",
        element: <CancelledSales />,
      },
      {
        path: "sales/:id",
        element: <SaleDetails />,
      },
      {
        path: "sales/:id/invoice/:invoiceId",
        element: <DisplayInvoice />,
      },
      {
        path: "daily-cash-flow",
        element: <DailyCashFlow />,
      },
      {
        path: "banking",
        element: <Banking />,
      },
      {
        path: "lc-form",
        element: <LCform />,
      },
      {
        path: "customer-form",
        element: <CustomerForm />,
      },
      {
        path: "invoice",
        element: <InvoiceGenerator />,
      },
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
