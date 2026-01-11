import { RiTeamFill } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import { useLogout } from "../../api/hooks/user";
import {
  ChartColumnIncreasing,
  CreditCard,
  LogOut,
  Trash,
  WalletMinimal,
} from "lucide-react";
import ConfirmationModal from "../ui/ConfirmationModal";
import { MdInventory } from "react-icons/md";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { IoHome } from "react-icons/io5";
import { BsFillCreditCardFill } from "react-icons/bs";
import { MdPeopleAlt } from "react-icons/md";
import { RiSettings3Fill, RiMenuLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  index,
  collapsed,
}) => (
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
            active ? "text-gray-800 font-semibold" : "text-gray-500 font-normal"
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

    {collapsed && (
      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap">
        {label}
      </div>
    )}
  </motion.div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, isSuperAdmin } = useAuth();
  const logoutMutation = useLogout();

  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);
  
  const allMenuItems = [
    {
      icon: BsFillCreditCardFill,
      label: "LC management",
      path: "/lc-management",
      permission: "LC_VIEW_TABLE",
    },
    { icon: MdInventory, label: "Stock Management", path: "/stock-management", permission: "WAREHOUSE_VIEW" },
    {
      icon: ChartColumnIncreasing,
      label: "Sales",
      path: "/sales",
      permission: "SALE_VIEW_TABLE",
    },
    {
      icon: WalletMinimal,
      label: "Daily Cash",
      path: "/daily-cash-flow",
      permission: "CASH_VIEW",
    },
    {
      icon: CreditCard,
      label: "Accounts",
      path: "/accounts",
      permission: "ACCOUNT_VIEW_ALL",
    },
    { icon: RiTeamFill, label: "Team", path: "/team", permission: "USER_VIEW_ALL" },
    {
      icon: MdPeopleAlt,
      label: "Customers",
      path: "/customers",
      permission: "CUSTOMER_VIEW_TABLE",
    },
    { icon: RiSettings3Fill, label: "Settings", path: "/settings" },
  ];

  const menuItems = isSuperAdmin 
    ? allMenuItems 
    : allMenuItems.filter(item => {
        if (item.path === "/settings") {
          return true; // Settings is always shown
        }
        return item.permission ? hasPermission(item.permission) : false;
      });

  const getActive = () => {
    const path = location.pathname;
    const activeItem = menuItems.find((item) =>
      item.path === "/" ? path === "/" : path.startsWith(item.path)
    );
    return activeItem ? activeItem.label : "";
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
    if (isMobile) setMobileOpen(!mobileOpen);
    else setCollapsed(!collapsed);
  };

  const handleClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isMobile) {
    return (
      <>
        <button
          className="fixed top-4 right-4 z-30 p-3 rounded-lg bg-[#003b75] text-white shadow-md touch-manipulation"
          onClick={toggleSidebar}
        >
          <RiMenuLine size={20} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-30"
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
              className="fixed inset-y-0 left-0 w-64 bg-[#f8f9fa] z-40 shadow-lg overflow-y-auto"
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

                <div className="flex-grow space-y-2">
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
                <div className="mt-auto">
                  <SidebarItem
                    icon={LogOut}
                    label="Logout"
                    onClick={() => setIsLogoutModalOpen(true)}
                    collapsed={false}
                    index={menuItems.length}
                    active={false}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <ConfirmationModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={handleLogout}
                    title="Confirm Logout"
                    description="Are you sure you want to log out?"
                    isConfirming={logoutMutation.isPending}
                    confirmingText="Logging out..."
                    variant="primary"
                    icon={LogOut}        />
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      <motion.div
        className="bg-[#f8f9fa] h-screen sticky top-0 z-20"
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="border-r border-gray-300 h-full p-4 flex flex-col">
          <div>
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
          <div className="mt-auto">
            <SidebarItem
              icon={LogOut}
              label="Logout"
              onClick={() => setIsLogoutModalOpen(true)}
              collapsed={collapsed}
              index={menuItems.length}
              active={false}
            />
          </div>
        </div>
      </motion.div>
      <ConfirmationModal
                  isOpen={isLogoutModalOpen}
                  onClose={() => setIsLogoutModalOpen(false)}
                  onConfirm={handleLogout}
                  title="Confirm Logout"
                  description="Are you sure you want to log out?"
                  isConfirming={logoutMutation.isPending}
                  confirmingText="Logging out..."
                  variant="primary"
                  icon={LogOut}      />
    </>
  );
};

export default Sidebar;
