import useImageModal from "@/app/hooks/modal/useImageModal";
import { Modal, ModalBody } from "flowbite-react";
import { XIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

const ImageModal = () => {
  const { image, open, closeImage } = useImageModal();
  if (!open) return null;
  return (
    <div className="fixed top-0 inset-0 left-0 right-0 bottom-0 w-full h-full bg-black/70 flex items-center justify-center overflow-y-auto">
      <div className="w-full h-full relative">
        <Image
          fill
          className="object-contain"
          src={image as string}
          alt=""
          priority
        />
      </div>
      <div className="absolute top-2 right-5">
        <button
          onClick={closeImage}
          className="text-white cursor-pointer hover:bg-gray-500/10 p-2 rounded-full"
        >
          <XIcon className="size-10" />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
