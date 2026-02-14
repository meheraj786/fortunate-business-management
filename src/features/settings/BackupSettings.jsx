import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    createBackup,
    getBackups,
    downloadBackup,
    deleteBackup,
} from "../../api/backup.api";
import { toast } from "react-hot-toast";
import {
    FaDownload,
    FaTrash,
    FaDatabase,
    FaFileArchive,
    FaSync,
} from "react-icons/fa";
import Swal from "sweetalert2";

const BackupSettings = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await getBackups();
            if (response.data?.success) {
                setBackups(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch backups:", error);
            toast.error("Failed to load backups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            const response = await createBackup();
            if (response.data?.success) {
                toast.success("Backup created successfully");
                fetchBackups();
            }
        } catch (error) {
            console.error("Backup creation failed:", error);
            toast.error("Failed to create backup: " + (error.response?.data?.message || error.message));
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await downloadBackup(filename);
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download backup");
        }
    };

    const handleDelete = async (filename) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await deleteBackup(filename);
                toast.success("Backup deleted successfully");
                fetchBackups();
            } catch (error) {
                console.error("Delete failed:", error);
                toast.error("Failed to delete backup");
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaDatabase className="text-blue-600" /> System Backups
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your database and file backups. Backups run automatically every day at 2:00 AM.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchBackups}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        title="Refresh List"
                    >
                        <FaSync className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button
                        onClick={handleCreateBackup}
                        disabled={creating}
                        className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${creating ? "opacity-75 cursor-not-allowed" : ""
                            }`}
                    >
                        {creating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FaFileArchive /> Create Backup Now
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-6">
                {loading && backups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading backups...</div>
                ) : backups.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FaDatabase className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p>No backups found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Created At</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {backups.map((backup) => (
                                    <tr key={backup.filename} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <FaFileArchive className="text-orange-500" />
                                            {backup.filename}
                                        </td>
                                        <td className="px-6 py-4">{backup.size}</td>
                                        <td className="px-6 py-4">
                                            {format(new Date(backup.createdAt), "PPP p")}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button
                                                onClick={() => handleDownload(backup.filename)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Download"
                                            >
                                                <FaDownload size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(backup.filename)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackupSettings;
