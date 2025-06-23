import { Spinner } from "flowbite-react";
import React from "react";

const HomeLoading = () => {
  return (
    <div className="min-h-screen min-w-screen w-full h-full flex  items-center justify-center">
      <div className="flex  items-center flex-col gap-6">
        <h1 className="font-bold md:text-6xl text-4xl bg-gradient-to-r from-blue-800 to-pink-400 bg-clip-text text-transparent">
          MessageME
        </h1>
        <Spinner color="pink" />
      </div>
    </div>
  );
};

export default HomeLoading;
