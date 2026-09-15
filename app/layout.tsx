import './globals.css';

export const metadata = {
  title: 'Sendora',
  description: 'Transferts d’argent internationaux'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
