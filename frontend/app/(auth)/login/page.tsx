"use client";

import { loginWithCookies } from "@/actions";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",

    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1/auth/login/`,
        formData,
      );
      const data = res.data;
      await loginWithCookies(data.access, data.refresh, data.user.pk);
      toast.success("User account created successfully");
      setIsLoading(false);
      router.push("/");
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.non_field_errors[0]);
      console.log(error);
    }
  };

  const handleSuccessGoogleLogin = async (
    credentialRes: CredentialResponse,
  ) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1/auth/google/`,
        { id_token: credentialRes.credential },
      );
      const data = res.data;
      await loginWithCookies(data.access, data.refresh, data.user.pk);
      toast.success("Login successfully");
      setIsLoading(false);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID as string}
    >
      <div className="flex items-center w-full h-full flex-row justify-center mt-6 px-4">
        <div className="max-w-lg w-full px-4 py-6 border border-slate-200 rounded-md shadow-md">
          <form className="space-y-6" onSubmit={onSubmit}>
            <h2 className="text-center font-medium text-xl md:text-2xl text-slate-700">
              Log In
            </h2>
            <div className="my-2 ">
              <GoogleLogin onSuccess={handleSuccessGoogleLogin} shape="pill" />
            </div>
            <div className="my-4 space-y-2 flex flex-col  justify-start">
              <label className="text-slate-800 md:text-lg text-base">
                Email
              </label>
              <input
                placeholder="Enter your email address"
                className="p-2 md:p-4 w-full border border-slate-400 rounded"
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
              />
            </div>

            <div className="my-4 space-y-2 flex flex-col  justify-start">
              <label className="text-slate-800 md:text-lg text-base">
                Password
              </label>
              <input
                placeholder="Enter your Password"
                className="p-2 md:p-4 w-full border border-slate-400 rounded"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="cursor-pointer disabled:opacity-50 py-2 px-4 md:py-4 md:px-6 w-full bg-blue-400 rounded-lg text-white "
            >
              Log In
            </button>
          </form>
          <div className="mt-4 mb-6">
            <span className="text-slate-700 md:text-base text-xs">
              Haven't an account yet? Please click
            </span>{" "}
            <Link
              href={"/signup"}
              className="md:text-base text-xs text-blue-500 hover:underline"
            >
              register
            </Link>
            .
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
