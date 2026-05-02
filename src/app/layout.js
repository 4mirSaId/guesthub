import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClientProviders from '../components/ClientProviders';

export const metadata = {
  title: 'Hotel Name App',
  description: 'Welcome to Hotel Name Community',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-slate-950 text-slate-100">
        <ClientProviders>
          <Navbar />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}