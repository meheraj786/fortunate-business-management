import React, { useState, useEffect } from "react";
import AddTransactionDialog from "./components/AddTransactionDialog";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import { useDailyCashFlowData } from "./hooks/useDailyCashFlowData";
import DailyCashHeader from "./components/DailyCashHeader";
import DailyCashStats from "./components/DailyCashStats";
import TransactionFilters from "./components/TransactionFilters";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "react-loading-skeleton";

const DailyCashFlow = () => {
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
    isReferencesLoading,
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
    isToday,
  } = useDailyCashFlowData();

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] = useState(false);

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
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg font-semibold text-red-800 mb-4">
            Could not load transactions.
          </p>
          <p className="text-sm text-red-600">{error?.message}</p>
        </div>
      );
    }
    
    if (dailyCashStatus === "Not Opened Yet") {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-lg font-semibold text-yellow-800 mb-4">
            Cash for {selectedDate} is not opened yet.
          </p>
          <p className="text-sm text-yellow-600">
            Click "Open Day" to start tracking transactions.
          </p>
        </div>
      );
    }
    
    if (isInitialLoading) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Skeleton height={30} width={200} />
          <Skeleton height={20} width={150} className="mt-2" />
          <div className="mt-4">
            <TransactionTable transactions={[]} />
            <Skeleton height={40} className="mt-4" />
          </div>
        </div>
      );
    }

    if (transactions.length === 0 && filteredTransactionsCount === 0) {
      return (
        <div className="text-center py-12 px-4 bg-white rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <img src="/favicon.jpg" alt="No transactions" className="w-8 h-8 opacity-50 rounded-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no transactions recorded for this day yet.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
        <TransactionTable
          transactions={transactions}
          onRowClick={handleTransactionClick}
        />
        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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

      {renderTransactionSection()}

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
    </div>
  );
};

export default DailyCashFlow;