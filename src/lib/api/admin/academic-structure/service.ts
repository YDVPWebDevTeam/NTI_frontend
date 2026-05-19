import { api } from 'lib/api/base-client';

import { unwrapAdminData } from '../shared/response';
import { adminAcademicStructureEndpoints } from './endpoints';

import type {
  AdminFacultyDto,
  AdminSpecializationDto,
  AdminUniversityDto,
  CreateFacultyDto,
  CreateSpecializationDto,
  CreateUniversityDto,
  ListAcademicStructureQuery,
  UpdateFacultyDto,
  UpdateSpecializationDto,
  UpdateUniversityDto,
} from './types';

type MaybeWrappedData<T> = T | { data: T };

export const adminAcademicStructureService = {
  async getUniversities(query?: ListAcademicStructureQuery) {
    const response = await api.get<MaybeWrappedData<AdminUniversityDto[]>>(
      adminAcademicStructureEndpoints.universities,
      {
        params: query,
      },
    );

    return unwrapAdminData(response);
  },

  async createUniversity(payload: CreateUniversityDto) {
    const response = await api.post<MaybeWrappedData<AdminUniversityDto>, CreateUniversityDto>(
      adminAcademicStructureEndpoints.universities,
      payload,
    );

    return unwrapAdminData(response);
  },

  async updateUniversity(id: string, payload: UpdateUniversityDto) {
    const response = await api.patch<MaybeWrappedData<AdminUniversityDto>, UpdateUniversityDto>(
      adminAcademicStructureEndpoints.universityById(id),
      payload,
    );

    return unwrapAdminData(response);
  },

  deleteUniversity(id: string) {
    return api.delete<void>(adminAcademicStructureEndpoints.universityById(id));
  },

  async getFaculties(universityId: string, query?: Omit<ListAcademicStructureQuery, 'search'>) {
    const response = await api.get<MaybeWrappedData<AdminFacultyDto[]>>(
      adminAcademicStructureEndpoints.facultiesByUniversity(universityId),
      {
        params: query,
      },
    );

    return unwrapAdminData(response);
  },

  async createFaculty(payload: CreateFacultyDto) {
    const response = await api.post<MaybeWrappedData<AdminFacultyDto>, CreateFacultyDto>(
      adminAcademicStructureEndpoints.faculties,
      payload,
    );

    return unwrapAdminData(response);
  },

  async updateFaculty(id: string, payload: UpdateFacultyDto) {
    const response = await api.patch<MaybeWrappedData<AdminFacultyDto>, UpdateFacultyDto>(
      adminAcademicStructureEndpoints.facultyById(id),
      payload,
    );

    return unwrapAdminData(response);
  },

  deleteFaculty(id: string) {
    return api.delete<void>(adminAcademicStructureEndpoints.facultyById(id));
  },

  async getSpecializations(facultyId: string, query?: Omit<ListAcademicStructureQuery, 'search'>) {
    const response = await api.get<MaybeWrappedData<AdminSpecializationDto[]>>(
      adminAcademicStructureEndpoints.specializationsByFaculty(facultyId),
      {
        params: query,
      },
    );

    return unwrapAdminData(response);
  },

  async createSpecialization(payload: CreateSpecializationDto) {
    const response = await api.post<
      MaybeWrappedData<AdminSpecializationDto>,
      CreateSpecializationDto
    >(adminAcademicStructureEndpoints.specializations, payload);

    return unwrapAdminData(response);
  },

  async updateSpecialization(id: string, payload: UpdateSpecializationDto) {
    const response = await api.patch<
      MaybeWrappedData<AdminSpecializationDto>,
      UpdateSpecializationDto
    >(adminAcademicStructureEndpoints.specializationById(id), payload);

    return unwrapAdminData(response);
  },

  deleteSpecialization(id: string) {
    return api.delete<void>(adminAcademicStructureEndpoints.specializationById(id));
  },
};
