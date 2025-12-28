import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  useTrash,
  useRestoreFromTrash,
} from "@/api/hooks/trash";
import Button from "@/components/ui/Button";
import { Loader2, RotateCcw, ChevronLeft, ChevronRight, Info } from "lucide-react";

const TrashPage = () => {
  const { moduleName } = useParams();
  
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

const { data, isLoading, isFetching, refetch } = useTrash({
  module: moduleName ? currentModule : "", 
  page,
  limit,
});

  const restoreMutation = useRestoreFromTrash();

  const trashItems = data?.data?.trash || [];
  const totalPages = data?.data?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [moduleName]);

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
          {doc.accountNumber && <span className="text-[10px] text-gray-400">A/C: {doc.accountNumber}</span>}
          {doc.mobileNumber && <span className="text-[10px] text-gray-400">Mob: {doc.mobileNumber}</span>}
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
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🗑️</span> 
            {moduleName ? `${currentModule} Trash` : "All Trash Items"}
          </h1>
          <p className="text-sm text-muted-foreground">
            View and restore recently deleted records
          </p>
        </div>
        {isFetching && <Loader2 className="animate-spin w-5 h-5 text-primary" />}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Module</th>
              <th className="p-4 text-left font-semibold text-gray-600">Item Details</th>
              <th className="p-4 text-left font-semibold text-gray-600">Deleted By</th>
              <th className="p-4 text-left font-semibold text-gray-600">Deleted Date</th>
              <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
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
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold uppercase">
                      {item.model}
                    </span>
                  </td>

                  <td className="p-4">
                    {renderDocInfo(item)}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {item.deletedBy?.name || "System"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.deletedBy?.email || ""}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-gray-600">
                    {new Date(item.deletedAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                      onClick={() => restoreMutation.mutate(item._id, {
                        onSuccess: () => refetch() 
                      })}
                      disabled={restoreMutation.isLoading}
                    >
                      {restoreMutation.isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      )}
                      Restore
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
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
  );
};

export default TrashPage;