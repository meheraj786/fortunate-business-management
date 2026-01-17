import React, { useState, useMemo } from "react";
import { Link } from "react-router"; // Corrected import
import {
  Building,
  Smartphone,
  Copy,
  Check,
  Phone,
  MapPin,
  User,
  Plus,
  Loader2,
  Wallet,
} from "lucide-react";
import { useAccounts } from "@/api/hooks/account"; // Using react-query hook
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import { useAuth } from "@/hooks/useAuth";

const AccountList = ({ onAddAccount }) => {
  const { data: allAccounts, isLoading, isError } = useAccounts();
  const [copiedText, setCopiedText] = useState("");
  const { hasPermission } = useAuth();
  const canCreateAccount = hasPermission("ACCOUNT_CREATE");
  const canViewDetails = hasPermission("ACCOUNT_VIEW_DETAILS");

  const { bankAccounts, mobileBankingAccounts, cashAccounts } = useMemo(() => {
    const bank = [];
    const mobile = [];
    const cash = [];
    if (allAccounts?.data) {
      allAccounts.data.forEach((acc) => {
        if (acc.accountType === "Bank") bank.push(acc);
        else if (acc.accountType === "Mobile Banking") mobile.push(acc);
        else if (acc.accountType === "Cash") cash.push(acc);
      });
    }
    return {
      bankAccounts: bank,
      mobileBankingAccounts: mobile,
      cashAccounts: cash,
    };
  }, [allAccounts]);

  const copyToClipboard = (e, text, type) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedText(`${type}_${text}`);
        setTimeout(() => setCopiedText(""), 2000);
      },
      (err) => {
        showErrorToast(err, "Failed to copy text.");
      }
    );
  };

  if (isError) {
    // You can use the error object to display a more specific message if needed
    return (
      <div className="text-center text-[var(--color-danger)] py-10">
        Failed to load accounts.
      </div>
    );
  }

  const AccountCard = ({ account, children }) => {
    if (canViewDetails) {
      return (
        <Link
          to={`/accounts/${account._id}`}
          className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          {children}
        </Link>
      );
    }
    return (
      <div className="block border border-gray-200 rounded-lg p-4">
        {children}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* Bank Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--color-primary)]" />
            Bank Accounts
          </h2>
          {canCreateAccount && (
            <Button
              onClick={() => onAddAccount("Bank")}
              variant="primary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              <span> Account</span>
            </Button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-[var(--color-primary)]" />
            </div>
          ) : bankAccounts.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {bankAccounts.map((account) => (
                <motion.div key={account._id}>
                  <AccountCard account={account}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {account.bankName}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-[var(--color-success)]">
                          ৳{account.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{account.branchName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>
                            {account.accountHolderName} ({account.accountName})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          A/C: {account.accountNumber}
                        </span>
                        <Button
                          onClick={(e) =>
                            copyToClipboard(e, account.accountNumber, "account")
                          }
                          variant="subtle"
                          size="sm"
                          className="!p-1" // Override padding for small icon button
                          aria-label="Copy account number"
                        >
                          {copiedText === `account_${account.accountNumber}` ? (
                            <Check className="w-3 h-3 text-[var(--color-success)]" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Routing: {account.routingNumber} | Swift:{" "}
                        {account.swiftCode}
                      </div>
                    </div>
                  </AccountCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No Bank accounts found.
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Banking Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[var(--color-primary)]" />
            Mobile Banking
          </h2>
          {canCreateAccount && (
            <Button
              onClick={() => onAddAccount("Mobile Banking")}
              variant="primary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              <span> Account</span>
            </Button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-[var(--color-primary)]" />
            </div>
          ) : mobileBankingAccounts.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {mobileBankingAccounts.map((account) => (
                <motion.div key={account._id}>
                  <AccountCard account={account}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {account.serviceName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {account.accountHolderName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <p className="font-bold text-lg text-[var(--color-success)]">
                            ৳{account.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="font-mono text-sm">
                            {account.mobileNumber}
                          </span>
                          <Button
                            onClick={(e) =>
                              copyToClipboard(e, account.mobileNumber, "mobile")
                            }
                            variant="subtle"
                            size="sm"
                            className="!p-1" // Override padding for small icon button
                            aria-label="Copy mobile number"
                          >
                            {copiedText === `mobile_${account.mobileNumber}` ? (
                              <Check className="w-3 h-3 text-[var(--color-success)]" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccountCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No mobile banking accounts found.
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Cash Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--color-success)]" />
            Cash Accounts
          </h2>
          {canCreateAccount && (
            <Button
              onClick={() => onAddAccount("Cash")}
              variant="primary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              <span> Account</span>
            </Button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-[var(--color-primary)]" />
            </div>
          ) : cashAccounts.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {cashAccounts.map((account) => (
                <motion.div key={account._id}>
                  <AccountCard account={account}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {account.accountName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {account.accountHolderName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <p className="font-bold text-lg text-[var(--color-success)]">
                            ৳{account.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccountCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No cash accounts found.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccountList;
