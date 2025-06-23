import React from "react";
import MessagesSkeleton from "./MessagesSkeleton";

//message page skeleton
const MSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 ">
      <div className="w-full h-[60px] animate-pulse lg:h-[80px] flex items-center justify-between border-b border-b-gray-200  lg:px-6">
        <div className="flex flex-row gap-4 items-center w-full relative p-2 px-4 lg:p-4 lg:px-0">
          <div className="relative h-10 w-10">
            <div className="rounded-full w-full h-full bg-gray-100"></div>
          </div>
          <div className="text-xl text-slate-700 font-semibold h-4 w-[200px] rounded-xl bg-gray-100"></div>
        </div>
      </div>
      <div className="p-2">
        <MessagesSkeleton />
      </div>
    </div>
  );
};

export default MSkeleton;
