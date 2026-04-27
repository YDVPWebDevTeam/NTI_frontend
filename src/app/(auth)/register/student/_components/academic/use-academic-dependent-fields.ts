import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useRef } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import {
  useFacultiesByUniversityQuery,
  useSpecializationsByFacultyQuery,
  useUniversitiesQuery,
} from 'lib/api';
import type { StudentRegistrationValues } from '../../schema';

type UseAcademicDependentFieldsArgs = {
  universityId: string;
  facultyId: string;
  hasTransferredSubjects: boolean;
  setValue: UseFormSetValue<StudentRegistrationValues>;
};

export function useAcademicDependentFields({
  universityId,
  facultyId,
  hasTransferredSubjects,
  setValue,
}: UseAcademicDependentFieldsArgs) {
  const previousUniversityIdRef = useRef<string>('');
  const previousFacultyIdRef = useRef<string>('');

  const universitiesQuery = useUniversitiesQuery({ activeOnly: true });
  const facultiesQuery = useFacultiesByUniversityQuery(universityId || undefined);
  const specializationsQuery = useSpecializationsByFacultyQuery(facultyId || undefined);

  useEffect(() => {
    if (
      previousUniversityIdRef.current &&
      universityId &&
      previousUniversityIdRef.current !== universityId
    ) {
      setValue('facultyId', '');
      setValue('specializationId', '');
    }

    if (!universityId) {
      setValue('facultyId', '');
      setValue('specializationId', '');
    }

    previousUniversityIdRef.current = universityId;
  }, [setValue, universityId]);

  useEffect(() => {
    if (previousFacultyIdRef.current && facultyId && previousFacultyIdRef.current !== facultyId) {
      setValue('specializationId', '');
    }

    if (!facultyId) {
      setValue('specializationId', '');
    }

    previousFacultyIdRef.current = facultyId;
  }, [facultyId, setValue]);

  useEffect(() => {
    if (!hasTransferredSubjects) {
      setValue('transferredSubjectsCount', undefined);
    }
  }, [hasTransferredSubjects, setValue]);

  const universities = universitiesQuery.data ?? [];
  const faculties = facultiesQuery.data ?? [];
  const specializations = specializationsQuery.data ?? [];

  const universityPlaceholder = useMemo(() => {
    if (universitiesQuery.isLoading) {
      return t`Loading universities...`;
    }
    if (universities.length === 0) {
      return t`No universities available`;
    }

    return t`Select university`;
  }, [universities.length, universitiesQuery.isLoading]);

  const facultyPlaceholder = useMemo(() => {
    if (!universityId) {
      return t`Select university first`;
    }
    if (facultiesQuery.isLoading) {
      return t`Loading faculties...`;
    }
    if (faculties.length === 0) {
      return t`No faculties available`;
    }

    return t`Select faculty`;
  }, [faculties.length, facultiesQuery.isLoading, universityId]);

  const specializationPlaceholder = useMemo(() => {
    if (!facultyId) {
      return t`Select faculty first`;
    }
    if (specializationsQuery.isLoading) {
      return t`Loading specializations...`;
    }
    if (specializations.length === 0) {
      return t`No specializations available`;
    }

    return t`Select specialization`;
  }, [facultyId, specializations.length, specializationsQuery.isLoading]);

  return {
    universitiesQuery,
    facultiesQuery,
    specializationsQuery,
    universities,
    faculties,
    specializations,
    universityPlaceholder,
    facultyPlaceholder,
    specializationPlaceholder,
  };
}
