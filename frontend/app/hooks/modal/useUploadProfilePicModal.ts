import { create } from "zustand";

interface IUploadProfilePicModal {
  isOpen: boolean;
  avatar: string | null;
  setOpen: () => void;
  onClose: () => void;
  setAvatar: (avatar_url: string | null) => void;
}

const useUploadProfilePicModal = create<IUploadProfilePicModal>((set) => ({
  isOpen: false,
  avatar: null,
  setOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setAvatar: (avatar_url: string | null) => set({ avatar: avatar_url }),
}));

export default useUploadProfilePicModal;
