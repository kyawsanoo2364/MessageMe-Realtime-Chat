import { getAxiosInstance } from "@/axiosInstance";
import { ConversationType } from "@/components/conversations/Conversations";
import { create } from "zustand";

interface IConversationStore {
  conversations: ConversationType[];
  isLoading: boolean;
  filteredConversations: ConversationType[];
  fetchConversations: (userId: string) => void;
  setConversations: (conversations: ConversationType[]) => void;
  setFilter: (conversations: ConversationType[]) => void;
  addConversation: (conversation: ConversationType) => void;
  removeConversation: (conversation_id: string) => void;
}

const conversationsStore = create<IConversationStore>((set) => ({
  conversations: [],
  filteredConversations: [],
  isLoading: false,
  fetchConversations: async (userId: string) => {
    try {
      set({ isLoading: true });
      const axiosInstance = await getAxiosInstance();
      const res = await axiosInstance.get(`/chat/${userId}/all-conversations/`);
      if (res.status === 200) {
        set({ conversations: res.data });
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  setConversations: (conversations: ConversationType[]) =>
    set({ conversations: conversations }),
  setFilter: (conversations: ConversationType[]) =>
    set({ filteredConversations: conversations }),
  addConversation: (conversation: ConversationType) => {
    set((state) => ({
      conversations: [...state.conversations, conversation],
    }));
  },
  removeConversation: (conversation_id: string) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => c.id !== conversation_id,
      ),
    }));
  },
}));

export default conversationsStore;
