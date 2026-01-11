import React from "react";
// import Skeleton from "react-loading-skeleton"; // Removed react-loading-skeleton

const SalesTableSkeleton = () => {
  const SkeletonRow = () => (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[120px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[100px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[60px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[80px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[70px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[90px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[100px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[80px]" />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-[80px]" />
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {/* The header is intentionally left static to provide context */}
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  LC Number
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Invoice Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTableSkeleton;
