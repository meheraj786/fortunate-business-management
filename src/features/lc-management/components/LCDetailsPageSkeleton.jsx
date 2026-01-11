import React from 'react';
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import { FileText, DollarSign, Package, Truck, User, Clipboard, PieChart, CreditCard } from "lucide-react";

const InputFieldSkeleton = () => (
    <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
);

const DataFieldSkeleton = () => (
    <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </div>
);

const CostFieldSkeleton = () => (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const LCDetailsPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-4 sm:mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex-shrink-0 mr-3 sm:mr-4"></div>
            <div className="min-w-0">
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic LC Information Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<FileText className="text-gray-400" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <DataFieldSkeleton key={i} />
              ))}
            </div>
          </CollapsibleCard>

          {/* Financial Information Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<DollarSign className="text-gray-400" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <DataFieldSkeleton key={i} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                        <CostFieldSkeleton key={i} />
                    ))}
                </div>
            </div>
          </CollapsibleCard>

          {/* Product Information Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<Package className="text-gray-400" />}
            defaultOpen={true}
          >
            {[...Array(2)].map((_, productIndex) => (
                <div key={productIndex} className="pb-4 mb-4 last:pb-0 last:mb-0 border-b last:border-b-0 border-gray-200 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <DataFieldSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ))}
            <div className="mt-4 bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CollapsibleCard>

          {/* Shipping & Customs Info Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<Truck className="text-gray-400" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <DataFieldSkeleton key={i} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...Array(2)].map((_, i) => (
                        <CostFieldSkeleton key={i} />
                    ))}
                </div>
            </div>
          </CollapsibleCard>

          {/* Agent & Transport Info Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<User className="text-gray-400" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(2)].map((_, i) => (
                    <CostFieldSkeleton key={i} />
                ))}
            </div>
          </CollapsibleCard>

          {/* Other Expenses Skeleton */}
          <CollapsibleCard
            title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            icon={<DollarSign className="text-gray-400" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(2)].map((_, i) => (
                    <CostFieldSkeleton key={i} />
                ))}
            </div>
          </CollapsibleCard>
        </div>

        <div className="space-y-4 sm:space-y-6">
            {/* Cost Summary Skeleton */}
            <CollapsibleCard
                title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
                icon={<PieChart className="text-gray-400" />}
                defaultOpen={true}
            >
                <div className="space-y-3">
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200 animate-pulse">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </CollapsibleCard>

            {/* Documents & Notes Skeleton */}
            <CollapsibleCard
                title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
                icon={<Clipboard className="text-gray-400" />}
                defaultOpen={true}
            >
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="space-y-2">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </CollapsibleCard>

            {/* Payment History Skeleton */}
            <CollapsibleCard
                title={<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
                icon={<CreditCard className="text-gray-400" />}
                defaultOpen={true}
            >
                <div className="space-y-3">
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </CollapsibleCard>
        </div>
      </div>
    </div>
  );
};

export default LCDetailsPageSkeleton;
