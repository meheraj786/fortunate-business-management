import React from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/layout/Layout";
import LC from "./pages/LC";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import LCdetails from "./pages/lc_management/LCdetails";
import CustomerDetails from "./pages/customer_management/CustomerDetails";
import Stock from "./pages/stock_management/Stock";
import WarehouseStock from "./pages/stock_management/WarehouseStock";
import Team from "./pages/Team";
import Sales from "./pages/Sales";
import Accounts from "./pages/Accounts";
import Banking from "./pages/Banking";
import LCform from "./pages/lc_management/LCform";
import CustomerForm from "./pages/customer_management/CustomerForm";
import InvoiceGenerator from "./pages/InvoiceGenerator ";

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
    path: "/stock/:warehouseName",
    element: (
      <Layout>
        <WarehouseStock />
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
