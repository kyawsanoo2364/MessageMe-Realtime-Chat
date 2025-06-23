import { getUser, LogoutWithCookies } from "@/actions";
import { create } from "zustand";
import { UserType } from "../types";

interface IUserStore {
  user: UserType | null;
  fetch: () => void;
  routePush: string | null;

  setRoute: (route: string | null) => void;
}

const userStore = create<IUserStore>((set) => ({
  user: null,
  fetch: async () => {
    try {
      set({ routePush: null });
      const user = await getUser();
      if (!user) {
        await LogoutWithCookies();
        set({ routePush: "/login" });
        return;
      }
      set({ user, routePush: null });
    } catch (error) {
      console.log(error);
    }
  },
  routePush: null,
  setRoute: (route: string | null) => set({ routePush: route }),
}));

export default userStore;
