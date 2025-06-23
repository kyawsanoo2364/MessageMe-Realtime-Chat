"use client";
import React, { useState } from "react";
import { ConversationType } from "../conversations/Conversations";
import OnlineUsersStore from "@/app/store/onlineUsersStore";
import { Modal, ModalBody, ModalHeader, Popover } from "flowbite-react";
import toast from "react-hot-toast";
import { getAxiosInstance } from "@/axiosInstance";
import conversationsStore from "@/app/store/conversationsStore";
import { useRouter } from "next/navigation";

interface MessageHeaderProps {
  userId: string | undefined;
  conversation: ConversationType;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  userId,
  conversation,
}) => {
  const user = conversation.members.find((user) => user.id !== userId);
  const { onlineUsers } = OnlineUsersStore();
  const isOnline = onlineUsers.includes(user?.id);
  const [isDeleteModalShow, setDeleteModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { removeConversation } = conversationsStore();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const axiosInstance = await getAxiosInstance();
      const res = await axiosInstance.delete(
        `/chat/conversation/${conversation.id}/delete/`,
      );
      if (res.status === 200) {
        removeConversation(conversation.id);
        setDeleteModalShow(false);
        router.push("/");
        router.refresh();
        toast.success("Deleted conversation");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[60px] lg:h-[80px] flex items-center justify-between border-b border-b-gray-200  lg:px-6">
      <div className="flex flex-row gap-4 items-center w-full relative p-2 px-4 lg:p-4 lg:px-0">
        <div className="relative h-10 w-10">
          <img
            className="size-full object-cover rounded-full"
            src={user?.avatar_url ? user?.avatar_url : "profile.png"}
            alt="p"
          />
          {isOnline && (
            <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
          )}
        </div>
        <h2 className="text-xl text-slate-700 font-semibold">
          {user?.full_name}
        </h2>
      </div>
      <Popover
        trigger="click"
        content={
          <div className="bg-white">
            <button
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => setDeleteModalShow(true)}
            >
              Delete Chat
            </button>
          </div>
        }
      >
        <div className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </div>
      </Popover>

      <Modal popup show={isDeleteModalShow}>
        <ModalBody className="bg-white p-4">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-xl font-medium">Delete Chat</h2>
            <button
              disabled={isLoading}
              className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
              onClick={() => setDeleteModalShow(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-sm text-slate-600">
              Do you want to delete all conversation with this user?
            </h3>
            <div className="flex items-center justify-end">
              <div className="flex flex-row items-center gap-4">
                <button
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setDeleteModalShow(false)}
                >
                  Cancel
                </button>
                <button
                  className="disabled:opacity-80 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MessageHeader;
