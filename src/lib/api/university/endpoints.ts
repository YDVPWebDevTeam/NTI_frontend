export const lookupEndpoints = {
  universities: '/universities',
  facultiesByUniversity: (universityId: string) => `/universities/${universityId}/faculties`,
  specializationsByFaculty: (facultyId: string) => `/faculties/${facultyId}/specializations`,
};
