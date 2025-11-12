import React, { useState, useMemo, useEffect, useContext } from "react";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import SalesTable from "../../components/common/SalesTable";
import SearchBar from "../../components/common/SearchBar";
import Breadcrumb from "../../components/common/Breadcrumb";

const DueInvoices = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { baseUrl } = useContext(UrlContext);

  useEffect(() => {
    axios
      .get(`${baseUrl}sales/get-all-due-invoices`)
      .then((res) => {
        if (res.data && res.data.data) {
          setSales(res.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching due invoices:", error);
      });
  }, [baseUrl]);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter(
      (sale) =>
        (sale.product?.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (sale.customer?.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (sale._id?.toString() || "").includes(searchTerm)
    );
  }, [sales, searchTerm]);

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Due Invoices" },
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
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by product, customer, or sale ID..."
            />
          </div>
          <SalesTable sales={filteredSales} />
        </div>
      </div>
    </div>
  );
};

export default DueInvoices;
