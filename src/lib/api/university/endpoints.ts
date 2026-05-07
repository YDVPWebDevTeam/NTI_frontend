export const lookupEndpoints = {
  universities: '/v1/universities',
  facultiesByUniversity: (universityId: string) => `/v1/universities/${universityId}/faculties`,
  specializationsByFaculty: (facultyId: string) => `/v1/faculties/${facultyId}/specializations`,
};
