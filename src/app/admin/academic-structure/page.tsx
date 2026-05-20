'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookOpenText,
  Building2,
  GraduationCap,
  PencilLine,
  Plus,
  School,
  Trash2,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminStatCard,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  useHandleAdminSessionFailure,
} from 'components/admin';
import { ControlledInputField } from 'components/forms';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'components/shadcn';
import {
  facultyFormSchema,
  specializationFormSchema,
  universityFormSchema,
  useAdminFaculties,
  useAdminSpecializations,
  useAdminUniversities,
  useCreateFaculty,
  useCreateSpecialization,
  useCreateUniversity,
  useDeleteFaculty,
  useDeleteSpecialization,
  useDeleteUniversity,
  useUpdateFaculty,
  useUpdateSpecialization,
  useUpdateUniversity,
  type AdminFacultyDto,
  type AdminSpecializationDto,
  type AdminUniversityDto,
  type FacultyFormSchema,
  type SpecializationFormSchema,
  type UniversityFormSchema,
} from 'lib/api-client/admin/academic-structure';
import { cn } from 'lib/utils';

const UNIVERSITY_FORM_DEFAULTS: UniversityFormSchema = {
  name: '',
  shortName: undefined,
  website: undefined,
  city: undefined,
  country: undefined,
  isActive: true,
};

const FACULTY_FORM_DEFAULTS: FacultyFormSchema = {
  name: '',
  shortName: undefined,
  isActive: true,
};

const SPECIALIZATION_FORM_DEFAULTS: SpecializationFormSchema = {
  name: '',
  code: undefined,
  degreeLabel: undefined,
  isActive: true,
};

function toOptionalString(value?: string) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function toUniversityPayload(values: UniversityFormSchema): UniversityFormSchema {
  return {
    name: values.name.trim(),
    shortName: toOptionalString(values.shortName),
    website: toOptionalString(values.website),
    city: toOptionalString(values.city),
    country: toOptionalString(values.country),
    isActive: values.isActive,
  };
}

function toFacultyPayload(values: FacultyFormSchema): FacultyFormSchema {
  return {
    name: values.name.trim(),
    shortName: toOptionalString(values.shortName),
    isActive: values.isActive,
  };
}

function toSpecializationPayload(values: SpecializationFormSchema): SpecializationFormSchema {
  return {
    name: values.name.trim(),
    code: toOptionalString(values.code),
    degreeLabel: toOptionalString(values.degreeLabel),
    isActive: values.isActive,
  };
}

function matchesSearch(search: string, values: Array<string | undefined | null>) {
  const normalizedSearch = search.trim().toLowerCase();

  if (normalizedSearch.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalizedSearch));
}

function ActiveStateBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase',
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-600',
      )}
    >
      {isActive ? t`Active` : t`Inactive`}
    </Badge>
  );
}

