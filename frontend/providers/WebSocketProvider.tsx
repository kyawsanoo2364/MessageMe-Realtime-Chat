"use client";

import { getTokensAndUserId } from "@/actions";
import userStore from "@/app/store/userStore";
import { createContext, useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

interface UseWebSocketInterface {
  sendJsonMessage: SendJsonMessage | null;
  sendOnlineMessage: SendJsonMessage | null;
  lastJsonMessage: unknown;
  lastOnlineMessage: unknown;
  readyState: ReadyState;
}

export const WebSocketContext = createContext<UseWebSocketInterface>({
  sendJsonMessage: null,
  sendOnlineMessage: null,
  lastJsonMessage: null,
  lastOnlineMessage: null,
  readyState: ReadyState.CLOSED,
});

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socketURL, setSocketURL] = useState(``);
  const [presenceSocketURL, setPresenceSocketURL] = useState("");
  const [token, setToken] = useState<string | undefined>("");
  const { user } = userStore();

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
  }, [user]);

  useEffect(() => {
    if (token) {
      const protocol = process.env.NODE_ENV === "production" ? "wss" : "ws";
      setSocketURL(
        `${protocol}://${process.env.NEXT_PUBLIC_BACKEND_HOST_NAME}/ws/chat/?token=${token}`,
      );
      setPresenceSocketURL(
        `${protocol}://${process.env.NEXT_PUBLIC_BACKEND_HOST_NAME}/ws/presence/?token=${token}`,
      );
    }
  }, [token]);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketURL,
    {
      retryOnError: true,
      shouldReconnect: () => true,
      share: true,
    },
  );
  const {
    sendJsonMessage: sendOnlineMessage,
    lastJsonMessage: lastOnlineMessage,
  } = useWebSocket(presenceSocketURL, {
    retryOnError: true,
    shouldReconnect: () => true,
  });

  return (
    <WebSocketContext.Provider
      value={{
        sendJsonMessage,
        lastJsonMessage,
        readyState,

        lastOnlineMessage,
        sendOnlineMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
