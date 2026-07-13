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
  // Pre-paint theme init — mirrors lib/theme-mode.ts resolveInitial() (a module can't run
  // before hydration). Runs synchronously during HTML parse so dark users see no light flash.
  const themeInit = `!function(){try{var k='teaching_tool_theme',v=localStorage.getItem(k);if(v!=='light'&&v!=='dark'){v=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=v;}catch(e){}}()`;
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <NavSidebar />
          <main
            style={{
              flex: 1,
              height: "100%",
              minWidth: 0,
              background: "var(--canvas)",
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
