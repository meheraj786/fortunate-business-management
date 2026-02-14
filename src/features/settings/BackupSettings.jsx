import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    createBackup,
    getBackups,
    downloadBackup,
    deleteBackup,
} from "../../api/backup.api";
import { getSystemSettings, updateSystemSettings } from "../../api/settings.api";
import { toast } from "react-hot-toast";
import {
    FaDownload,
    FaTrash,
    FaDatabase,
    FaFileArchive,
    FaSync,
    FaCog,
    FaSave,
} from "react-icons/fa";
import Swal from "sweetalert2";

const BackupSettings = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [config, setConfig] = useState({
        frequency: "Daily",
        time: "02:00",
        retentionCount: 7,
        includeFiles: true,
    });

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

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const response = await getSystemSettings();
            if (response.success && response.data.backup) {
                setConfig(response.data.backup);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Optional: don't show error toast if it's just missing initial settings
        } finally {
            setSettingsLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
        fetchSettings();
    }, []);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const response = await updateSystemSettings({ backup: config });
            if (response.success) {
                toast.success("Backup settings updated successfully");
            }
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error("Failed to update settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

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
        <div className="space-y-6">
            {/* Configuration Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaCog className="text-gray-600" /> Backup Configuration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure automatic backup schedule and retention policy.
                    </p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleUpdateSettings}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frequency
                                </label>
                                <select
                                    name="frequency"
                                    value={config.frequency}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time (24h)
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={config.time}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Retention Count (Files to keep)
                                </label>
                                <input
                                    type="number"
                                    name="retentionCount"
                                    min="1"
                                    max="365"
                                    value={config.retentionCount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="includeFiles"
                                        checked={config.includeFiles}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-gray-700 font-medium">Include Uploads Folder</span>
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingSettings || settingsLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {savingSettings ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave /> Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Backups List Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <FaDatabase className="text-blue-600" /> System Backups
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage your database and file backups.
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
        </div>
    );
};

export default BackupSettings;
