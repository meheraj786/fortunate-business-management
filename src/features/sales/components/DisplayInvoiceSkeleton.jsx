import React from 'react';

const Skeleton = ({ className }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;

const DisplayInvoiceSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-grow p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg">
          <div className="flex justify-between items-start pb-8 border-b">
            <div>
              <Skeleton className="h-9 w-40 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-52 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8">
            <div>
              <Skeleton className="h-5 w-20 mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-32 ml-auto" />
              <Skeleton className="h-5 w-40 ml-auto" />
              <Skeleton className="h-5 w-36 ml-auto" />
            </div>
          </div>

          <div className="w-full mb-8">
            <div className="bg-gray-50 flex justify-between p-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="border-b p-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-6 w-full mt-2 pt-2 border-t" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 bg-white lg:h-screen p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
};

export default DisplayInvoiceSkeleton;
