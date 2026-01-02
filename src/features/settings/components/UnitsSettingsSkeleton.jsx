import React from 'react';

const UnitsSettingsSkeleton = () => {
  return (
    <div className="px-2">
      <div className="flex justify-between items-center">
        <div className="sm:flex-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
      </div>

      <div className="-mx-4 mt-8 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 text-left text-sm font-semibold">
                Name
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Type
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Conversion Factor
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="py-4 pl-4 text-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </td>
                <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </td>
                <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                </td>
                <td className="py-3.5 px-3 text-sm">
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitsSettingsSkeleton;