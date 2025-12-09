// LC.jsx
import React, { useState, useEffect, useContext } from "react";
import Flex from "../../layout/Flex";
import StatBox from "../../components/common/StatBox";
import LCTable from "../../layout/LCTable";
import {
  BookmarkCheck,
  BookmarkX,
  Gpu,
  MonitorDot,
  Plus,
  Grid2x2Check,
} from "lucide-react";
import api from "../../api/axios";

import { Link } from "react-router";
import { exportToExcel } from "../../components/exportXlsx/ExportXlxs";
import toast from "react-hot-toast";

const LC = () => {
  const [lcData, setLcData] = useState([]);
  const [lcCounts, setLcCounts] = useState({
    Active: 0,
    Completed: 0,
    Draft: 0,
    Cancelled: 0,
  });


  useEffect(() => {
    // const toastId = toast.loading("Loading LC data..."); // Removed loading toast
    api.get(`/lc/summary`).then((res) => {
      if (Array.isArray(res.data.data)) {
        setLcData(res.data.data);
        // toast.success("LC data loaded", { id: toastId }); // Removed success toast
      } else {
        setLcData([]);
        toast.error("Failed to load LC data"); // Kept error toast, removed id
      }
    }).catch((error) => {
      console.error("Error fetching LC summary:", error);
      toast.error("Could not fetch LC data."); // Kept error toast
    });
  }, []);

  useEffect(() => {
    api
      .get(`/lc/counts/status`)
      .then((res) => {
        if (res.data && res.data.data) {
          setLcCounts({
            Active: res.data.data.Active || 0,
            Completed: res.data.data.Completed || 0,
            Draft: res.data.data.Draft || 0,
            Cancelled: res.data.data.Cancelled || 0,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching LC counts:", error);
        toast.error("Could not fetch LC statistics.");
      });
  }, []);

  const formatDateForExport = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    return date.toLocaleDateString();
  };
  
  const handleExport = () => {
    const toastId = toast.loading("Preparing data for export...");
    const formattedData = lcData.map((lc) => ({
      LC_Number: lc.lcNumber || lc.basicInfo?.lcNumber || "N/A",
      Status: lc.status || lc.basicInfo?.status || "N/A",
      Supplier: lc.supplierName || lc.basicInfo?.supplierName || "N/A",
      Opening_Date: formatDateForExport(
        lc.lcOpeningDate || lc.basicInfo?.lcOpeningDate
      ),
      Arrival_Date: formatDateForExport(
        lc.dueDate || lc.shippingCustomsInfo?.expectedArrivalDate
      ),
      Products:
        lc.products
          ?.map(
            (p) =>
              `${p.itemName || "Unnamed"} (${p.quantity || 0} ${
                p.unit || "units"
              })`
          )
          .join(", ") ||
        lc.productInfo
          ?.map(
            (p) =>
              `${p.itemName || "Unnamed"} (${p.quantityValue || 0} ${
                p.quantityUnit?.name || "units"
              })`
          )
          .join(", ") ||
        "No products",
      Total_Quantity:
        lc.products?.reduce((acc, item) => acc + (item.quantity || 0), 0) ||
        lc.productInfo?.reduce(
          (acc, item) => acc + (item.quantityValue || 0),
          0
        ) ||
        0,
      Total_Cost_BDT: lc.totalCost || lc.financialInfo?.lcAmountBdt || 0,
    }));

    const today = new Date().toISOString().split("T")[0];
    exportToExcel(formattedData, `LC_Report_${today}.xlsx`, `LC Data ${today}`);
    toast.success("LC Table Exported As XLSX", { id: toastId });
  };

  return (
    <div>
      {/* Header with buttons */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Letters of Credit
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Overview of all registered LCs within your organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              <Grid2x2Check size={20} />
              <span>Export XLSX</span>
            </button>
            <Link to="/lc-form" className="sm:w-auto w-full">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors w-full">
                <Plus size={20} />
                <span>Add LC</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatBox
            title="Active LC"
            Icon={MonitorDot}
            number={lcCounts.Active}
            textColor="green"
          />
          <StatBox
            title="Completed LC"
            Icon={BookmarkCheck}
            number={lcCounts.Completed}
            textColor="blue"
          />
          <StatBox
            title="Draft LC"
            Icon={Gpu}
            number={lcCounts.Draft}
            textColor="yellow"
          />
          <StatBox
            title="Canceled LC"
            Icon={BookmarkX}
            number={lcCounts.Cancelled}
            textColor="red"
          />
        </div>
      </div>

      {/* LC Table */}
      <div>
        <LCTable lcData={lcData} />
      </div>
    </div>
  );
};

export default LC;
