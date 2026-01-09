import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useTrash, useRestoreFromTrash } from "@/api/hooks/trash";
import Button from "@/components/ui/Button";
import {
  Loader2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  Calendar,
  Archive,
  FileText,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const TrashPage = () => {
  const { moduleName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const warehouseId = queryParams.get("warehouseId");

  const [page, setPage] = useState(1);
  const limit = 10;

  const formatModule = (str) => {
    if (!str) return "";
    const lower = str.toLowerCase();
    if (lower === "lc") return "LC";
    if (lower === "dailycash") return "DailyCash";
    if (lower === "account") return "Account";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const currentModule = formatModule(moduleName);
  const viewPermission = `TRASH_VIEW_${currentModule.toUpperCase()}`;
  const restorePermission = `TRASH_RESTORE_${currentModule.toUpperCase()}`;

  useEffect(() => {
    if (!hasPermission(viewPermission)) {
      toast.error("You don't have permission to view this trash.");
      navigate("/");
    }
  }, [hasPermission, navigate, viewPermission]);

  const { data, isLoading, isFetching, refetch } = useTrash({
    module: moduleName ? currentModule : "",
    page,
    limit,
    warehouseId,
  });

  const restoreMutation = useRestoreFromTrash();

  const trashItems = data?.data?.trash || [];
  const totalPages = data?.data?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [moduleName, warehouseId]);

  const renderDocInfo = (item) => {
    const doc = item.docId;

    if (typeof doc === "string") return doc;

    if (typeof doc === "object" && doc !== null) {
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-blue-600">
            {doc.accountName ||
              doc.basicInfo?.lcNumber ||
              doc.name ||
              doc.invoiceNo ||
              doc.transactionId ||
              "Unknown Item"}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ID: {doc._id}
          </span>
          {doc.accountNumber && (
            <span className="text-[10px] text-gray-400">
              A/C: {doc.accountNumber}
            </span>
          )}
          {doc.mobileNumber && (
            <span className="text-[10px] text-gray-400">
              Mob: {doc.mobileNumber}
            </span>
          )}
        </div>
      );
    }
    return <span className="text-gray-400 italic text-xs">Data not found</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            {moduleName ? `${currentModule} Trash` : "All Trash Items"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View and restore recently deleted records
          </p>
        </div>
        {isFetching && (
          <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        )}
      </div>

      {/* Desktop/Large Tablet View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Module
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Item Details
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Deleted By
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Deleted Date
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-600 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {trashItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Info className="w-10 h-10 mb-2 opacity-20" />
                        <p>No deleted items found in {currentModule || "trash"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trashItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold uppercase">
                          {item.model}
                        </span>
                      </td>

                      <td className="p-4 min-w-[200px]">
                        {renderDocInfo(item)}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {item.deletedBy?.name || "System"}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[180px]">
                            {item.deletedBy?.email || ""}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(item.deletedAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="text-right">
                        {hasPermission(restorePermission) && (
                          <button
                            variant="outline"
                            className="rounded-lg bg-blue-200 px-4 py-2 text-blue-700 flex items-center justify-center gap-1"
                            onClick={() =>
                              restoreMutation.mutate({ model: item.model, id: item._id }, {
                                onSuccess: () => {
                                  toast.success("Item restored successfully!");
                                  refetch();
                                },
                              })
                            }
                            disabled={restoreMutation.isLoading}
                          >
                            {restoreMutation.isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            )}
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 gap-4">
              <div className="text-xs sm:text-sm text-gray-500">
                Showing page{" "}
                <span className="font-medium text-gray-900">{page}</span> of{" "}
                <span className="font-medium text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden">
        {trashItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center text-muted-foreground">
              <Info className="w-10 h-10 mb-2 opacity-20" />
              <p>No deleted items found in {currentModule || "trash"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {trashItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-gray-400" />
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-bold uppercase">
                        {item.model}
                      </span>
                    </div>
                    <div>
                      {hasPermission(restorePermission) && (
                        <button
                          className="rounded-lg bg-blue-200 px-4 py-2 text-blue-700 flex items-center justify-center gap-1"
                          onClick={() =>
                            restoreMutation.mutate({ model: item.model, id: item._id }, {
                              onSuccess: () => {
                                toast.success("Item restored successfully!");
                                refetch();
                              },
                            })
                          }
                          disabled={restoreMutation.isLoading}
                        >
                          {restoreMutation.isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1">Restore</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        {renderDocInfo(item)}
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">
                          Deleted By
                        </div>
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {item.deletedBy?.name || "System"}
                        </div>
                        {item.deletedBy?.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.deletedBy.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">
                          Deleted Date
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(item.deletedAt).toLocaleDateString("en-GB", {
                            dateStyle: "medium",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.deletedAt).toLocaleTimeString("en-GB", {
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm text-gray-500 text-center">
                    Showing page{" "}
                    <span className="font-medium text-gray-900">{page}</span> of{" "}
                    <span className="font-medium text-gray-900">{totalPages}</span>
                  </div>
                  <div className="flex gap-2 w-full justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white flex-1 max-w-[120px]"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white flex-1 max-w-[120px]"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;