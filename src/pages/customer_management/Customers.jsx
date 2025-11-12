import React from "react";
// import { customers } from "../../data/data";
import CustomerCard from "../../layout/CustomerCard";
import Input from "../../layout/Input";
import { Filter, Plus, Search } from "lucide-react";
import { Link } from "react-router";
import Button from "../../components/common/Button";
import Flex from "../../layout/Flex";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { UrlContext } from "../../context/UrlContext";

const Customers = () => {
  const { baseUrl } = useContext(UrlContext);
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    axios
      .get(`${baseUrl}customer/summary`)
      .then((res) => setCustomers(res?.data?.data));
  }, []);
  return (
    <div className="pt-8 p-6 h-full w-full">
      <Toaster position="top-right" />
      <div className=" items-center flex-wrap flex justify-between">
        <h2 className="text-3xl font-semibold mb-4">Your Customers</h2>
        <Link to="/customer-form">
          <button className="flex rounded-xl gap-x-2 px-4 py-3 cursor-pointer hover:bg-primary-hover transition-colors duration-300 bg-primary text-white text-[16px] items-center  xl:ms-auto mx-auto xl:mx-0">
            {" "}
            <Plus size={22} /> Add Customer
          </button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors justify-center">
          <Filter size={20} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>
      <div className="grid grid-cols-1 mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {customers.map((customer) => (
          <CustomerCard key={customer._id} customer={customer} />
        ))}
      </div>
    </div>
  );
};

export default Customers;
