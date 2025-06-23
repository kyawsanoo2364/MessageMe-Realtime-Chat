import { getAxiosInstance } from "@/axiosInstance";
import { create } from "zustand";

interface IOnlineUserStore {
  onlineUsers: [];
  fetchOnlineUsers: () => void;
}

const OnlineUsersStore = create<IOnlineUserStore>((set) => ({
  onlineUsers: [],
  fetchOnlineUsers: async () => {
    try {
      const axiosInstance = await getAxiosInstance();
      const res = await axiosInstance.get(`/chat/online-users/`);
      if (res.status === 200) {
        set({ onlineUsers: res.data });
      }
    } catch (error) {
      console.log(error);
    }
  },
}));

export default OnlineUsersStore;
