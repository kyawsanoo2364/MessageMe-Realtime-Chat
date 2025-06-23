"use client";

import React from "react";
import { ConversationType } from "./Conversations";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import OnlineUsersStore from "@/app/store/onlineUsersStore";

interface ConversationItemProps {
  conversation: ConversationType;
  userId: string | undefined;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  userId,
}) => {
  const { onlineUsers } = OnlineUsersStore();
  const user = conversation.members.find((u) => u.id !== userId);

  const isOnline = onlineUsers.includes(user?.id);

  return (
    <Link
      href={`/?conversation=${conversation.id}`}
      className="flex flex-row gap-4 items-center w-full relative cursor-pointer hover:bg-gray-100 p-4"
    >
      <div className="relative h-10 w-10 border border-gray-100 rounded-full">
        <img
          className="size-full object-cover rounded-full "
          src={user?.avatar_url ? user.avatar_url : "/profile.png"}
          alt="p"
        />
        {isOnline && (
          <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        )}
      </div>
      <div className="flex flex-col ">
        <h3 className="lg:text-lg text-slate-600 font-semibold">
          {user?.full_name}
        </h3>
        <p className="text-sm max-w-[150px] lg:max-w-[200px] text-gray-500 line-clamp-1">
          {conversation.message?.body}
        </p>
      </div>
      <div className="absolute top-4 right-2">
        <span className="text-sm text-slate-400">
          {formatDistanceToNow(
            new Date(
              conversation.message && conversation.message.created_at
                ? (conversation.message?.created_at as string)
                : Date.now(),
            ),
            {
              addSuffix: true,
            },
          )}
        </span>
      </div>
    </Link>
  );
};

export default ConversationItem;
