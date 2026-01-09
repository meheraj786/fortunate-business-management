import React from "react";
import { Calendar, Plus, Target, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button"; // Import the standardized Button component

const DailyCashHeader = ({
  onAddTransaction,
  selectedDate,
  handleDateChange,
  dailyCashStatus,
  openDay,
  closeDay,
  isOpeningDay,
  isClosingDay,
  getLocalDateString,
  isToday,
}) => {
  const { hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleOpenDay = () => openDay(selectedDate);
  const handleCloseDay = () => {
    if (
      window.confirm(
        "Are you sure you want to close the cash for the day? This cannot be undone."
      )
    ) {
      closeDay(selectedDate);
    }
  };

  const statusBanner = () => {
    const commonProps = {
      transition: { duration: 0.2 },
    };

    if (dailyCashStatus === "Closed") {
      return (
        <motion.div
          {...commonProps}
          className="p-2.5 rounded-lg text-center bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold"
        >
          📋 This day's account is closed
        </motion.div>
      );
    }
    if (dailyCashStatus === "Open" && isToday) {
      return (
        <motion.div
          {...commonProps}
          className="p-2.5 rounded-lg text-center bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)] text-xs font-semibold"
        >
          ✅ This day's account is active
        </motion.div>
      );
    }
    if (dailyCashStatus === "Open" && !isToday) {
      return (
        <motion.div
          {...commonProps}
          className="p-2.5 rounded-lg text-center bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)] text-xs font-semibold"
        >
          ❗ This past day's account was not closed
        </motion.div>
      );
    }
    return null;
  };

  const MobileActionsMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-gray-900">Actions</h3>
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                variant="subtle"
                size="sm"
                className="!p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2.5">
              {/* Buttons inside mobile menu */}
              {hasPermission("CASH_ADD_INCOME") && (
                <Button
                  onClick={() => {
                    onAddTransaction("income");
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={dailyCashStatus !== "Open"}
                  variant="success"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Income</span>
                </Button>
              )}
              {hasPermission("CASH_ADD_EXPENSE") && (
                <Button
                  onClick={() => {
                    onAddTransaction("expense");
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={dailyCashStatus !== "Open"}
                  variant="danger"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </Button>
              )}
              {hasPermission("CASH_ACCOUNTS_OPEN_CLOSE") &&
                dailyCashStatus === "Open" && (
                  <Button
                    onClick={() => {
                      handleCloseDay();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isClosingDay}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                    isLoading={isClosingDay}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isClosingDay ? "Closing..." : "Close Day"}</span>
                  </Button>
                )}
              {hasPermission("CASH_ACCOUNTS_OPEN_CLOSE") &&
                (dailyCashStatus === "Closed" ||
                  dailyCashStatus === "Not Opened Yet") && (
                  <Button
                    onClick={() => {
                      handleOpenDay();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isOpeningDay}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                    isLoading={isOpeningDay}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isOpeningDay ? "Opening..." : "Open Day"}</span>
                  </Button>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-5 space-y-5">
        {/* Top Row: Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Daily Cash Flow
            </h1>
            <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">
              Track daily cash flow and business expenses in real-time
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex flex-shrink-0 flex-wrap gap-2">
            {hasPermission("CASH_ADD_INCOME") && (
              <Button
                onClick={() => onAddTransaction("income")}
                disabled={dailyCashStatus !== "Open"}
                variant="success"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Income</span>
              </Button>
            )}
            {hasPermission("CASH_ADD_EXPENSE") && (
              <Button
                onClick={() => onAddTransaction("expense")}
                disabled={dailyCashStatus !== "Open"}
                variant="danger"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </Button>
            )}
            {hasPermission("CASH_ACCOUNTS_OPEN_CLOSE") &&
              dailyCashStatus === "Open" && (
                <Button
                  onClick={handleCloseDay}
                  disabled={isClosingDay}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5"
                  isLoading={isClosingDay}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isClosingDay ? "Closing..." : "Close Day"}</span>
                </Button>
              )}
            {hasPermission("CASH_ACCOUNTS_OPEN_CLOSE") &&
              (dailyCashStatus === "Closed" ||
                dailyCashStatus === "Not Opened Yet") && (
                <Button
                  onClick={handleOpenDay}
                  disabled={isOpeningDay}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5"
                  isLoading={isOpeningDay}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isOpeningDay ? "Opening..." : "Open Day"}</span>
                </Button>
              )}
          </div>

          {/* Mobile Actions Button */}
          <Button
            onClick={() => setIsMobileMenuOpen(true)}
            variant="primary"
            className="md:hidden w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 font-medium text-sm shadow-sm"
          >
            <Menu className="w-4 h-4" />
            <span>Actions</span>
          </Button>
        </div>

        {/* Second Row: Date Selection and Status */}
        <div className="space-y-3 pt-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-[var(--color-primary-light)] rounded-lg">
                <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Selected Date
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[240px]">
              <label htmlFor="cash-flow-date" className="sr-only">
                Select Date
              </label>
              <input
                id="cash-flow-date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent transition-all"
                max={getLocalDateString(new Date())}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {statusBanner()}
          </AnimatePresence>
        </div>
      </div>

      <MobileActionsMenu />
    </>
  );
};

export default DailyCashHeader;
