import { MdInventory } from "react-icons/md";
// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { IoHome } from "react-icons/io5";
import { BsFillCreditCardFill } from "react-icons/bs";
import { MdPeopleAlt } from "react-icons/md";
import { RiSettings3Fill, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";
import { FaSalesforce } from "react-icons/fa";
import { ChartColumnIncreasing, CreditCard, WalletMinimal } from "lucide-react";

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  index,
  collapsed,
}) => {
  return (
    <motion.div
      className={`flex items-center p-3 rounded-lg cursor-pointer group relative ${
        collapsed ? "justify-center" : "justify-start"
      }`}
      onClick={onClick}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ x: collapsed ? 0 : 5 }}
    >
      <div
        className={`p-2 rounded-lg shadow-md transition-colors duration-200 ${
          active ? "bg-[#003b75] text-white" : "bg-white text-[#003b75]"
        }`}
      >
        <Icon size={18} />
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            className={`ml-2 transition-colors duration-200 whitespace-nowrap ${
              active
                ? "text-gray-800 font-semibold"
                : "text-gray-500 font-normal"
            }`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </motion.div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Add routing here,
  // New page routing should be added in the menuItems array below

  const menuItems = [
    { icon: IoHome, label: "Dashboard", path: "/" },
    {
      icon: BsFillCreditCardFill,
      label: "LC management",
      path: "/lc-management",
    },
    { icon: MdInventory, label: "Stock Management", path: "/stock-management" },
    { icon: ChartColumnIncreasing, label: "Sales", path: "/sales" },
    { icon: WalletMinimal, label: "Accounts", path: "/accounts" },
    { icon: CreditCard, label: "Banking", path: "/banking" },
    { icon: MdPeopleAlt, label: "Team", path: "/team" },
    { icon: MdPeopleAlt, label: "Customers", path: "/customers" },
    { icon: RiSettings3Fill, label: "Settings", path: "/settings" },
  ];

  const getActive = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.includes("/lc-management")) return "LC management";
    if (path.includes("/customers")) return "Customers";
    if (path.includes("/sales")) return "Sales";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/stock-management")) return "Stock Management";
    if (path.includes("/team")) return "Team";
    if (path.includes("/accounts")) return "Accounts";
    if (path.includes("/banking")) return "Banking";
    return "";
  };

  useEffect(() => {
    const resizeHandler = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };

    window.addEventListener("resize", resizeHandler);
    resizeHandler();
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <button
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-[#003b75] text-white shadow-md"
          onClick={toggleSidebar}
        >
          <RiMenuLine size={20} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-y-0 left-0 w-64 bg-[#f8f9fa] z-50 shadow-lg overflow-y-auto"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                  <div className="font-inter text-lg font-bold">
                    BUSINESS MANAGEMENT <br /> SYSTEM
                  </div>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item, i) => (
                    <SidebarItem
                      key={i}
                      icon={item.icon}
                      label={item.label}
                      active={getActive() === item.label}
                      onClick={() => handleClick(item.path)}
                      index={i}
                      collapsed={false}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div
      className="bg-[#f8f9fa] h-screen sticky top-0 z-30"
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="border-r border-gray-300 h-full p-4 flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center border-b border-gray-200 pb-4 mb-6 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="font-inter text-lg font-bold"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                BUSINESS MANAGEMENT <br /> SYSTEM
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
          >
            <RiMenuLine size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <SidebarItem
              key={i}
              icon={item.icon}
              label={item.label}
              active={getActive() === item.label}
              onClick={() => handleClick(item.path)}
              index={i}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
