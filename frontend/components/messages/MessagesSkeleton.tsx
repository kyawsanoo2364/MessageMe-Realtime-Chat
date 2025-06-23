import React from "react";

const MessagesSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...new Array(2)].map((_, i: number) => (
        <div key={`message_${i}`} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="size-10 rounded-full bg-gray-100"></div>
            <div className="flex flex-col gap-2">
              <div className="w-32 rounded-full h-[10px] bg-gray-100"></div>
              <div className="w-[300px] h-[50px] bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2 justify-end items-start">
            <div className="flex flex-col gap-2">
              <div className="w-32 rounded-full h-[10px] self-end bg-gray-100"></div>
              <div className="w-[300px] h-[50px] bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesSkeleton;
