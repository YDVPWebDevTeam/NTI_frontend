'use client';

import { t } from '@lingui/core/macro';
import type { UseFormReturn } from 'react-hook-form';

import {
  useFilesControllerCompleteUpload,
  useFilesControllerRequestUploadUrl,
  useUpdateMyStudentAcademicInformation,
  useUpdateMyStudentProfessionalSkills,
  type FilesControllerCompleteUploadMutationBody,
  type FilesControllerCompleteUploadMutationResult,
  type FilesControllerRequestUploadUrlMutationBody,
  type FilesControllerRequestUploadUrlMutationResult,
} from 'lib/api';
import {
  uploadAndCompleteFile,
  useUploadToPresignedUrl as useUploadToPresignedUrlMutation,
} from 'lib/api-client/openapi-runtime/file-upload';

import { buildAcademicUpdatePayload, buildProfessionalSkillsPayload } from './mappers';
import type { StudentRegistrationValues } from './types';

type StudentUploadTarget = {
  fileField: 'academicEvidenceFile' | 'cvFile';
  idField: 'academicEvidenceFileId' | 'cvFileId';
  purpose: 'ACADEMIC_EVIDENCE' | 'CV';
};

type StudentUploadDependencies = {
  requestUploadUrl: (
    payload: FilesControllerRequestUploadUrlMutationBody,
  ) => Promise<FilesControllerRequestUploadUrlMutationResult>;
  uploadToPresignedUrl: (payload: { uploadUrl: string; file: File }) => Promise<void>;
  completeUpload: (
    payload: FilesControllerCompleteUploadMutationBody,
  ) => Promise<FilesControllerCompleteUploadMutationResult>;
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
  const updateAcademic = useUpdateMyStudentAcademicInformation();
  const updateProfessional = useUpdateMyStudentProfessionalSkills();
  const requestUploadUrl = useFilesControllerRequestUploadUrl();
  const uploadToPresignedUrl = useUploadToPresignedUrlMutation();
  const completeUpload = useFilesControllerCompleteUpload();

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
        requestUploadUrl: (payload) => requestUploadUrl.mutateAsync({ data: payload }),
        uploadToPresignedUrl: uploadToPresignedUrl.mutateAsync,
        completeUpload: (payload) => completeUpload.mutateAsync({ data: payload }),
      },
      {
        fileField: 'academicEvidenceFile',
        idField: 'academicEvidenceFileId',
        purpose: 'ACADEMIC_EVIDENCE',
      },
    );

    return updateAcademic.mutateAsync({
      data: buildAcademicUpdatePayload(values, academicEvidenceFileId),
    });
  };

  const submitProfessional = async () => {
    const values = form.getValues();
    const cvFileId = await uploadStudentFile(
      form,
      {
        requestUploadUrl: (payload) => requestUploadUrl.mutateAsync({ data: payload }),
        uploadToPresignedUrl: uploadToPresignedUrl.mutateAsync,
        completeUpload: (payload) => completeUpload.mutateAsync({ data: payload }),
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

    return updateProfessional.mutateAsync({
      data: buildProfessionalSkillsPayload(values, cvFileId),
    });
  };

  return {
    submitAcademic,
    submitProfessional,
    isBusy,
    isAcademicPending: updateAcademic.isPending,
    isProfessionalPending: updateProfessional.isPending,
  };
}
