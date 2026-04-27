import { api } from 'lib/api/base-client';

import { lookupEndpoints } from './endpoints';
import type {
  FacultyLookupDto,
  ListUniversitiesParams,
  SpecializationLookupDto,
  UniversityLookupDto,
} from './types';

function withQuery(path: string, params: ListUniversitiesParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.activeOnly !== undefined) {
    searchParams.set('activeOnly', String(params.activeOnly));
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

export const lookupService = {
  listUniversities(params: ListUniversitiesParams = {}) {
    return api.get<UniversityLookupDto[]>(withQuery(lookupEndpoints.universities, params));
  },

  listFacultiesByUniversity(universityId: string) {
    return api.get<FacultyLookupDto[]>(lookupEndpoints.facultiesByUniversity(universityId));
  },

  listSpecializationsByFaculty(facultyId: string) {
    return api.get<SpecializationLookupDto[]>(lookupEndpoints.specializationsByFaculty(facultyId));
  },
};
