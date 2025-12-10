import React, { useState, useEffect, useCallback } from "react";
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
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const AccountList = ({ onEdit, onAddBank, onAddMobile, refresh }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/bank/get-all-accounts`);
      if (response.data.success) {
        const allAccounts = response.data.data;
        setBankAccounts(
          allAccounts.filter((acc) => acc.accountType === "Bank")
        );
        setMobileBankingAccounts(
          allAccounts.filter((acc) => acc.accountType === "Mobile Banking")
        );
      } else {
        toast.error(response.data.message || "Failed to fetch accounts.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching accounts.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, refresh]); // Depend on refresh prop

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    setIsConfirmingDelete(true);
    try {
      const response = await api.delete(
        `/bank/delete-account/${accountToDelete._id}`
      );
      if (response.data.success) {
        toast.success("Account deleted successfully!");
        fetchAccounts(); // Refresh data
        setIsDeleteModalOpen(false);
        setAccountToDelete(null);
      } else {
        toast.error(response.data.message || "Failed to delete account.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(`${type}_${text}`);
      setTimeout(() => setCopiedText(""), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Bank Accounts
          </h2>
          <button
            onClick={onAddBank} // Calls onAddBank prop
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
          ) : bankAccounts.length > 0 ? (
            bankAccounts.map((account) => (
              <div
                key={account._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {account.bankName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-green-600">
                      ৳{account.balance.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onEdit(account)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(account)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
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
                      onClick={() =>
                        copyToClipboard(account.accountNumber, "account")
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
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No bank accounts found.
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
            onClick={onAddMobile} // Calls onAddMobile prop
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
              <div
                key={account._id}
                className="border border-gray-200 rounded-lg p-4"
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
                      <button
                        onClick={() => onEdit(account)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(account)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="font-mono text-sm">
                        {account.mobileNumber}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(account.mobileNumber, "mobile")
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
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No mobile banking accounts found.
            </p>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        isConfirming={isConfirmingDelete}
      />
    </div>
  );
};

export default AccountList;
