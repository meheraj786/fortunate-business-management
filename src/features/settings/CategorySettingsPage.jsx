import { useState } from "react";
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
import { Link } from "react-router";
import { Trash } from "lucide-react";
import CategorySettingsSkeleton from "./components/CategorySettingsSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { handleError } from "@/utils/handle-error";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Category() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const { data: categoryData, isLoading, isError, error } = useCategories();
    const createCatMutation = useCreateCategory();
    const updateCatMutation = useUpdateCategory();
    const deleteCatMutation = useDeleteCategory();
    const { isSuperAdmin } = useAuth();

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
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
                            Categories
                        </h1>
                    </div>
                    <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 cursor-pointer"
                        >
                            Create New
                        </button>
                    </div>
                </div>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="flex items-center justify-center h-15 text-red-500">
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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
                        Categories
                    </h1>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-wrap items-center gap-4">
                    {isSuperAdmin && (
                        <Link
                            className="text-sm flex items-center gap-2 text-blue-600"
                            to="/trash/category"
                        >
                            <Trash size={16} /> Trash
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="block rounded-md bg-[rgb(0,51,102)] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[rgb(0,41,82)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[rgb(0,51,102)]"
                    >
                        Create New
                    </button>
                </div>
            </div>
            <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg dark:ring-black/15 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-black/15 bg-white">
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-black"
                            >
                                Name
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-black"
                            >
                                Description
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 sm:pr-6 dark:text-black"
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
                                            : "border-t border-gray-200 dark:border-black/10",
                                        "py-4 pr-3 pl-4 text-sm sm:pl-6"
                                    )}
                                >
                                    <div className="font-medium text-gray-900 dark:text-black">
                                        {plan.name}
                                    </div>
                                    <div className="mt-1 text-gray-500 sm:hidden dark:text-gray-400">
                                        <span>{plan.description}</span>
                                    </div>
                                </td>
                                <td
                                    className={classNames(
                                        planIdx === 0
                                            ? ""
                                            : "border-t border-gray-200 dark:border-black/10",
                                        "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell dark:text-gray-400"
                                    )}
                                >
                                    {plan.description}
                                </td>
                                <td
                                    className={classNames(
                                        planIdx === 0
                                            ? ""
                                            : "border-t border-gray-200 dark:border-black/10",
                                        "py-3.5 pr-4 pl-3 text-sm sm:pr-6"
                                    )}
                                >
                                    <div className="flex justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openModal(plan)}
                                            className="text-center justify-center inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(plan)}
                                            className="inline-flex items-center rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                        >
                                            Delete
                                        </button>
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
                        error={errors.name}
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
