import React, { useState, useEffect } from "react";
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from "@/api/hooks/settingsHooks";
import { useAuth } from "@/hooks/useAuth"; // Adjust path if needed
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Moscow",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
];

const GeneralSettingsPage = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const { mutate: updateSettings, isPending } = useUpdateSystemSettings();
  const { isSuperAdmin } = useAuth();
  const [selectedTimezone, setSelectedTimezone] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  useEffect(() => {
    if (settings) {
      if (settings.timezone) {
        setSelectedTimezone(settings.timezone);
      }
      setFormData({
        businessName: settings.businessName || "",
        currency: settings.currency || "USD",
        dateFormat: settings.dateFormat || "MM/DD/YYYY",
        timeFormat: settings.timeFormat || "12h",
      });
    }
  }, [settings]);

  if (!isSuperAdmin) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
        <p className="mt-2 text-sm text-red-600">
          Only Super Admins can access General Settings.
        </p>
      </div>
    );
  }

  const handleUpdate = () => {
    if (!selectedTimezone) return;
    updateSettings({ timezone: selectedTimezone });
  };

  const handleGeneralUpdate = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const isLocked = settings?.isTimezoneSet;

  return (
    <div className="space-y-6">
      {/* Timezone Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            Timezone Configuration
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Set the business timezone. This affects all dates, transactions, and
            reports.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {isLocked ? (
            <div className="flex items-center gap-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-8.25.36-1.025.36h.003v.24c.75 0 1.125.5 1.125 1.125v2.25c0 .625.5 1.125 1.125 1.125h3c.625 0 1.125-.5 1.125-1.125v-2.25c0-.625-.5-1.125-1.125-1.125h-.375v-.24c0-1.11-.605-2.04-1.464-2.383a1.125 1.125 0 00-1.296.265zm2.345 5.06a.75.75 0 10-1.44-.42.75.75 0 001.44.42z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M8.625 8.625h6.75v.75h-6.75v-.75z"
                    clipRule="evenodd"
                  />
                  <path d="M12 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Timezone Locked</h3>
                <p className="text-sm opacity-90">
                  The business timezone is permanently set to{" "}
                  <span className="font-bold font-mono bg-green-100 px-2 py-0.5 rounded text-green-800">
                    {isLoading ? (
                      <ValueSkeleton width="w-32" height="h-4" />
                    ) : (
                      settings.timezone
                    )}
                  </span>
                  . It cannot be changed to ensure data consistency.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-amber-600 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold text-amber-800">
                      Warning: One-Time Configuration
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Start by selecting your business timezone. Once saved,
                      this setting <strong>cannot be changed</strong>. This
                      ensures historic transaction data remains consistent
                      forever.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Timezone
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10 px-3 border"
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      {isLoading
                        ? "Loading timezones..."
                        : "Select a timezone..."}
                    </option>
                    {!isLoading &&
                      TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleUpdate}
                    disabled={
                      isPending ||
                      !selectedTimezone ||
                      selectedTimezone === settings?.timezone
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isPending ? "Locking..." : "Set & Lock Timezone"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* General Preferences Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            General Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage business details and display formats.
          </p>
        </div>

        <form onSubmit={handleGeneralUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="h-10">
                {isLoading ? (
                  <ValueSkeleton width="w-full" height="h-10" />
                ) : (
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10 px-3 border"
                    placeholder="Enter business name"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10 px-3 border"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol}) - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date Format
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) =>
                  setFormData({ ...formData, dateFormat: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10 px-3 border"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Format
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) =>
                  setFormData({ ...formData, timeFormat: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10 px-3 border"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
