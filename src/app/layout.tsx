import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chain Legends - Web3 Battle Arena",
  description: "The ultimate blockchain-based battle arena game. Collect, battle, and earn with your NFT fighters!",
  keywords: ["web3", "blockchain", "nft", "battle", "game", "crypto", "etherlink"],
  authors: [{ name: "Chain Legends Team" }],
  openGraph: {
    title: "Chain Legends - Web3 Battle Arena",
    description: "The ultimate blockchain-based battle arena game. Collect, battle, and earn with your NFT fighters!",
    type: "website",
    siteName: "Chain Legends",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain Legends - Web3 Battle Arena",
    description: "The ultimate blockchain-based battle arena game. Collect, battle, and earn with your NFT fighters!",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        <div id="root" className="min-h-screen">
          <WalletProvider>
            {children}
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}