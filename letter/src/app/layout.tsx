import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Una carta para ti",
  description: "Una carta privada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: extensiones como Dark Reader inyectan atributos
    // en <html> antes de hidratar. Solo aplica a este elemento, no a sus hijos.
    <html
      lang="es"
      className={`${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-surface text-body-md text-on-surface selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
