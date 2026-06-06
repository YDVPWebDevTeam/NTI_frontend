'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Lock, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  CreateOrganizationDocumentUploadDtoVisibility,
  getOrganizationDocumentsControllerListDocumentsQueryKey,
  useOrganizationDocumentsControllerCompleteUploadCompat,
  useOrganizationDocumentsControllerCreateUploadCompat,
  useOrganizationDocumentsControllerListDocumentsCompat,
  organizationDocumentsControllerRequestDownloadCompat,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { uploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
const ORGANIZATION_DOCUMENT_ACCEPT =
  '.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const FORBIDDEN_STATUS = 403;

function getOrganizationDocumentsErrorMessage(error: unknown) {
  if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
    return t`You can’t upload this file right now. Check that your account is active and that the file is a PDF or DOCX.`;
  }

  return error instanceof Error ? error.message : t`Unable to upload document.`;
}

export function OrganizationDocumentsSection({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null);

  const documentsQuery = useOrganizationDocumentsControllerListDocumentsCompat(organizationId, {
    query: {
      enabled: Boolean(organizationId),
    },
  });
  const createUpload = useOrganizationDocumentsControllerCreateUploadCompat();
  const completeUpload = useOrganizationDocumentsControllerCompleteUploadCompat();

  const form = useForm<OrganizationDocumentUploadFormValues>({
    resolver: zodResolver(
      createOrganizationDocumentUploadSchema(),
    ) as Resolver<OrganizationDocumentUploadFormValues>,
    defaultValues: {
      name: '',
      documentType: '',
      visibility: CreateOrganizationDocumentUploadDtoVisibility.INTERNAL,
      file: null,
    },
    mode: 'onChange',
  });

  const selectedFile = form.watch('file');
  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

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

    try {
      const uploadTicket = await createUpload.mutateAsync({
        id: organizationId,
        data: {
          name: values.name.trim(),
          documentType: values.documentType.trim(),
          mimeType: values.file.type || DEFAULT_MIME_TYPE,
          sizeBytes: values.file.size,
          visibility: values.visibility,
        },
      });

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
        visibility: CreateOrganizationDocumentUploadDtoVisibility.INTERNAL,
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
      const result = await organizationDocumentsControllerRequestDownloadCompat(
        organizationId,
        documentId,
      );

      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
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
            className="space-y-4 rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
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

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
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
                        accept={ORGANIZATION_DOCUMENT_ACCEPT}
                        disabled={isUploading}
                        placeholder={t`Choose a document file`}
                        buttonLabel={t`Browse file`}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm leading-6 text-[#60718d]">
                      {t`Accepted formats: PDF and DOCX.`}
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Visibility`}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CreateOrganizationDocumentUploadDtoVisibility.INTERNAL}>
                          {t`Internal`}
                        </SelectItem>
                        <SelectItem
                          value={CreateOrganizationDocumentUploadDtoVisibility.CONFIDENTIAL}
                        >
                          {t`Confidential`}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm leading-6 text-[#60718d]">
                      {t`Choose who this document should be visible to.`}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-[#dfe7fa] bg-white p-5 shadow-[0_8px_20px_rgba(19,27,46,0.04)] lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[#10213d]">{document.name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#1f56c2]">
                        {`v${document.version}`}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#5f6f8a]">
                        <Lock className="h-3.5 w-3.5" />
                        {formatEnumLabel(document.visibility)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#60718d]">
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
