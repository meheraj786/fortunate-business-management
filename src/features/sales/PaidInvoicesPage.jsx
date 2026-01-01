import React, { useMemo } from 'react';
import SalesListingsPage from "./SalesListingsPage";

const PaidInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Paid Invoices" },
  ];

  const initialFilters = useMemo(() => ({ paymentStatus: "Paid payment" }), []);

  return (
    <SalesListingsPage
      title="Paid Invoices"
      description="Sales that have been fully paid."
      initialFilters={initialFilters}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default PaidInvoices;