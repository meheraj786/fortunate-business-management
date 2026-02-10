import React, { createContext, useContext, useMemo } from "react";
import { useSystemSettings } from "@/api/hooks/settingsHooks";
import { format } from "date-fns";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { data: settings, isLoading } = useSystemSettings();

  const formattedSettings = useMemo(() => {
    if (!settings) return null;
    return {
      businessName: settings.businessName || "Fortunate Business Management",
      currency: settings.currency || "USD",
      dateFormat: settings.dateFormat || "MM/DD/YYYY",
      timeFormat: settings.timeFormat || "12h",
      timezone: settings.timezone || "Asia/Dhaka",
    };
  }, [settings]);

  // Helper: Format Currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "";
    const symbol = getCurrencySymbol(formattedSettings?.currency || "USD");
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  // Helper: Format Compact Number (e.g. 1.2M, 500K)
  const formatCompactNumber = (amount) => {
    if (amount === undefined || amount === null) return "";
    const symbol = getCurrencySymbol(formattedSettings?.currency || "USD");
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: formattedSettings?.currency || "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  // Helper: Get Currency Symbol
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      USD: "$",
      BDT: "৳",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CNY: "¥",
      AED: "AED",
      SAR: "SAR",
    };
    return symbols[currencyCode] || currencyCode;
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Map settings format to date-fns format
      const formatMap = {
        "MM/DD/YYYY": "MM/dd/yyyy",
        "DD/MM/YYYY": "dd/MM/yyyy",
        "YYYY-MM-DD": "yyyy-MM-dd",
      };
      const fmt = formatMap[formattedSettings?.dateFormat] || "MM/dd/yyyy";
      return format(date, fmt);
    } catch (e) {
      return dateString;
    }
  };

  // Helper: Format Time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const fmt = formattedSettings?.timeFormat === "24h" ? "HH:mm" : "hh:mm a";
      return format(date, fmt);
    } catch (e) {
      return dateString;
    }
  };

  // Helper: Format DateTime
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  // Helper: Format Number
  const formatNumber = (amount) => {
    if (amount === undefined || amount === null || amount === "") return "0";
    return Number(amount).toLocaleString();
  };

  const value = {
    settings: formattedSettings,
    isLoading,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCompactNumber,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
