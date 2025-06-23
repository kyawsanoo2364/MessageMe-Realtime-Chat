import { Spinner } from "flowbite-react";
import Image from "next/image";
import React from "react";

interface PreviewImageProps {
  img: string;
  percent: number;
}

const PreviewImage: React.FC<PreviewImageProps> = ({ img, percent }) => {
  return (
    <div className="flex relative w-[320px] h-[400px]  bg-blue-500 p-1 rounded-xl self-end">
      <Image
        alt="preview-image"
        height={300}
        width={300}
        className="w-full h-full object-cover rounded-xl"
        src={img}
      />
      <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-gray-100/50 w-full h-full">
        <div className="bg-black/20 rounded-full p-2 relative">
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
            <span className="text-sm text-gray-200">{percent}%</span>
          </div>
          <Spinner />
        </div>
      </div>
    </div>
  );
};

export default PreviewImage;
