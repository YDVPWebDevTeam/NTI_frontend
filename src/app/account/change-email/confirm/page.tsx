import { redirect } from 'next/navigation';

export default async function AccountEmailChangeConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const params = new URLSearchParams();

  if (token?.trim()) {
    params.set('token', token.trim());
  }

  redirect(params.size ? `/account?${params.toString()}` : '/account');
}
