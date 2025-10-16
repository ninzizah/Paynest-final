import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/app-layout';
import { AuthProvider } from '@/hooks/use-auth';
import { ActiveEmployeeProvider } from '@/hooks/use-active-employee';


export const metadata: Metadata = {
  title: 'Paynest HR Simplified',
  description: 'A simple system to help HR control the organization, including payroll and financial services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          <AuthProvider>
            <ActiveEmployeeProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </ActiveEmployeeProvider>
          </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
