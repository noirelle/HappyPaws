import type { Metadata } from "next";
import "./globals.css";

import GlobalLoader from "./components/ui/GlobalLoader";
import { WidgetProvider } from "./providers/WidgetProvider";


export const metadata: Metadata = {
  title: "Happy Paws Vet Clinic",
  description: "Your Pet’s Health is Our Top Priority",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <WidgetProvider>
          <GlobalLoader />
          {children}
        </WidgetProvider>
      </body>
    </html>
  );
}

