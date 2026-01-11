import React from 'react';
import SidebarSkeleton from './SidebarSkeleton';
import PageContentSkeleton from './PageContentSkeleton';

const LayoutSkeleton = () => {
    return (
        <div className="flex h-screen bg-[#F5F6FA]">
            <SidebarSkeleton />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <PageContentSkeleton />
                </main>
            </div>
        </div>
    );
};

export default LayoutSkeleton;
