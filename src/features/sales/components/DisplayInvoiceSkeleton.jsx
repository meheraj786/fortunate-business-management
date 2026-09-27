import React from 'react';

const Skeleton = ({ className }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;

const DisplayInvoiceSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Actions Bar Skeleton */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white p-6 sm:p-12 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-gray-200 mb-7">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-8 w-28 ml-auto" />
            <Skeleton className="h-4 w-36 ml-auto" />
            <Skeleton className="h-5 w-16 ml-auto" />
          </div>
        </div>

        {/* Bill to & Details */}
        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2 sm:text-right">
            <Skeleton className="h-4 w-36 sm:ml-auto" />
            <Skeleton className="h-4 w-32 sm:ml-auto" />
            <Skeleton className="h-4 w-28 sm:ml-auto" />
            <Skeleton className="h-4 w-44 sm:ml-auto" />
            <Skeleton className="h-4 w-36 sm:ml-auto" />
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full mb-12">
          <div className="bg-gray-900 h-9 rounded-t flex items-center px-4 justify-between">
            <Skeleton className="h-4 w-8 bg-gray-700" />
            <Skeleton className="h-4 w-32 bg-gray-700" />
            <Skeleton className="h-4 w-16 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
          </div>
          <div className="divide-y divide-gray-100 border-x border-b">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <Skeleton className="h-24 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full pt-2" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t text-center">
          <Skeleton className="h-4 w-48 mx-auto mb-2" />
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default DisplayInvoiceSkeleton;
