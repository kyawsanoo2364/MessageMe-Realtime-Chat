"use client";

import { LogoutWithCookies } from "@/actions";
import useUploadProfilePicModal from "@/app/hooks/modal/useUploadProfilePicModal";
import conversationsStore from "@/app/store/conversationsStore";
import OnlineUsersStore from "@/app/store/onlineUsersStore";
import { UserType } from "@/app/types";
import { Button, Popover } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ConversationHeader = ({ user }: { user: UserType | undefined }) => {
  const router = useRouter();
  const { setOpen, setAvatar } = useUploadProfilePicModal();
  const { conversations, filteredConversations, setFilter } =
    conversationsStore();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    try {
      await LogoutWithCookies();
      toast.success("Logout successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Something went wrong.");
      console.log(error);
    }
  };

  const handleOpenProfileUploaderModal = () => {
    if (user?.avatar_url) {
      setAvatar(user.avatar_url);
    } else {
      setAvatar(null);
    }
    setOpen();
  };

  useEffect(() => {
    if (searchValue) {
      const cs = conversations.filter((c) =>
        c.members.some((u) =>
          u.full_name.toLowerCase().includes(searchValue.toLowerCase()),
        ),
      );
      setFilter(cs);
    } else {
      setFilter(conversations);
    }
  }, [searchValue]);

  return (
    <div className="md:p-4 pb-4 border-b border-b-gray-200">
      <div className="flex justify-between flex-row">
        <Link
          href={"/"}
          className="cursor-pointer font-bold lg:text-3xl text-3xl bg-gradient-to-r from-blue-800 to-pink-400 bg-clip-text text-transparent"
        >
          MessageME
        </Link>

        <Popover
          trigger="hover"
          color="light"
          className="bg-white opacity-100 z-[50] border border-gray-100"
          aria-labelledby="profile-popover"
          content={
            <div className="w-64 p-3">
              <div className="flex items-center gap-4">
                <div className="mb-2 flex items-center justify-between relative">
                  {user?.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={`${user?.avatar_url}`}
                      alt="Jese Leos"
                    />
                  ) : (
                    <div className="size-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 left-0 bottom-0">
                    <div
                      className="w-full opacity-0 h-full flex flex-col items-center justify-center hover:bg-gray-100 hover:opacity-80 rounded-full cursor-pointer"
                      onClick={handleOpenProfileUploaderModal}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <p
                    id="profile-popover"
                    className="text-base font-semibold leading-none text-slate-800"
                  >
                    {user?.full_name}
                  </p>
                  <span className="text-sm text-gray-500 ">{user?.email}</span>
                </div>
              </div>
              <button
                className="w-full mt-2 py-2 rounded-xl text-white hover:bg-red-600 cursor-pointer bg-red-500"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          }
        >
          <div className="border border-gray-200 ring-2 ring-blue-200 rounded-full cursor-pointer size-[30px] lg:size-[30px] relative">
            {user?.avatar_url ? (
              <Image
                alt="profile"
                src={user?.avatar_url}
                width={100}
                height={100}
                className="object-cover rounded-full w-full h-full"
              />
            ) : (
              <div className="text-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
            )}
          </div>
        </Popover>
      </div>
      <div className="mt-4">
        <div className="relative">
          <input
            type="text"
            id="Search"
            placeholder="Search"
            className=" p-2  w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 border  border-gray-300 pe-10 shadow-sm sm:text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <span className="absolute inset-y-0 right-2 grid w-8 place-content-center">
            <button
              type="button"
              aria-label="Submit"
              className="rounded-full p-1.5 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
