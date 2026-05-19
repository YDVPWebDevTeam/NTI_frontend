import { buildPathWithId } from '../shared/path';

const ACADEMIC_STRUCTURE_BASE = '/admin/academic-structure';

export const adminAcademicStructureEndpoints = {
  universities: `${ACADEMIC_STRUCTURE_BASE}/universities`,
  universityById: (id: string) => buildPathWithId(`${ACADEMIC_STRUCTURE_BASE}/universities`, id),
  faculties: `${ACADEMIC_STRUCTURE_BASE}/faculties`,
  facultyById: (id: string) => buildPathWithId(`${ACADEMIC_STRUCTURE_BASE}/faculties`, id),
  specializations: `${ACADEMIC_STRUCTURE_BASE}/specializations`,
  specializationById: (id: string) =>
    buildPathWithId(`${ACADEMIC_STRUCTURE_BASE}/specializations`, id),
  facultiesByUniversity: (universityId: string) =>
    buildPathWithId(`${ACADEMIC_STRUCTURE_BASE}/universities`, universityId) + '/faculties',
  specializationsByFaculty: (facultyId: string) =>
    buildPathWithId(`${ACADEMIC_STRUCTURE_BASE}/faculties`, facultyId) + '/specializations',
} as const;
