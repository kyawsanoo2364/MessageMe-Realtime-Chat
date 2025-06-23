"use client";
import { loginWithCookies } from "@/actions";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password1: "",
    password2: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password1, password2, first_name, last_name } = formData;
    if (!email || !password1 || !password2 || !first_name || !last_name) {
      toast.error("All fields are required!");
      return;
    }
    if (password1.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password1 !== password2) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1/auth/register/`,
        formData,
      );
      const data = res.data;
      await loginWithCookies(data.access, data.refresh, data.user.pk);
      toast.success("User account created successfully");
      setIsLoading(false);
      router.push("/");
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
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
              Register
            </h2>
            <div className="my-2">
              <GoogleLogin
                onSuccess={handleSuccessGoogleLogin}
                shape="circle"
              />
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
                First Name
              </label>
              <input
                placeholder="Enter your first name"
                className="p-2 md:p-4 w-full border border-slate-400 rounded"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
              />
            </div>
            <div className="my-4 space-y-2 flex flex-col  justify-start">
              <label className="text-slate-800 md:text-lg text-base">
                Last Name
              </label>
              <input
                placeholder="Enter your last name"
                className="p-2 md:p-4 w-full border border-slate-400 rounded"
                type="text"
                name="last_name"
                value={formData.last_name}
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
                name="password1"
                value={formData.password1}
                onChange={onChange}
              />
            </div>
            <div className="my-4 space-y-2 flex flex-col  justify-start">
              <label className="text-slate-800 md:text-lg text-base">
                Confirm Password
              </label>
              <input
                placeholder="Confirm Password"
                className="p-2 md:p-4 w-full border border-slate-400 rounded"
                type="password"
                name="password2"
                value={formData.password2}
                onChange={onChange}
              />
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="disabled:opacity-60 py-2 px-4 md:py-4 md:px-6 w-full bg-blue-400 rounded-lg text-white "
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 mb-6">
            <span className="text-slate-700 md:text-base text-xs">
              Already have an account? Please click
            </span>{" "}
            <Link
              href={"/login"}
              className="md:text-base text-xs text-blue-500 hover:underline"
            >
              Login
            </Link>
            .
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignupPage;
