import "./globals.css";

export const metadata = {
  title: "KLEINANZEIGEN-AF",
  description: "Marketplace Afrique & Europe"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
