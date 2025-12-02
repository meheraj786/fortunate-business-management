// Layout.jsx
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[#F5F6FA] px-2 overflow-x-auto">

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
