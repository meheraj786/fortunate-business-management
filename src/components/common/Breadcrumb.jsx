import React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center flex-wrap text-sm text-gray-500 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={16} className="mx-2" />}
          <div className="mb-1">
            {item.path ? (
              <Link to={item.path} className="hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-700">{item.label}</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
