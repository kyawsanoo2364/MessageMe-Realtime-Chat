"use client";

import React, { useEffect, useState } from "react";
import MessageHeader from "./MessageHeader";
import MessageBody from "./MessageBody";
import { ConversationType } from "../conversations/Conversations";
import { getTokensAndUserId } from "@/actions";
import { UserType } from "@/app/types";
import ForwardToModal from "../conversations/modal/ForwardToModal";

interface MessagesProps {
  user: UserType | undefined;
  conversation: ConversationType;
  isMessagesLoading: boolean;
}

const Messages = ({ user, conversation, isMessagesLoading }: MessagesProps) => {
  const [token, setToken] = useState<string | undefined>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { access } = await getTokensAndUserId();
        setToken(access);
      } catch (error) {
        console.log(error);
      }
    };
    fetchToken();
  }, []);

  return (
    <div className="h-full w-full min-h-screen">
      <MessageHeader userId={user?.id} conversation={conversation} />
      <MessageBody
        isMessagesLoading={isMessagesLoading}
        user={user}
        conversation={conversation}
        token={token}
      />
      <ForwardToModal />
    </div>
  );
};

export default Messages;
