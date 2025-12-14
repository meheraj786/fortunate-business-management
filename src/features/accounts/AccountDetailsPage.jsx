import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Building,
  Smartphone,
  CreditCard,
  DollarSign,
  Hash,
  User,
  Calendar,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import StatBox from "@/components/ui/StatBox";
import TransactionList from "./TransactionListPage"; // Reusing for structure/style

// Mock data fetching since backend is not ready
const fetchAccountDetailsMock = async (accountId) => {
  // In a real scenario, this would be an API call: `/account/get-account/${accountId}`
  const allAccountsResponse = await api.get(`/account/get-all-accounts`);
  const account = allAccountsResponse.data.data.find(
    (acc) => acc._id === accountId
  );
  if (account) {
    return { success: true, data: account };
  }
  return { success: false, message: "Account not found." };
};

const fetchAccountTransactionsMock = async (accountId) => {
  // In a real scenario: `/transaction/get-all?accountId=${accountId}`
  const allTransactionsResponse = await api.get(`/transaction/get-all`);
  const transactions = allTransactionsResponse.data.data.filter(
    (t) => t.account?._id === accountId
  );
  return { success: true, data: transactions };
};

const AccountDetails = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const accountRes = await fetchAccountDetailsMock(accountId);
        if (accountRes.success) {
          setAccount(accountRes.data);
        } else {
          toast.error(accountRes.message);
        }

        const transactionsRes = await fetchAccountTransactionsMock(accountId);
        if (transactionsRes.success) {
          setTransactions(transactionsRes.data);
        }
      } catch (error) {
        toast.error("Failed to load account details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      loadData();
    }
  }, [accountId]);

  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter((t) => t.type === "Credit")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOutcome = transactions
      .filter((t) => t.type === "Debit")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalTransactions, totalIncome, totalOutcome };
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <DollarSign className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Account not found.</h2>
        <Link to="/accounts" className="text-blue-600 hover:underline">
          Go back to Accounts
        </Link>
      </div>
    );
  }

  const isBank = account.accountType === "Bank";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/accounts"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {account.accountName}
          </h1>
          <p className="text-gray-600">{account.accountHolderName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatBox
          title="Current Balance"
          number={`৳${account.balance.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatBox
          title="Total Income"
          number={`৳${stats.totalIncome.toLocaleString()}`}
          icon={CreditCard}
          color="green"
        />
        <StatBox
          title="Total Outcome"
          number={`৳${stats.totalOutcome.toLocaleString()}`}
          icon={CreditCard}
          color="red"
        />
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-gray-600" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <strong>Holder:</strong> {account.accountHolderName}
          </div>
          <div className="flex items-center gap-2">
            {isBank ? (
              <Building className="w-4 h-4 text-gray-500" />
            ) : (
              <Smartphone className="w-4 h-4 text-gray-500" />
            )}
            <strong>
              {isBank ? "Bank:" : "Service:"}
            </strong>{" "}
            {isBank ? account.bankName : account.serviceName}
          </div>
          {isBank && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <strong>A/C Number:</strong> {account.accountNumber}
            </div>
          )}
          {isBank && (
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <strong>Branch:</strong> {account.branchName}
            </div>
          )}
          {!isBank && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <strong>Mobile No:</strong> {account.mobileNumber}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <strong>Created At:</strong>{" "}
            {new Date(account.createdAt).toLocaleString("en-GB")}
          </div>
          {isBank && account.routingNumber && (
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <strong>Routing:</strong> {account.routingNumber}
            </div>
          )}
          {isBank && account.swiftCode && (
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <strong>SWIFT:</strong> {account.swiftCode}
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Transactions
          </h2>
        </div>
        {/* We can pass down the fetched and filtered transactions to a generic list component */}
        {/* For simplicity, we'll recreate a simplified table here */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString("en-GB")}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        t.type === "Credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "Credit" ? "+" : "-"} ৳
                      {t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">
                    No transactions found for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
