import { create } from "zustand";

interface IUseImageModal {
  open: boolean;
  image: string | null;
  openImage: (href: string) => void;
  closeImage: () => void;
}

const useImageModal = create<IUseImageModal>((set) => ({
  open: false,
  image: null,
  openImage: (href: string) => {
    set({ open: true, image: href });
  },
  closeImage: () => set({ open: false, image: null }),
}));

export default useImageModal;
