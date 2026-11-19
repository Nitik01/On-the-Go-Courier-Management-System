import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'On-the-Go Courier Management System',
  description:
    'Full-stack courier operations platform with real-time tracking, parcel booking, courier fleet management, and operational administration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
