import React from 'react';

const SkeletonRect = ({ width, height, className = "rounded" }) => (
  <div className={`bg-gray-200 animate-pulse ${width} ${height} ${className}`}></div>
);

const CustomerDetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center flex-1 min-w-0">
            <SkeletonRect width="w-14 sm:w-16" height="h-14 sm:h-16" className="rounded-full mr-3 sm:mr-4 flex-shrink-0" />
            <div className="min-w-0">
              <SkeletonRect width="w-48 sm:w-64" height="h-6 sm:h-7" className="mb-2" />
              <SkeletonRect width="w-32 sm:w-48" height="h-4 sm:h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonRect width="w-20" height="h-9" />
            <SkeletonRect width="w-20" height="h-9" />
          </div>
        </div>
      </div>

      {/* Main Content Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1 - General Info & Transaction Overview */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Collapsible Card Skeleton */}
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <SkeletonRect width="w-48" height="h-6" />
              <SkeletonRect width="w-6" height="h-6" className="rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonRect width="w-24" height="h-4" />
                  <SkeletonRect width="w-full" height="h-5" />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-2">
                <SkeletonRect width="w-24" height="h-4" />
                <SkeletonRect width="w-full" height="h-5" />
              </div>
            </div>
          </div>

          {/* Collapsible Card Skeleton */}
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <SkeletonRect width="w-48" height="h-6" />
              <SkeletonRect width="w-6" height="h-6" className="rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-100 space-y-2">
                  <SkeletonRect width="w-16" height="h-6" className="mx-auto" />
                  <SkeletonRect width="w-24" height="h-4" className="mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 - Status & Documents */}
        <div className="space-y-4 sm:space-y-6">
          {/* Collapsible Card Skeleton */}
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <SkeletonRect width="w-48" height="h-6" />
              <SkeletonRect width="w-6" height="h-6" className="rounded-full" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonRect width="w-24" height="h-4" />
                  <SkeletonRect width="w-full" height="h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Card Skeleton */}
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <SkeletonRect width="w-48" height="h-6" />
              <SkeletonRect width="w-6" height="h-6" className="rounded-full" />
            </div>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <SkeletonRect width="w-6" height="h-6" className="flex-shrink-0 mr-3" />
                  <div className="flex-1 space-y-1">
                    <SkeletonRect width="w-full" height="h-4" />
                    <SkeletonRect width="w-24" height="h-3" />
                  </div>
                  <SkeletonRect width="w-6" height="h-6" className="rounded-full ml-2 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases Skeleton */}
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <SkeletonRect width="w-48" height="h-6" />
          <SkeletonRect width="w-6" height="h-6" className="rounded-full" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {[...Array(8)].map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <SkeletonRect width="w-24" height="h-4" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3 whitespace-nowrap">
                      <SkeletonRect width="w-full" height="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsSkeleton;
