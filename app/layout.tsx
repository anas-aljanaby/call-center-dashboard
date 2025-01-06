'use client';

import "./globals.css";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/';

  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
