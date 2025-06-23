"use client";

import { UserType } from "@/app/types";
import { Avatar } from "flowbite-react";
import React from "react";

interface ChatUserItemProps {
  user: UserType;
  selected?: boolean;
  onClick?: () => void;
}

const ChatUserItem: React.FC<ChatUserItemProps> = ({
  user,
  onClick,
  selected,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${
        selected
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "text-black hover:text-white hover:bg-blue-500"
      } flex flex-row p-2 gap-4 items-center  cursor-pointer rounded-xl `}
    >
      <Avatar
        img={user?.avatar_url ? user.avatar_url : "profile.png"}
        bordered
        className={
          !user?.avatar_url ? "bg-white rounded-full object-cover" : ""
        }
        rounded
      />
      <h2 className="text-lg font-semibold">{user?.full_name}</h2>
    </div>
  );
};

export default ChatUserItem;
