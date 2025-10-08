import React from "react";
import Flex from "../../layout/Flex";

const StatBox = ({ title, number, Icon, textColor = "#202224" }) => {
  const textColorClass = (() => {
    switch (textColor) {
      case "red":
        return "text-red-500";
      case "blue":
        return "text-blue-500";
      case "green":
        return "text-green-500";
      case "yellow":
        return "text-yellow-500";
      default:
        return "text-[#202224]";
    }
  })();
  return (
    <div className="xl:flex-1 xl:w-auto w-full relative group hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-[14px] bg-white p-4">
      <Flex className="!justify-between relative z-10">
        <div>
          <h4 className="font-semibold mb-2 text-[#202224]/70">{title}</h4>
          <h3 className={`text-[28px] font-bold ${textColorClass}`}>
            {number}
          </h3>
        </div>
        {Icon && (
          <span className={`p-4 bg-primary/20 text-primary rounded-[23px]`}>
            <Icon size={24} />
          </span>
        )}
      </Flex>
      <div className="absolute bottom-0 left-0 z-0 bg-gray-200  w-0 group-hover:w-[70%] rounded-tr-full h-[70%] transition-all duration-300"></div>
    </div>
  );
};

export default StatBox;
