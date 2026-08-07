import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QueueFlow Operations Dashboard',
  description: 'Realtime distributed background job monitoring and telemetry platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
