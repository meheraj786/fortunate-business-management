import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
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
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService";

const AccountList = ({ onAddAccount, refresh }) => {
  const [accounts, setAccounts] = useState([]);
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState("");

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/account/get-all-accounts`);
      if (response.data.success) {
        const allAccounts = response.data.data;
        setAccounts(
          allAccounts.filter((acc) => acc.accountType === "Bank")
        );
        setMobileBankingAccounts(
          allAccounts.filter((acc) => acc.accountType === "Mobile Banking")
        );
        setCashAccounts(
          allAccounts.filter((acc) => acc.accountType === "Cash")
        );
      } else {
        handleError({ response });
      }
    } catch (error) {
      handleError(error, "An unexpected error occurred while fetching accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, refresh]); // Depend on refresh prop

  const copyToClipboard = (e, text, type) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(`${type}_${text}`);
      setTimeout(() => setCopiedText(""), 2000);
    });
  };

  console.log(accounts, "accounts");
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Bank Accounts
          </h2>
          <button
            onClick={() => onAddAccount("Bank")} // Use the new prop
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
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

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Mobile Banking
          </h2>
          <button
            onClick={() => onAddAccount("Mobile Banking")} // Use the new prop
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
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

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Cash Accounts
          </h2>
          <button
            onClick={() => onAddAccount("Cash")} // Use the new prop
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
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
