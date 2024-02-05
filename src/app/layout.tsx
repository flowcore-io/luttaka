import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import PublicPage from "./public-page";
import ProtectedPage from "./protected-page";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flowcore Open Source Conference App",
  description: "The open source Conference App from Flowcore",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen font-sans ${inter.variable}`}>
        <ClerkProvider>
          <SignedOut>
            <PublicPage children={children} />
          </SignedOut>
          <SignedIn>
            <TRPCReactProvider cookies={cookies().toString()}>
              <ProtectedPage children={children} />
              <Toaster />
            </TRPCReactProvider>
          </SignedIn>
        </ClerkProvider>
      </body>
    </html>
  );
}
