// Layout.jsx
import React from "react";
import Sidebar from "../sidebar/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-[#F5F6FA] p-6">{children}</div>
    </div>
  );
};

export default Layout;
