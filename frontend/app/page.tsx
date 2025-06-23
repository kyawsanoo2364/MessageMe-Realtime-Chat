"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Conversations, {
  ConversationType,
} from "@/components/conversations/Conversations";
import { useContext, useEffect, useState } from "react";

import Messages from "@/components/messages/Messages";
import { getAxiosInstance } from "@/axiosInstance";
import userStore from "./store/userStore";
import OnlineUsersStore from "./store/onlineUsersStore";
import { WebSocketContext } from "@/providers/WebSocketProvider";
import HomeLoading from "@/components/HomeLoading";
import ImageModal from "@/components/messages/modal/ImageModal";

export default function Home() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const router = useRouter();
  const { fetch, user, routePush, setRoute } = userStore();
  const [conversation, setConversation] = useState<ConversationType | null>();
  const { sendOnlineMessage } = useContext(WebSocketContext);
  const { fetchOnlineUsers } = OnlineUsersStore();
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  useEffect(() => {
    fetch();
    fetchOnlineUsers();
    const interval = setInterval(() => {
      sendOnlineMessage?.({
        type: "ping",
      });
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sendOnlineMessage) {
      fetchOnlineUsers();
    }
  }, [sendOnlineMessage]);

  useEffect(() => {
    if (routePush) {
      router.push(routePush);
      setRoute(null);
    }
  }, [routePush]);

  useEffect(() => {
    if (conversationId) {
      const fetchConversation = async () => {
        try {
          setIsMessagesLoading(true);
          const axiosInstance = await getAxiosInstance();
          const res = await axiosInstance(
            `/chat/conversation/${conversationId}/`,
          );
          if (res.data) {
            setConversation(res.data);
            setIsMessagesLoading(false);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsMessagesLoading(false);
        }
      };
      fetchConversation();
    } else {
      setConversation(null);
    }
  }, [conversationId]);

  if (!user) {
    return <HomeLoading />;
  }

  return (
    <main className="min-h-screen w-full">
      <div className="grid w-full h-full grid-cols-1 md:grid-cols-8 md:p-0">
        <div className="lg:p-0 lg:col-span-2 sm:col-span-3 hidden md:block">
          <Conversations user={user} />
        </div>
        <div className="md:col-span-5 lg:col-span-6 md:border-l md:border-l-gray-300">
          {conversation ? (
            <Messages
              isMessagesLoading={isMessagesLoading}
              user={user}
              conversation={conversation}
            />
          ) : (
            <div className="flex items-center flex-col justify-center min-h-screen w-full">
              <div className="text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-32"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-slate-500">
                Click & Start a Conversation - Anytime,Anywhere
              </span>
            </div>
          )}
        </div>
      </div>
      <ImageModal />
    </main>
  );
}
