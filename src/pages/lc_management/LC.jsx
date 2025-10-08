import React from "react";
import Flex from "../../layout/Flex";
import { BiMoney, BiUser } from "react-icons/bi";
import StatBox from "../../components/common/StatBox";
import LCTable from "../../layout/LCTable";
import { lcData } from "../../data/data";
import { BookmarkCheck, BookmarkX, Gpu, MonitorDot } from "lucide-react";

const LC = () => {
  const activeLC = lcData.filter((i) => i.status == "Active");
  const processingLC = lcData.filter((i) => i.status == "Processing");
  const completedLC = lcData.filter((i) => i.status == "Completed");
  const canceledLC = lcData.filter((i) => i.status == "Canceled");
  return (
    <div className="pt-8 p-6 h-full w-full">
      <h2 className="text-3xl font-bold mb-4">LC Management</h2>
      <p className="text-gray-600 mt-1 mb-7 text-sm sm:text-base">
        Manage your steel inventory and product catalog.
      </p>
      <Flex className="!justify-between xl:flex-row flex-col gap-x-10 xl:gap-y-0 gap-y-5 xl:px-0 px-3">
        <StatBox
          title="Active LC"
          Icon={MonitorDot}
          number={activeLC.length}
          textColor="green"
        />
        <StatBox
          title="Processing LC"
          Icon={Gpu}
          number={processingLC.length}
          textColor="yellow"
        />
        <StatBox
          title="Completed LC"
          Icon={BookmarkCheck}
          number={completedLC.length}
          textColor="blue"
        />
        <StatBox
          title="Canceled LC"
          Icon={BookmarkX}
          number={canceledLC.length}
          textColor="red"
        />
      </Flex>
      <LCTable />
    </div>
  );
};

export default LC;
