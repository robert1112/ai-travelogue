import type { Metadata } from 'next';
import './globals.css';
import BaseLayout from '@/components/BaseLayout';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Auto-Travelog | AI Travel Journal',
  description: 'AI-powered travel journal generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          <BaseLayout>{children}</BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
