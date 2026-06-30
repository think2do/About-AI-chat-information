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
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <NavSidebar />
          <main
            style={{
              flex: 1,
              height: "100%",
              minWidth: 0,
              background: "#0d1117",
              overflow: "hidden",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
