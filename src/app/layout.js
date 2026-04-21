import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClientProviders from '../components/ClientProviders';

export const metadata = {
  title: 'Rosa Beach Community',
  description: 'Welcome to Rosa Beach Community',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className="bg-white">
        <ClientProviders>
          <Navbar />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}