"use server";

import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { cookies } from "next/headers";

const loginWithCookies = async (
  access: string,
  refresh: string,
  userId: string,
) => {
  const _cookies = await cookies();

  _cookies.set("messageme_access", access, {
    maxAge: 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  _cookies.set("messageme_refresh", refresh, {
    maxAge: 60 * 60 * 24 * 7,

    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  _cookies.set("messageme_userId", userId, {
    maxAge: 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const getUser = async () => {
  const { userId, access } = await getTokensAndUserId();
  try {
    if (!userId || !access) {
      return null;
    }
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1/auth/user/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      },
    );
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const handleRefreshLogin = async (refresh: string) => {
  try {
    const _cookies = await cookies();

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1/auth/token/refresh/`,
      { refresh },
    );

    const data = res.data;

    const decoded = jwtDecode(data.access);

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    _cookies.set("messageme_access", data?.access, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    _cookies.set("messageme_userId", decoded.user_id, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return { access: data.access, userId: decoded.user_id };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTokensAndUserId = async () => {
  const _cookies = await cookies();
  let access = _cookies.get("messageme_access")?.value;
  const refresh = _cookies.get("messageme_refresh")?.value;
  let userId = _cookies.get("messageme_userId")?.value;

  if (!access) {
    const data = await handleRefreshLogin(refresh as string);
    access = data?.access;
    userId = data?.userId;
  }

  return { access, refresh, userId };
};

const LogoutWithCookies = async () => {
  const _cookies = await cookies();
  _cookies.delete("messageme_access");
  _cookies.delete("messageme_refresh");
  _cookies.delete("messageme_userId");
};

export {
  loginWithCookies,
  LogoutWithCookies,
  getUser,
  handleRefreshLogin,
  getTokensAndUserId,
};
