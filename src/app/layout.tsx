import type { Metadata } from "next";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import "./globals.css";
export const metadata:Metadata={title:"PC Gamer Titan Elite | Loja",description:"Landing Page de vendas do PC Gamer Titan Elite."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AnalyticsScripts/>{children}</body></html>;}
