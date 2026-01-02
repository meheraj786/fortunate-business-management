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
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 sm:py-8 lg:py-10">
          <Suspense fallback={<PageContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Layout;
