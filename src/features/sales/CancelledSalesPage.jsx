import React from 'react';
import SalesListingsPage from './SalesListingsPage';

const CancelledSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Cancelled Sales" },
  ];

  return (
    <SalesListingsPage
      title="Cancelled Sales"
      description="Sales that have been cancelled."
      fetchUrl="/sales/get-all-cancelled-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default CancelledSales;