"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import { ConversationType, MessageType } from "../conversations/Conversations";

import { UserType } from "@/app/types";
import { WebSocketContext } from "@/providers/WebSocketProvider";

import useForwardModal from "@/app/hooks/modal/useForwardModal";
import editMessageStore from "@/app/store/editMessageStore";
import replyMessageStore from "@/app/store/replyMessageStore";
import toast from "react-hot-toast";
import MessagesSkeleton from "./MessagesSkeleton";
import { ImageUp } from "lucide-react";
import PreviewImage from "./PreviewImage";
import { UploadImageMessage } from "@/utils/uploadImageMessage";
import { useSearchParams } from "next/navigation";

interface MessageBodyProps {
  user: UserType | undefined;
  conversation: ConversationType;
  token: string | undefined;
  isMessagesLoading: boolean;
}

const MessageBody: React.FC<MessageBodyProps> = ({
  user,
  conversation,
  isMessagesLoading,
}) => {
  const [realTimeMessages, setRealTimeMessages] = useState<MessageType[]>(
    conversation.messages,
  );
  const { replyTo, isReply, closeReply } = replyMessageStore();
  const { message, closeEdit, isEdit } = editMessageStore();
  const [typing, setTyping] = useState("");
  const { isOpen } = useForwardModal();
  const otherUserId = conversation.members.find((u) => u.id !== user.id)?.id;
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useContext(WebSocketContext);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sendPreviewImage, setSendPreviewImage] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const conversationId = useSearchParams().get("conversation");

  useEffect(() => {
    setRealTimeMessages(conversation.messages);
  }, [conversation]);

  useEffect(() => {
    if (isEdit) {
      setBody(message?.body as string);
    }
  }, [message, isEdit]);

  useEffect(() => {
    if (!isOpen) {
      scrollDown();
    }
  }, [conversation.id, isOpen]);

  const [body, setBody] = useState("");
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollDown();
  }, []);

  const scrollDown = () => {
    setTimeout(() => {
      if (divRef.current) {
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    }, 500);
  };

  useEffect(() => {}, [readyState]);

  useEffect(() => {
    if (!lastJsonMessage) return;
    if (lastJsonMessage && lastJsonMessage.type == "chat_message") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        const data: MessageType = {
          id: lastJsonMessage.message_id,
          body: lastJsonMessage.message,
          created_by: lastJsonMessage.created_by,
          created_at: new Date(Date.now()).toString(),
          modified_at: new Date(Date.now()).toString(),
          seen_by: [],
        };
        setRealTimeMessages([...realTimeMessages, data]);
        scrollDown();
      }
      // else {
      //   toast.custom(
      //     (t) => (
      //       <div
      //         className={`${
      //           t.visible ? "animate-enter" : "animate-leave"
      //         } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      //       >
      //         <div className="flex-1 w-0 p-4">
      //           <div className="flex items-start">
      //             <div className="flex-shrink-0 pt-0.5">
      //               <img
      //                 className="h-10 w-10 rounded-full object-cover"
      //                 src={
      //                   lastJsonMessage.created_by.avatar_url
      //                     ? lastJsonMessage.created_by.avatar_url
      //                     : "profile.png"
      //                 }
      //                 alt=""
      //               />
      //             </div>
      //             <div className="ml-3 flex-1">
      //               <p className="text-sm font-medium text-gray-900">
      //                 {lastJsonMessage.created_by.full_name}
      //               </p>
      //               <p className="mt-1 text-sm text-gray-500">
      //                 {lastJsonMessage.message}
      //               </p>
      //             </div>
      //           </div>
      //         </div>
      //         <div className="flex border-l border-gray-200">
      //           <button
      //             onClick={() => toast.dismiss(t.id)}
      //             className="cursor-pointer w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      //           >
      //             Close
      //           </button>
      //         </div>
      //       </div>
      //     ),
      //     { position: "top-right" },
      //   );
      // }
    } else if (lastJsonMessage?.type === "message_edited") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        const data: MessageType = {
          id: lastJsonMessage.message_id,
          body: lastJsonMessage.new_message,
          created_by: lastJsonMessage.created_by,
          created_at: new Date(Date.now()).toString(),
          modified_at: new Date(Date.now()).toString(),
        };
        setRealTimeMessages(
          realTimeMessages.map((m) => {
            if (m.id == data.id) {
              return data;
            }
            return m;
          }),
        );
      }
    } else if (lastJsonMessage?.type === "delete_message") {
      setRealTimeMessages(
        realTimeMessages.filter((m) => m.id !== lastJsonMessage.message_id),
      );
    } else if (lastJsonMessage && lastJsonMessage.type == "reply_message") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        const data: MessageType = {
          id: lastJsonMessage.message_id,
          body: lastJsonMessage.message,
          created_by: lastJsonMessage.created_by,
          created_at: new Date(Date.now()).toString(),
          modified_at: new Date(Date.now()).toString(),
          seen_by: [],
          reply_to: lastJsonMessage.reply_to,
        };
        setRealTimeMessages([...realTimeMessages, data]);
        scrollDown();
      }
    } else if (lastJsonMessage && lastJsonMessage.type == "typing") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        if (lastJsonMessage.user && lastJsonMessage.user !== user?.email) {
          setTyping(`typing...`);
          scrollDown();
        } else if (!lastJsonMessage.user) {
          setTyping("");
        }
      }
    } else if (lastJsonMessage && lastJsonMessage.type == "seen_message") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        const messages = realTimeMessages.map((m) => {
          if (
            m.created_by.id === user.id &&
            !m.seen_by.includes(lastJsonMessage.user_id)
          ) {
            m.seen_by.push(lastJsonMessage.user_id);
          }
          return m;
        });
        setRealTimeMessages(messages);
      }
    } else if (lastJsonMessage && lastJsonMessage.type === "reaction_added") {
      if (lastJsonMessage.conversation_id == conversation.id) {
        const messages = realTimeMessages.map((m) => {
          if (m.id == lastJsonMessage.message_id) {
            m.reactions.push(lastJsonMessage.reaction);
          }
          return m;
        });
        setRealTimeMessages(messages);
      }
    } else if (lastJsonMessage && lastJsonMessage.type === "reaction_removed") {
      if (lastJsonMessage.conversation_id == conversation.id) {
        const messages = realTimeMessages.map((m) => {
          if (m.id === lastJsonMessage.message_id) {
            m.reactions = m.reactions.filter(
              (r) => r.react_by.id !== lastJsonMessage.react_by_user_id,
            );
          }
          return m;
        });
        setRealTimeMessages(messages);
      }
    } else if (lastJsonMessage && lastJsonMessage.type === "chat_photo") {
      if (lastJsonMessage.conversation_id === conversation.id) {
        setRealTimeMessages([...realTimeMessages, lastJsonMessage.message]);
        scrollDown();
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (!realTimeMessages || !user || !conversation) return;

    const messageIds = realTimeMessages
      .filter(
        (m) =>
          m.created_by.id !== user.id &&
          !m.seen_by?.includes(user.id) &&
          !seenMessageIdsRef.current.has(m.id),
      )
      .map((m) => m.id);

    if (messageIds && messageIds.length > 0) {
      sendJsonMessage?.({
        type: "seen_message",
        messageIds,
        conversation_id: conversation.id,
      });

      messageIds.map((id) => seenMessageIdsRef.current.add(id));
    }
  }, [realTimeMessages, user, sendJsonMessage, conversation]);

  const onChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!body) return;
      if (isReply) {
        sendJsonMessage?.({
          event: "reply_message",
          type: "reply_message",
          message: body,
          conversation_id: conversation.id,
          created_by: user,
          reply_to: replyTo?.id.toString(),
          photo_url: replyTo?.photo_url,
          receiver_user_id: otherUserId,
        });
        setBody("");
        closeReply();
      } else if (!isEdit) {
        sendJsonMessage?.({
          event: "chat_message",
          type: "chat_message",
          message: body,
          conversation_id: conversation.id,
          created_by: user,
          receiver_user_id: otherUserId,
        });
        setBody("");
        scrollDown();
      } else {
        sendJsonMessage?.({
          type: "edited_message",
          message_id: message?.id,
          new_message: body,
          conversation_id: conversation.id,
          created_by: message?.created_by,
          receiver_user_id: otherUserId,
        });
        setBody("");
        closeEdit();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (body) {
      sendJsonMessage?.({
        type: "typing",
        user: user?.email,
        conversation_id: conversation.id,
        receiver_user_id: otherUserId,
      });
    } else {
      sendJsonMessage?.({
        type: "typing",
        user: "",
        conversation_id: conversation.id,
        receiver_user_id: otherUserId,
      });
    }
  }, [body]);

  const handleChangeImageInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No uploaded File!");
      return;
    }
    const url = URL.createObjectURL(file);
    setSendPreviewImage(url);
    scrollDown();
    try {
      await UploadImageMessage(file, conversationId as string, setPercent);
      setSendPreviewImage("");
    } catch (error) {
      toast.error("something went wrong.");
      console.log(error);
    }
  };

  return (
    <div className="lg:p-6 flex flex-col gap-4 w-full bg-gray-50">
      <div
        className={`w-full flex flex-col gap-6 lg:gap-2 px-4 translation  ${
          isEdit || isReply
            ? "min-h-[60vh] max-h-[60vh] lg:min-h-[58vh] lg:max-h-[58vh]"
            : "lg:min-h-[70vh] lg:max-h-[70vh] min-h-[74vh] max-h-[74vh]"
        }    overflow-y-auto`}
        ref={divRef}
      >
        {isMessagesLoading ? (
          <MessagesSkeleton />
        ) : realTimeMessages.length > 0 ? (
          realTimeMessages?.map((message) => (
            <MessageItem
              openPopoverId={openPopoverId}
              setOpenPopoverId={setOpenPopoverId}
              conversation_id={conversation.id}
              key={message.id}
              message={message}
              isOwner={user?.id === message.created_by.id}
            />
          ))
        ) : (
          <div className="flex flex-col w-full h-full items-center justify-center lg:min-h-[450px] min-h-[390px] max-h-[390px] lg:max-h-[450px]">
            <div className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-16 md:size-24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-3xl font-semibold text-slate-400">
              Start Messaging...
            </h3>
          </div>
        )}
        <div className="text-green-400 italic ">{typing}</div>
        {sendPreviewImage && (
          <PreviewImage percent={percent} img={sendPreviewImage} />
        )}
      </div>
      <div>
        <form onSubmit={onSubmit}>
          <label className="sr-only">Your message</label>
          {isEdit && (
            <div className="w-full py-4 border-t px-4 border-b-0 border-gray-200 flex items-center gap-4 text-blue-500 relative">
              <div>
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </div>
              <span>Edit Message</span>
              <div
                className="absolute right-2 top-2 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => {
                  closeEdit();

                  setBody("");
                }}
              >
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          )}
          {isReply && (
            <div className="w-full py-4 border-t px-4 border-b-0 border-gray-200 flex flex-col gap-2 text-slate-500 relative">
              <div className="flex flex-row gap-4">
                <div>
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
                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                    />
                  </svg>
                </div>
                <span>Reply</span>
              </div>
              <div className="text-sm italic line-clamp-1 max-w-[100px] truncate">
                {replyTo?.body}
              </div>
              <div
                className="absolute right-2 top-2 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => {
                  closeReply();
                }}
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
              </div>
            </div>
          )}
          <div className="flex items-center px-3  rounded-lg bg-gray-50 ">
            <button
              className="text-gray-500 cursor-pointer hover:bg-gray-200 p-2 rounded-full"
              onClick={() => imageInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                ref={imageInputRef}
                onChange={handleChangeImageInput}
              />
              <ImageUp />
            </button>
            <textarea
              id="chat"
              rows={1}
              name="body"
              value={body}
              onChange={onChange}
              className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500   dark:focus:ring-blue-500 "
              placeholder="Your message..."
            ></textarea>
            <button
              type="submit"
              className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 "
            >
              <svg
                className="w-5 h-5 rotate-90 rtl:-rotate-90"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
              </svg>
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageBody;
