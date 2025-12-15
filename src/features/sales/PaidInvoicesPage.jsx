import React from 'react';
import SalesListingsPage from "./SalesListingsPage";

const PaidInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Paid Invoices" },
  ];

  return (
    <SalesListingsPage
      title="Paid Invoices"
      description="Sales that have been fully paid."
      initialFilters={{ paymentStatus: "Paid payment" }}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default PaidInvoices;