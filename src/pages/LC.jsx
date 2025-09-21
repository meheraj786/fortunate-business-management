import React from "react";
import Flex from "../layout/Flex";
import { BiMoney, BiUser } from "react-icons/bi";
import StatBox from "../layout/StatBox";
import LCTable from "../layout/LCTable";
import { lcData } from "../data/data";

const LC = () => {
  const activeLC= lcData.filter((i)=>i.status=="Active")
  const processingLC= lcData.filter((i)=>i.status=="Processing")
  const completedLC= lcData.filter((i)=>i.status=="Completed")
  const canceledLC= lcData.filter((i)=>i.status=="Canceled")
  return (
    <div className="pt-8 p-6 h-full w-full">
      <h2 className="text-3xl font-semibold mb-4  ">LC Management</h2>
      <Flex className="!justify-between xl:flex-row flex-col gap-x-10 xl:gap-y-0 gap-y-5 xl:px-0 px-3">
        <StatBox title="Active LC" Icon={BiUser} number={activeLC.length} />
        <StatBox title="Processing LC" Icon={BiUser} number={processingLC.length} />
        <StatBox title="Completed LC" Icon={BiMoney} number={completedLC.length} />
        <StatBox title="Canceled LC" Icon={BiUser} number={canceledLC.length} />
      </Flex>
      <LCTable/>
    </div>
  );
};

export default LC;
