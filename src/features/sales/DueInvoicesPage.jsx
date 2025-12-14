import React from 'react';
import SalesListingsPage from "./SalesListingsPage";

const DueInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Due Invoices" },
  ];

  return (
    <SalesListingsPage
      title="Due Invoices"
      description="Sales with due payments."
      fetchUrl="/sales/get-all-due-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default DueInvoices;