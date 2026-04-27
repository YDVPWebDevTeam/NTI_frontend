export interface UniversityLookupDto {
  id: string;
  name: string;
  shortName?: string;
}

export interface FacultyLookupDto {
  id: string;
  name: string;
  shortName?: string;
}

export interface SpecializationLookupDto {
  id: string;
  name: string;
  code?: string;
  degreeLabel?: string;
}

export interface ListUniversitiesParams {
  search?: string;
  activeOnly?: boolean;
}
