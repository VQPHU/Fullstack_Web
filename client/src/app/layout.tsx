import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import { Toaster } from 'sonner';
import Footer from "@/components/footer/Footer";
import NotificationModal from "@/components/home/NotificationModal";

export const metadata: Metadata = {
  title: "Babyshop | Online shopping places",
  description: "Babyshop for onlne shopping",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Header />
        {children}
        <NotificationModal/>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "rounded-lg shadow-lg border",
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
