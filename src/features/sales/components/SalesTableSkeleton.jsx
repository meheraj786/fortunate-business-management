import React from "react";
import Skeleton from "react-loading-skeleton";

const SalesTableSkeleton = () => {
  const SkeletonRow = () => (
    <tr>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-4 sm:text-sm">
        <Skeleton width={120} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={100} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={60} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={80} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={70} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={90} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={100} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={80} />
      </td>
      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
        <Skeleton width={80} />
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {/* The header is intentionally left static to provide context */}
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-4 sm:text-sm"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  LC Number
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer sm:px-3 sm:text-sm"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer sm:px-3 sm:text-sm"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Invoice Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer sm:px-3 sm:text-sm"
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
