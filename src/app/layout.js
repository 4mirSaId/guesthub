import './globals.css';
import ClientProviders from '../components/ClientProviders';
import AppChrome from '../components/AppChrome';

export const metadata = {
  title: 'GuestHub',
  icons: {
    icon: '/GH.png',
    shortcut: '/GH.png',
    apple: '/GH.png',
  },
  description: 'Welcome to Hotel GuestHub',
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
          <AppChrome>{children}</AppChrome>
        </ClientProviders>
      </body>
    </html>
  );
}