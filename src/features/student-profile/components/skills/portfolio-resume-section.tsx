import { t } from '@lingui/core/macro';
import { Download, Loader2 } from 'lucide-react';
import type { Control, UseFormSetValue, UseFormClearErrors } from 'react-hook-form';
import { toast } from 'sonner';

import { ControlledFileField, FormSectionCard } from 'components/forms';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from 'components/shadcn';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { useFilesControllerRequestDownloadUrl } from 'lib/api';
import { FilesControllerRequestDownloadUrlDisposition } from 'lib/api';
import { DOCUMENT_ACCEPT, validateDocumentFile } from 'lib/files/upload-validation';

function CvDownloadLink({ fileId }: { fileId: string }) {
  const downloadQuery = useFilesControllerRequestDownloadUrl(
    fileId,
    { disposition: FilesControllerRequestDownloadUrlDisposition.attachment },
    { query: { enabled: !!fileId } },
  );

  if (downloadQuery.isLoading) {
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t`Loading CV…`}
      </span>
    );
  }

  if (!downloadQuery.data?.downloadUrl) {
    return (
      <p className="text-muted-foreground text-xs">{t`CV on file — replace by uploading a new file.`}</p>
    );
  }

  return (
    <a
      href={downloadQuery.data.downloadUrl}
      download
      className="text-primary inline-flex items-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline"
    >
      <Download className="h-3.5 w-3.5" />
      {t`Download current CV`}
    </a>
  );
}

type PortfolioResumeSectionProps = {
  control: Control<StudentRegistrationValues>;
  setValue: UseFormSetValue<StudentRegistrationValues>;
  clearErrors: UseFormClearErrors<StudentRegistrationValues>;
  selectedCvFile: unknown;
};

export function PortfolioResumeSection({
  control,
  setValue,
  clearErrors,
  selectedCvFile,
}: PortfolioResumeSectionProps) {
  return (
    <FormSectionCard
      title={t`Portfolio & Resume`}
      description={t`Upload your CV and add links to your profiles.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <ControlledFileField
          control={control}
          name="cvFileId"
          className="md:col-span-2"
          label={t`CV File`}
          accept={DOCUMENT_ACCEPT}
          file={selectedCvFile instanceof File ? selectedCvFile : null}
          onFileChange={(file) => {
            if (!file) {
              return;
            }

            const validation = validateDocumentFile(file);

            if (!validation.ok) {
              toast.error(validation.message);

              return;
            }

            setValue('cvFileId', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: false,
            });
            setValue('cvFile', file, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            clearErrors('cvFileId');
          }}
          buttonLabel={t`Browse file`}
          placeholder={t`Choose your CV`}
          renderStatus={(field) => (field.value ? <CvDownloadLink fileId={field.value} /> : null)}
        />

        <FormField
          control={control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`GitHub Profile`}</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`LinkedIn Profile`}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t`Personal Portfolio / Website`}</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
