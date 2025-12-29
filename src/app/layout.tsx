import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/utils/reduxProvider";
import Auth from "./auth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Inter({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Roboto_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Quality Clinic",
    description: "Quality Clinic Admin",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ReduxProvider>
                    <Auth>
                        {children}
                    </Auth>
                    <ToastContainer />                    
                </ReduxProvider>
            </body>
        </html>
    );
}
