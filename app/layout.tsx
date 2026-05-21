import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/nav';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Adobe Target Activity Prep',
  description: 'Guided prep for Adobe Target activities.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Nav />
          <main className="relative flex-1 px-10 py-12">
            <div className="mx-auto max-w-3xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
