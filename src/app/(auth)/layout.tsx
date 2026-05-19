import { PublicShell } from 'components/layout';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicShell>{children}</PublicShell>;
}
