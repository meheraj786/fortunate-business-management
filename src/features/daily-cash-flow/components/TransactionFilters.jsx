import React from "react";
import SearchBar from "@/components/ui/SearchBar";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button"; // Import Button component
import { motion } from "framer-motion"; // Import motion

const TransactionFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  allCategories,
  filteredTransactionsCount,
}) => {
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...allCategories.map((cat) => ({
      value: cat.value,
      label: cat.label.charAt(0).toUpperCase() + cat.label.slice(1),
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4"
    >
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTransactionsCount} transactions matched
          </p>
        </div>
        {(searchTerm || categoryFilter !== "all") && (
          <Button
            onClick={handleClearFilters}
            variant="subtle"
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary-light)] self-start sm:self-auto" // Themed colors
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Bar */}
        <div>
          <SearchBar
            onSearch={setSearchTerm}
            initialValue={searchTerm}
            placeholder="Search by description, category, or name..."
            debounceDelay={300}
            className="w-full"
          />
        </div>

        {/* Category Select */}
        <div>
          <SelectField
            name="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
            placeholder="Filter by category"
            className="w-full"
            hideLabel // Label will be part of the header
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionFilters;
