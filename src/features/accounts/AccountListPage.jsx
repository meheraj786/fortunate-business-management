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
import { handleError } from "@/utils/handle-error"; // For clipboard error

const AccountList = ({ onAddAccount }) => {
  const { data: allAccounts, isLoading, isError, error } = useAccounts();
  const [copiedText, setCopiedText] = useState("");

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
      cashAccounts: cash 
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
        handleError(err, "Failed to copy text.");
      }
    );
  };
  
  if (isError) {
    // You can use the error object to display a more specific message if needed
    return <div className="text-center text-red-500 py-10">Failed to load accounts.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* Bank Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Bank Accounts
          </h2>
          <button
            onClick={() => onAddAccount("Bank")}
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : bankAccounts.length > 0 ? (
            bankAccounts.map((account) => (
              <Link
                to={`/accounts/${account._id}`}
                key={account._id}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {account.bankName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-green-600">
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
                    <button
                      onClick={(e) =>
                        copyToClipboard(e, account.accountNumber, "account")
                      }
                      className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                    >
                      {copiedText === `account_${account.accountNumber}` ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Routing: {account.routingNumber} | Swift:{" "}
                    {account.swiftCode}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No Bank accounts found.
            </p>
          )}
        </div>
      </div>

      {/* Mobile Banking Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Mobile Banking
          </h2>
          <button
            onClick={() => onAddAccount("Mobile Banking")}
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
            </div>
          ) : mobileBankingAccounts.length > 0 ? (
            mobileBankingAccounts.map((account) => (
              <Link
                to={`/accounts/${account._id}`}
                key={account._id}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center`}
                    >
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {account.serviceName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {account.accountHolderName} ({account.accountName})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <p className="font-bold text-lg text-green-600">
                        ৳{account.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="font-mono text-sm">
                        {account.mobileNumber}
                      </span>
                      <button
                        onClick={(e) =>
                          copyToClipboard(e, account.mobileNumber, "mobile")
                        }
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedText === `mobile_${account.mobileNumber}` ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No mobile banking accounts found.
            </p>
          )}
        </div>
      </div>

      {/* Cash Accounts */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Cash Accounts
          </h2>
          <button
            onClick={() => onAddAccount("Cash")}
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-green-500" />
            </div>
          ) : cashAccounts.length > 0 ? (
            cashAccounts.map((account) => (
              <Link
                to={`/accounts/${account._id}`}
                key={account._id}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center`}
                    >
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
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
                      <p className="font-bold text-lg text-green-600">
                        ৳{account.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No cash accounts found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountList;
