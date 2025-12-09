import React from 'react';
import SalesListPage from './SalesListPage';

const CancelledSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Cancelled Sales" },
  ];

  return (
    <SalesListPage
      title="Cancelled Sales"
      description="Sales that have been cancelled."
      fetchUrl="/sales/get-all-cancelled-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default CancelledSales;