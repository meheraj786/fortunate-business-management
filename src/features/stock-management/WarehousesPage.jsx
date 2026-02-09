import React, { useState } from "react";
import { Link } from "react-router"; // Changed to react-router
import {
  Box,
  CheckCircle,
  Edit,
  Loader2,
  MapPin,
  Package,
  Plus,
  Trash,
  Trash2,
  Warehouse,

  XCircle,
  Scale,
} from "lucide-react";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatBox from "@/components/ui/StatBox";
import AddWarehouseForm from "./AddWarehouseForm";
import { useAuth } from "@/hooks/useAuth";
import { useWarehouses, useDeleteWarehouse } from "@/api/hooks/warehouse";
import Button from "@/components/ui/Button"; // Import Button component

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

  const { hasPermission } = useAuth();

  const warehouses = warehouseData?.data?.warehouses || [];
  const totalStats = warehouseData?.data?.stats || {};

  const formatWeight = (kg) => {
    if (!kg) return "0 KG";
    if (kg < 1000) {
      return `${kg.toFixed(2)} KG`;
    }
    return `${(kg / 1000).toFixed(2)} TON`;
  };

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

  if (isError) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-[var(--color-danger-light)] rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Warehouse className="text-[var(--color-danger)]" size={24} />
          </div>
          <p className="text-[var(--color-danger)] mb-4 text-sm">
            {error.message}
          </p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try Again
          </Button>
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
                : `Manage ${warehouses.length} warehouse${warehouses.length !== 1 ? "s" : ""
                } and their inventory.`}
            </p>
          </div>
          <div className="flex gap-2">
            {hasPermission("WAREHOUSE_CREATE") && (
              <Button
                onClick={handleAddClick}
                variant="primary"
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus size={20} /> Add Warehouse
              </Button>
            )}
            {hasPermission("TRASH_VIEW_WAREHOUSE") && (
              <Link to="/trash/warehouse">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Trash className="text-[var(--color-danger)]" size={20} />{" "}
                  Warehouse Trash
                </Button>
              </Link>
            )}
          </div>
        </div>

        {(warehouses.length > 0 || isLoading) && (
          <div className="my-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title="Total Products"
              number={totalStats?.totalProducts || 0}
              Icon={Package}
              textColor="primary"
              loading={isLoading}
            />
            <StatBox
              title="Total Quantity"
              number={formatWeight(totalStats?.totalQuantity)}
              Icon={Scale}
              textColor="info"
              loading={isLoading}
            />
            <StatBox
              title="Total In-stock"
              number={totalStats?.totalInStock || 0}
              Icon={CheckCircle}
              textColor="success"
              loading={isLoading}
            />
            <StatBox
              title="Total Low Stock"
              number={totalStats?.totalLowStock || 0}
              Icon={Box}
              textColor="warning"
              loading={isLoading}
            />
            <StatBox
              title="Total Out of Stock"
              number={totalStats?.totalOutOfStock || 0}
              Icon={XCircle}
              textColor="danger"
              loading={isLoading}
            />
          </div>
        )}

        {warehouses.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-[var(--color-primary-light)] rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Warehouse className="text-[var(--color-primary)]" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No warehouses yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Start by adding your first warehouse to organize and manage your
              inventory efficiently.
            </p>
            {hasPermission("WAREHOUSE_CREATE") && (
              <Button
                onClick={handleAddClick}
                variant="primary"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={20} /> Add Your First Warehouse
              </Button>
            )}
          </div>
        )}

        {(warehouses.length > 0 || isLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <div className="h-3 bg-gray-100 rounded w-12"></div>
                        <div className="h-3 bg-gray-100 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              : warehouses.map((warehouse) => (
                <div
                  key={warehouse._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200/60 hover:border-gray-300 group"
                >
                  {hasPermission("WAREHOUSE_VIEW") ? (
                    <Link
                      to={`/stock/${warehouse._id}`}
                      className="p-6 flex-grow block hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg group-hover:scale-105 transition-transform duration-200">
                          <Warehouse
                            className="text-[var(--color-primary)]"
                            size={24}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-gray-900 truncate mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                            {warehouse.name}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <MapPin
                              size={14}
                              className="flex-shrink-0 mt-0.5"
                            />
                            <span className="text-sm truncate">
                              {warehouse.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-700 mt-4 border-t border-gray-100 pt-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-gray-500" />{" "}
                              <span className="font-medium">
                                {warehouse.stats?.totalProducts || 0}
                              </span>{" "}
                              <span className="text-gray-500">Products</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Scale size={16} className="text-[var(--color-info)]" />{" "}
                              <span className="font-medium">
                                {formatWeight(warehouse.stats?.totalQuantity || 0)}
                              </span>{" "}
                              <span className="text-gray-500">Total Qty</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={16}
                                className="text-[var(--color-success)]"
                              />{" "}
                              <span className="font-medium">
                                {warehouse.stats?.totalInStock || 0}
                              </span>{" "}
                              <span className="text-gray-500">In Stock</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-6 flex-grow">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                          <Warehouse
                            className="text-[var(--color-primary)]"
                            size={24}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-gray-900 truncate mb-1">
                            {warehouse.name}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <MapPin
                              size={14}
                              className="flex-shrink-0 mt-0.5"
                            />
                            <span className="text-sm truncate">
                              {warehouse.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-700 mt-4 border-t border-gray-100 pt-4 flex-wrap">

                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-gray-500" />{" "}
                              <span className="font-medium">
                                {warehouse.stats?.totalProducts || 0}
                              </span>{" "}
                              <span className="text-gray-500">Products</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scale size={16} className="text-[var(--color-info)]" />{" "}
                              <span className="font-medium">
                                {formatWeight(warehouse.stats?.totalQuantity || 0)}
                              </span>{" "}
                              <span className="text-gray-500">Total Qty</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={16}
                                className="text-[var(--color-success)]"
                              />{" "}
                              <span className="font-medium">
                                {warehouse.stats?.totalInStock || 0}
                              </span>{" "}
                              <span className="text-gray-500">In Stock</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-100 px-4 py-1 flex justify-end items-center gap-2 bg-gray-50/50 rounded-b-xl">
                    {hasPermission("WAREHOUSE_UPDATE") && (
                      <Button
                        onClick={() => handleEditClick(warehouse)}
                        variant="subtle"
                        size="sm"
                        className="!p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                        aria-label={`Edit ${warehouse.name}`}
                        title="Edit Warehouse"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {hasPermission("WAREHOUSE_DELETE") && (
                      <Button
                        onClick={() => handleDeleteClick(warehouse)}
                        disabled={
                          deleteWarehouseMutation.isLoading &&
                          warehouseToDelete?._id === warehouse._id
                        }
                        isLoading={
                          deleteWarehouseMutation.isLoading &&
                          warehouseToDelete?._id === warehouse._id
                        }
                        variant="subtle"
                        size="sm"
                        className="!p-2 text-gray-400 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                        aria-label={`Delete ${warehouse.name}`}
                        title="Delete Warehouse"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
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
