import React, { useMemo } from 'react';
import SalesListingsPage from "./SalesListingsPage";

const NotInvoicedSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Not Invoiced Sales" },
  ];

  const initialFilters = useMemo(() => ({ invoiceStatus: "Not-invoiced" }), []);

  return (
    <SalesListingsPage
      title="Not Invoiced Sales"
      description="Sales that have not been invoiced yet."
      initialFilters={initialFilters}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default NotInvoicedSales;