function ActiveCheckboxField<TValues extends { isActive: boolean }>({
  control,
}: {
  control: Control<TValues>;
}) {
  return (
    <FormField
      control={control}
      name={'isActive' as never}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              className="mt-0.5"
            />
          </FormControl>
          <div className="space-y-1">
            <FormLabel className="text-sm font-medium text-slate-900">{t`Record is active`}</FormLabel>
            <p className="text-sm text-slate-600">
              {t`Use this for soft disabling. Delete only when the record is truly obsolete.`}
            </p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

function SectionSearch({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
        {label}
      </label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 bg-white"
      />
    </div>
  );
}

function SectionHint({ title, description }: { title: string; description: string }) {
  return <AdminEmptyState title={title} description={description} />;
}

export default function AdminAcademicStructurePage() {
  const handleSessionFailure = useHandleAdminSessionFailure();
  const [universitySearch, setUniversitySearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [editingUniversityId, setEditingUniversityId] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<string | null>(null);
  const [editingSpecializationId, setEditingSpecializationId] = useState<string | null>(null);

  const universitiesQuery = useAdminUniversities({
    search: universitySearch.trim() || undefined,
    includeInactive,
  });
  const createUniversityMutation = useCreateUniversity();
  const updateUniversityMutation = useUpdateUniversity();
  const deleteUniversityMutation = useDeleteUniversity();

  const facultiesQuery = useAdminFaculties(selectedUniversityId ?? '', includeInactive);
  const createFacultyMutation = useCreateFaculty();
  const updateFacultyMutation = useUpdateFaculty();
  const deleteFacultyMutation = useDeleteFaculty();

  const specializationsQuery = useAdminSpecializations(selectedFacultyId ?? '', includeInactive);
  const createSpecializationMutation = useCreateSpecialization();
  const updateSpecializationMutation = useUpdateSpecialization();
  const deleteSpecializationMutation = useDeleteSpecialization();

  const universityForm = useForm<UniversityFormSchema>({
    resolver: zodResolver(universityFormSchema),
    defaultValues: UNIVERSITY_FORM_DEFAULTS,
    mode: 'onChange',
  });
  const facultyForm = useForm<FacultyFormSchema>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: FACULTY_FORM_DEFAULTS,
    mode: 'onChange',
  });
  const specializationForm = useForm<SpecializationFormSchema>({
    resolver: zodResolver(specializationFormSchema),
    defaultValues: SPECIALIZATION_FORM_DEFAULTS,
    mode: 'onChange',
  });

  const universities = universitiesQuery.data ?? [];
  const selectedUniversity =
    universities.find((university) => university.id === selectedUniversityId) ?? null;
  const editingUniversity =
    universities.find((university) => university.id === editingUniversityId) ?? null;

  const faculties = (facultiesQuery.data ?? []).filter((faculty) =>
    matchesSearch(facultySearch, [faculty.name, faculty.shortName, faculty.id]),
  );
  const selectedFaculty = faculties.find((faculty) => faculty.id === selectedFacultyId) ?? null;
  const editingFaculty = faculties.find((faculty) => faculty.id === editingFacultyId) ?? null;

  const specializations = (specializationsQuery.data ?? []).filter((specialization) =>
    matchesSearch(specializationSearch, [
      specialization.name,
      specialization.code,
      specialization.degreeLabel,
      specialization.id,
    ]),
  );
  const editingSpecialization =
    specializations.find((specialization) => specialization.id === editingSpecializationId) ?? null;

  useEffect(() => {
    if (
      selectedUniversityId &&
      !universities.some((university) => university.id === selectedUniversityId)
    ) {
      setSelectedUniversityId(null);
      setEditingUniversityId(null);
      setSelectedFacultyId(null);
      setEditingFacultyId(null);
      setSelectedSpecializationId(null);
      setEditingSpecializationId(null);
    }
  }, [selectedUniversityId, universities]);

  useEffect(() => {
    if (
      editingUniversityId &&
      !universities.some((university) => university.id === editingUniversityId)
    ) {
      setEditingUniversityId(null);
    }
  }, [editingUniversityId, universities]);

  useEffect(() => {
    if (selectedFacultyId && !faculties.some((faculty) => faculty.id === selectedFacultyId)) {
      setSelectedFacultyId(null);
      setEditingFacultyId(null);
      setSelectedSpecializationId(null);
      setEditingSpecializationId(null);
    }
  }, [selectedFacultyId, faculties]);

  useEffect(() => {
    if (editingFacultyId && !faculties.some((faculty) => faculty.id === editingFacultyId)) {
      setEditingFacultyId(null);
    }
  }, [editingFacultyId, faculties]);

  useEffect(() => {
    if (
      selectedSpecializationId &&
      !specializations.some((specialization) => specialization.id === selectedSpecializationId)
    ) {
      setSelectedSpecializationId(null);
      setEditingSpecializationId(null);
    }
  }, [selectedSpecializationId, specializations]);

  useEffect(() => {
    if (
      editingSpecializationId &&
      !specializations.some((specialization) => specialization.id === editingSpecializationId)
    ) {
      setEditingSpecializationId(null);
    }
  }, [editingSpecializationId, specializations]);

  useEffect(() => {
    universityForm.reset(
      editingUniversity
        ? {
            name: editingUniversity.name,
            shortName: editingUniversity.shortName,
            website: editingUniversity.website,
            city: editingUniversity.city,
            country: editingUniversity.country,
            isActive: editingUniversity.isActive,
          }
        : UNIVERSITY_FORM_DEFAULTS,
    );
  }, [editingUniversity, universityForm]);

  useEffect(() => {
    facultyForm.reset(
      editingFaculty
        ? {
            name: editingFaculty.name,
            shortName: editingFaculty.shortName,
            isActive: editingFaculty.isActive,
          }
        : FACULTY_FORM_DEFAULTS,
    );
  }, [editingFaculty, facultyForm]);

  useEffect(() => {
    specializationForm.reset(
      editingSpecialization
        ? {
            name: editingSpecialization.name,
            code: editingSpecialization.code,
            degreeLabel: editingSpecialization.degreeLabel,
            isActive: editingSpecialization.isActive,
          }
        : SPECIALIZATION_FORM_DEFAULTS,
    );
  }, [editingSpecialization, specializationForm]);

  if (universitiesQuery.isLoading) {
    return <AdminLoadingState label={t`Loading academic structure...`} />;
  }

  if (universitiesQuery.isError) {
    return (
      <AdminErrorState
        title={t`Academic structure is unavailable`}
        description={t`The university directory could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void universitiesQuery.refetch()}
      />
    );
  }

  const handleUniversitySubmit = async (values: UniversityFormSchema) => {
    const payload = toUniversityPayload(values);

    try {
      if (editingUniversityId) {
        const updated = await updateUniversityMutation.mutateAsync({
          id: editingUniversityId,
          payload,
        });

        setSelectedUniversityId(updated.id);
        setEditingUniversityId(updated.id);
        toast.success(t`University updated.`);

        return;
      }

      const created = await createUniversityMutation.mutateAsync(payload);

      setSelectedUniversityId(created.id);
      setEditingUniversityId(created.id);
      toast.success(t`University created.`);
    } catch (error) {
      await handleSessionFailure(error, t`Unable to save the university.`);
    }
  };

  const handleFacultySubmit = async (values: FacultyFormSchema) => {
    if (!selectedUniversityId) {
      return;
    }

    const payload = toFacultyPayload(values);

    try {
      if (editingFacultyId) {
        const updated = await updateFacultyMutation.mutateAsync({
          id: editingFacultyId,
          payload,
        });

        setSelectedFacultyId(updated.id);
        setEditingFacultyId(updated.id);
        toast.success(t`Faculty updated.`);

        return;
      }

      const created = await createFacultyMutation.mutateAsync({
        universityId: selectedUniversityId,
        ...payload,
      });

      setSelectedFacultyId(created.id);
      setEditingFacultyId(created.id);
      toast.success(t`Faculty created.`);
    } catch (error) {
      await handleSessionFailure(error, t`Unable to save the faculty.`);
    }
  };

  const handleSpecializationSubmit = async (values: SpecializationFormSchema) => {
    if (!selectedFacultyId) {
      return;
    }

    const payload = toSpecializationPayload(values);

    try {
      if (editingSpecializationId) {
        const updated = await updateSpecializationMutation.mutateAsync({
          id: editingSpecializationId,
          payload,
        });

        setSelectedSpecializationId(updated.id);
        setEditingSpecializationId(updated.id);
        toast.success(t`Specialization updated.`);

        return;
      }

      const created = await createSpecializationMutation.mutateAsync({
        facultyId: selectedFacultyId,
        ...payload,
      });

      setSelectedSpecializationId(created.id);
      setEditingSpecializationId(created.id);
      toast.success(t`Specialization created.`);
    } catch (error) {
      await handleSessionFailure(error, t`Unable to save the specialization.`);
    }
  };

  const handleUniversitySelection = (university: AdminUniversityDto) => {
    setSelectedUniversityId(university.id);
    setEditingUniversityId(university.id);
    setSelectedFacultyId(null);
    setEditingFacultyId(null);
    setSelectedSpecializationId(null);
    setEditingSpecializationId(null);
  };

  const handleFacultySelection = (faculty: AdminFacultyDto) => {
    setSelectedFacultyId(faculty.id);
    setEditingFacultyId(faculty.id);
    setSelectedSpecializationId(null);
    setEditingSpecializationId(null);
  };

  const handleSpecializationSelection = (specialization: AdminSpecializationDto) => {
    setSelectedSpecializationId(specialization.id);
    setEditingSpecializationId(specialization.id);
  };

  const isSavingUniversity =
    createUniversityMutation.isPending || updateUniversityMutation.isPending;
  let universitySubmitLabel = t`Create University`;

  if (isSavingUniversity) {
    universitySubmitLabel = t`Saving...`;
  } else if (editingUniversityId) {
    universitySubmitLabel = t`Update University`;
  }

  const isSavingFaculty = createFacultyMutation.isPending || updateFacultyMutation.isPending;
  let facultySubmitLabel = t`Create Faculty`;

  if (isSavingFaculty) {
    facultySubmitLabel = t`Saving...`;
  } else if (editingFacultyId) {
    facultySubmitLabel = t`Update Faculty`;
  }

  const isSavingSpecialization =
    createSpecializationMutation.isPending || updateSpecializationMutation.isPending;
  let specializationSubmitLabel = t`Create Specialization`;

  if (isSavingSpecialization) {
    specializationSubmitLabel = t`Saving...`;
  } else if (editingSpecializationId) {
    specializationSubmitLabel = t`Update Specialization`;
  }

  let facultySectionContent: ReactNode;

  if (selectedUniversity) {
    if (facultiesQuery.isLoading) {
      facultySectionContent = <AdminLoadingState label={t`Loading faculties...`} />;
    } else if (facultiesQuery.isError) {
      facultySectionContent = (
        <AdminErrorState
          title={t`Faculties are unavailable`}
          description={t`The selected university faculty list could not be loaded.`}
          actionLabel={t`Retry`}
          onAction={() => void facultiesQuery.refetch()}
        />
      );
    } else if (faculties.length === 0) {
      facultySectionContent = (
        <SectionHint
          title={t`No faculties found`}
          description={t`Create the first faculty for this university or adjust the local filter.`}
        />
      );
    } else {
      facultySectionContent = (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>{t`Faculty`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`University`}</AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>
          <AdminTableBody>
            {faculties.map((faculty) => {
              const isUpdatingFaculty =
                updateFacultyMutation.isPending &&
                updateFacultyMutation.variables?.id === faculty.id;
              const isDeletingFaculty =
                deleteFacultyMutation.isPending && deleteFacultyMutation.variables === faculty.id;
              const isSelected = selectedFacultyId === faculty.id;
              const facultyToggleSuccessMessage = faculty.isActive
                ? t`Faculty deactivated.`
                : t`Faculty reactivated.`;
              let facultyToggleActionLabel = t`Enable`;

              if (isUpdatingFaculty) {
                facultyToggleActionLabel = t`Saving...`;
              } else if (faculty.isActive) {
                facultyToggleActionLabel = t`Disable`;
              }

              return (
                <AdminTableRow key={faculty.id} className={cn(isSelected && 'bg-sky-50/70')}>
                  <AdminTableCell>
                    <div className="font-medium text-slate-950">{faculty.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {faculty.shortName || t`No short name`}
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-400">{faculty.id}</div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <ActiveStateBadge isActive={faculty.isActive} />
                  </AdminTableCell>
                  <AdminTableCell>{selectedUniversity.name}</AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleFacultySelection(faculty)}
                      >
                        {isSelected ? t`Selected` : t`Manage`}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isUpdatingFaculty || isDeletingFaculty}
                        onClick={() =>
                          updateFacultyMutation
                            .mutateAsync({
                              id: faculty.id,
                              payload: { isActive: !faculty.isActive },
                            })
                            .then(() => toast.success(facultyToggleSuccessMessage))
                            .catch((error) =>
                              handleSessionFailure(error, t`Unable to update the faculty.`),
                            )
                        }
                      >
                        {facultyToggleActionLabel}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        disabled={isUpdatingFaculty || isDeletingFaculty}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete faculty "${faculty.name}"? This can fail if it is still referenced.`,
                            )
                          ) {
                            return;
                          }

                          deleteFacultyMutation
                            .mutateAsync(faculty.id)
                            .then(() => {
                              if (selectedFacultyId === faculty.id) {
                                setSelectedFacultyId(null);
                                setEditingFacultyId(null);
                                setSelectedSpecializationId(null);
                                setEditingSpecializationId(null);
                              }

                              toast.success(t`Faculty deleted.`);
                            })
                            .catch((error) =>
                              handleSessionFailure(error, t`Unable to delete the faculty.`),
                            );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeletingFaculty ? t`Deleting...` : t`Delete`}
                      </Button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      );
    }
  } else {
    facultySectionContent = (
      <SectionHint
        title={t`Choose a university first`}
        description={t`Faculty management depends on the currently selected university.`}
      />
    );
  }

  let specializationSectionContent: ReactNode;

  if (selectedFaculty) {
    if (specializationsQuery.isLoading) {
      specializationSectionContent = <AdminLoadingState label={t`Loading specializations...`} />;
    } else if (specializationsQuery.isError) {
      specializationSectionContent = (
        <AdminErrorState
          title={t`Specializations are unavailable`}
          description={t`The selected faculty specialization list could not be loaded.`}
          actionLabel={t`Retry`}
          onAction={() => void specializationsQuery.refetch()}
        />
      );
    } else if (specializations.length === 0) {
      specializationSectionContent = (
        <SectionHint
          title={t`No specializations found`}
          description={t`Create the first specialization for this faculty or adjust the local filter.`}
        />
      );
    } else {
      specializationSectionContent = (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>{t`Specialization`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Degree / Code`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>
          <AdminTableBody>
            {specializations.map((specialization) => {
              const isUpdatingSpecialization =
                updateSpecializationMutation.isPending &&
                updateSpecializationMutation.variables?.id === specialization.id;
              const isDeletingSpecialization =
                deleteSpecializationMutation.isPending &&
                deleteSpecializationMutation.variables === specialization.id;
              const isSelected = selectedSpecializationId === specialization.id;
              const specializationToggleSuccessMessage = specialization.isActive
                ? t`Specialization deactivated.`
                : t`Specialization reactivated.`;
              let specializationToggleActionLabel = t`Enable`;

              if (isUpdatingSpecialization) {
                specializationToggleActionLabel = t`Saving...`;
              } else if (specialization.isActive) {
                specializationToggleActionLabel = t`Disable`;
              }

              return (
                <AdminTableRow key={specialization.id} className={cn(isSelected && 'bg-sky-50/70')}>
                  <AdminTableCell>
                    <div className="font-medium text-slate-950">{specialization.name}</div>
                    <div className="mt-1 font-mono text-xs text-slate-400">{specialization.id}</div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div>{specialization.degreeLabel || t`No degree label`}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {specialization.code || t`No code`}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <ActiveStateBadge isActive={specialization.isActive} />
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSpecializationSelection(specialization)}
                      >
                        {isSelected ? t`Selected` : t`Manage`}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isUpdatingSpecialization || isDeletingSpecialization}
                        onClick={() =>
                          updateSpecializationMutation
                            .mutateAsync({
                              id: specialization.id,
                              payload: { isActive: !specialization.isActive },
                            })
                            .then(() => toast.success(specializationToggleSuccessMessage))
                            .catch((error) =>
                              handleSessionFailure(error, t`Unable to update the specialization.`),
                            )
                        }
                      >
                        {specializationToggleActionLabel}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        disabled={isUpdatingSpecialization || isDeletingSpecialization}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete specialization "${specialization.name}"? This can fail if it is still referenced.`,
                            )
                          ) {
                            return;
                          }

                          deleteSpecializationMutation
                            .mutateAsync(specialization.id)
                            .then(() => {
                              if (selectedSpecializationId === specialization.id) {
                                setSelectedSpecializationId(null);
                                setEditingSpecializationId(null);
                              }

                              toast.success(t`Specialization deleted.`);
                            })
                            .catch((error) =>
                              handleSessionFailure(error, t`Unable to delete the specialization.`),
                            );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeletingSpecialization ? t`Deleting...` : t`Delete`}
                      </Button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      );
    }
  } else {
    specializationSectionContent = (
      <SectionHint
        title={t`Choose a faculty first`}
        description={t`Specialization management depends on the currently selected faculty.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={t`Universities`}
          value={universities.length}
          description={t`Top-level academic institutions currently visible in the directory.`}
          icon={<Building2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Faculties`}
          value={facultiesQuery.data?.length ?? 0}
          description={
            selectedUniversity
              ? t`${selectedUniversity.name} is currently selected.`
              : t`Select a university to inspect its faculties.`
          }
          icon={<School className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Specializations`}
          value={specializationsQuery.data?.length ?? 0}
          description={
            selectedFaculty
              ? t`${selectedFaculty.name} is currently selected.`
              : t`Select a faculty to inspect its specializations.`
          }
          icon={<BookOpenText className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Inactive Included`}
          value={includeInactive ? t`Yes` : t`No`}
          description={t`Soft-disabled rows remain manageable when this filter is turned on.`}
          icon={<GraduationCap className="h-5 w-5" />}
        />
      </section>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">{t`Directory Controls`}</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            {t`Use the backend search for universities, then manage dependent faculties and specializations from the selected branch. Prefer deactivating records before attempting deletion.`}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <SectionSearch
            label={t`University Search`}
            value={universitySearch}
            onChange={setUniversitySearch}
            placeholder={t`Search universities by name, short name, city, or country`}
          />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="flex items-start gap-3">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(checked) => setIncludeInactive(Boolean(checked))}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{t`Include inactive records`}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  {t`Deleted rows may be restricted by student profile references, so inactive records should stay easy to recover.`}
                </span>
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-950">{t`Universities`}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t`Select a university to manage its faculties. Search is executed by the backend on this level.`}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <SectionSearch
                label={t`Current Search`}
                value={universitySearch}
                onChange={setUniversitySearch}
                placeholder={t`Filter universities`}
              />
            </div>
          </CardHeader>
          <CardContent>
            {universities.length === 0 ? (
              <SectionHint
                title={t`No universities found`}
                description={t`Adjust the search or create a new university to start building the academic tree.`}
              />
            ) : (
              <AdminTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>{t`University`}</AdminTableHeaderCell>
                    <AdminTableHeaderCell>{t`Location`}</AdminTableHeaderCell>
                    <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
                    <AdminTableHeaderCell>{t`Website`}</AdminTableHeaderCell>
                    <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
                  </AdminTableRow>
                </AdminTableHead>
                <AdminTableBody>
                  {universities.map((university) => {
                    const isUpdatingUniversity =
                      updateUniversityMutation.isPending &&
                      updateUniversityMutation.variables?.id === university.id;
                    const isDeletingUniversity =
                      deleteUniversityMutation.isPending &&
                      deleteUniversityMutation.variables === university.id;
                    const isSelected = selectedUniversityId === university.id;
                    let universityToggleActionLabel = t`Enable`;

                    if (isUpdatingUniversity) {
                      universityToggleActionLabel = t`Saving...`;
                    } else if (university.isActive) {
                      universityToggleActionLabel = t`Disable`;
                    }

                    return (
                      <AdminTableRow
                        key={university.id}
                        className={cn(isSelected && 'bg-sky-50/70')}
                      >
                        <AdminTableCell>
                          <div className="font-medium text-slate-950">{university.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {university.shortName || t`No short name`}
                          </div>
                          <div className="mt-1 font-mono text-xs text-slate-400">
                            {university.id}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          {[university.city, university.country].filter(Boolean).join(', ') ||
                            t`Not provided`}
                        </AdminTableCell>
                        <AdminTableCell>
                          <ActiveStateBadge isActive={university.isActive} />
                        </AdminTableCell>
                        <AdminTableCell>
                          {university.website ? (
                            <a
                              href={university.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-700 underline-offset-4 hover:underline"
                            >
                              {university.website}
                            </a>
                          ) : (
                            t`Not provided`
                          )}
                        </AdminTableCell>
                        <AdminTableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleUniversitySelection(university)}
                            >
                              {isSelected ? t`Selected` : t`Manage`}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={isUpdatingUniversity || isDeletingUniversity}
                              onClick={() => {
                                const successMessage = university.isActive
                                  ? t`University deactivated.`
                                  : t`University reactivated.`;

                                return updateUniversityMutation
                                  .mutateAsync({
                                    id: university.id,
                                    payload: { isActive: !university.isActive },
                                  })
                                  .then(() => toast.success(successMessage))
                                  .catch((error) =>
                                    handleSessionFailure(
                                      error,
                                      t`Unable to update the university.`,
                                    ),
                                  );
                              }}
                            >
                              {universityToggleActionLabel}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              disabled={isUpdatingUniversity || isDeletingUniversity}
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    `Delete university "${university.name}"? This can fail if it is still referenced.`,
                                  )
                                ) {
                                  return;
                                }

                                deleteUniversityMutation
                                  .mutateAsync(university.id)
                                  .then(() => {
                                    if (selectedUniversityId === university.id) {
                                      setSelectedUniversityId(null);
                                      setEditingUniversityId(null);
                                      setSelectedFacultyId(null);
                                      setEditingFacultyId(null);
                                      setSelectedSpecializationId(null);
                                      setEditingSpecializationId(null);
                                    }

                                    toast.success(t`University deleted.`);
                                  })
                                  .catch((error) =>
                                    handleSessionFailure(
                                      error,
                                      t`Unable to delete the university.`,
                                    ),
                                  );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeletingUniversity ? t`Deleting...` : t`Delete`}
                            </Button>
                          </div>
                        </AdminTableCell>
                      </AdminTableRow>
                    );
                  })}
                </AdminTableBody>
              </AdminTable>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-950">
                {editingUniversityId ? t`Edit University` : t`Create University`}
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {editingUniversityId
                  ? t`Selected university values are loaded here for direct editing.`
                  : t`Add a new university record to start a new academic branch.`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingUniversityId(null)}
            >
              <Plus className="h-4 w-4" />
              {t`New`}
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...universityForm}>
              <form
                className="space-y-5"
                onSubmit={universityForm.handleSubmit(handleUniversitySubmit)}
              >
                <ControlledInputField
                  control={universityForm.control}
                  name="name"
                  label={t`University Name`}
                  placeholder={t`Enter university name`}
                />
                <ControlledInputField
                  control={universityForm.control}
                  name="shortName"
                  label={t`Short Name`}
                  placeholder={t`Optional abbreviation`}
                />
                <ControlledInputField
                  control={universityForm.control}
                  name="website"
                  label={t`Website`}
                  placeholder={t`https://example.edu`}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <ControlledInputField
                    control={universityForm.control}
                    name="city"
                    label={t`City`}
                    placeholder={t`Optional city`}
                  />
                  <ControlledInputField
                    control={universityForm.control}
                    name="country"
                    label={t`Country`}
                    placeholder={t`Optional country`}
                  />
                </div>
                <ActiveCheckboxField control={universityForm.control} />
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-slate-950 hover:bg-slate-800"
                  disabled={isSavingUniversity}
                >
                  <PencilLine className="h-4 w-4" />
                  {universitySubmitLabel}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-950">{t`Faculties`}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedUniversity
                  ? t`Managing faculties for the selected university.`
                  : t`Select a university to load its faculties.`}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <SectionSearch
                label={t`Faculty Search`}
                value={facultySearch}
                onChange={setFacultySearch}
                placeholder={t`Filter faculties on this page`}
              />
            </div>
          </CardHeader>
          <CardContent>{facultySectionContent}</CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-950">
                {editingFacultyId ? t`Edit Faculty` : t`Create Faculty`}
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedUniversity
                  ? t`The faculty will be created under the selected university.`
                  : t`Select a university before creating or editing faculties.`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingFacultyId(null)}
              disabled={!selectedUniversity}
            >
              <Plus className="h-4 w-4" />
              {t`New`}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedUniversity ? (
              <Form {...facultyForm}>
                <form
                  className="space-y-5"
                  onSubmit={facultyForm.handleSubmit(handleFacultySubmit)}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                      {t`Selected University`}
                    </div>
                    <div className="mt-2 font-medium text-slate-950">{selectedUniversity.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selectedUniversity.shortName || t`No short name`}
                    </div>
                  </div>
                  <ControlledInputField
                    control={facultyForm.control}
                    name="name"
                    label={t`Faculty Name`}
                    placeholder={t`Enter faculty name`}
                  />
                  <ControlledInputField
                    control={facultyForm.control}
                    name="shortName"
                    label={t`Short Name`}
                    placeholder={t`Optional abbreviation`}
                  />
                  <ActiveCheckboxField control={facultyForm.control} />
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-slate-950 hover:bg-slate-800"
                    disabled={isSavingFaculty}
                  >
                    <PencilLine className="h-4 w-4" />
                    {facultySubmitLabel}
                  </Button>
                </form>
              </Form>
            ) : (
              <SectionHint
                title={t`University selection required`}
                description={t`Choose a university from the table before managing faculties.`}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-950">{t`Specializations`}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedFaculty
                  ? t`Managing specializations for the selected faculty.`
                  : t`Select a faculty to load its specializations.`}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <SectionSearch
                label={t`Specialization Search`}
                value={specializationSearch}
                onChange={setSpecializationSearch}
                placeholder={t`Filter specializations on this page`}
              />
            </div>
          </CardHeader>
          <CardContent>{specializationSectionContent}</CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-950">
                {editingSpecializationId ? t`Edit Specialization` : t`Create Specialization`}
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedFaculty
                  ? t`The specialization will be created under the selected faculty.`
                  : t`Select a faculty before creating or editing specializations.`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingSpecializationId(null)}
              disabled={!selectedFaculty}
            >
              <Plus className="h-4 w-4" />
              {t`New`}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedFaculty ? (
              <Form {...specializationForm}>
                <form
                  className="space-y-5"
                  onSubmit={specializationForm.handleSubmit(handleSpecializationSubmit)}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                      {t`Selected Faculty`}
                    </div>
                    <div className="mt-2 font-medium text-slate-950">{selectedFaculty.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selectedUniversity?.name || t`No university selected`}
                    </div>
                  </div>
                  <ControlledInputField
                    control={specializationForm.control}
                    name="name"
                    label={t`Specialization Name`}
                    placeholder={t`Enter specialization name`}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlledInputField
                      control={specializationForm.control}
                      name="code"
                      label={t`Code`}
                      placeholder={t`Optional code`}
                    />
                    <ControlledInputField
                      control={specializationForm.control}
                      name="degreeLabel"
                      label={t`Degree Label`}
                      placeholder={t`Optional degree label`}
                    />
                  </div>
                  <ActiveCheckboxField control={specializationForm.control} />
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-slate-950 hover:bg-slate-800"
                    disabled={isSavingSpecialization}
                  >
                    <PencilLine className="h-4 w-4" />
                    {specializationSubmitLabel}
                  </Button>
                </form>
              </Form>
            ) : (
              <SectionHint
                title={t`Faculty selection required`}
                description={t`Choose a faculty from the table before managing specializations.`}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
