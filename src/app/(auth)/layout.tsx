import { Footer } from '@/src/components/layout/footer';
import { Header } from '@/src/components/layout/header';

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
