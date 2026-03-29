import React, { useState, useMemo, memo } from "react";
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
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getAccountDetails } from "@/api/account.api";

const AccountList = memo(({ onAddAccount }) => {
  const { data: allAccounts, isLoading, isError } = useAccounts();
  const [copiedText, setCopiedText] = useState("");
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
  const queryClient = useQueryClient();

  const prefetchAccountDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["accounts", "details", id],
      queryFn: async () => (await getAccountDetails(id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };
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
      },
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
          className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          onMouseEnter={() => prefetchAccountDetails(account._id)}
        >
          {children}
        </Link>
      );
    }
    return (
      <div className="block border border-gray-200 rounded-lg p-3">
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
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {account.bankName}
                        </h3>
                        {account.accountName && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {account.accountName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-sm text-[var(--color-success)]">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center gap-1">
                          A/C: <span className="text-gray-900">{account.accountNumber}</span>
                        </span>
                        <Button
                          onClick={(e) =>
                            copyToClipboard(e, account.accountNumber, "account")
                          }
                          variant="subtle"
                          size="sm"
                          className="!p-0.5 hover:bg-gray-100" 
                          aria-label="Copy account number"
                        >
                          {copiedText === `account_${account.accountNumber}` ? (
                            <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </Button>
                      </div>

                      {account.accountHolderName && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{account.accountHolderName}</span>
                        </div>
                      )}
                      
                      {account.branchName && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{account.branchName}</span>
                        </div>
                      )}

                      {(account.routingNumber || account.swiftCode) && (
                        <div className="text-gray-500 flex items-center gap-2 mt-1">
                          {account.routingNumber && <span>Routing: {account.routingNumber}</span>}
                          {account.swiftCode && <span>Swift: {account.swiftCode}</span>}
                        </div>
                      )}
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {account.serviceName}
                        </h3>
                        {account.accountName && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {account.accountName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-sm text-[var(--color-success)]">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5 text-xs">
                       <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a
                              href={`tel:${account.mobileNumber}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-gray-900 hover:text-[var(--color-primary)] transition-colors"
                            >
                              {account.mobileNumber}
                            </a>
                          </div>
                          <Button
                            onClick={(e) =>
                              copyToClipboard(e, account.mobileNumber, "mobile")
                            }
                            variant="subtle"
                            size="sm"
                            className="!p-0.5 hover:bg-gray-100"
                            aria-label="Copy mobile number"
                          >
                            {copiedText === `mobile_${account.mobileNumber}` ? (
                              <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {account.accountHolderName && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{account.accountHolderName}</span>
                          </div>
                        )}
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {account.accountName}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-sm text-[var(--color-success)]">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                       <div className="flex items-center gap-1.5 text-gray-600">
                         <User className="w-3 h-3 text-gray-400" />
                         <span className="truncate">
                           {account.accountHolderName}
                         </span>
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
});

export default AccountList;
