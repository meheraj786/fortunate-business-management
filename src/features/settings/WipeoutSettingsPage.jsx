import React, { useState } from "react";
import {
  Trash,
  AlertTriangle,
  RefreshCw,
  Database,
  ShoppingCart,
  FileText,
  Users,
  CreditCard,
  Box,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

const WipeoutSettingsPage = () => {
  const { isSuperAdmin, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null); // 'module', 'business', 'factory'
  const [selectedModule, setSelectedModule] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState("");

  const modules = [
    {
      id: "sales",
      name: "Sales & Invoices",
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50",
      desc: "Deletes all sales records and generated invoices.",
    },
    {
      id: "lc",
      name: "LC Management",
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
      desc: "Deletes all Letters of Credit and cost details.",
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: Box,
      color: "text-orange-600 bg-orange-50",
      desc: "Deletes products, categories, units, and warehouses.",
    },
    {
      id: "customers",
      name: "Customers",
      icon: Users,
      color: "text-green-600 bg-green-50",
      desc: "Deletes the customer database.",
    },
    {
      id: "accounts",
      name: "Accounts & Finance",
      icon: CreditCard,
      color: "text-indigo-600 bg-indigo-50",
      desc: "Deletes accounts, transactions, and daily cash history.",
    },
    {
      id: "trash",
      name: "Trash Bin",
      icon: Trash,
      color: "text-gray-600 bg-gray-50",
      desc: "Permanently empty the trash bin.",
    },
  ];

  const handleClearModule = async (moduleId) => {
    setLoading(true);
    try {
      await axios.post(`/cleanup/module/${moduleId}`);
      toast.success(`${moduleId.toUpperCase()} data cleared successfully.`);
      setShowConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear data.");
    } finally {
      setLoading(false);
      setConfirmationInput("");
    }
  };

  const handleCleanBusinessData = async () => {
    if (confirmationInput !== "DELETE BUSINESS DATA") {
      return toast.error("Please type the confirmation phrase correctly.");
    }
    setLoading(true);
    try {
      await axios.post("/cleanup/business-data");
      toast.success("All business data wiped successfully.");
      setShowConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to wipe data.");
    } finally {
      setLoading(false);
      setConfirmationInput("");
    }
  };

  const handleFactoryReset = async () => {
    if (confirmationInput !== "FACTORY RESET") {
      return toast.error("Please type the confirmation phrase correctly.");
    }
    setLoading(true);
    try {
      await axios.post("/cleanup/factory-reset");
      toast.success("System reset complete. Logging out...");
      setTimeout(() => logout(), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Factory reset failed.");
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Database className="w-8 h-8 text-red-600" />
          Data Wipeout
        </h1>
        <p className="text-gray-500 mt-1">
          Development tools to clear database collections.{" "}
          <span className="font-bold text-red-500">Proceed with caution.</span>
        </p>
      </div>

      {/* Modules Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white border border-gray-200 hover:shadow-lg transition-shadow rounded-xl p-5 flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${mod.color}`}
              >
                <mod.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800">
                {mod.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{mod.desc}</p>
            </div>
            <button
              onClick={() => {
                setSelectedModule(mod);
                setShowConfirm("module");
              }}
              className="mt-6 w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash className="w-4 h-4" /> Clear Data
            </button>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle className="w-48 h-48 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-4 relative z-10">
          <AlertTriangle className="w-6 h-6" /> Danger Zone
        </h2>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-white p-5 rounded-lg border border-red-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">
              Wipe Business Data
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Clears all Sales, LC, Inventory, Customers, and Accounts. Keeping
              Users & Settings intact.
            </p>
            <button
              onClick={() => setShowConfirm("business")}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Wipe Business Data
            </button>
          </div>

          <div className="bg-white p-5 rounded-lg border-2 border-red-500 shadow-sm">
            <h3 className="font-semibold text-red-600 mb-2">Factory Reset</h3>
            <p className="text-sm text-gray-500 mb-4">
              Nuclear option. Deletes EVERYTHING including your user account.
              You will need to re-register.
            </p>
            <button
              onClick={() => setShowConfirm("factory")}
              className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg font-bold transition-colors shadow-sm animate-pulse"
            >
              INITIATE FACTORY RESET
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Destructive Action
              </h3>
              <button
                onClick={() => {
                  setShowConfirm(null);
                  setConfirmationInput("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {showConfirm === "module" && selectedModule && (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to clear <b>{selectedModule.name}</b>?
                  This cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClearModule(selectedModule.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Clearing..." : "Yes, Clear It"}
                  </button>
                </div>
              </>
            )}

            {(showConfirm === "business" || showConfirm === "factory") && (
              <>
                <p className="text-gray-600 mb-4">
                  This action is <b>IRREVERSIBLE</b>. All selected data will be
                  permanently destroyed.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded border border-gray-300 select-all">
                      {showConfirm === "business"
                        ? "DELETE BUSINESS DATA"
                        : "FACTORY RESET"}
                    </span>{" "}
                    to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none uppercase font-mono tracking-widest text-center"
                    placeholder="TYPE HERE"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowConfirm(null);
                      setConfirmationInput("");
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      showConfirm === "business"
                        ? handleCleanBusinessData
                        : handleFactoryReset
                    }
                    disabled={
                      loading ||
                      confirmationInput !==
                      (showConfirm === "business"
                        ? "DELETE BUSINESS DATA"
                        : "FACTORY RESET")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Wiping..." : "Confirm Wipe"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WipeoutSettingsPage;
