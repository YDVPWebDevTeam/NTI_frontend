import { Footer } from 'components/layout';
import { Header } from 'components/layout';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e7e8eb]">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
