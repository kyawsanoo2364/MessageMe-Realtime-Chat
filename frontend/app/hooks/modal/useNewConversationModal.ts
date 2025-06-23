import { create } from "zustand";

interface useNewConversationType {
  isShow: boolean;
  onShow: () => void;
  onClose: () => void;
}

const useNewConversationModal = create<useNewConversationType>((set) => ({
  isShow: false,
  onShow: () => set({ isShow: true }),
  onClose: () => set({ isShow: false }),
}));

export default useNewConversationModal;
