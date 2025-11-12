import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import {
  Trash2,
  Loader,
  Package,
  Plus,
  Warehouse,
  MapPin,
  Edit,
} from "lucide-react";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AddWarehouseForm from "./AddWarehouseForm";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import toast from "react-hot-toast";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddWarehouseForm, setShowAddWarehouseForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const { baseUrl } = useContext(UrlContext);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseUrl}warehouse/`);
      setWarehouses(response.data.data);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Failed to fetch warehouses";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleFormClose = () => {
    setShowAddWarehouseForm(false);
    setEditingWarehouse(null);
  };

  const handleWarehouseAdded = () => {
    fetchWarehouses();
    handleFormClose();
    toast.success("Warehouse added successfully!");
  };

  const handleWarehouseUpdated = () => {
    fetchWarehouses();
    handleFormClose();
    toast.success("Warehouse updated successfully!");
  };

  const handleAddClick = () => {
    setEditingWarehouse(null);
    setShowAddWarehouseForm(true);
  };

  const handleEditClick = (warehouse) => {
    setEditingWarehouse(warehouse);
    setShowAddWarehouseForm(true);
  };

  const handleDeleteClick = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!warehouseToDelete) return;

    try {
      setDeletingId(warehouseToDelete._id);
      setShowDeleteConfirmation(false);
      await axios.delete(`${baseUrl}warehouse/${warehouseToDelete._id}`);
      toast.success("Warehouse deleted successfully");
      fetchWarehouses();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete warehouse"
      );
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
      setWarehouseToDelete(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-primary" size={32} />
          <p className="text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && warehouses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Warehouse className="text-red-500" size={24} />
          </div>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchWarehouses}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50/60">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Warehouse Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">
              {warehouses.length === 0
                ? "Get started by adding your first warehouse to organize your inventory."
                : `Manage ${warehouses.length} warehouse${
                    warehouses.length !== 1 ? "s" : ""
                  } and their inventory.`}
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 w-full sm:w-auto justify-center shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus size={20} />
            Add Warehouse
          </button>
        </div>

        {/* Empty state */}
        {warehouses.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Warehouse className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No warehouses yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Start by adding your first warehouse to organize and manage your
              inventory efficiently.
            </p>
            <button
              onClick={handleAddClick}
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 mx-auto shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus size={20} />
              Add Your First Warehouse
            </button>
          </div>
        )}

        {/* Warehouses Grid */}
        {warehouses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200/60 hover:border-gray-300 group"
              >
                {/* Card Content */}
                <Link
                  to={`/stock/${warehouse._id}`}
                  className="p-6 flex-grow block hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <Warehouse className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-700 transition-colors">
                        {warehouse.name}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="text-sm truncate">
                          {warehouse.location}
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <Package size={14} />
                        <span>
                          {warehouse.productCount || 0} product{warehouse.productCount !== 1 ? 's' : ''}
                        </span>
                      </div> */}
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="border-t border-gray-100 px-4 py-1 flex justify-end items-center gap-2 bg-gray-50/50 rounded-b-xl">
                  <button
                    onClick={() => handleEditClick(warehouse)}
                    className="cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                    aria-label={`Edit ${warehouse.name}`}
                    title="Edit Warehouse"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(warehouse)}
                    disabled={deletingId === warehouse._id}
                    className="cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label={`Delete ${warehouse.name}`}
                    title="Delete Warehouse"
                  >
                    {deletingId === warehouse._id ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AddWarehouseForm
        isOpen={showAddWarehouseForm}
        onClose={handleFormClose}
        onWarehouseAdded={handleWarehouseAdded}
        onWarehouseUpdated={handleWarehouseUpdated}
        editingWarehouse={editingWarehouse}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Warehouse"
        description={`Are you sure you want to delete the warehouse "${warehouseToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={deletingId === warehouseToDelete?._id}
        confirmingText="Deleting..."
      />
    </div>
  );
};

export default Warehouses;
