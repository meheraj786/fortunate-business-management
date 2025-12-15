import React from 'react';
import SalesListingsPage from "./SalesListingsPage";

const NotInvoicedSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Not Invoiced Sales" },
  ];

  return (
    <SalesListingsPage
      title="Not Invoiced Sales"
      description="Sales that have not been invoiced yet."
      initialFilters={{ invoiceStatus: "Not-invoiced" }}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default NotInvoicedSales;