import React from "react";
import Flex from "./Flex";

const StatBox = ({ title, number, Icon }) => {
  return (
    <div className="xl:flex-1 xl:w-auto w-full relative group hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-[14px] bg-white p-4">
      <Flex className="!justify-between relative z-10">
        <div>
          <h4 className="font-semibold mb-2 text-[#202224]/70">{title}</h4>
          <h3 className="text-[28px] font-bold text-[#202224]">{number}</h3>
        </div>
        <span className={`p-4 bg-primary/20 text-primary rounded-[23px]`}>
          <Icon size={24} />
        </span>
      </Flex>
      <div className="absolute bottom-0 left-0 z-0 bg-gray-200  w-0 group-hover:w-[70%] rounded-tr-full h-[70%] transition-all duration-300"></div>
    </div>
  );
};

export default StatBox;
