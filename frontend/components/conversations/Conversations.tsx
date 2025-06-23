"use client";
import React, { useContext, useEffect, useState } from "react";
import ConversationHeader from "./ConversationHeader";

import ConversationItem from "./ConversationItem";
import NewConversationModal from "./modal/NewConversationModal";
import useNewConversationModal from "@/app/hooks/modal/useNewConversationModal";
import { MessageReactionType, UserType } from "@/app/types";

import { useRouter, useSearchParams } from "next/navigation";
import conversationsStore from "@/app/store/conversationsStore";
import UploadProfilePic from "./modal/UploadProfilePic";
import { WebSocketContext } from "@/providers/WebSocketProvider";
import toast from "react-hot-toast";
import Link from "next/link";

interface ConversationsProps {
  user: UserType | undefined;
}

export interface MessageType {
  id: string;
  body: string | null;
  modified_at: string;
  created_by: UserType;
  created_at: string;
  reply_to?: {
    id: string;
    body: string;
  };
  seen_by: string[];
  reactions: MessageReactionType[];
  photo_url: string | null;
}
export type ConversationType = {
  id: string;
  members: UserType[];
  created_at: string;
  messages: MessageType[];
  message?: MessageType;
  modified_at: string;
};

const Conversations: React.FC<ConversationsProps> = ({ user }) => {
  const { onShow } = useNewConversationModal();
  const { lastJsonMessage, sendJsonMessage } = useContext(WebSocketContext);
  const conversationId = useSearchParams().get("conversation");
  const {
    filteredConversations: conversations,
    fetchConversations,
    setFilter,
    conversations: _conversations,
    addConversation,
    removeConversation,
    isLoading,
  } = conversationsStore();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchConversations(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (_conversations) {
      setFilter(_conversations);
    }
  }, [_conversations]);

  const setFilterData = (
    conversation_id: string,
    data: string,
    auto_date_now = false,
  ) => {
    setFilter(
      conversations.map((c) => {
        if (c.id === conversation_id) {
          return {
            ...c,
            message: {
              ...(c.message || {}),
              body: data,

              ...(auto_date_now && { created_at: new Date().toISOString() }),
            },
          };
        }
        return c;
      }) as ConversationType[],
    );
  };

  useEffect(() => {
    if (!lastJsonMessage) return;

    const {
      conversation_id,
      type,
      user: typingUser,
      message,
    } = lastJsonMessage;

    if (type === "new_conversation") {
      sendJsonMessage?.({
        type: "join_conversation",
        conversation_id: lastJsonMessage.conversation.id,
      });
      addConversation(lastJsonMessage.conversation);
    } else if (type === "delete_conversation") {
      if (conversation_id === conversationId) {
        router.push("/");
        router.refresh();
      }
      removeConversation(conversation_id);
    }

    if (conversation_id && type === "typing") {
      if (typingUser && typingUser !== user?.email) {
        setFilterData(conversation_id, "typing...");
      }
    } else if (type === "chat_message" || type === "reply_message") {
      setFilterData(conversation_id, message, true);
      if (
        conversation_id !== conversationId &&
        lastJsonMessage.created_by.id !== user.id
      ) {
        toast.custom(
          (t) => (
            <Link
              href={`/?conversation=${conversation_id}`}
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md cursor-pointer w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={
                        lastJsonMessage.created_by.avatar_url
                          ? lastJsonMessage.created_by.avatar_url
                          : "profile.png"
                      }
                      alt=""
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {lastJsonMessage.created_by.full_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {lastJsonMessage.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="cursor-pointer w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </Link>
          ),
          { position: "top-right" },
        );
      }
    }
  }, [lastJsonMessage, user?.email]);

  return (
    <div className="  w-full">
      <ConversationHeader user={user} />
      <div className="mt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className=" md:p-4 text-2xl font-bold text-slate-700">
            Latest Chats
          </h2>
          <button
            type="button"
            onClick={onShow}
            className="rounded-full hover:bg-gray-200 p-2 cursor-pointer hover:border border-gray-200"
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4 animate-pulse">
            {[...new Array(5)].map((_, index: number) => (
              <div
                key={`conversation_${index}`}
                className="flex items-center mt-4"
              >
                <svg
                  className="w-10 h-10 me-3 text-gray-200 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full  w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full "></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="mt-2 p-0 max-h-[360px] lg:max-h-[420px] overflow-y-auto">
            {" "}
            {conversations
              ?.sort(
                (a, b) =>
                  new Date(b.message?.created_at || b.modified_at).getTime() -
                  new Date(a.message?.created_at || a.modified_at).getTime(),
              )
              .map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  userId={user.id}
                />
              ))}
          </div>
        ) : (
          <div className="mt-2 p-0 h-[360px] lg:h-[420px] flex flex-col items-center justify-center">
            <div className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-20"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-400">
              No Conversations
            </span>
          </div>
        )}
      </div>
      <NewConversationModal />
      <UploadProfilePic />
    </div>
  );
};

export default Conversations;
