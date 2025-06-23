import type { Metadata } from "next";
import { Roboto, Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import WebSocketProvider from "@/providers/WebSocketProvider";

const roboto = Roboto({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MessageMe",
  description: "Chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <WebSocketProvider>{children}</WebSocketProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
