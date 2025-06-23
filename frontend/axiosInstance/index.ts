import axios from "axios";
import { getTokensAndUserId } from "@/actions/index";

export async function getAxiosInstance() {
  const { access } = await getTokensAndUserId();

  return axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL_API}/api/v1`,
    headers: {
      Authorization: access ? `Bearer ${access}` : null,
    },
  });
}
