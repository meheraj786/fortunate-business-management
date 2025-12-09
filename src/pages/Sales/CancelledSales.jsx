import React, { useState, useMemo, useEffect, useContext } from "react";
import api from "../../api/axios";

import SalesTable from "../../components/common/SalesTable";
import SearchBar from "../../components/common/SearchBar";
import Breadcrumb from "../../components/common/Breadcrumb";
import toast from "react-hot-toast";

const CancelledSales = () => {
  const [sales, setSales] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const fetchSales = () => {
      api
        .get(`/sales/get-all-cancelled-invoices`)
        .then((res) => {
          if (res.data && res.data.data) {
            setSales(res.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching cancelled sales:", error);
        });
    };

    const fetchUnits = async () => {
      try {
        const response = await api.get(`/unit/get`);
        if (response.data.success) {
          setUnits(response.data.data || []);
        } else {
          toast.error(response.data.message || "Failed to fetch units.");
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        toast.error("An unexpected error occurred while fetching units.");
      }
    };

    fetchSales();
    fetchUnits();
  }, []);

  const augmentedSales = useMemo(() => {
    if (!units.length) return sales;
    const unitsMap = new Map(units.map((unit) => [unit._id, unit]));
    return sales.map((sale) => ({
      ...sale,
      unit: unitsMap.get(sale.unit) || sale.unit,
    }));
  }, [sales, units]);

  const filteredSales = useMemo(() => {
    if (!augmentedSales) return [];
    return augmentedSales.filter(
      (sale) =>
        (sale.product?.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (sale.customer?.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (sale._id?.toString() || "").includes(searchTerm)
    );
  }, [augmentedSales, searchTerm]);

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: "Cancelled Sales" },
  ];

  return (
    <div className="">
      <div className="mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Cancelled Sales
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sales that have been cancelled.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by product, customer, or sale ID..."
            />
          </div>
          <div className="px-3 pb-3"><SalesTable sales={filteredSales} /></div>
          
        </div>
      </div>
    </div>
  );
};

export default CancelledSales;
