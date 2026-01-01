import React from 'react';

const Skeleton = ({ className }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;

const AddSaleFormSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-grow">
      {/* Product Selection Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Quantity, Unit, Price Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Customer Info Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" /> {/* For existing customer select */}

      {/* Invoice Status & Delivery Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Other Charges */}
      <div>
        <Skeleton className="h-6 w-1/4 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Discount & Total Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Notes Skeleton */}
      <div>
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Form Actions Skeletons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-11 w-24" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
};

export default AddSaleFormSkeleton;
