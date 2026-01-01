import React, { useMemo } from 'react';
import SalesListingsPage from "./SalesListingsPage";

const DueInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Due Invoices" },
  ];

  const initialFilters = useMemo(() => ({ paymentStatus: "Due payment" }), []);

  return (
    <SalesListingsPage
      title="Due Invoices"
      description="Sales with due payments."
      initialFilters={initialFilters}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default DueInvoices;