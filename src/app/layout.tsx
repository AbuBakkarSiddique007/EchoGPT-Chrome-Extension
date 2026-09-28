import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoGPT",
  description: "EchoGPT Chrome extension redesign prototype",
};

const themeInitScript = `(function(){try{var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
