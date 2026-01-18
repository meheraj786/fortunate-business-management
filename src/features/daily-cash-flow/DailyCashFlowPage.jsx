import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AddTransactionDialog from "./components/AddTransactionDialog";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import { useDailyCashFlowData } from "./hooks/useDailyCashFlowData";
import DailyCashHeader from "./components/DailyCashHeader";
import DailyCashStats from "./components/DailyCashStats";
import TransactionFilters from "./components/TransactionFilters";
import Pagination from "@/components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { showErrorToast } from "@/utils/notifications";
// import Skeleton from "react-loading-skeleton"; // Removed react-loading-skeleton
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const DailyCashFlow = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("CASH_VIEW")) {
      showErrorToast("You don't have permission to view daily cash flow.");
      navigate("/");
    }
  }, [hasPermission, navigate]);

  const {
    selectedDate,
    handleDateChange,
    dailyCashStatus,
    summary,
    transactions,
    filteredTransactionsCount,
    isInitialLoading,
    isError,
    error,
    refetchDailyCashData,
    currentPage,
    totalPages,
    handlePageChange,
    activeLc,
    activeSales,
    refetchReferences,
    accounts,
    accountsLoading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    allCategories,
    openDay,
    closeDay,
    isOpeningDay,
    isClosingDay,
    getLocalDateString,
    totalTransactions,
    isToday,
    sortBy,
    sortOrder,
    onSort,
  } = useDailyCashFlowData();

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState(false);

  useEffect(() => {
    if (showAddTransaction) {
      refetchReferences();
    }
  }, [showAddTransaction, refetchReferences]);

  const handleAddTransactionClick = (type) => {
    setTransactionType(type);
    setShowAddTransaction(true);
  };

  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowTransactionDetailsModal(true);
  };

  const renderTransactionSection = () => {
    if (isError) {
      return (
        <motion.div className="text-center p-8 bg-[var(--color-danger-light)] rounded-lg border border-[var(--color-danger-light)]">
          <p className="text-lg font-semibold text-[var(--color-danger)] mb-4">
            Could not load transactions.
          </p>
          <p className="text-sm text-[var(--color-danger)]">{error?.message}</p>
        </motion.div>
      );
    }

    if (dailyCashStatus === "Not Opened Yet") {
      return (
        <motion.div className="text-center p-8 bg-[var(--color-warning-light)] rounded-lg border border-[var(--color-warning-light)]">
          <p className="text-lg font-semibold text-[var(--color-warning)] mb-4">
            Cash for {selectedDate} is not opened yet.
          </p>
          <p className="text-sm text-[var(--color-warning)]">
            Click "Open Day" to start tracking transactions.
          </p>
        </motion.div>
      );
    }

    if (isInitialLoading) {
      return (
        <motion.div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
          <div className="space-y-4">
            <div className="h-10 bg-gray-50 rounded w-full flex items-center px-4">
              <ValueSkeleton width="w-24" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <ValueSkeleton width="w-16" />
                <ValueSkeleton width="w-32" />
                <ValueSkeleton width="w-24" />
                <ValueSkeleton width="w-20" />
                <ValueSkeleton width="w-full" />
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (totalTransactions === 0) {
      return (
        <motion.div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <img
              src="/favicon.jpg"
              alt="No transactions"
              className="w-8 h-8 opacity-50 rounded-full"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no transactions recorded for this day yet.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <TransactionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            allCategories={allCategories}
            filteredTransactionsCount={filteredTransactionsCount}
          />
        </div>

        {filteredTransactionsCount > 0 ? (
          <TransactionTable
            transactions={transactions}
            onRowClick={handleTransactionClick}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <img
                src="/favicon.jpg"
                alt="No matching transactions"
                className="w-8 h-8 opacity-50 rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transactions match your search
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try clearing the filters or using a different search term.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div className="space-y-6">
      <DailyCashHeader
        onAddTransaction={handleAddTransactionClick}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        dailyCashStatus={dailyCashStatus}
        openDay={openDay}
        closeDay={closeDay}
        isOpeningDay={isOpeningDay}
        isClosingDay={isClosingDay}
        getLocalDateString={getLocalDateString}
        isToday={isToday}
      />

      <DailyCashStats summary={summary} isLoading={isInitialLoading} />

      <AnimatePresence mode="wait">
        {renderTransactionSection()}
      </AnimatePresence>

      {showAddTransaction && (
        <AddTransactionDialog
          open={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={() => {
            setShowAddTransaction(false);
            refetchDailyCashData();
          }}
          transactionType={transactionType}
          accounts={accounts}
          accountsLoading={accountsLoading}
          activeLc={activeLc}
          activeSales={activeSales}
          selectedDate={selectedDate}
        />
      )}

      {selectedTransactionId && (
        <TransactionDetailsModal
          isOpen={showTransactionDetailsModal}
          onClose={() => {
            setShowTransactionDetailsModal(false);
            setSelectedTransactionId(null);
          }}
          transactionId={selectedTransactionId}
        />
      )}
    </motion.div>
  );
};

export default DailyCashFlow;
