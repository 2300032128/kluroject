import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/common/Navbar';

export const metadata: Metadata = {
  title: 'EduAgent AI — AI Teaching Assistant Agent',
  description: 'AI Teaching Assistant Agent platform for students and instructors. RAG grounding, material contradiction scanning, automated escalations, and class analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>EduAgent AI — Built for Hackathon Demo | Grounded via Google Gemini API & 5-Agent Architecture</p>
        </footer>
      </body>
    </html>
  );
}
