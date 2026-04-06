import './globals.css';

export const metadata = {
  title: 'photobooth',
  description: 'Interactive photo booth with custom stickers and filters',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
