import React, { useState, useEffect, useContext } from "react";
import Flex from "../../layout/Flex";
import StatBox from "../../components/common/StatBox";
import LCTable from "../../layout/LCTable";
import { BookmarkCheck, BookmarkX, Gpu, MonitorDot } from "lucide-react";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";

const LC = () => {
  const [lcData, setLcData] = useState([]);
  const { baseUrl } = useContext(UrlContext);

  useEffect(() => {
    axios.get(`${baseUrl}lc/get-all-lc`).then((res) => {
      if (Array.isArray(res.data.data)) {
        setLcData(res.data.data);
      } else {
        setLcData([]);
      }
    });
  }, [baseUrl]);

  const activeLC = lcData.filter((i) => i.basicInfo?.status === "Active");
  const processingLC = lcData.filter((i) => i.basicInfo?.status === "Draft");
  const completedLC = lcData.filter(
    (i) => i.basicInfo?.status === "Completed"
  );
  const canceledLC = lcData.filter((i) => i.basicInfo?.status === "Canceled");

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
          title="Completed LC"
          Icon={BookmarkCheck}
          number={completedLC.length}
          textColor="blue"
        />
        <StatBox
          title="Draft LC"
          Icon={Gpu}
          number={processingLC.length}
          textColor="yellow"
        />
        <StatBox
          title="Canceled LC"
          Icon={BookmarkX}
          number={canceledLC.length}
          textColor="red"
        />
      </Flex>
      <LCTable lcData={lcData} />
    </div>
  );
};

export default LC;
