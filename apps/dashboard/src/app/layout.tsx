import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QueueFlow Operations Dashboard',
  description: 'Realtime distributed background job monitoring and telemetry platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#09090b] text-zinc-100 antialiased font-sans min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
