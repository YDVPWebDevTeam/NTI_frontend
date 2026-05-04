'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { filesService, uploadAndCompleteFile, useCreateOrganizationMutation } from 'lib/api';

export default function CreateCompanyOwnerOrganizationPage() {
  const router = useRouter();

  const { mutateAsync: createOrganization, isPending } = useCreateOrganizationMutation();

  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setLogoFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    try {
      let logoUrl: string | undefined;

      if (logoFile) {
        const uploadedLogo = await uploadAndCompleteFile(
          {
            requestUploadUrl: (payload) => filesService.requestUploadUrl(payload),
            uploadToPresignedUrl: ({ uploadUrl, file }) =>
              filesService.uploadToPresignedUrl(uploadUrl, file),
            completeUpload: (payload) => filesService.completeUpload(payload),
          },
          {
            file: logoFile,
            purpose: 'organization-logo',
            entityType: 'organization',
          },
        );

        logoUrl = uploadedLogo.publicUrl;
      }
      await createOrganization({
        name,
        ico,
        sector,
        description,
        website,
        logoUrl,
      });

      sessionStorage.removeItem('companyOwnerEmail');
      sessionStorage.removeItem('companyOwnerPassword');

      router.push('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Organization creation failed');
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-950">Create organization</h1>

          <p className="mt-2 text-sm text-gray-600">
            Add basic information about your organization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-800">
              Company name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Test Company"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="ico" className="mb-1 block text-sm font-medium text-gray-800">
              IČO
            </label>

            <input
              id="ico"
              type="text"
              value={ico}
              onChange={(event) => setIco(event.target.value)}
              placeholder="12345678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="sector" className="mb-1 block text-sm font-medium text-gray-800">
              Sector
            </label>

            <input
              id="sector"
              type="text"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              placeholder="IT"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-800">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Software development company."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium text-gray-800">
              Website
            </label>

            <input
              id="website"
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-gray-950"
              required
            />
          </div>

          <div>
            <label htmlFor="logo" className="mb-1 block text-sm font-medium text-gray-800">
              Logo
            </label>

            <input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:font-medium"
            />

            <p className="mt-1 text-xs text-gray-500">PNG, JPG or WEBP. Logo is optional.</p>
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
            {isPending ? 'Creating organization...' : 'Create organization'}
          </button>
        </form>
      </section>
    </main>
  );
}
