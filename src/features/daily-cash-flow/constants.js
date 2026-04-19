export const INCOME_CATEGORIES = [
  "LC",
  "Sales",
  "Donation",
  "Commission",
  "Interest",
  "Service Charge",
  "Others",
];
export const EXPENSE_CATEGORIES = [
  "LC",
  "Sales",
  "Rent",
  "Salary",
  "Office Expense",
  "Transport",
  "Utility",
  "Jakat",
  "Self",
  "Others",
];

export const ITEMS_PER_PAGE = 10;

export const INITIAL_TRANSACTION_STATE = {
  name: "", // For income/expense name
  amount: "",
  category: "",
  description: "",
  paymentMethod: "Cash",
  accountId: "",
  lcId: "", // For LC transactions
  salesId: "", // For Sales transactions
  lcCostCategory: "otherExpenses",
};

import {
    Users,
    Fuel,
    Wrench,
    Coffee,
    Building,
    Truck,
    Car,
    CreditCard,
    Receipt,
    PiggyBank,
    Wallet,
    Package,
    DollarSign,
    Heart,
    User,
} from "lucide-react";

export const ICON_COMPONENTS = {
  Fuel,
  Users,
  Wrench,
  Coffee,
  Building,
  Truck,
  Car,
  CreditCard,
  Receipt,
  PiggyBank,
  Wallet,
  Package, // For LC/Sales
  User: Users,
  Sale: DollarSign,
  "Office Expense": Building,
  Transportation: Truck,
  Jakat: Heart,
  Self: User,
};
