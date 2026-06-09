'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getOrganizationDocumentsControllerListDocumentsQueryKey,
  useOrganizationDocumentsControllerCompleteUpload,
  useOrganizationDocumentsControllerCreateUpload,
  useOrganizationDocumentsControllerListDocuments,
  organizationDocumentsControllerRequestDownload,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { uploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
import { DOCUMENT_ACCEPT, validateDocumentFile } from 'lib/files/upload-validation';
import { ControlledInputField } from 'components/forms';
import {
  Form,
  Button,
  FileInput,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import {
  OrganizationEmptyState,
  OrganizationErrorState,
  OrganizationLoadingState,
  OrganizationSectionCard,
} from './organization-workspace-primitives';
import {
  createOrganizationDocumentUploadSchema,
  type OrganizationDocumentUploadFormValues,
} from '../lib/schemas';

const DEFAULT_MIME_TYPE = 'application/octet-stream';
const BYTES_IN_KILOBYTE = 1024;
const FORBIDDEN_STATUS = 403;

interface OrganizationDocument {
  id: string;
  name: string;
  version: number | string;
  documentType: string;
  status: string;
  sizeBytes: number;
  uploadedAt?: string | null;
}

interface OrganizationDocumentDownloadResult {
  downloadUrl: string;
}

interface OrganizationDocumentUploadTicket {
  uploadUrl: string;
  documentId: string;
}

function getOrganizationDocumentsErrorMessage(error: unknown) {
  if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
    return t`You can’t upload this file right now. Check that your account is active and that the file is a PDF or DOCX.`;
  }

  return error instanceof Error ? error.message : t`Unable to upload document.`;
}

export function OrganizationDocumentsSection({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null);

  const documentsQuery = useOrganizationDocumentsControllerListDocuments(organizationId, {
    query: {
      enabled: Boolean(organizationId),
    },
  });
  const createUpload = useOrganizationDocumentsControllerCreateUpload();
  const completeUpload = useOrganizationDocumentsControllerCompleteUpload();

  const form = useForm<OrganizationDocumentUploadFormValues>({
    resolver: zodResolver(
      createOrganizationDocumentUploadSchema(),
    ) as Resolver<OrganizationDocumentUploadFormValues>,
    defaultValues: {
      name: '',
      documentType: '',
      file: null,
    },
    mode: 'onChange',
  });

  const selectedFile = form.watch('file');
  const documents = useMemo(
    () => (documentsQuery.data as unknown as OrganizationDocument[] | undefined) ?? [],
    [documentsQuery.data],
  );

  const refreshDocuments = async () => {
    await queryClient.invalidateQueries({
      queryKey: getOrganizationDocumentsControllerListDocumentsQueryKey(organizationId),
    });
  };

  const handleUpload = async (values: OrganizationDocumentUploadFormValues) => {
    if (!(values.file instanceof File)) {
      form.setError('file', {
        message: t`Please choose a file to upload.`,
      });

      return;
    }

    const fileValidation = validateDocumentFile(values.file);

    if (!fileValidation.ok) {
      form.setError('file', { message: fileValidation.message });

      return;
    }

    try {
      const uploadTicket = (await createUpload.mutateAsync({
        id: organizationId,
        data: {
          name: values.name.trim(),
          documentType: values.documentType.trim(),
          mimeType: values.file.type || DEFAULT_MIME_TYPE,
          sizeBytes: values.file.size,
        },
      })) as unknown as OrganizationDocumentUploadTicket;

      await uploadToPresignedUrl({
        uploadUrl: uploadTicket.uploadUrl,
        file: values.file,
      });

      await completeUpload.mutateAsync({
        id: organizationId,
        docId: uploadTicket.documentId,
        data: {
          sizeBytes: values.file.size,
        },
      });

      toast.success(t`Document uploaded.`);
      form.reset({
        name: '',
        documentType: '',
        file: null,
      });
      await refreshDocuments();
    } catch (error) {
      toast.error(getOrganizationDocumentsErrorMessage(error));
    }
  };

  const handleDownload = async (documentId: string) => {
    setDownloadingDocumentId(documentId);

    try {
      const result = (await organizationDocumentsControllerRequestDownload(
        organizationId,
        documentId,
      )) as unknown as OrganizationDocumentDownloadResult;

      // window.open after an await is frequently blocked by popup blockers because it
      // is no longer tied to the original user gesture. Detect the null return and
      // fall back to navigating the current tab so the download still starts.
      const popup = window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');

      if (!popup) {
        window.location.href = result.downloadUrl;
      }
    } catch (error) {
      let message = t`Unable to download document.`;

      if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
        message = t`You don’t have access to download this document right now.`;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const isUploading = createUpload.isPending || completeUpload.isPending;

  return (
    <OrganizationSectionCard
      title={t`Documents`}
      description={t`Store important organization files here and download them whenever you need them.`}
      badge={t`Owner only`}
    >
      <div className="space-y-6">
        <Form {...form}>
          <form
            className="border-border bg-muted space-y-4 rounded-2xl border p-5"
            onSubmit={form.handleSubmit(handleUpload)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ControlledInputField
                control={form.control}
                name="name"
                label={t`Document name`}
                placeholder={t`Technical specification`}
                startIcon={<FileText className="h-4 w-4" />}
              />

              <ControlledInputField
                control={form.control}
                name="documentType"
                label={t`Document type`}
                placeholder={t`Contract`}
              />
            </div>

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>{t`File`}</FormLabel>
                  <FormControl>
                    <FileInput
                      id="organization-document-file"
                      file={selectedFile instanceof File ? selectedFile : null}
                      onFileChange={(file) =>
                        form.setValue('file', file, { shouldDirty: true, shouldValidate: true })
                      }
                      accept={DOCUMENT_ACCEPT}
                      disabled={isUploading}
                      placeholder={t`Choose a document file`}
                      buttonLabel={t`Browse file`}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-sm leading-6">
                    {t`Accepted formats: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP.`}
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading || !form.formState.isValid}>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? t`Uploading document…` : t`Upload document`}
              </Button>
            </div>
          </form>
        </Form>

        {documentsQuery.isLoading ? (
          <OrganizationLoadingState label={t`Loading documents…`} />
        ) : null}

        {documentsQuery.isError ? (
          <OrganizationErrorState
            title={t`Unable to load documents`}
            description={
              isApiRequestError(documentsQuery.error) &&
              documentsQuery.error.status === FORBIDDEN_STATUS
                ? t`Documents aren't available for this account yet.`
                : t`We couldn’t load your documents right now.`
            }
            onRetry={() => void documentsQuery.refetch()}
          />
        ) : null}

        {!documentsQuery.isLoading && !documentsQuery.isError && documents.length === 0 ? (
          <OrganizationEmptyState
            title={t`No documents uploaded yet`}
            description={t`Upload your first document to start building your shared file library.`}
          />
        ) : null}

        {!documentsQuery.isLoading && !documentsQuery.isError ? (
          <div className="space-y-3">
            {documents.map((document) => {
              const isDownloading = downloadingDocumentId === document.id;

              return (
                <div
                  key={document.id}
                  className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-base font-semibold">{document.name}</p>
                      <span className="bg-accent text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                        {`v${document.version}`}
                      </span>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span>
                        {t`Type`}: {document.documentType}
                      </span>
                      <span>
                        {t`Status`}: {formatEnumLabel(document.status)}
                      </span>
                      <span>
                        {t`Size`}: {(document.sizeBytes / BYTES_IN_KILOBYTE).toFixed(1)} KB
                      </span>
                      <span>
                        {t`Uploaded`}:{' '}
                        {document.uploadedAt
                          ? new Date(document.uploadedAt).toLocaleDateString()
                          : t`Pending`}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDownloading}
                    onClick={() => void handleDownload(document.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? t`Preparing download…` : t`Download`}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </OrganizationSectionCard>
  );
}
