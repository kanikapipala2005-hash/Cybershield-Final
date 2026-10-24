import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppShell } from '@/components/app-shell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'CyberShield — Indian Phishing & Fraud Detector',
  description:
    'Scan URLs, SMS, emails, and screenshots for phishing and cyber fraud. Built for India — detect SBI YONO, Paytm KYC, electricity bill, UPI lookalike, and part-time job scams. Report incidents and get help from the National Cyber Crime Helpline 1930.',
  keywords: ['phishing', 'cyber fraud', 'India', 'UPI scam', 'Paytm KYC', 'SBI YONO', 'cybercrime', '1930'],
  openGraph: {
    title: 'CyberShield — Indian Phishing & Fraud Detector',
    description: 'Detect phishing and cyber fraud tailored for India. Scan, report, and stay protected.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#060a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
