import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EndMyopia | Start Here",
  description:
    "Discover why your eyes keep getting worse — and what to actually do about it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: "#f8fafc", colorScheme: "light" }}>
      <body style={{ backgroundColor: "#f8fafc", color: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  );
}
