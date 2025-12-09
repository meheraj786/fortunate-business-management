import React, { useState, useMemo, useEffect } from "react";
import api from "../../api/axios";
import SalesTable from "../../components/common/SalesTable";
import SearchBar from "../../components/common/SearchBar";
import Breadcrumb from "../../components/common/Breadcrumb";
import toast from "react-hot-toast";

const SalesListPage = ({ title, description, fetchUrl, breadcrumbItems }) => {
  const [sales, setSales] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = () => {
      setLoading(true);
      // const toastId = toast.loading(`Loading ${title}...`); // Removed loading toast
      api
        .get(fetchUrl)
        .then((res) => {
          if (res.data && res.data.data) {
            setSales(res.data.data);
            // toast.success(`${title} loaded successfully`, { id: toastId }); // Removed success toast
          } else {
            toast.error(`Failed to load ${title}`); // Kept error toast
          }
        })
        .catch((error) => {
          console.error(`Error fetching ${title}:`, error);
          toast.error(`Could not fetch ${title}.`); // Kept error toast
        })
        .finally(() => {
          setLoading(false);
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
  }, [fetchUrl, title]);

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

  return (
    <div className="">
      <div className="mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {description}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by product, customer, or sale ID..."
            />
          </div>
          <div className="px-3 pb-3">
            <SalesTable sales={filteredSales} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesListPage;
