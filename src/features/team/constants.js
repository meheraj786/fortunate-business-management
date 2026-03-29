export const MODULES_ORDER = [
  "USER",
  "WAREHOUSE",
  "PRODUCT",
  "LC",
  "SALE",
  "CASH",
  "ACCOUNT",
  "TRANSACTION",
  "CUSTOMER",
  "CATEGORY",
  "UNIT",
  "SETTINGS",
  "TRASH",
  "AUDIT",
  "ADVANCE_PAYMENT",
];

/**
 * Frontend mirror of backend BUNDLED_PERMISSIONS.
 * When a permission key is checked, all permissions in its array
 * are auto-checked as prerequisites.
 */
export const PERMISSION_BUNDLES = {
  // CUSTOMER
  CUSTOMER_VIEW_DETAILS: ["CUSTOMER_VIEW_TABLE"],
  CUSTOMER_VIEW_SENSITIVE: ["CUSTOMER_VIEW_TABLE", "CUSTOMER_VIEW_DETAILS"],
  CUSTOMER_CREATE: ["CUSTOMER_VIEW_TABLE"],
  CUSTOMER_UPDATE: ["CUSTOMER_VIEW_TABLE", "CUSTOMER_VIEW_DETAILS", "CUSTOMER_VIEW_SENSITIVE"],
  CUSTOMER_DELETE: ["CUSTOMER_VIEW_TABLE", "CUSTOMER_VIEW_DETAILS"],

  // SALE
  SALE_VIEW_DETAILS: ["SALE_VIEW_TABLE"],
  SALE_CREATE: ["SALE_VIEW_TABLE"],
  SALE_ADD_PAYMENT: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS"],
  SALE_UPDATE: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS"],
  SALE_ITEM_ADD: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS", "SALE_UPDATE"],
  SALE_ITEM_DELETE: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS", "SALE_UPDATE"],
  SALE_CANCEL: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS"],
  SALE_DELETE: ["SALE_VIEW_TABLE", "SALE_VIEW_DETAILS"],

  // LC
  LC_VIEW_DETAILS: ["LC_VIEW_TABLE"],
  LC_CREATE: ["LC_VIEW_TABLE"],
  LC_UPDATE: ["LC_VIEW_TABLE", "LC_VIEW_DETAILS"],
  LC_DELETE: ["LC_VIEW_TABLE", "LC_VIEW_DETAILS"],

  // PRODUCT
  PRODUCT_VIEW_DETAILS: ["PRODUCT_VIEW_TABLE"],
  PRODUCT_CREATE: ["PRODUCT_VIEW_TABLE", "PRODUCT_VIEW_DETAILS"],
  PRODUCT_UPDATE: ["PRODUCT_VIEW_TABLE", "PRODUCT_VIEW_DETAILS"],
  PRODUCT_DELETE: ["PRODUCT_VIEW_TABLE", "PRODUCT_VIEW_DETAILS"],

  // USER
  USER_VIEW_DETAILS: ["USER_VIEW_ALL"],
  USER_CREATE: ["USER_VIEW_ALL"],
  USER_UPDATE: ["USER_VIEW_ALL", "USER_VIEW_DETAILS"],
  USER_DELETE: ["USER_VIEW_ALL", "USER_VIEW_DETAILS"],

  // ACCOUNT
  // Cross-module: ACCOUNT_VIEW_ALL → TRANSACTION_VIEW_ALL (same page)
  ACCOUNT_VIEW_ALL: ["TRANSACTION_VIEW_ALL"],
  ACCOUNT_VIEW_DETAILS: ["ACCOUNT_VIEW_ALL", "ACCOUNT_VIEW_TRANSACTIONS"],
  ACCOUNT_CREATE: ["ACCOUNT_VIEW_ALL"],
  ACCOUNT_UPDATE: ["ACCOUNT_VIEW_ALL", "ACCOUNT_VIEW_DETAILS"],
  ACCOUNT_DELETE: ["ACCOUNT_VIEW_ALL", "ACCOUNT_VIEW_DETAILS"],
  ACCOUNT_VIEW_TRANSACTIONS: ["ACCOUNT_VIEW_ALL", "ACCOUNT_VIEW_DETAILS"],

  // TRANSACTION
  TRANSACTION_VIEW_DETAILS: ["TRANSACTION_VIEW_ALL"],
  // Cross-module: TRANSACTION_CREATE → ACCOUNT_VIEW_ALL (need to select account)
  TRANSACTION_CREATE: ["TRANSACTION_VIEW_ALL", "ACCOUNT_VIEW_ALL"],
  TRANSACTION_UPDATE: ["TRANSACTION_VIEW_ALL", "TRANSACTION_VIEW_DETAILS"],
  TRANSACTION_DELETE: ["TRANSACTION_VIEW_ALL", "TRANSACTION_VIEW_DETAILS"],

  // ADVANCE PAYMENT
  ADVANCE_PAYMENT_VIEW_DETAILS: ["ADVANCE_PAYMENT_VIEW"],
  ADVANCE_PAYMENT_CREATE: ["ADVANCE_PAYMENT_VIEW"],
  ADVANCE_PAYMENT_SETTLE: ["ADVANCE_PAYMENT_VIEW", "ADVANCE_PAYMENT_VIEW_DETAILS"],
  ADVANCE_PAYMENT_REFUND: ["ADVANCE_PAYMENT_VIEW", "ADVANCE_PAYMENT_VIEW_DETAILS"],
  ADVANCE_PAYMENT_DELETE: ["ADVANCE_PAYMENT_VIEW", "ADVANCE_PAYMENT_VIEW_DETAILS"],
};

