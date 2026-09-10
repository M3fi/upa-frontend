import type { Metadata } from 'next';
import './globals.css';
import SpaceThemeLayout from '@/components/SpaceTheme';

export const metadata: Metadata = {
  title: 'Upa! — Dashboard del maestro',
  description: 'Plataforma educativa gamificada',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen overflow-x-hidden" style={{ background: '#0d0221' }}>
        <SpaceThemeLayout>{children}</SpaceThemeLayout>
      </body>
    </html>
  );
}
