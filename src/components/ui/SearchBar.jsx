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
      <div className="absolute inset-y-0 left-0 pl-4 sm:pl-3 flex items-center pointer-events-none z-10">
        <Search
          className="h-6 w-6 sm:h-5 sm:w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <label htmlFor="search-bar" className="sr-only">
        {placeholder || "Search"}
      </label>
      <input
        id="search-bar"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="block w-full pl-12 sm:pl-10 pr-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm transition-shadow"
      />
    </div>
  );
};

export default React.memo(SearchBar);
