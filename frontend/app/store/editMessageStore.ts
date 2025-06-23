import { MessageType } from "@/components/conversations/Conversations";
import { create } from "zustand";

interface IEditMessageStore {
  message: MessageType | null;
  isEdit: boolean;
  setEdit: (message: MessageType) => void;
  closeEdit: () => void;
}

const editMessageStore = create<IEditMessageStore>((set) => ({
  message: null,
  isEdit: false,
  setEdit: (message: MessageType) => set({ message, isEdit: true }),
  closeEdit: () => set({ message: null, isEdit: false }),
}));

export default editMessageStore;
