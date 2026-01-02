import React from 'react';
import SidebarSkeleton from './SidebarSkeleton';
import PageContentSkeleton from './PageContentSkeleton';

const LayoutSkeleton = () => {
    return (
        <div className="flex h-screen bg-[#F5F6FA]">
            <SidebarSkeleton />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 sm:py-8 lg:py-10">
                    <PageContentSkeleton />
                </main>
            </div>
        </div>
    );
};

export default LayoutSkeleton;
