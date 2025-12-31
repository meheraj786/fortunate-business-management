import React from 'react';
import Skeleton from 'react-loading-skeleton';
import SidebarSkeleton from './SidebarSkeleton';

const LayoutSkeleton = () => {
    return (
        <div className="flex h-screen bg-[#F5F6FA]">
            <SidebarSkeleton />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 sm:py-8 lg:py-10">
                    {/* Skeleton for page header */}
                    <Skeleton height={40} width={300} className="mb-6" />

                    {/* Skeleton for stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height={100} borderRadius="0.75rem" />
                        ))}
                    </div>

                    {/* Skeleton for a table or content box */}
                    <Skeleton height={400} borderRadius="0.75rem" />
                </main>
            </div>
        </div>
    );
};

export default LayoutSkeleton;
