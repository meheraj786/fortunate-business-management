import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch, placeholder, debounceDelay = 300 }) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [value, debounceDelay, onSearch]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base transition-shadow"
        aria-label={placeholder || "Search"}
      />
    </div>
  );
};

export default SearchBar;
