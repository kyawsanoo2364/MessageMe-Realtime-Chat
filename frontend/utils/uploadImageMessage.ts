import { getAxiosInstance } from "@/axiosInstance";

export const UploadImageMessage = async (
  file: File,
  conversationId: string,
  onProgress?: (precent: number) => void,
) => {
  const chunkSize = 1024 * 1024; //1MB
  let start = 0;
  let index = 0;
  let uploadedBytes = 0;
  const axiosInstance = await getAxiosInstance();
  while (start < file.size) {
    const chunk = file.slice(start, start + chunkSize);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("index", index);
    formData.append("is_last", start + chunkSize >= file.size);
    formData.append("filename", file.name);
    try {
      await axiosInstance.post(
        `/chat/conversation/${conversationId}/send_image/`,
        formData,
      );
    } catch (error) {
      throw error;
    }
    uploadedBytes += chunkSize;
    const percent = Math.round((uploadedBytes / file.size) * 100);
    onProgress?.(percent);

    start += chunkSize;
    index++;
  }
};
