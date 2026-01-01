import React, { useMemo } from 'react';
import SalesListingsPage from './SalesListingsPage';

const CancelledSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Cancelled Sales" },
  ];

  const initialFilters = useMemo(() => ({ invoiceStatus: "Cancelled" }), []);

  return (
    <SalesListingsPage
      title="Cancelled Sales"
      description="Sales that have been cancelled."
      initialFilters={initialFilters}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default CancelledSales;