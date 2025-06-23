"use client";

import useNewConversationModal from "@/app/hooks/modal/useNewConversationModal";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import ChatUserItem from "./ChatUserItem";
import { getAxiosInstance } from "@/axiosInstance";
import { UserType } from "@/app/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ConversationType } from "../Conversations";
import conversationsStore from "@/app/store/conversationsStore";
import { WebSocketContext } from "@/providers/WebSocketProvider";

const NewConversationModal = () => {
  const { isShow, onClose } = useNewConversationModal();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType>();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { addConversation } = conversationsStore();
  const { sendJsonMessage } = useContext(WebSocketContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (query && query.length > 4) {
          const axiosInstance = await getAxiosInstance();
          const res = await axiosInstance.get(`/auth/users/?query=${query}`);
          setUsers(res.data);
        } else if (!query) {
          setUsers([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [query]);

  const createConversation = async () => {
    try {
      if (selectedUser) {
        setIsCreating(true);
        const axiosInstance = await getAxiosInstance();
        const bodyData = {
          receiver_userId: selectedUser?.id,
        };
        const res = await axiosInstance.post(
          "/chat/conversation/create/",
          bodyData,
        );

        if (res.status === 201) {
          const conversationData = res.data;
          onClose();
          setIsCreating(false);
          sendJsonMessage?.({
            type: "join_conversation",
            conversation_id: conversationData.id,
          });
          addConversation(conversationData);
          router.push(`/?conversation=${conversationData.id}`);
        } else if (res.status === 200) {
          const conversationData = res.data;
          onClose();
          setIsCreating(false);
          router.push(`/?conversation=${conversationData.id}`);
        }
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.log(error);
      setIsCreating(false);
    }
  };

  return (
    <Modal show={isShow} popup className="bg-black  " onClose={onClose}>
      <ModalHeader className="bg-white " />
      <ModalBody className="bg-white">
        <h2 className="text-xl">New Conversation</h2>
        <div className="flex">
          <input
            className="p-2 w-full border border-gray-300 rounded mt-2"
            placeholder="Search Contact (name or email address) ...."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <hr className="my-4 text-gray-500" />
        {users.length <= 0 ? (
          <div className="flex gap-4 flex-col h-[300px] md:h-[200px] items-center justify-center ">
            <div className="text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-10"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>
            <span className="text-slate-500">No Contacts</span>
          </div>
        ) : (
          <div className="flex flex-col min-h-[300px] md:min-h-[200px] max-h-[300px] md:max-h-[200px] overflow-y-auto ">
            {users.map((user) => {
              return (
                <ChatUserItem
                  selected={user.id == selectedUser?.id}
                  key={user.id}
                  user={user}
                  onClick={() => setSelectedUser(user)}
                />
              );
            })}
          </div>
        )}
      </ModalBody>
      <ModalFooter className="bg-white flex items-center justify-between md:justify-end gap-4">
        <Button
          disabled={selectedUser && !isCreating ? false : true}
          className="cursor-pointer"
          onClick={createConversation}
        >
          {isCreating ? "Creating..." : "Create"}
        </Button>
        <Button
          outline
          color={"dark"}
          onClick={onClose}
          className="cursor-pointer !text-slate-800 hover:!text-white"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default NewConversationModal;
