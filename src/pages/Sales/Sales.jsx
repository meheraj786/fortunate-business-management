import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
} from "lucide-react";
import { Link } from "react-router";
import { salesData as initialSalesData } from "../../data/data";
import AddSales from "./AddSales";
import SalesTable from "../../components/common/SalesTable";
import SalesStatCard from "../../components/common/SalesStatCard";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";

const Sales = () => {
  const [salesData, setSalesData] = useState(initialSalesData);
  const [showAddSale, setShowAddSale] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { baseUrl } = useContext(UrlContext);

  useEffect(() => {
    axios
      .get(`${baseUrl}sales/get-all-sales`)
      .then((res) => setSalesData(res.data.data));
  }, []);
  const { notInvoiced, dueInvoices, paidInvoices, cancelled } = useMemo(() => {
    return salesData.reduce(
      (acc, sale) => {
        if (sale.invoiceStatus === "Not Invoiced") {
          acc.notInvoiced++;
        }
        if (sale.paymentStatus === "Due Payment") {
          acc.dueInvoices++;
        }
        if (sale.paymentStatus === "Paid Payment") {
          acc.paidInvoices++;
        }
        if (sale.invoiceStatus === "Cancelled") {
          acc.cancelled++;
        }
        return acc;
      },
      { notInvoiced: 0, dueInvoices: 0, paidInvoices: 0, cancelled: 0 }
    );
  }, [salesData]);
console.log(salesData);

  const sortedData = useMemo(
    () =>
      [...salesData].sort(
        (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
      ),
    [salesData]
  );

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaleAdded = (newSale) => {
    const newId = Math.max(...salesData.map((s) => s.id)) + 1;
    setSalesData([{ ...newSale, id: newId }, ...salesData]);
    setShowAddSale(false);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 ">
      <AddSales
        isOpen={showAddSale}
        onClose={() => setShowAddSale(false)}
        onSaleAdded={handleSaleAdded}
      />

      <div className=" mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Sales Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track your product sales
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAddSale(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex-1 sm:flex-none justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Sale
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SalesStatCard
            title="Not Invoiced"
            count={notInvoiced}
            linkTo="/sales/not-invoiced"
            icon={FileWarning}
            color="yellow"
          />
          <SalesStatCard
            title="Due Invoices"
            count={dueInvoices}
            linkTo="/sales/due-invoices"
            icon={FileClock}
            color="orange"
          />
          <SalesStatCard
            title="Paid Invoices"
            count={paidInvoices}
            linkTo="/sales/paid-invoices"
            icon={FileCheck}
            color="green"
          />
          <SalesStatCard
            title="Cancelled"
            count={cancelled}
            linkTo="/sales/cancelled"
            icon={FileX}
            color="red"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  All Sales Records
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Showing {salesData.length} of {salesData.length} records
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <SalesTable sales={salesData} />
        </div>
      </div>
    </div>
  );
};

export default Sales;
