import { create } from "zustand";

interface IUseForwardModal {
  isOpen: boolean;
  text: string | null;
  photo: string | null;
  onClose: () => void;
  setOpen: (text: string | null, photo: string | null) => void;
}

const useForwardModal = create<IUseForwardModal>((set) => ({
  isOpen: false,
  text: null,
  photo: null,
  onClose: () => set({ isOpen: false }),
  setOpen: (text: string | null, photo: string | null) =>
    set({ isOpen: true, text, photo }),
}));

export default useForwardModal;
