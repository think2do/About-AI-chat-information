import type { Metadata } from "next";
import NavSidebar from "@/components/NavSidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Teaching Tool",
  description: "LLM 机制可视化教学工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <NavSidebar />
          <main
            style={{
              flex: 1,
              background: "#0d1117",
              overflow: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
