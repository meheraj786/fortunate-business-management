import React, { useState, useEffect } from 'react';

const SidebarItemSkeleton = ({ collapsed }) => (
    <div className={`flex items-center p-3`}>
        <div className="h-[34px] w-[34px] bg-gray-300 rounded-lg animate-pulse"></div>
        {!collapsed && (
            <div className="ml-2 w-full">
                <div className="h-[18px] bg-gray-300 rounded w-4/5 animate-pulse"></div>
            </div>
        )}
    </div>
);

const SidebarSkeleton = () => {
    const [collapsed, setCollapsed] = useState(
        () => {
            try {
                return JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
            } catch {
                return false
            }
        }
    );
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                // On mobile, the sidebar is an overlay, so the skeleton should not reserve static space.
                // The collapsed state is handled differently for the actual mobile sidebar.
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // On mobile, the sidebar is an overlay triggered by a button, so we don't render a static sidebar skeleton.
    // We only render a skeleton for the trigger button.
    if (isMobile) {
        return (
            <div className="fixed top-4 right-4 z-30 p-2 rounded-lg bg-gray-300 animate-pulse h-9 w-9"></div>
        );
    }

    return (
        <div 
            className="bg-[#f8f9fa] h-screen sticky top-0 z-20 border-r border-gray-300 p-4 flex flex-col transition-all duration-300 ease-in-out"
            style={{ width: collapsed ? 80 : 256 }}
        >
            {/* Header Skeleton */}
            <div className={`flex items-center border-b border-gray-200 pb-4 mb-6 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <div className="w-full mr-2">
                        <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                        <div className="h-5 bg-gray-300 rounded w-1/2 animate-pulse mt-2"></div>
                    </div>
                )}
                <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></div>
            </div>

            {/* Menu Items Skeleton */}
            <div className="flex-grow space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SidebarItemSkeleton key={i} collapsed={collapsed} />
                ))}
            </div>

            {/* Logout Skeleton */}
            <div className="mt-auto">
                <SidebarItemSkeleton collapsed={collapsed} />
            </div>
        </div>
    );
};

export default SidebarSkeleton;
