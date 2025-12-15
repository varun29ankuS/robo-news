import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROBO-NEWS | Robotics News Aggregator",
  description: "The front page of robotics. News, builds, and deep dives across drones, arms, humanoids, mobile robots, industrial automation, and DIY projects.",
  keywords: ["robotics", "robots", "drones", "humanoids", "ROS2", "automation", "DIY robots"],
  authors: [{ name: "ROBO-NEWS" }],
  openGraph: {
    title: "ROBO-NEWS | Robotics News Aggregator",
    description: "The front page of robotics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cyan">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
