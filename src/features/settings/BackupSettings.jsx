import React, { useEffect, useState, useCallback, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    createBackup,
    getBackups,
    downloadBackup,
    deleteBackup,
    verifyBackup,
    updateBackupNotes,
    getBackupHistory,
    inspectBackup,
    restoreFromBackup,
    uploadBackupFile,
} from "../../api/backup.api";
import { getSystemSettings, updateSystemSettings } from "../../api/settings.api";
import { useAuth } from "@/hooks/useAuth";
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
    FaShieldAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaClock,
    FaStickyNote,
    FaHistory,
    FaPlay,
    FaCalendarDay,
    FaCalendarWeek,
    FaCalendarAlt,
    FaTag,
    FaSpinner,
    FaInfoCircle,
    FaUndo,
    FaUpload,
    FaCloudUploadAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import SelectField from "@/components/ui/SelectField";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: FaCheckCircle },
    verified: { label: "Verified", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: FaShieldAlt },
    corrupted: { label: "Corrupted", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: FaTimesCircle },
    running: { label: "Running", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: FaSpinner },
    failed: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: FaTimesCircle },
    unknown: { label: "Legacy", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: FaExclamationTriangle },
};

const RETENTION_TAG_CONFIG = {
    manual: { label: "Manual", icon: FaPlay, color: "text-indigo-700", bg: "bg-indigo-50" },
    daily: { label: "Daily", icon: FaCalendarDay, color: "text-sky-700", bg: "bg-sky-50" },
    weekly: { label: "Weekly", icon: FaCalendarWeek, color: "text-violet-700", bg: "bg-violet-50" },
    monthly: { label: "Monthly", icon: FaCalendarAlt, color: "text-amber-700", bg: "bg-amber-50" },
    unknown: { label: "Unknown", icon: FaTag, color: "text-gray-600", bg: "bg-gray-50" },
};

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Status badge */
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
            <Icon size={10} className={status === "running" ? "animate-spin" : ""} />
            {cfg.label}
        </span>
    );
};

/** Retention tag badge */
const RetentionBadge = ({ tag }) => {
    const cfg = RETENTION_TAG_CONFIG[tag] || RETENTION_TAG_CONFIG.unknown;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
};

