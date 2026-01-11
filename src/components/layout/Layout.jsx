// Layout.jsx
import React, { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Outlet } from "react-router";
import PageContentSkeleton from "./PageContentSkeleton";

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F5F6FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PageContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Layout;
