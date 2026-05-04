'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useRegisterCompanyOwnerMutation } from 'lib/api';

export default function RegisterCompanyOwnerPage() {
  const router = useRouter();

  const { mutateAsync: registerCompanyOwner, isPending } = useRegisterCompanyOwnerMutation();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    try {
      await registerCompanyOwner({
        email,
        firstName,
        lastName,
        password,
      });

      sessionStorage.setItem('companyOwnerEmail', email);
      sessionStorage.setItem('companyOwnerPassword', password);

      router.push('/register/company-owner/confirm-email');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-950">Register company owner</h1>

          <p className="mt-2 text-sm text-gray-600">
            Create your company owner account to continue with organization registration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-800">
              First name
            </label>

            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="John"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-800">
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Doe"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-800">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="StrongPass123!"
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
            {isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}
