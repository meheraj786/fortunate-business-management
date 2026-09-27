// Layout.jsx
import React, { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Outlet } from "react-router";
import PageContentSkeleton from "./PageContentSkeleton";

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F5F6FA] print:h-auto print:bg-white print:block">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto print:overflow-visible print:block print:h-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:block">
          <Suspense fallback={<PageContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Layout;
