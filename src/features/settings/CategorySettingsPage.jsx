import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import FormDialogInput from "@/components/ui/FormDialogInput";
import FormDialogTextarea from "@/components/ui/FormDialogTextarea";
import toast from "react-hot-toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../api/hooks/category";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router"; // Changed to react-router
import { Trash } from "lucide-react";
import CategorySettingsSkeleton from "./components/CategorySettingsSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { handleError } from "@/utils/handle-error";
import classNames from "@/utils/classNames";
import Button from "@/components/ui/Button"; // Import Button component

export default function Category() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("CATEGORY_VIEW")) {
      toast.error("You don't have permission to view categories.");
      navigate("/settings");
    }
  }, [hasPermission, navigate]);

  const { data: categoryData, isLoading, isError, error } = useCategories();
  const createCatMutation = useCreateCategory();
  const updateCatMutation = useUpdateCategory();
  const deleteCatMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({ defaultValues: { description: "" } });

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setValue("name", category.name);
      setValue("description", category.description);
    } else {
      setEditingCategory(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
    reset();
  };

  const handleCreateCategory = (data) => {
    const categoryData = { name: data.name };
    if (data.description) {
      categoryData.description = data.description;
    }
    createCatMutation.mutate(categoryData, {
      onSuccess: () => {
        toast.success("Category created successfully!");
        closeModal();
      },
      onError: (error) => {
        handleError(error, "Failed to create category");
      },
    });
  };

  const handleUpdateCategory = (data) => {
    if (!editingCategory) return;

    updateCatMutation.mutate(
      {
        id: editingCategory._id,
        data,
      },
      {
        onSuccess: () => {
          toast.success("Category updated successfully!");
          closeModal();
        },
        onError: (error) => {
          handleError(error, "Failed to update category");
        },
      }
    );
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCatMutation.mutate(categoryToDelete._id, {
      onSuccess: () => {
        toast.success("Category deleted successfully!");
        closeDeleteModal();
      },
      onError: (error) => {
        handleError(error, "Failed to delete category");
        closeDeleteModal();
      },
    });
  };

  if (isLoading) {
    return <CategorySettingsSkeleton />;
  }

  if (isError) {
    return (
      <div className="px-2">
        <div className="flex justify-between items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Categories
            </h1>
          </div>
          {hasPermission("CATEGORY_CREATE") && (
            <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
              <Button
                type="button"
                onClick={() => openModal()}
                variant="primary"
                className="block px-3 py-2 text-center text-sm font-semibold"
              >
                Create New
              </Button>
            </div>
          )}
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="flex items-center justify-center h-15 text-[var(--color-danger)]">
              Error: {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Categories
          </h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-wrap items-center gap-4">
          {hasPermission("CATEGORY_DELETE") && (
            <Link
              className="text-sm flex items-center gap-2 text-[var(--color-primary)]" // Themed color
              to="/trash/category"
            >
              <Trash size={16} /> Trash
            </Link>
          )}
          {hasPermission("CATEGORY_CREATE") && (
            <Button
              type="button"
              onClick={() => openModal()}
              variant="primary"
              className="block px-3 py-2 text-center text-sm font-semibold"
            >
              Create New
            </Button>
          )}
        </div>
      </div>
      <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Name
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryData?.data?.map((plan, planIdx) => (
              <tr key={plan._id}>
                <td
                  className={classNames(
                    planIdx === 0
                      ? ""
                      : "border-t border-gray-200",
                    "py-4 pr-3 pl-4 text-sm sm:pl-6"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {plan.name}
                  </div>
                  <div className="mt-1 text-gray-500 sm:hidden">
                    <span>{plan.description}</span>
                  </div>
                </td>
                <td
                  className={classNames(
                    planIdx === 0
                      ? ""
                      : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {plan.description}
                </td>
                <td
                  className={classNames(
                    planIdx === 0
                      ? ""
                      : "border-t border-gray-200",
                    "py-3.5 pr-4 pl-3 text-sm sm:pr-6"
                  )}
                >
                  <div className="flex justify-center gap-2">
                    {hasPermission("CATEGORY_UPDATE") && (
                      <Button
                        type="button"
                        onClick={() => openModal(plan)}
                        variant="secondary" // Changed to secondary
                        size="sm"
                      >
                        Edit
                      </Button>
                    )}
                    {hasPermission("CATEGORY_DELETE") && (
                      <Button
                        type="button"
                        onClick={() => openDeleteModal(plan)}
                        variant="danger" // Changed to danger
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <FormDialog
          open={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? "Edit Category" : "Create New Category"}
          primaryButtonText={editingCategory ? "Update" : "Create"}
          secondaryButtonText="Cancel"
          onSubmit={handleSubmit(
            editingCategory ? handleUpdateCategory : handleCreateCategory
          )}
          isSubmitting={
            createCatMutation.isLoading || updateCatMutation.isLoading
          }
        >
          <FormDialogInput
            id="name"
            name="name"
            label="Category Name"
            type="text"
            placeholder="Enter category name"
            register={register}
            error={errors.name?.message}
            validation={{ required: "Category name is required" }}
          />
          <FormDialogTextarea
            id="description"
            name="description"
            label="Description"
            rows={4}
            placeholder="Enter category description"
            register={register}
          />
        </FormDialog>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteCategory}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          isSubmitting={deleteCatMutation.isLoading}
        />
      )}
    </div>
  );
}
