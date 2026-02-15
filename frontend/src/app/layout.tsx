import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NexusAI — Autonomous Sales Intelligence",
    description: "AI-powered lead research, scoring, and personalized email generation for modern sales teams.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            appearance={{
                variables: {
                    colorPrimary: "#8b5cf6",
                    colorBackground: "#171717",
                    colorInputBackground: "#262626",
                    colorInputText: "#ffffff",
                    colorText: "#e5e5e5",
                },
                elements: {
                    socialButtonsBlockButton: {
                        backgroundColor: "#262626",
                        color: "#e5e5e5",
                        border: "1px solid #404040",
                        "&:hover": {
                            backgroundColor: "#333333",
                        },
                    },
                    socialButtonsBlockButtonText: {
                        color: "#e5e5e5",
                        fontWeight: 500,
                    },
                },
            }}
        >
            <html lang="en" className="dark">
                <body className={`${outfit.className} bg-neutral-950 text-neutral-200 antialiased min-h-screen`}>
                    {children}
                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    );
}
