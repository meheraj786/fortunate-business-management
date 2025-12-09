import React from 'react';
import SalesListPage from './SalesListPage';

const NotInvoicedSales = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Not Invoiced Sales" },
  ];

  return (
    <SalesListPage
      title="Not Invoiced Sales"
      description="Sales that have not been invoiced yet."
      fetchUrl="/sales/get-all-not-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default NotInvoicedSales;