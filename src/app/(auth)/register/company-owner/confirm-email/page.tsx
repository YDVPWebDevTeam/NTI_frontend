'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useConfirmEmailMutation, useLoginMutation } from 'lib/api';

export default function ConfirmCompanyOwnerEmailPage() {
  const router = useRouter();

  const { mutateAsync: confirmEmail, isPending: isConfirmPending } = useConfirmEmailMutation();

  const { mutateAsync: login, isPending: isLoginPending } = useLoginMutation();

  const [token, setToken] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isPending = isConfirmPending || isLoginPending;

  useEffect(() => {
    const email = sessionStorage.getItem('companyOwnerEmail') || '';

    setSavedEmail(email);

    // For local development backend may allow email as token.
    // If backend requires a real token, replace this value manually.
    setToken(email);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    try {
      await confirmEmail({
        token,
      });

      const email = sessionStorage.getItem('companyOwnerEmail');
      const password = sessionStorage.getItem('companyOwnerPassword');

      if (!email || !password) {
        throw new Error('Saved email or password is missing. Please register again.');
      }

      await login({
        email,
        password,
      });

      router.push('/register/company-owner/organization');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Email confirmation failed');
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-950">Confirm email</h1>

          <p className="mt-2 text-sm text-gray-600">
            Enter the verification token from your email. In local development, you can try using
            your email as the token.
          </p>

          {savedEmail && (
            <p className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
              Registered email: {savedEmail}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="mb-1 block text-sm font-medium text-gray-800">
              Verification token
            </label>

            <input
              id="token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste your verification token"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Confirming...' : 'Confirm email'}
          </button>
        </form>
      </section>
    </main>
  );
}
