import React from "react";

const Button = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-10 py-4 text-white bg-primary hover:bg-primary-hover transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
