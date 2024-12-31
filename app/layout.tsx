import "./globals.css";
// import Sidebar from "./components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          {/* <Sidebar /> */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
