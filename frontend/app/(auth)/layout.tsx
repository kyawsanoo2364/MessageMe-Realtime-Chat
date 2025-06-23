import React from "react";
import userStore from "../store/userStore";
import { redirect } from "next/navigation";
import { getTokensAndUserId } from "@/actions";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId, access } = await getTokensAndUserId();
  if (userId || access) {
    redirect("/");
  }

  return (
    <div className=" min-h-screen w-full bg-slate-50">
      <nav className="w-full fixed top-0 left-0 right-0 h-24 flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-b-gray-200">
        <h1 className="font-bold md:text-4xl text-2xl bg-gradient-to-r from-blue-800 to-pink-400 bg-clip-text text-transparent">
          MessageME
        </h1>
      </nav>
      <div className="pt-30 pb-5">{children}</div>
    </div>
  );
};

export default AuthLayout;
