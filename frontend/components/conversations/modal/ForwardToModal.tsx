import useForwardModal from "@/app/hooks/modal/useForwardModal";
import conversationsStore from "@/app/store/conversationsStore";
import userStore from "@/app/store/userStore";
import { UserType } from "@/app/types";
import { WebSocketContext } from "@/providers/WebSocketProvider";
import { UploadImageMessage } from "@/utils/uploadImageMessage";
import { Avatar, Modal, ModalBody, ModalHeader } from "flowbite-react";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { ReadyState } from "react-use-websocket";

const ForwardToModal = () => {
  const { user } = userStore();
  const { conversations } = conversationsStore();

  const { text, isOpen, onClose, photo } = useForwardModal();
  const [isSending, setIsSending] = useState(false);
  const { sendJsonMessage, readyState } = useContext(WebSocketContext);

  const handleSend = async (conversationId: string) => {
    try {
      setIsSending(true);
      if (text) {
        sendJsonMessage?.({
          event: "chat_message",
          type: "chat_message",
          message: text,

          conversation_id: conversationId,
          created_by: user,
        });
      } else if (photo) {
        sendJsonMessage?.({
          event: "photo_message",
          type: "photo_message",
          photo_url: photo,
          conversation_id: conversationId,
        });
      }

      setIsSending(false);

      toast.success("Forwarded successfully");
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong!");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Modal show={isOpen} onClose={onClose} popup>
      <ModalHeader className="bg-white" />
      <ModalBody className="bg-white">
        <h1 className="text-xl font-bold">Forward To</h1>
        <div className="flex">
          <input
            className="p-2 w-full border border-gray-300 rounded mt-2"
            placeholder="Search...."
          />
        </div>
        <hr className="my-4 text-gray-500" />

        <div className="flex flex-col min-h-[300px] md:min-h-[200px] max-h-[300px] md:max-h-[200px] overflow-y-auto ">
          {conversations?.map((conversation) => {
            const other: UserType | undefined = conversation.members.find(
              (u) => u.id !== user?.id,
            );
            return (
              <div
                key={conversation.id}
                className={`
                   
                } flex flex-row p-2 gap-4 items-center  justify-between rounded-xl `}
              >
                <div className="flex flex-row p-2 gap-4 items-center">
                  <Avatar
                    img={other?.avatar_url ? other.avatar_url : "profile.png"}
                    bordered
                    className={`${
                      !other?.avatar_url ? "bg-white rounded-full" : ""
                    } object-cover`}
                    rounded
                  />
                  <h2 className="text-lg font-semibold">{other?.full_name}</h2>
                </div>
                <button
                  disabled={isSending}
                  className="px-6 text-sm py-2 hover:bg-blue-600 hover:text-white cursor-pointer bg-gray-100 rounded-full"
                  onClick={() => handleSend(conversation.id)}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ForwardToModal;
