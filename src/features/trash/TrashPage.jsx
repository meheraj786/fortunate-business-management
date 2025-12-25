import React from "react";
import {
  useTrash,
  useRestoreFromTrash,
  useDeleteTrashPermanently,
} from "@/api/hooks/trash";
import  Button  from "@/components/ui/Button";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";

const TrashPage = () => {
  const { data, isLoading } = useTrash();
  const restoreMutation = useRestoreFromTrash();
  const deleteMutation = useDeleteTrashPermanently();

  const trashItems = data?.data?.trash || [];

  console.log(trashItems, "traaaaaaaas")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">🗑️ Trash</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Document ID</th>
              <th className="p-3 text-left">Deleted By</th>
              <th className="p-3 text-left">Deleted At</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {trashItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Trash is empty
                </td>
              </tr>
            ) : (
              trashItems.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3 font-medium">
                    {item.model}
                  </td>

                  <td className="p-3 text-xs text-muted-foreground">
                    {item.docId}
                  </td>

                  <td className="p-3">
                    {item.deletedBy?.name ||
                      item.deletedBy?.email ||
                      "System"}
                  </td>

                  <td className="p-3">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>

                  <td className="p-3 flex justify-end gap-2">
                    {/* RESTORE */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(item._id)}
                      disabled={restoreMutation.isLoading}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>

                    {/* PERMANENT DELETE */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        deleteMutation.mutate(item._id)
                      }
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrashPage;
