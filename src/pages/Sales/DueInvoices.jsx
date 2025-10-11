import React, { useState, useMemo } from 'react';
import { salesData as initialSalesData } from '../../data/data';
import SalesTable from '../../components/common/SalesTable';
import SearchBar from '../../components/common/SearchBar';
import Breadcrumb from '../../components/common/Breadcrumb';

const DueInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const dueInvoices = useMemo(() => {
    return initialSalesData.filter(sale => 
      sale.paymentStatus === 'Due Payment'
    );
  }, []);

  const filteredSales = useMemo(() => {
    return dueInvoices.filter(sale =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toString().includes(searchTerm)
    );
  }, [dueInvoices, searchTerm]);

  const breadcrumbItems = [
    { label: 'Sales', path: '/sales' },
    { label: 'Due Invoices' },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Due Invoices
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sales with due payments.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <SearchBar onSearch={setSearchTerm} placeholder="Search by product, customer, or sale ID..." />
          </div>
          <SalesTable sales={filteredSales} />
        </div>
      </div>
    </div>
  );
};

export default DueInvoices;
