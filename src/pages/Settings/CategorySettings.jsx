import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "../../components/common/FormDialog";
import FormDialogInput from "../../components/common/FormDialogInput";
import FormDialogTextarea from "../../components/common/FormDialogTextarea";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Category() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateCategory = async (data) => {
    try {
      const categoryData = { name: data.name };
      if (data.description) {
        categoryData.description = data.description;
      }
      const response = await axios.post(
        "http://localhost:3000/api/v1/category/create",
        categoryData
      );
      setCategories([...categories, response.data.data]);
      closeModal();
    } catch (error) {
      console.error("Error creating category:", error);
      setError(error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/category/delete/${id}`
      );
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/v1/category/get"
        );
        setCategories(response.data.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
              Categories
            </h1>
          </div>
          <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
            <button
              type="button"
              onClick={openModal}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 cursor-pointer"
            >
              Create New
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="flex items-center justify-center h-15 text-black">
              Loading....
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
              Categories
            </h1>
          </div>
          <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
            <button
              type="button"
              onClick={openModal}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 cursor-pointer"
            >
              Create New
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="flex items-center justify-center h-15 text-black">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Categories
          </h1>
        </div>
        <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
          <button
            type="button"
            onClick={openModal}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 cursor-pointer"
          >
            Create New
          </button>
        </div>
      </div>
      <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg dark:ring-black/15">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-black/15">
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
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6 dark:text-black"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((plan, planIdx) => (
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
                  <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden dark:text-gray-400">
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
                  <div className="flex flex-col sm:flex-row w-max gap-2">
                    <button
                      type="button"
                      className="text-center justify-center inline-flex items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-black dark:bg-black/10 dark:text-black dark:ring-black/10 dark:hover:bg-black/15 dark:disabled:hover:bg-black/10 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(plan._id)}
                      className="inline-flex items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-black dark:bg-black/10 dark:text-black dark:ring-black/10 dark:hover:bg-black/15 dark:disabled:hover:bg-black/10 cursor-pointer"
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
      <FormDialog
        open={isModalOpen}
        onClose={closeModal}
        title="Create New Category"
        primaryButtonText="Create Category"
        secondaryButtonText="Cancel"
        onSubmit={handleSubmit(handleCreateCategory)}
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
    </div>
  );
}
