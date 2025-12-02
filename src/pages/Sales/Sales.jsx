import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
  Grid2x2Check,
  Download,
} from "lucide-react";
import { Link } from "react-router";
import AddSales from "./AddSales";
import SalesTable from "../../components/common/SalesTable";
import SalesStatCard from "../../components/common/SalesStatCard";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import { exportToExcel } from "../../components/exportXlsx/ExportXlxs";
import toast from "react-hot-toast";

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [salesStats, setSalesStats] = useState({
    notInvoiced: 0,
    due: 0,
    paid: 0,
    cancelled: 0,
  });
  const [showAddSale, setShowAddSale] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { baseUrl } = useContext(UrlContext);

  const fetchSales = () => {
    axios
      .get(`${baseUrl}sales/get-all-sales`)
      .then((res) => setSalesData(res.data.data || []))
      .catch((error) => {
        console.error("Error fetching all sales:", error);
      });
  };

  useEffect(() => {
    fetchSales();
  }, [baseUrl]);

  useEffect(() => {
    axios
      .get(`${baseUrl}sales/get-all-invoices-status-count`)
      .then((res) => {
        if (res.data && res.data.data) {
          setSalesStats({
            notInvoiced: res.data.data.notInvoiced || 0,
            due: res.data.data.due || 0,
            paid: res.data.data.paid || 0,
            cancelled: res.data.data.cancelled || 0,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching sales stats:", error);
      });
  }, [baseUrl]);

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

  const handleSaleAdded = () => {
    setShowAddSale(false);
  };

  const handleExport = () => {
    const formattedSales = salesData.map((sale) => ({
      Product: sale?.product?.name,
      LC_Number: sale?.product?.LC?.basicInfo?.lcNumber,
      Quantity: `${sale.quantity} ${sale.product?.unit?.name}`,
      Unit_Price: sale?.pricePerUnit,
      Total_Amount: sale?.totalAmount,
      Customer: sale?.customer?.name,
      Invoice_Status: sale?.invoiceStatus,
      Payment_Status: sale?.paymentStatus,
      Sale_Date: new Date(sale.saleDate).toLocaleDateString("en-GB"),
    }));

    const today = new Date().toISOString().split("T")[0];

    exportToExcel(
      formattedSales,
      `Sales_Report_${today}.xlsx`,
      `Sales Data ${today}`
    );
    toast.success("Sales Data Exported as XLSX");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AddSales
          isOpen={showAddSale}
          onClose={() => setShowAddSale(false)}
          onSaleAdded={handleSaleAdded}
        />

        {/* Header Section */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage and track your product sales
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <Download className="w-4 h-4" />
              Export XLSX
            </button>
            <button
              onClick={() => setShowAddSale(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Plus className="w-4 h-4" />
              Add Sale
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SalesStatCard
            title="Not Invoiced"
            count={salesStats.notInvoiced}
            linkTo="/sales/not-invoiced"
            icon={FileWarning}
            color="yellow"
          />
          <SalesStatCard
            title="Due Invoices"
            count={salesStats.due}
            linkTo="/sales/due-invoices"
            icon={FileClock}
            color="orange"
          />
          <SalesStatCard
            title="Paid Invoices"
            count={salesStats.paid}
            linkTo="/sales/paid-invoices"
            icon={FileCheck}
            color="green"
          />
          <SalesStatCard
            title="Cancelled"
            count={salesStats.cancelled}
            linkTo="/sales/cancelled"
            icon={FileX}
            color="red"
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Sales Records
                </h2>
                <p className="mt-1 text-sm text-gray-700">
                  Showing {paginatedData.length} of {salesData.length} records
                </p>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-700 min-w-[100px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            <SalesTable 
              sales={paginatedData}
              title=""
              description=""
            />
            
            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, salesData.length)}
                  </span>{" "}
                  of <span className="font-medium">{salesData.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          } rounded-md`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;