/** Inline editable notes */
const NotesEditor = ({ filename, initialNotes, onSaved }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initialNotes || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateBackupNotes(filename, value);
            toast.success("Notes saved");
            setEditing(false);
            onSaved?.(value);
        } catch {
            toast.error("Failed to save notes");
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                title="Add notes"
            >
                <FaStickyNote size={10} />
                {initialNotes ? (
                    <span className="text-gray-600 max-w-[200px] truncate">{initialNotes}</span>
                ) : (
                    <span className="italic">Add note...</span>
                )}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1.5 mt-1">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={500}
                placeholder="e.g., Before LC migration"
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-48"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setEditing(false);
                }}
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-2 py-1 bg-[var(--color-primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
            >
                {saving ? "..." : "Save"}
            </button>
            <button
                onClick={() => { setEditing(false); setValue(initialNotes || ""); }}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
            >
                Cancel
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const BackupSettings = () => {
    const { isSuperAdmin } = useAuth();

    // ── State ────────────────────────────────────────────────────────────
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [verifyingFile, setVerifyingFile] = useState(null);
    const [activeTab, setActiveTab] = useState("backups"); // "backups" | "history"
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPagination, setHistoryPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });

    // Restore state
    const [restoreModal, setRestoreModal] = useState(null); // { filename, manifest, ... }
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [inspecting, setInspecting] = useState(null);
    const [uploading, setUploading] = useState(false);
    const uploadRef = useRef(null);

    const [config, setConfig] = useState({
        frequency: "Daily",
        time: "02:00",
        weeklyDay: "Saturday",
        retentionCount: 7,
        retention: { daily: 7, weekly: 4, monthly: 6 },
        includeFiles: true,
        encryption: { enabled: false },
    });

    // ── Data Fetching ────────────────────────────────────────────────────

    const fetchBackups = useCallback(async () => {
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
    }, []);

    const fetchSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            const response = await getSystemSettings();
            if (response.success && response.data?.backup) {
                const b = response.data.backup;
                setConfig({
                    frequency: b.frequency || "Daily",
                    time: b.time || "02:00",
                    weeklyDay: b.weeklyDay || "Saturday",
                    retentionCount: b.retentionCount || 7,
                    retention: {
                        daily: b.retention?.daily || 7,
                        weekly: b.retention?.weekly || 4,
                        monthly: b.retention?.monthly || 6,
                    },
                    includeFiles: b.includeFiles ?? true,
                    encryption: { enabled: b.encryption?.enabled || false },
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async (page = 1) => {
        setHistoryLoading(true);
        try {
            const response = await getBackupHistory({ page, limit: 15 });
            if (response.data?.success) {
                setHistory(response.data.data.history);
                setHistoryPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Failed to load backup history");
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBackups();
        fetchSettings();
    }, [fetchBackups, fetchSettings]);

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory(1);
        }
    }, [activeTab, fetchHistory]);

    // ── Handlers ─────────────────────────────────────────────────────────

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
            toast.error(error.response?.data?.message || "Failed to update settings");
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

    const handleRetentionChange = (field, value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return;
        setConfig((prev) => ({
            ...prev,
            retention: { ...prev.retention, [field]: num },
        }));
    };

    const handleCreateBackup = async () => {
        setCreating(true);
        const toastId = toast.loading("Creating backup... This may take a moment.");
        try {
            const response = await createBackup();
            if (response.data?.success) {
                const d = response.data.data;
                toast.success(
                    `Backup created! ${d.manifest?.totalDocuments || "?"} docs, ${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB in ${(d.durationMs / 1000).toFixed(1)}s`,
                    { id: toastId, duration: 6000 }
                );
                fetchBackups();
            }
        } catch (error) {
            console.error("Backup creation failed:", error);
            toast.error(
                "Backup failed: " + (error.response?.data?.message || error.message),
                { id: toastId }
            );
        } finally {
            setCreating(false);
        }
    };

    const handleVerify = async (filename) => {
        setVerifyingFile(filename);
        const toastId = toast.loading("Verifying backup integrity...");
        try {
            const response = await verifyBackup(filename);
            if (response.data?.success) {
                const d = response.data.data;
                if (d.isValid) {
                    toast.success("Backup integrity verified — file is intact!", { id: toastId, duration: 5000 });
                } else {
                    toast.error("❌ BACKUP CORRUPTED — checksum mismatch!", { id: toastId, duration: 8000 });
                }
                fetchBackups();
            }
        } catch (error) {
            toast.error("Verification failed: " + (error.response?.data?.message || error.message), { id: toastId });
        } finally {
            setVerifyingFile(null);
        }
    };

    const handleDownload = async (filename) => {
        const toastId = toast.loading("Downloading backup...");
        try {
            const response = await downloadBackup(filename);

            const contentType = response.headers["content-type"];
            if (contentType && contentType.includes("application/json")) {
                const text = await new Response(response.data).text();
                try {
                    const errorJson = JSON.parse(text);
                    throw new Error(errorJson.message || "Download failed");
                } catch {
                    throw new Error("Download failed: " + text);
                }
            }

            const blob = new Blob([response.data], {
                type: contentType || "application/octet-stream",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();

            // Clean up properly (fixes memory leak from previous implementation)
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 5000);

            toast.success("Download started", { id: toastId });
        } catch (error) {
            console.error("Download failed:", error);
            let msg = "Failed to download backup";

            if (error.response && error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errObj = JSON.parse(text);
                    msg = errObj.message || msg;
                } catch { /* ignore */ }
            } else if (error.message) {
                msg = error.message;
            }

            toast.error(msg, { id: toastId });
        }
    };

    const handleDelete = async (filename) => {
        const result = await Swal.fire({
            title: "Delete Backup?",
            html: `<p>You are about to permanently delete:</p><p class="font-mono text-sm mt-2">${filename}</p><p class="text-red-600 mt-2 text-sm font-medium">This cannot be undone.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
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

    // ── Restore Handlers ─────────────────────────────────────────────────

    const handleInspectForRestore = async (filename) => {
        setInspecting(filename);
        try {
            const response = await inspectBackup(filename);
            if (response.data?.success) {
                setRestoreModal(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to inspect backup: " + (error.response?.data?.message || error.message));
        } finally {
            setInspecting(null);
        }
    };

    const handleUploadBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading backup file...");
        try {
            const formData = new FormData();
            formData.append("backupFile", file);
            const response = await uploadBackupFile(formData);
            if (response.data?.success) {
                toast.success(`Backup uploaded: ${response.data.data.filename}`, { id: toastId });
                fetchBackups();
            }
        } catch (error) {
            toast.error("Upload failed: " + (error.response?.data?.message || error.message), { id: toastId });
        } finally {
            setUploading(false);
            if (uploadRef.current) uploadRef.current.value = "";
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* ═══════ CONFIGURATION CARD ═══════ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaCog className="text-gray-600" /> Backup Configuration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure automatic backup schedule, retention policy, and encryption.
                    </p>
                </div>
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleUpdateSettings}>
                        {/* Schedule Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            {config.frequency === "Weekly" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Weekly Day
                                    </label>
                                    <SelectField
                                        value={config.weeklyDay}
                                        onChange={(val) => handleChange({ target: { name: "weeklyDay", value: val } })}
                                        options={WEEK_DAYS}
                                        className="mb-0"
                                    />
                                </div>
                            )}
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="includeFiles"
                                        checked={config.includeFiles}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-gray-300"
                                    />
                                    <span className="text-gray-700 font-medium">Include Uploads</span>
                                </label>
                            </div>
                        </div>

                        {/* Smart Retention Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-500" /> Smart Retention Policy
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Grandfather-Father-Son rotation. Manual backups are never auto-deleted.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendarDay className="text-sky-600" />
                                        <label className="text-sm font-medium text-sky-800">Daily Backups</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="90"
                                            value={config.retention.daily}
                                            onChange={(e) => handleRetentionChange("daily", e.target.value)}
                                            className="w-20 px-3 py-2 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 text-center"
                                        />
                                        <span className="text-sm text-sky-700">to keep</span>
                                    </div>
                                </div>
                                <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendarWeek className="text-violet-600" />
                                        <label className="text-sm font-medium text-violet-800">Weekly Backups</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="52"
                                            value={config.retention.weekly}
                                            onChange={(e) => handleRetentionChange("weekly", e.target.value)}
                                            className="w-20 px-3 py-2 border border-violet-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400 text-center"
                                        />
                                        <span className="text-sm text-violet-700">to keep</span>
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendarAlt className="text-amber-600" />
                                        <label className="text-sm font-medium text-amber-800">Monthly Backups</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="24"
                                            value={config.retention.monthly}
                                            onChange={(e) => handleRetentionChange("monthly", e.target.value)}
                                            className="w-20 px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
                                        />
                                        <span className="text-sm text-amber-700">to keep</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Encryption Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                                <FaLock className="text-gray-500" /> Encryption
                            </h3>
                            <div className="flex items-start gap-4">
                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={config.encryption?.enabled || false}
                                        onChange={(e) => {
                                            setConfig((prev) => ({
                                                ...prev,
                                                encryption: { ...prev.encryption, enabled: e.target.checked },
                                            }));
                                        }}
                                        className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] border-gray-300"
                                    />
                                    <span className="text-gray-700 font-medium">Enable AES-256-GCM Encryption</span>
                                </label>
                            </div>
                            {config.encryption?.enabled && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <FaInfoCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-medium">Password is managed via environment variable</p>
                                            <p className="mt-1 text-amber-700">
                                                Set <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">BACKUP_ENCRYPTION_PASSWORD</code> in
                                                your server's <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">.env</code> file.
                                                This password is never stored in the database for security.
                                            </p>
                                            <p className="mt-1 text-amber-700">
                                                Use <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">scripts/decrypt_backup.js</code> to
                                                restore encrypted backups.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
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

            {/* ═══════ BACKUPS LIST / HISTORY TABS ═══════ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            {/* Tab Switcher */}
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                <button
                                    onClick={() => setActiveTab("backups")}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "backups"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <FaDatabase className="inline mr-1.5" size={12} />
                                    Backups
                                </button>
                                <button
                                    onClick={() => setActiveTab("history")}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "history"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <FaHistory className="inline mr-1.5" size={12} />
                                    History
                                </button>
                            </div>
                        </div>
                        {activeTab === "backups" && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                    onClick={fetchBackups}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                                    title="Refresh List"
                                >
                                    <FaSync className={loading ? "animate-spin" : ""} /> Refresh
                                </button>
                                {isSuperAdmin && (
                                    <>
                                        <input
                                            ref={uploadRef}
                                            type="file"
                                            accept=".zip,.enc"
                                            onChange={handleUploadBackup}
                                            className="hidden"
                                            id="backup-upload"
                                        />
                                        <button
                                            onClick={() => uploadRef.current?.click()}
                                            disabled={uploading}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <><FaSpinner className="animate-spin" /> Uploading...</>
                                            ) : (
                                                <><FaCloudUploadAlt /> Upload Backup</>
                                            )}
                                        </button>
                                    </>
                                )}
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
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === "backups" ? (
                        <BackupsTab
                            backups={backups}
                            loading={loading}
                            verifyingFile={verifyingFile}
                            inspecting={inspecting}
                            isSuperAdmin={isSuperAdmin}
                            onVerify={handleVerify}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            onRestore={handleInspectForRestore}
                            onRefresh={fetchBackups}
                        />
                    ) : (
                        <HistoryTab
                            history={history}
                            loading={historyLoading}
                            pagination={historyPagination}
                            onPageChange={(page) => fetchHistory(page)}
                        />
                    )}
                </div>
            </div>

            {/* ═══════ RESTORE MODAL ═══════ */}
            {restoreModal && (
                <RestoreModal
                    data={restoreModal}
                    loading={restoreLoading}
                    onClose={() => setRestoreModal(null)}
                    onConfirm={async (options) => {
                        setRestoreLoading(true);
                        const toastId = toast.loading("Restoring data... This may take several minutes.");
                        try {
                            const response = await restoreFromBackup(restoreModal.filename, options);
                            if (response.data?.success) {
                                const d = response.data.data;
                                toast.success(
                                    `Restore complete in ${(d.durationMs / 1000).toFixed(1)}s! Safety backup: ${d.safetyBackup || "created"}`,
                                    { id: toastId, duration: 8000 }
                                );
                                setRestoreModal(null);
                                fetchBackups();
                            }
                        } catch (error) {
                            toast.error(
                                "Restore failed: " + (error.response?.data?.message || error.message),
                                { id: toastId, duration: 8000 }
                            );
                        } finally {
                            setRestoreLoading(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKUPS TAB
// ─────────────────────────────────────────────────────────────────────────────

const BackupsTab = ({ backups, loading, verifyingFile, inspecting, isSuperAdmin, onVerify, onDownload, onDelete, onRestore, onRefresh }) => {
    if (loading && backups.length === 0) {
        return <div className="text-center py-8 text-gray-500">Loading backups...</div>;
    }

    if (backups.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaDatabase className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="font-medium">No backups found</p>
                <p className="text-sm mt-1">Create your first backup to protect your business data.</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-3">
                {backups.map((backup) => (
                    <BackupCard
                        key={backup.filename}
                        backup={backup}
                        verifyingFile={verifyingFile}
                        inspecting={inspecting}
                        isSuperAdmin={isSuperAdmin}
                        onVerify={onVerify}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onRestore={onRestore}
                        onRefresh={onRefresh}
                    />
                ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-4 py-3">Backup</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {backups.map((backup) => (
                            <tr key={backup.filename} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <FaFileArchive className={backup.encrypted ? "text-purple-600 flex-shrink-0" : "text-orange-500 flex-shrink-0"} />
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-xs truncate max-w-[180px]" title={backup.filename}>
                                                {backup.filename}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {backup.encrypted && (
                                                    <span className="inline-flex items-center gap-0.5 text-purple-600 text-[10px]">
                                                        <FaLock size={8} /> Encrypted
                                                    </span>
                                                )}
                                            </div>
                                            <NotesEditor
                                                filename={backup.filename}
                                                initialNotes={backup.notes}
                                                onSaved={onRefresh}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={backup.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <RetentionBadge tag={backup.retentionTag} />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="text-gray-900 font-medium">{backup.size}</span>
                                    {backup.durationMs && (
                                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                            <FaClock size={8} /> {(backup.durationMs / 1000).toFixed(1)}s
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {backup.manifest ? (
                                        <div className="text-xs">
                                            <span className="text-gray-900 font-medium">{backup.manifest.totalDocuments.toLocaleString()}</span>
                                            <span className="text-gray-500"> docs</span>
                                            <p className="text-[10px] text-gray-400">{backup.manifest.collectionsCount} collections</p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-xs">
                                        <p className="text-gray-800">{format(new Date(backup.createdAt), "MMM dd, yyyy")}</p>
                                        <p className="text-gray-400">{format(new Date(backup.createdAt), "hh:mm a")}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => onRestore(backup.filename)}
                                                disabled={inspecting === backup.filename}
                                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                                                title="Restore from this backup"
                                            >
                                                {inspecting === backup.filename ? (
                                                    <FaSpinner size={15} className="animate-spin" />
                                                ) : (
                                                    <FaUndo size={15} />
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onVerify(backup.filename)}
                                            disabled={verifyingFile === backup.filename}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                            title="Verify Integrity"
                                        >
                                            {verifyingFile === backup.filename ? (
                                                <FaSpinner size={15} className="animate-spin" />
                                            ) : (
                                                <FaShieldAlt size={15} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onDownload(backup.filename)}
                                            className="p-1.5 text-[var(--color-primary)] hover:bg-gray-100 rounded transition-colors"
                                            title="Download"
                                        >
                                            <FaDownload size={15} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(backup.filename)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// ── Mobile Backup Card ────────────────────────────────────────────────

const BackupCard = ({ backup, verifyingFile, inspecting, isSuperAdmin, onVerify, onDownload, onDelete, onRestore, onRefresh }) => (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
                <FaFileArchive className={`mt-0.5 flex-shrink-0 ${backup.encrypted ? "text-purple-600" : "text-orange-500"}`} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 break-all">{backup.filename}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <StatusBadge status={backup.status} />
                        <RetentionBadge tag={backup.retentionTag} />
                        {backup.encrypted && (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                                <FaLock size={10} /> Encrypted
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">{backup.size}</span>
                {backup.manifest && (
                    <span>{backup.manifest.totalDocuments.toLocaleString()} docs</span>
                )}
                {backup.durationMs && (
                    <span className="flex items-center gap-0.5">
                        <FaClock size={9} /> {(backup.durationMs / 1000).toFixed(1)}s
                    </span>
                )}
            </div>
            <span>{format(new Date(backup.createdAt), "PPP p")}</span>
        </div>

        <NotesEditor filename={backup.filename} initialNotes={backup.notes} onSaved={onRefresh} />

        <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
            {isSuperAdmin && (
                <button
                    onClick={() => onRestore(backup.filename)}
                    disabled={inspecting === backup.filename}
                    className="flex items-center gap-1.5 text-sm text-orange-600 hover:opacity-75 transition-colors disabled:opacity-50"
                >
                    {inspecting === backup.filename ? (
                        <FaSpinner size={13} className="animate-spin" />
                    ) : (
                        <FaUndo size={13} />
                    )}
                    Restore
                </button>
            )}
            <button
                onClick={() => onVerify(backup.filename)}
                disabled={verifyingFile === backup.filename}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:opacity-75 transition-colors disabled:opacity-50"
            >
                {verifyingFile === backup.filename ? (
                    <FaSpinner size={13} className="animate-spin" />
                ) : (
                    <FaShieldAlt size={13} />
                )}
                Verify
            </button>
            <button
                onClick={() => onDownload(backup.filename)}
                className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:opacity-75 transition-colors"
            >
                <FaDownload size={13} /> Download
            </button>
            <button
                onClick={() => onDelete(backup.filename)}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
                <FaTrash size={13} /> Delete
            </button>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────────────────────────────────────

const HistoryTab = ({ history, loading, pagination, onPageChange }) => {
    if (loading && history.length === 0) {
        return <div className="text-center py-8 text-gray-500">Loading history...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="font-medium">No backup history</p>
                <p className="text-sm mt-1">Backup operations will be recorded here.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-2">
                {history.map((item) => (
                    <div
                        key={item._id}
                        className={`border rounded-lg p-3 ${item.status === "failed" || item.status === "corrupted"
                            ? "border-red-200 bg-red-50/50"
                            : item.status === "verified"
                                ? "border-blue-200 bg-blue-50/30"
                                : "border-gray-200 bg-white"
                            }`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <StatusBadge status={item.status} />
                                <RetentionBadge tag={item.retentionTag} />
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[250px]" title={item.filename}>
                                    {item.filename}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                {item.sizeBytes > 0 && (
                                    <span>{(item.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                                )}
                                {item.durationMs > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <FaClock size={9} /> {(item.durationMs / 1000).toFixed(1)}s
                                    </span>
                                )}
                                <span title={format(new Date(item.createdAt), "PPP p")}>
                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                        {item.initiatedBy && (
                            <p className="text-xs text-gray-400 mt-1">
                                By {item.initiatedBy.name || item.initiatedBy.email || "System"}
                            </p>
                        )}
                        {item.errorMessage && (
                            <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
                                <FaTimesCircle className="mt-0.5 flex-shrink-0" size={10} />
                                {item.errorMessage}
                            </p>
                        )}
                        {item.manifest?.totalDocuments > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                {item.manifest.totalDocuments.toLocaleString()} documents across {item.manifest.collections?.length || 0} collections
                            </p>
                        )}
                        {item.notes && (
                            <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                <FaStickyNote size={9} /> {item.notes}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} total)
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE MODAL — Multi-step confirmation
// ─────────────────────────────────────────────────────────────────────────────

const RestoreModal = ({ data, loading, onClose, onConfirm }) => {
    const [confirmText, setConfirmText] = useState("");
    const [restoreUploads, setRestoreUploads] = useState(false);
    const isConfirmed = confirmText === "RESTORE DATA";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FaUndo className="text-orange-600" />
                                Restore from Backup
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 break-all">{data.filename}</p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Manifest Preview */}
                <div className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-800">
                                <p className="font-bold">This will REPLACE your current database</p>
                                <p className="mt-1 text-red-700">
                                    All existing data will be dropped and replaced with the backup data.
                                    A safety backup of your current data will be created automatically before restoring.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Backup Info */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Backup Contents</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500">Size</p>
                                <p className="font-medium text-gray-900">{data.size}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Encrypted</p>
                                <p className="font-medium text-gray-900">{data.encrypted ? "Yes (AES-256-GCM)" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Integrity</p>
                                <p className="font-medium text-gray-900">
                                    <StatusBadge status={data.status} />
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="font-medium text-gray-900">
                                    {data.createdAt ? format(new Date(data.createdAt), "PPP p") : "Unknown"}
                                </p>
                            </div>
                        </div>

                        {/* Manifest details */}
                        {data.manifest && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-500">App Version</span>
                                    <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">{data.manifest.appVersion || "Unknown"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-500">Database</span>
                                    <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">{data.manifest.dbName || "Unknown"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-gray-500">Total Documents</span>
                                    <span className="font-bold text-gray-900">{(data.manifest.totalDocuments || 0).toLocaleString()}</span>
                                </div>

                                {data.manifest.collections && data.manifest.collections.length > 0 && (
                                    <details className="text-xs">
                                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                                            {data.manifest.collections.length} collections (click to expand)
                                        </summary>
                                        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                                            {data.manifest.collections.map((col, i) => (
                                                <div key={i} className="flex justify-between text-gray-600 py-0.5 px-2 hover:bg-gray-100 rounded">
                                                    <span className="font-mono">{col.name}</span>
                                                    <span className="text-gray-400">{col.documentCount >= 0 ? col.documentCount.toLocaleString() : "?"} docs</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}

                        {!data.manifest && !data.hasManifest && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <FaExclamationTriangle size={10} />
                                    Legacy backup — no manifest available. Contents cannot be previewed.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Restore uploads option */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <input
                            type="checkbox"
                            id="restore-uploads"
                            checked={restoreUploads}
                            onChange={(e) => setRestoreUploads(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="restore-uploads" className="text-sm text-blue-800 cursor-pointer">
                            <span className="font-medium">Also restore uploaded files</span>
                            <p className="text-xs text-blue-600 mt-0.5">Replaces the uploads directory (LC documents, customer files, etc.)</p>
                        </label>
                    </div>

                    {/* Confirmation Input */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type{" "}
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 select-all text-red-700">
                                RESTORE DATA
                            </span>{" "}
                            to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none uppercase font-mono tracking-widest text-center disabled:opacity-50"
                            placeholder="TYPE HERE"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm({ restoreUploads })}
                        disabled={!isConfirmed || loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[160px] justify-center"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Restoring...
                            </>
                        ) : (
                            <>
                                <FaUndo /> Restore Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;
