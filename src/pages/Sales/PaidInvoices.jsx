import React from 'react';
import SalesListPage from './SalesListPage';

const PaidInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Paid Invoices" },
  ];

  return (
    <SalesListPage
      title="Paid Invoices"
      description="Sales that have been fully paid."
      fetchUrl="/sales/get-all-paid-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default PaidInvoices;