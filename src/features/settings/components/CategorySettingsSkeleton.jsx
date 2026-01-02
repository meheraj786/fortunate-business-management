import React from 'react';

const CategorySettingsSkeleton = () => {
  return (
    <div className="px-2">
      <div className="flex justify-between items-center">
        <div className="sm:flex-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
        <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center gap-6 items-center">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
      <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg dark:ring-black/15">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-black/15 bg-white">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-black"
              >
                Name
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-black"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6 dark:text-black"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="py-4 pr-3 pl-4 text-sm sm:pl-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </td>
                <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell dark:text-gray-400">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                </td>
                <td className="py-3.5 pr-4 pl-3 text-sm sm:pr-6">
                  <div className="flex flex-col sm:flex-row w-max gap-2">
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

export default CategorySettingsSkeleton;