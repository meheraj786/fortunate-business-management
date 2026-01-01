import React from "react";
import { Calendar, Plus, Target, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useHover } from "@/hooks/useHover";

const MotionButton = ({ children, ...props }) => {
  const canHover = useHover();
  return (
    <motion.button
      whileHover={canHover ? { scale: 1.01 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 6 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
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
  const { isSuperAdmin } = useAuth();
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
    if (dailyCashStatus === "Closed") {
      return (
        <div className="p-2.5 rounded-lg text-center bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold">
          📋 This day's account is closed
        </div>
      );
    }
    if (dailyCashStatus === "Open" && isToday) {
      return (
        <div className="p-2.5 rounded-lg text-center bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
          ✅ This day's account is active
        </div>
      );
    }
    if (dailyCashStatus === "Open" && !isToday) {
      return (
        <div className="p-2.5 rounded-lg text-center bg-yellow-50 text-yellow-800 border border-yellow-300 text-xs font-semibold">
          ❗ This past day's account was not closed
        </div>
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
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Buttons inside mobile menu */}
              <MotionButton
                onClick={() => {
                  onAddTransaction("income");
                  setIsMobileMenuOpen(false);
                }}
                disabled={dailyCashStatus !== "Open"}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Income</span>
              </MotionButton>
              <MotionButton
                onClick={() => {
                  onAddTransaction("expense");
                  setIsMobileMenuOpen(false);
                }}
                disabled={dailyCashStatus !== "Open"}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </MotionButton>
              {isSuperAdmin && dailyCashStatus === "Open" && (
                <MotionButton
                  onClick={() => {
                    handleCloseDay();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isClosingDay}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover font-medium text-sm disabled:opacity-50"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isClosingDay ? "Closing..." : "Close Day"}</span>
                </MotionButton>
              )}
              {isSuperAdmin &&
                (dailyCashStatus === "Closed" ||
                  dailyCashStatus === "Not Opened Yet") && (
                  <MotionButton
                    onClick={() => {
                      handleOpenDay();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isOpeningDay}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover font-medium text-sm disabled:opacity-50"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isOpeningDay ? "Opening..." : "Open Day"}</span>
                  </MotionButton>
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
            <MotionButton
              onClick={() => onAddTransaction("income")}
              disabled={dailyCashStatus !== "Open"}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </MotionButton>
            <MotionButton
              onClick={() => onAddTransaction("expense")}
              disabled={dailyCashStatus !== "Open"}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </MotionButton>
            {isSuperAdmin && dailyCashStatus === "Open" && (
              <MotionButton
                onClick={handleCloseDay}
                disabled={isClosingDay}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover font-medium text-sm shadow-sm disabled:opacity-50"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isClosingDay ? "Closing..." : "Close Day"}</span>
              </MotionButton>
            )}
            {isSuperAdmin &&
              (dailyCashStatus === "Closed" ||
                dailyCashStatus === "Not Opened Yet") && (
                <MotionButton
                  onClick={handleOpenDay}
                  disabled={isOpeningDay}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover font-medium text-sm shadow-sm disabled:opacity-50"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isOpeningDay ? "Opening..." : "Open Day"}</span>
                </MotionButton>
              )}
          </div>

          {/* Mobile Actions Button */}
          <MotionButton
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium text-sm shadow-sm"
          >
            <Menu className="w-4 h-4" />
            <span>Actions</span>
          </MotionButton>
        </div>

        {/* Second Row: Date Selection and Status */}
        <div className="space-y-3 pt-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Calendar className="w-4 h-4 text-primary" />
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
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                max={getLocalDateString(new Date())}
              />
            </div>
          </div>

          <div className="mt-3">{statusBanner()}</div>
        </div>
      </div>

      <MobileActionsMenu />
    </>
  );
};

export default DailyCashHeader;
