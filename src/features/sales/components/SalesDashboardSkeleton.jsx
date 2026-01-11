import React from 'react';
import SalesTableSkeleton from './SalesTableSkeleton';

const SalesDashboardSkeleton = () => {
  const StatCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-gray-100">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        </div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="h-11 bg-gray-200 rounded-lg w-full sm:w-32 animate-pulse"></div>
            <div className="h-11 bg-gray-200 rounded-lg w-full sm:w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-7 bg-gray-200 rounded w-48 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="w-full sm:w-64 h-11 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <SalesTableSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboardSkeleton;
