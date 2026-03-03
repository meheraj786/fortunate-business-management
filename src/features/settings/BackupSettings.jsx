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
    FaLock,
} from "react-icons/fa";
import Swal from "sweetalert2";
import SelectField from "@/components/ui/SelectField";

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
        const toastId = toast.loading("Downloading backup...");
        try {
            const response = await downloadBackup(filename);

            // Validate response content
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                // If backend returns JSON despite blob type, parse it
                const text = await new Response(response.data).text();
                try {
                    const errorJson = JSON.parse(text);
                    throw new Error(errorJson.message || "Download failed");
                } catch {
                    throw new Error("Download failed: " + text);
                }
            }

            // Create blob
            const blob = new Blob([response.data], {
                type: contentType || 'application/octet-stream'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            link.style.display = "none";
            document.body.appendChild(link);

            // Click and wait
            link.click();

            // Clean up DOM element but NOT the URL immediately
            // Changing strategy: Let the URL live for 60s to ensure browser catches it
            setTimeout(() => {
                document.body.removeChild(link);
                // window.URL.revokeObjectURL(url); // Intentionally leaked for stability testing
            }, 1000);

            toast.success("Download started", { id: toastId });
        } catch (error) {
            console.error("Download failed:", error);
            let msg = "Failed to download backup";

            if (error.response && error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errObj = JSON.parse(text);
                    msg = errObj.message || msg;
                } catch {
                    // ignore
                }
            } else if (error.message) {
                msg = error.message;
            }

            toast.error(msg, { id: toastId });
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
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaCog className="text-gray-600" /> Backup Configuration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure automatic backup schedule and retention policy.
                    </p>
                </div>
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleUpdateSettings}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frequency
                                </label>
                                <SelectField
                                    value={config.frequency}
                                    onChange={(val) => handleChange({ target: { name: "frequency", value: val } })}
                                    options={["Daily", "Weekly", "Monthly"]}
                                    className="mb-0"
                                />
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="includeFiles"
                                        checked={config.includeFiles}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-gray-300"
                                    />
                                    <span className="text-gray-700 font-medium">Include Uploads Folder</span>
                                </label>
                            </div>
                        </div>

                        {/* Encryption Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                                <FaLock className="text-gray-500" /> Encryption Settings
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Enable AES-256 encryption to protect your backups with a password.
                                <br />
                                <span className="text-amber-600">Note: You will need the provided <code>decrypt_backup.js</code> script to restore these files.</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.encryption?.enabled || false}
                                            onChange={(e) => {
                                                setConfig(prev => ({
                                                    ...prev,
                                                    encryption: {
                                                        ...prev.encryption,
                                                        enabled: e.target.checked
                                                    }
                                                }));
                                            }}
                                            className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-gray-300"
                                        />
                                        <span className="text-gray-700 font-medium">Enable Encryption</span>
                                    </label>
                                </div>

                                {config.encryption?.enabled && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Backup Password
                                        </label>
                                        <input
                                            type="password"
                                            value={config.encryption?.password || ""}
                                            onChange={(e) => {
                                                setConfig(prev => ({
                                                    ...prev,
                                                    encryption: {
                                                        ...prev.encryption,
                                                        password: e.target.value
                                                    }
                                                }));
                                            }}
                                            placeholder="Enter secure password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Do not lose this password. Data cannot be recovered without it.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingSettings || settingsLoading}
                                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
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
                <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <FaDatabase className="text-[var(--color-primary)]" /> System Backups
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage your database and file backups.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={fetchBackups}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                            title="Refresh List"
                        >
                            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button
                            onClick={handleCreateBackup}
                            disabled={creating}
                            className={`px-4 py-2 text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${creating ? "opacity-75 cursor-not-allowed" : ""
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

                <div className="p-4 sm:p-6">
                    {loading && backups.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Loading backups...</div>
                    ) : backups.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <FaDatabase className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p>No backups found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout */}
                            <div className="block md:hidden space-y-3">
                                {backups.map((backup) => (
                                    <div key={backup.filename} className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <FaFileArchive className={`mt-0.5 flex-shrink-0 ${backup.encrypted ? "text-purple-600" : "text-orange-500"}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 break-all">{backup.filename}</p>
                                                {backup.encrypted && (
                                                    <span className="inline-flex items-center gap-1 mt-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                                                        <FaLock size={10} /> Encrypted
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{backup.size}</span>
                                            <span>{format(new Date(backup.createdAt), "PPP p")}</span>
                                        </div>
                                        <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
                                            <button
                                                onClick={() => handleDownload(backup.filename)}
                                                className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:opacity-75 transition-colors"
                                            >
                                                <FaDownload size={14} /> Download
                                            </button>
                                            <button
                                                onClick={() => handleDelete(backup.filename)}
                                                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <FaTrash size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table Layout */}
                            <div className="hidden md:block overflow-x-auto">
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
                                                    <FaFileArchive className={backup.encrypted ? "text-purple-600" : "text-orange-500"} />
                                                    {backup.filename}
                                                    {backup.encrypted && (
                                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <FaLock size={10} /> Encrypted
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">{backup.size}</td>
                                                <td className="px-6 py-4">
                                                    {format(new Date(backup.createdAt), "PPP p")}
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleDownload(backup.filename)}
                                                        className="text-[var(--color-primary)] hover:opacity-75 transition-colors"
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;
