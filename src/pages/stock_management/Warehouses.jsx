import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Warehouse, MapPin, Edit, Trash2 } from "lucide-react";
import AddWarehouseForm from "./AddWarehouseForm";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import toast from "react-hot-toast";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [showAddWarehouseForm, setShowAddWarehouseForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const { baseUrl } = useContext(UrlContext);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = () => {
    axios
      .get(`${baseUrl}warehouse/`)
      .then((res) => setWarehouses(res.data.data));
  };

  const handleFormClose = () => {
    setShowAddWarehouseForm(false);
    setEditingWarehouse(null);
  };

  const handleWarehouseAdded = () => {
    fetchWarehouses();
    handleFormClose();
  };

  const handleWarehouseUpdated = () => {
    fetchWarehouses();
    handleFormClose();
  };

  const handleAddClick = () => {
    setEditingWarehouse(null);
    setShowAddWarehouseForm(true);
  };

  const handleEditClick = (warehouse) => {
    setEditingWarehouse(warehouse);
    setShowAddWarehouseForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        await axios.delete(`${baseUrl}warehouse/${id}`);
        toast.success("Warehouse deleted successfully");
        fetchWarehouses();
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to delete warehouse"
        );
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Warehouses
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Select a warehouse to view its inventory.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={20} />
            Add Warehouse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <Link
                to={`/stock/${warehouse._id}`}
                className="p-6 flex-grow block"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Warehouse className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500">
                      Total products #{warehouse.productCount}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {warehouse.name}
                    </h2>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{warehouse.location}</span>
                </div>
              </Link>
              <div className="border-t border-gray-100 px-4 py-2 flex justify-end items-center gap-2">
                <button
                  onClick={() => handleEditClick(warehouse)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                  aria-label="Edit Warehouse"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(warehouse._id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Delete Warehouse"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddWarehouseForm
        isOpen={showAddWarehouseForm}
        onClose={handleFormClose}
        onWarehouseAdded={handleWarehouseAdded}
        onWarehouseUpdated={handleWarehouseUpdated}
        editingWarehouse={editingWarehouse}
      />
    </div>
  );
};

export default Warehouses;