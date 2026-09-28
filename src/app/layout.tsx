import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoGPT",
  description: "EchoGPT Chrome extension redesign prototype",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
