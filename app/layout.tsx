import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import Header from "./header";

// ADD THESE IMPORTS:
import '@mantine/core/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Planner",
  description: "A modern budget tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={inter.className}>
        <MantineProvider
          theme={{
            fontFamily: inter.style.fontFamily,
            primaryColor: 'blue',
          }}
        >
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}