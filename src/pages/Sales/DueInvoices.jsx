import React from 'react';
import SalesListPage from './SalesListPage';

const DueInvoices = () => {
  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Due Invoices" },
  ];

  return (
    <SalesListPage
      title="Due Invoices"
      description="Sales with due payments."
      fetchUrl="/sales/get-all-due-invoices"
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default DueInvoices;