import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlantTree.life — plant trees, watch them grow",
  description:
    "Pay a farmer directly to plant and tend a native tree. Watch it grow for the next twenty years. PlantTree.life never touches your money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Serif+Display&family=Fraunces:opsz,wght@9..144,300..700&family=Source+Serif+4:wght@300..700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
