'use client';

import { t } from '@lingui/core/macro';
import type { UseFormReturn } from 'react-hook-form';

import {
  uploadAndCompleteFile,
  useCompleteUploadMutation,
  useRequestUploadUrlMutation,
  useUpdateAcademicInformationMutation,
  useUpdateProfessionalSkillsMutation,
  useUploadToPresignedUrlMutation,
} from 'lib/api';
import type {
  CompleteUploadDto,
  RequestUploadDto,
  UploadUrlResponse,
  UploadedFileResponse,
} from 'lib/api/files/types';

import {
  buildAcademicUpdatePayload,
  buildCompleteProfilePayload,
  buildProfessionalSkillsPayload,
} from './mappers';
import type { StudentRegistrationValues } from './types';

type StudentUploadTarget = {
  fileField: 'academicEvidenceFile' | 'cvFile';
  idField: 'academicEvidenceFileId' | 'cvFileId';
  purpose: 'ACADEMIC_EVIDENCE' | 'CV';
};

type StudentUploadDependencies = {
  requestUploadUrl: (payload: RequestUploadDto) => Promise<UploadUrlResponse>;
  uploadToPresignedUrl: (payload: { uploadUrl: string; file: File }) => Promise<void>;
  completeUpload: (payload: CompleteUploadDto) => Promise<UploadedFileResponse>;
};

async function uploadStudentFile(
  form: UseFormReturn<StudentRegistrationValues>,
  dependencies: StudentUploadDependencies,
  target: StudentUploadTarget,
) {
  const values = form.getValues();
  const selectedFile = values[target.fileField];
  const existingFileId = values[target.idField] || undefined;

  if (!(selectedFile instanceof File)) {
    return existingFileId;
  }

  const uploadedFile = await uploadAndCompleteFile(
    {
      requestUploadUrl: dependencies.requestUploadUrl,
      uploadToPresignedUrl: dependencies.uploadToPresignedUrl,
      completeUpload: dependencies.completeUpload,
    },
    {
      file: selectedFile,
      purpose: target.purpose,
      entityType: 'STUDENT_PROFILE',
    },
  );

  form.setValue(target.idField, uploadedFile.id, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: false,
  });
  form.setValue(target.fileField, null, {
    shouldDirty: true,
    shouldTouch: false,
    shouldValidate: false,
  });

  return uploadedFile.id;
}

export function useStudentProfileSubmit(form: UseFormReturn<StudentRegistrationValues>) {
  const updateAcademic = useUpdateAcademicInformationMutation();
  const updateProfessional = useUpdateProfessionalSkillsMutation();
  const requestUploadUrl = useRequestUploadUrlMutation();
  const uploadToPresignedUrl = useUploadToPresignedUrlMutation();
  const completeUpload = useCompleteUploadMutation();

  const isBusy =
    updateAcademic.isPending ||
    updateProfessional.isPending ||
    requestUploadUrl.isPending ||
    uploadToPresignedUrl.isPending ||
    completeUpload.isPending;

  const submitAcademic = async () => {
    const values = form.getValues();
    const academicEvidenceFileId = await uploadStudentFile(
      form,
      {
        requestUploadUrl: requestUploadUrl.mutateAsync,
        uploadToPresignedUrl: uploadToPresignedUrl.mutateAsync,
        completeUpload: completeUpload.mutateAsync,
      },
      {
        fileField: 'academicEvidenceFile',
        idField: 'academicEvidenceFileId',
        purpose: 'ACADEMIC_EVIDENCE',
      },
    );

    return updateAcademic.mutateAsync(buildAcademicUpdatePayload(values, academicEvidenceFileId));
  };

  const submitProfessional = async () => {
    const values = form.getValues();
    const cvFileId = await uploadStudentFile(
      form,
      {
        requestUploadUrl: requestUploadUrl.mutateAsync,
        uploadToPresignedUrl: uploadToPresignedUrl.mutateAsync,
        completeUpload: completeUpload.mutateAsync,
      },
      {
        fileField: 'cvFile',
        idField: 'cvFileId',
        purpose: 'CV',
      },
    );

    if (!cvFileId) {
      throw new Error(t`CV file is required.`);
    }

    return updateProfessional.mutateAsync(buildProfessionalSkillsPayload(values, cvFileId));
  };

  const buildCompletePayload = () => buildCompleteProfilePayload(form.getValues());

  return {
    submitAcademic,
    submitProfessional,
    buildCompletePayload,
    isBusy,
    isAcademicPending: updateAcademic.isPending,
    isProfessionalPending: updateProfessional.isPending,
  };
}
