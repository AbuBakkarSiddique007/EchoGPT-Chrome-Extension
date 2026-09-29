import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoGPT",
  description: "EchoGPT Chrome extension redesign prototype",
  icons: {
    icon: "/logo-echogpt.svg",
    shortcut: "/logo-echogpt.svg",
  },
};

const themeInitScript = `(function(){try{var t;try{var s=JSON.parse(localStorage.getItem("echogpt.demo.settings.v1")||"{}");t=s.themeMode==="light"?"light":s.themeMode==="dark"?"dark":null;}catch(e){t=null;}if(!t)t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
