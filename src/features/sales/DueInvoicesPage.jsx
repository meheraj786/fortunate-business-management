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
      initialFilters={{ paymentStatus: "Due payment" }}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default DueInvoices;