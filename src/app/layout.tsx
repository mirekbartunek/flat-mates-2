import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";
import { Nunito_Sans } from "next/font/google";
import { Header } from "@/modules/layout/components";
import { Providers } from "@/modules/layout/components/Providers/Providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";

export const metadata = {
  title: "Flat Mates",
  description: "Find your flat!",
};
const nunito = Nunito_Sans({ weight: "400", subsets: ["latin"] });
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${nunito.className}`} suppressHydrationWarning>
      <body>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <TRPCReactProvider>
          <Providers>
            <Header />
            {children}
          </Providers>
          <ReactQueryDevtools initialIsOpen={false} />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
