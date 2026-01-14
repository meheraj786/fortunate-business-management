import React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="flex items-center text-sm text-gray-600 mb-4 sm:mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1 sm:gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                size={16}
                className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            {item.path ? (
              <Link
                to={item.path}
                className="hover:text-[var(--color-primary)] transition-colors truncate max-w-[120px] sm:max-w-none" // Changed hover color
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
