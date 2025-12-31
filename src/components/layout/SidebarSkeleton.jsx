import React from 'react';
import Skeleton from 'react-loading-skeleton';

const SidebarItemSkeleton = () => (
    <div className="flex items-center p-3">
        <Skeleton circle height={34} width={34} />
        <div className="ml-2 w-full">
            <Skeleton height={18} width="80%" />
        </div>
    </div>
);

const SidebarSkeleton = () => {
    return (
        <div className="w-64 bg-[#f8f9fa] h-screen sticky top-0 z-20 border-r border-gray-200 p-4 flex flex-col">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div className="w-full">
                    <Skeleton height={20} width="70%" />
                    <Skeleton height={20} width="50%" className="mt-2" />
                </div>
                <Skeleton circle height={24} width={24} />
            </div>

            {/* Menu Items Skeleton */}
            <div className="flex-grow space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SidebarItemSkeleton key={i} />
                ))}
            </div>

            {/* Logout Skeleton */}
            <div className="mt-auto">
                <SidebarItemSkeleton />
            </div>
        </div>
    );
};

export default SidebarSkeleton;
