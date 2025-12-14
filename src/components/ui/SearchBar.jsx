import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch, placeholder }) => {
  return (
    <div className="relative w-full mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
      />
    </div>
  );
};

export default SearchBar;
