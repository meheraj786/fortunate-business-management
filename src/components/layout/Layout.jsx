// Layout.jsx
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F5F6FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 sm:py-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
