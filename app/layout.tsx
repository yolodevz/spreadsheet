import '@/app/globals.css';
import { Montserrat } from 'next/font/google';
import Providers from './providers';

import { cn } from '@/lib/utils';

const montserrat = Montserrat({
  subsets: ['latin'],
});

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'flex min-h-screen flex-col bg-background',
          montserrat.className
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
