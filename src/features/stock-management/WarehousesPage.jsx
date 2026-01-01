import React, { useState } from "react";
import { Link } from "react-router";
import {
  Box,
  CheckCircle,
  Edit,
  Loader,
  MapPin,
  Package,
  Plus,
  Trash,
  Trash2,
  Warehouse,
  XCircle,
} from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatBox from "@/components/ui/StatBox";
import AddWarehouseForm from "./AddWarehouseForm";
import { useAuth } from "../../context/AuthContext";
import { useWarehouses, useDeleteWarehouse } from "@/api/hooks/warehouse";

const Warehouses = () => {
  const {
    data: warehouseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useWarehouses();
  const deleteWarehouseMutation = useDeleteWarehouse();

  const [showAddWarehouseForm, setShowAddWarehouseForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  const { user } = useAuth();
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN";

  const warehouses = warehouseData?.data?.warehouses || [];
  const totalStats = warehouseData?.data?.stats || {};

  const handleFormClose = () => {
    setShowAddWarehouseForm(false);
    setEditingWarehouse(null);
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
  };

  const confirmDelete = async () => {
    if (!warehouseToDelete) return;
    deleteWarehouseMutation.mutate(warehouseToDelete._id, {
      onSuccess: () => setWarehouseToDelete(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-primary" size={32} />
          <p className="text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Warehouse className="text-red-500" size={24} />
          </div>
          <p className="text-red-600 mb-4 text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto">
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
          <div className="flex gap-2">
            {isSuperAdmin && (
              <button
                onClick={handleAddClick}
                className="bg-primary hover:bg-primary-hover text-white px-3 sm:px-6 sm:py-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 w-full sm:w-auto justify-center shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus size={20} /> Add Warehouse
              </button>
            )}
            {isSuperAdmin && (
              <Link to="/trash/warehouse">
                <button className="px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 w-full sm:w-auto justify-center shadow-sm hover:shadow-md active:scale-95">
                  <Trash size={20} /> Warehouse Trash
                </button>
              </Link>
            )}
          </div>
        </div>

        {warehouses.length > 0 && (
          <div className="my-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title="Total Products"
              number={totalStats?.totalproducts || 0}
              Icon={Package}
              textColor="blue"
            />
            <StatBox
              title="Total In-stock"
              number={totalStats?.["Total In-stock"] || 0}
              Icon={CheckCircle}
              textColor="green"
            />
            <StatBox
              title="Total Low Stock"
              number={totalStats?.["total lowstock"] || 0}
              Icon={Box}
              textColor="orange"
            />
            <StatBox
              title="Total Out of Stock"
              number={totalStats?.["Total outofstock"] || 0}
              Icon={XCircle}
              textColor="red"
            />
          </div>
        )}

        {warehouses.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
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
              <Plus size={20} /> Add Your First Warehouse
            </button>
          </div>
        )}

        {warehouses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200/60 hover:border-gray-300 group"
              >
                <Link
                  to={`/stock/${warehouse._id}`}
                  className="p-6 flex-grow block hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg group-hover:scale-105 transition-transform duration-200">
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
                      <div className="flex items-center gap-4 text-sm text-gray-700 mt-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-500" />{" "}
                          <span className="font-medium">
                            {warehouse.stats?.totalProducts || 0}
                          </span>{" "}
                          <span className="text-gray-500">Products</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />{" "}
                          <span className="font-medium">
                            {warehouse.stats?.totalInStock || 0}
                          </span>{" "}
                          <span className="text-gray-500">In Stock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {isSuperAdmin && (
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
                      disabled={
                        deleteWarehouseMutation.isLoading &&
                        warehouseToDelete?._id === warehouse._id
                      }
                      className="cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete ${warehouse.name}`}
                      title="Delete Warehouse"
                    >
                      {deleteWarehouseMutation.isLoading &&
                      warehouseToDelete?._id === warehouse._id ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <AddWarehouseForm
        isOpen={showAddWarehouseForm}
        onClose={handleFormClose}
        onWarehouseAdded={handleFormClose}
        onWarehouseUpdated={handleFormClose}
        editingWarehouse={editingWarehouse}
      />
      {warehouseToDelete && (
        <ConfirmationModal
          isOpen={!!warehouseToDelete}
          onClose={() => setWarehouseToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Warehouse"
          description={`Are you sure you want to delete the warehouse "${warehouseToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          isConfirming={deleteWarehouseMutation.isLoading}
          confirmingText="Deleting..."
        />
      )}
    </div>
  );
};
export default Warehouses;