export const MODULE_LABELS = {
  USER: "Users & Team",
  WAREHOUSE: "Warehouses",
  PRODUCT: "Products & Stock",
  LC: "Letter of Credit (LC)",
  SALE: "Sales & Invoices",
  CASH: "Daily Cash Flow",
  ACCOUNT: "Bank & Cash Accounts",
  TRANSACTION: "Transactions",
  CUSTOMER: "Customers",
  CATEGORY: "Categories",
  UNIT: "Units",
  SETTINGS: "System Settings",
  TRASH: "Recycle Bin",
  AUDIT: "Audit Logs",
  ADVANCE_PAYMENT: "Advance Payments",
};

export const formatPermissionLabel = (permission) => {
  // First, map some specific tricky/custom ones
  const customLabels = {
    CASH_ACCOUNTS_OPEN_CLOSE: "Open & Close Day",
    TRASH_RESTORE_LC: "Restore LC",
    TRASH_DELETE_LC: "Delete LC permanently",
    TRASH_RESTORE_PRODUCT: "Restore Product",
    TRASH_DELETE_PRODUCT: "Delete Product permanently",
    TRASH_RESTORE_CUSTOMER: "Restore Customer",
    TRASH_DELETE_CUSTOMER: "Delete Customer permanently",
    CUSTOMER_VIEW_SENSITIVE: "View Phone & Address",
    TRASH_RESTORE_SALE: "Restore Sale",
    TRASH_DELETE_SALE: "Delete Sale permanently",
    TRASH_RESTORE_TRANSACTION: "Restore Transaction",
    TRASH_DELETE_TRANSACTION: "Delete Transaction permanently",
    TRASH_RESTORE_WAREHOUSE: "Restore Warehouse",
    TRASH_DELETE_WAREHOUSE: "Delete Warehouse permanently",
    TRASH_RESTORE_USER: "Restore User",
    TRASH_DELETE_USER: "Delete User permanently",
    TRASH_RESTORE_ACCOUNT: "Restore Account",
    TRASH_DELETE_ACCOUNT: "Delete Account permanently",
    TRASH_RESTORE_ADVANCE_PAYMENT: "Restore Adv. Payment",
    TRASH_DELETE_ADVANCE_PAYMENT: "Delete Adv. Payment permanently",
    SALE_GENERATE_INVOICE: "Generate Invoice",
    SALE_VIEW_INVOICE: "View Invoice",
    SALE_DOWNLOAD_INVOICE: "Download Invoice",
    SALE_SHARE_INVOICE: "Share Invoice",
    SALE_ITEM_ADD: "Add Items to Sale",
    SALE_ITEM_DELETE: "Remove Items from Sale",
  };

  if (customLabels[permission]) return customLabels[permission];

  // For most permissions, strip the module prefix and format nicely
  // e.g., CUSTOMER_VIEW_TABLE -> View Table
  // e.g., LC_EXPORT_PDF -> Export PDF
  const parts = permission.split("_");

  // Handle modules with two words (e.g., ADVANCE_PAYMENT)
  let actionParts = parts.slice(1);
  if (parts[0] === "ADVANCE" && parts[1] === "PAYMENT") {
    actionParts = parts.slice(2);
  }

  return actionParts
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};
