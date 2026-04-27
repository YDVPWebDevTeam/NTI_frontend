import { t } from '@lingui/core/macro';
import type { Control } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/shadcn';
import type { StudentRegistrationValues } from '../../schema';

type AcademicAffiliationProgramFieldsProps = {
  control: Control<StudentRegistrationValues>;
  universityId: string;
  facultyId: string;
  universities: { id: string; name: string }[];
  faculties: { id: string; name: string }[];
  specializations: { id: string; name: string }[];
  isUniversitiesLoading: boolean;
  isFacultiesLoading: boolean;
  isSpecializationsLoading: boolean;
  universityPlaceholder: string;
  facultyPlaceholder: string;
  specializationPlaceholder: string;
};

export function AcademicAffiliationProgramFields({
  control,
  universityId,
  facultyId,
  universities,
  faculties,
  specializations,
  isUniversitiesLoading,
  isFacultiesLoading,
  isSpecializationsLoading,
  universityPlaceholder,
  facultyPlaceholder,
  specializationPlaceholder,
}: AcademicAffiliationProgramFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="universityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`University`}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger disabled={isUniversitiesLoading || universities.length === 0}>
                  <SelectValue placeholder={universityPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="facultyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Faculty`}</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!universityId || isFacultiesLoading || faculties.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={facultyPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="specializationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Specialization`}</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!facultyId || isSpecializationsLoading || specializations.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={specializationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((specialization) => (
                    <SelectItem key={specialization.id} value={specialization.id}>
                      {specialization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
