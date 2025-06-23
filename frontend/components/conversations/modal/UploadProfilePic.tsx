import useUploadProfilePicModal from "@/app/hooks/modal/useUploadProfilePicModal";
import userStore from "@/app/store/userStore";
import { getAxiosInstance } from "@/axiosInstance";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const UploadProfilePic = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<File>();
  const { isOpen, onClose, avatar } = useUploadProfilePicModal();
  const { fetch } = userStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFile(file);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleUploadPhoto = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);
        const axiosInstance = await getAxiosInstance();
        const res = await axiosInstance.patch(`/auth/user/avatar/`, formData);
        if (res.data.success) {
          toast.success("Uploaded avatar successfully!");
          fetch();
          onClose();
        } else {
          toast.error(res.data.error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} popup className="bg-black  ">
      <ModalHeader className="bg-white " />
      <ModalBody className="bg-white">
        <h2 className="text-xl font-medium ">Edit Profile Photo</h2>
        <div className="flex items-center justify-center flex-col">
          <div className="w-60 h-60 relative cursor-pointer">
            <Image
              src={
                previewImage ? previewImage : avatar ? avatar : "/profile.png"
              }
              className="rounded-full object-cover border border-gray-200"
              alt="profile"
              fill
            />
            <div className="absolute top-0 right-0 left-0 bottom-0">
              <div className="w-full h-full flex items-center justify-center  hover:bg-gray-100 opacity-0 hover:opacity-70 rounded-full cursor-pointer">
                <button
                  className="px-4 py-2 cursor-pointer font-medium"
                  onClick={() => fileRef?.current?.click()}
                >
                  Choose
                </button>
              </div>
            </div>
          </div>
          <input
            hidden
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleInputChange}
          />
        </div>
      </ModalBody>
      <ModalFooter className="bg-white ">
        <Button
          disabled={file ? false : true}
          className="cursor-pointer w-full py-6"
          onClick={handleUploadPhoto}
        >
          Upload
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadProfilePic;
