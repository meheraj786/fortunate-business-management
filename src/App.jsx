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
import Accounts from "./pages/Accounts/Accounts";
import Banking from "./pages/Banking/Banking";
import LCform from "./pages/lc_management/LCform";
import CustomerForm from "./pages/customer_management/CustomerForm";
import ProductDetails from "./pages/stock_management/ProductDetails";
import SaleDetails from "./pages/Sales/SaleDetails";
import InvoiceGenerator from "./pages/InvoiceGenerator";

import NotInvoicedSales from "./pages/Sales/NotInvoicedSales";
import DueInvoices from "./pages/Sales/DueInvoices";
import PaidInvoices from "./pages/Sales/PaidInvoices";
import CancelledSales from "./pages/Sales/CancelledSales";
import DisplayInvoice from "./pages/Sales/DisplayInvoice";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
  },
  {
    path: "/lc-management",
    element: (
      <Layout>
        <LC />
      </Layout>
    ),
  },
  {
    path: "/customers",
    element: (
      <Layout>
        <Customers />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <Settings />
      </Layout>
    ),
  },
  {
    path: "/lc-details/:id",
    element: (
      <Layout>
        <LCdetails />
      </Layout>
    ),
  },
  {
    path: "/customer-details/:id",
    element: (
      <Layout>
        <CustomerDetails />
      </Layout>
    ),
  },
  {
    path: "/stock-management",
    element: (
      <Layout>
        <Stock />
      </Layout>
    ),
  },
  {
    path: "/stock/:warehouseId",
    element: (
      <Layout>
        <WarehouseStock />
      </Layout>
    ),
  },
  {
    path: "/stock/product/:productId",
    element: (
      <Layout>
        <ProductDetails />
      </Layout>
    ),
  },
  {
    path: "/team",
    element: (
      <Layout>
        <Team />
      </Layout>
    ),
  },
  {
    path: "/sales",
    element: (
      <Layout>
        <Sales />
      </Layout>
    ),
  },
  {
    path: "/sales/not-invoiced",
    element: (
      <Layout>
        <NotInvoicedSales />
      </Layout>
    ),
  },
  {
    path: "/sales/due-invoices",
    element: (
      <Layout>
        <DueInvoices />
      </Layout>
    ),
  },
  {
    path: "/sales/paid-invoices",
    element: (
      <Layout>
        <PaidInvoices />
      </Layout>
    ),
  },
  {
    path: "/sales/cancelled",
    element: (
      <Layout>
        <CancelledSales />
      </Layout>
    ),
  },
  {
    path: "/sales/:id",
    element: (
      <Layout>
        <SaleDetails />
      </Layout>
    ),
  },
  {
    path: "/sales/:id/invoice/:invoiceId",
    element: (
      <Layout>
        <DisplayInvoice />
      </Layout>
    ),
  },
  {
    path: "/accounts",
    element: (
      <Layout>
        <Accounts />
      </Layout>
    ),
  },
  {
    path: "/banking",
    element: (
      <Layout>
        <Banking />
      </Layout>
    ),
  },
  {
    path: "/lc-form",
    element: (
      <Layout>
        <LCform />
      </Layout>
    ),
  },
  {
    path: "/customer-form",
    element: (
      <Layout>
        <CustomerForm />
      </Layout>
    ),
  },
  {
    path: "/invoice",
    element: (
      <Layout>
        <InvoiceGenerator />
      </Layout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
