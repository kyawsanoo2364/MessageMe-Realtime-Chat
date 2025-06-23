import { MessageType } from "@/components/conversations/Conversations";
import { create } from "zustand";

interface IReplyMessageStore {
  replyTo: MessageType | null;
  isReply: boolean;
  setReply: (reply: MessageType) => void;
  closeReply: () => void;
}

const replyMessageStore = create<IReplyMessageStore>((set) => ({
  replyTo: null,
  isReply: false,
  setReply: (reply: MessageType) => set({ replyTo: reply, isReply: true }),
  closeReply: () => set({ replyTo: null, isReply: false }),
}));

export default replyMessageStore;
