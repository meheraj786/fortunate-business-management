// Consistent currency formatting
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    // Return a default value or an indicator for non-numeric input
    return "BDT 0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export const formatCompactNumber = (number) => {
  if (number === undefined || number === null) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

export const formatNumber = (number) => {
  if (number === null || number === undefined) return "0";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (dateString, options) => {
  if (!dateString) return "N/A";
  try {
    const defaultOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(
      "en-GB",
      options || defaultOptions,
    );
  } catch {
    return "Invalid Date";
  }
};

export const formatAccountLabel = (account) => {
  if (!account) return "";
  if (account.accountType === "Bank") {
    return `${account.accountName} - ${account.bankName} (${account.branchName})`;
  } else if (account.accountType === "Mobile Banking") {
    return `${account.serviceName} - ${account.accountName} (${account.accountHolderName})`;
  } else if (account.accountType === "Cash") {
    return `${account.accountName} - ${account.accountHolderName}`;
  }
  return account.accountName;
};
