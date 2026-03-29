import React, { useState, Suspense, lazy } from "react";
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

import StatBox from "@/components/ui/StatBox";
import { useAuth } from "@/hooks/useAuth";
import { useWarehouses, useDeleteWarehouse } from "@/api/hooks/warehouse";
import Button from "@/components/ui/Button"; // Import Button component

const AddWarehouseForm = lazy(() => import("./AddWarehouseForm"));
const ConfirmationModal = lazy(() => import("@/components/ui/ConfirmationModal"));

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
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
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
    setHasOpenedForm(true);
  };

  const handleEditClick = (warehouse) => {
    setEditingWarehouse(warehouse);
    setShowAddWarehouseForm(true);
    setHasOpenedForm(true);
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="px-2 py-2 sm:px-4 sm:py-2.5 w-1/2 min-w-[180px]">Warehouse</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right sm:min-w-[120px]">Total Products</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right sm:min-w-[120px]">Total Quantity</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-center sm:min-w-[110px]">In Stock</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right w-16 sm:w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2">
                            <div className="flex flex-col gap-1.5">
                              <div className="h-4 bg-gray-200 rounded w-32 sm:w-48"></div>
                              <div className="h-3 bg-gray-100 rounded w-24 sm:w-32"></div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-5 bg-gray-200 rounded-full w-14 mx-auto"></div></td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2 text-right">
                            <div className="h-6 bg-gray-200 rounded w-12 inline-block"></div>
                          </td>
                        </tr>
                      ))
                    : warehouses.map((warehouse) => (
                        <tr key={warehouse._id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2">
                            {hasPermission("WAREHOUSE_VIEW") ? (
                              <Link to={`/stock/${warehouse._id}`} className="block">
                                <span className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors block mb-0.5 text-sm sm:text-base">
                                  {warehouse.name}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin size={12} /> {warehouse.location || "No location specified"}
                                </span>
                              </Link>
                            ) : (
                              <div>
                                <span className="font-semibold text-gray-900 block mb-0.5 text-sm sm:text-base">
                                  {warehouse.name}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin size={12} /> {warehouse.location || "No location specified"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                            {warehouse.stats?.totalProducts || 0}
                          </td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm text-[var(--color-info)] font-medium text-right">
                            {formatWeight(warehouse.stats?.totalQuantity || 0)}
                          </td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm text-[var(--color-success)] font-medium bg-[var(--color-success-light)] px-2.5 py-0.5 rounded-full min-w-[3rem]">
                              <CheckCircle size={14} /> {warehouse.stats?.totalInStock || 0}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1.5">
                              {hasPermission("WAREHOUSE_UPDATE") && (
                                <Button
                                  onClick={() => handleEditClick(warehouse)}
                                  variant="subtle"
                                  size="sm"
                                  className="!p-1 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
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
                                  className="!p-1 text-gray-400 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                                  title="Delete Warehouse"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        {hasOpenedForm && (
          <AddWarehouseForm
            isOpen={showAddWarehouseForm}
            onClose={handleFormClose}
            onWarehouseAdded={handleFormClose}
            onWarehouseUpdated={handleFormClose}
            editingWarehouse={editingWarehouse}
          />
        )}
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
      </Suspense>
    </div>
  );
};
export default Warehouses;
