"use client";

import { Popover, popoverTheme } from "flowbite-react";
import React, {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MessageType } from "../conversations/Conversations";
import { format } from "date-fns";
import useForwardModal from "@/app/hooks/modal/useForwardModal";
import toast from "react-hot-toast";
import editMessageStore from "@/app/store/editMessageStore";
import { WebSocketContext } from "@/providers/WebSocketProvider";
import replyMessageStore from "@/app/store/replyMessageStore";
import { Check, CheckCheck } from "lucide-react";
import { debounce } from "lodash";
import ReactedMessage from "./ReactedMessage";
import userStore from "@/app/store/userStore";
import Image from "next/image";
import useImageModal from "@/app/hooks/modal/useImageModal";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface MessageItemProps {
  isOwner?: boolean;
  message: MessageType;
  conversation_id: string;
  openPopoverId: string | null;
  setOpenPopoverId: React.Dispatch<React.SetStateAction<string | null>>;
}

const MessageItem: React.FC<MessageItemProps> = ({
  isOwner,
  message,
  conversation_id,
  openPopoverId,
  setOpenPopoverId,
}) => {
  const { setOpen } = useForwardModal();
  const { setEdit } = editMessageStore();
  const { sendJsonMessage, lastJsonMessage } = useContext(WebSocketContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setReply } = replyMessageStore();
  const { openImage } = useImageModal();
  const { user } = userStore();

  const handleDelete = () => {
    setOpenPopoverId(null);
    setIsDeleting(true);
    sendJsonMessage?.({
      type: "delete_message",
      message_id: message.id,
      conversation_id: conversation_id,
    });
  };

  const handleClickReaction = useMemo(
    () =>
      debounce((emoji: string) => {
        setOpenPopoverId(null);
        sendJsonMessage?.({
          type: "react_message",
          message_id: message.id,
          conversation_id: conversation_id,
          react: emoji,
        });
      }, 300),
    [sendJsonMessage, message.id, conversation_id],
  );

  return (
    <div
      className={`flex  items-start group
        gap-2.5 relative ${isOwner && "flex-row-reverse"}`}
    >
      {!isOwner && (
        <img
          className="w-8 h-8 object-cover rounded-full"
          src={
            message.created_by.avatar_url
              ? message.created_by.avatar_url
              : "profile.png"
          }
          alt={message.created_by.full_name}
        />
      )}
      <div className="flex flex-col gap-1 w-full max-w-[320px]">
        {!isOwner && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 ">
              {message.created_by.full_name}
            </span>
            <span className="text-sm font-normal text-gray-500 ">
              {format(new Date(message.modified_at), "hh:mm a")}
            </span>
          </div>
        )}
        {message.reply_to && message.reply_to.body && (
          <div className="flex flex-col leading-1.5 p-4 border-gray-200 rounded-t-xl bg-gray-100">
            <p className="select-none text-slate-400 text-sm italic line-clamp-3 ">
              {message.reply_to.body}
            </p>
          </div>
        )}
        {message.reply_to && message.reply_to.photo_url && (
          <div className="flex flex-col leading-1.5 p-4 border-gray-200 rounded-t-xl bg-gray-100">
            <Image
              width={100}
              height={100}
              src={message.reply_to.photo_url}
              alt=""
              className="size-24 rounded-xl object-cover"
            />
          </div>
        )}
        <div
          className={`flex  flex-col leading-1.5 ${
            message.body ? "p-4" : "p-1 w-[320px] "
          }  
            
            border-gray-200  ${
              isOwner
                ? `rounded-l-xl rounded-br-xl  text-white ${
                    isDeleting ? "bg-blue-300 " : "bg-blue-500"
                  }`
                : " rounded-e-xl rounded-es-xl bg-gray-200 text-gray-900"
            } `}
        >
          {message.body && (
            <p className="text-sm font-normal"> {message.body}</p>
          )}
          {message.photo_url && (
            <Image
              alt={message.photo_url}
              height={400}
              width={400}
              quality={70}
              className="w-full h-[400px] object-cover cursor-pointer rounded-xl"
              src={message.photo_url}
              layout="responsive"
              objectFit="cover"
              onClick={() => openImage(message.photo_url as string)}
            />
          )}
          {message.reactions?.length > 0 && (
            <div className="flex flex-row gap-2 items-center ">
              {Object.entries(
                message.reactions.reduce((acc, curr) => {
                  const emoji = curr.react;
                  if (!acc[emoji]) {
                    acc[emoji] = [];
                  }
                  acc[emoji].push(curr);
                  return acc;
                }, {}),
              ).map(([emoji, list]) => {
                const isUserReacted =
                  list.filter((l) => l.react_by.id === user.id).length > 0;

                return (
                  <ReactedMessage
                    key={emoji}
                    emoji={emoji}
                    num={list.length}
                    className={isUserReacted && "bg-blue-400"}
                    onClick={() => handleClickReaction(emoji)}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-row w-full group-hover:justify-between justify-end items-center ">
          {isOwner && (
            <span className="hidden  group-hover:block text-sm font-normal px-2  text-gray-400 ">
              {message.seen_by?.length > 0 ? "Seen" : "Delivered"}{" "}
            </span>
          )}
          {isOwner && (
            <div className="flex flex-row gap-2 items-center px-4">
              <span className="text-sm  font-normal text-gray-500 ">
                {format(new Date(message.modified_at), "hh:mm a")}
              </span>
              {message.seen_by?.length > 0 ? (
                <CheckCheck className="size-4 text-gray-500" />
              ) : (
                <Check className="size-4 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </div>

      <Popover
        onOpenChange={() =>
          setOpenPopoverId(openPopoverId === message.id ? null : message.id)
        }
        open={openPopoverId === message.id}
        trigger="click"
        content={
          <div className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-fit ">
            <ul
              className="py-2 text-sm text-gray-700 "
              aria-labelledby="dropdownMenuIconButton"
            >
              {/* <li className=" bg-white rounded-full">
                <Suspense fallback={<div>Loading reactions...</div>}>
                  <EmojiPicker
                    reactionsDefaultOpen
                    className=""
                    height={250}
                    width={300}
                    skinTonesDisabled
                    searchDisabled
                    open={openPopoverId === message.id}
                    onEmojiClick={(emoji) => handleClickReaction(emoji.emoji)}
                  />
                </Suspense>
              </li> */}
              <li>
                <span
                  onClick={() => {
                    setReply(message);
                    setOpenPopoverId(null);
                  }}
                  className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                >
                  Reply
                </span>
              </li>
              <li>
                <span
                  className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                  onClick={() => {
                    setOpen(message.body, message.photo_url);
                    setOpenPopoverId(null);
                  }}
                >
                  Forward
                </span>
              </li>
              {message.body && (
                <li>
                  <span
                    className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                    onClick={() => {
                      navigator.clipboard.writeText(message.body);
                      toast.success("Copied text successfully");
                      setOpenPopoverId(null);
                    }}
                  >
                    Copy
                  </span>
                </li>
              )}
              {message.photo_url && (
                <li>
                  <a
                    href={message.photo_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                    onClick={() => setOpenPopoverId(null)}
                  >
                    Save Image
                  </a>
                </li>
              )}

              {isOwner && (
                <>
                  {message.body && (
                    <li>
                      <span
                        onClick={() => {
                          setEdit(message);
                          setOpenPopoverId(null);
                        }}
                        className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                      >
                        Edit
                      </span>
                    </li>
                  )}
                  <li>
                    <span
                      onClick={handleDelete}
                      className="cursor-pointer block px-4 py-2 hover:bg-gray-100 "
                    >
                      Delete
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        }
      >
        <button
          onClick={() => setOpenPopoverId(message.id)}
          className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 cursor-pointer"
          type="button"
        >
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 4 15"
          >
            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </button>
      </Popover>
    </div>
  );
};

export default MessageItem;
