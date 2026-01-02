import React from 'react';

const PageContentSkeleton = () => (
    <>
        {/* Skeleton for page header */}
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse mb-6" />

        {/* Skeleton for stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="h-[100px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-[100px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-[100px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-[100px] bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Skeleton for a table or content box */}
        <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse" />
    </>
);

export default PageContentSkeleton;