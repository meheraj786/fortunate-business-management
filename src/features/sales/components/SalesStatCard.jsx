import React from "react";
import { Link } from "react-router"; // Changed to react-router
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/context/SettingsContext";
import { getSalesSummaryTable } from "@/api/sales.api";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const SalesStatCard = ({
  title,
  count,
  linkTo,
  icon,
  color,
  loading = false,
}) => {
  const IconComponent = icon;
  const { formatNumber } = useSettings();
  const queryClient = useQueryClient();

  // Map color prop to actual Tailwind classes
  const colorClasses = {
    yellow: {
      bg: "bg-[var(--color-warning-light)]",
      text: "text-[var(--color-warning)]",
    },
    orange: {
      // Mapping orange to warning for consistency
      bg: "bg-[var(--color-warning-light)]",
      text: "text-[var(--color-warning)]",
    },
    green: {
      bg: "bg-[var(--color-success-light)]",
      text: "text-[var(--color-success)]",
    },
    red: {
      bg: "bg-[var(--color-danger-light)]",
      text: "text-[var(--color-danger)]",
    },
    blue: {
      // Default color if primary is meant to be blue
      bg: "bg-[var(--color-primary-light)]",
      text: "text-[var(--color-primary)]",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue; // Default to blue (primary)

  const handleMouseEnter = () => {
    let initialFilters = {};
    if (linkTo === "/sales/not-invoiced")
      initialFilters = { invoiceStatus: "Not-invoiced" };
    else if (linkTo === "/sales/due-invoices")
      initialFilters = { paymentStatus: "Due payment" };
    else if (linkTo === "/sales/paid-invoices")
      initialFilters = { paymentStatus: "Paid payment" };
    else if (linkTo === "/sales/cancelled")
      initialFilters = { invoiceStatus: "Cancelled" };

    const params = {
      page: 1,
      limit: 10,
      search: "",
      sortBy: "saleDate",
      sortOrder: "desc",
      ...initialFilters,
    };

    queryClient.prefetchQuery({
      queryKey: ["sales", "summary", params],
      queryFn: async () => (await getSalesSummaryTable(params)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Link
      to={linkTo}
      onMouseEnter={handleMouseEnter}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow block active:scale-[0.98] touch-manipulation"
      aria-label={`View ${title}`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${classes.bg} ${classes.text}`}>
          <IconComponent className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-4 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="text-2xl font-bold text-gray-900 truncate">
            {loading ? (
              <ValueSkeleton width="w-16" height="h-8" className="mt-1" />
            ) : (
              formatNumber(count)
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(SalesStatCard);
