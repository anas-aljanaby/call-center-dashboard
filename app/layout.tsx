'use client';

import "./globals.css";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import { usePathname } from 'next/navigation';
import type { ReactElement } from "react";
import { SettingsProvider } from './contexts/SettingsContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const pathname = usePathname();
  const showNavbar = pathname !== '/';

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <SettingsProvider>
          <AuthGuard>
            <div className="flex flex-col h-screen">
              {showNavbar && <Navbar />}
              <div className="flex flex-1">
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </div>
          </AuthGuard>
        </SettingsProvider>
      </body>
    </html>
  );
}
