export type ListAcademicStructureQuery = {
  search?: string;
  includeInactive?: boolean;
};

export interface AdminUniversityDto {
  id: string;
  name: string;
  shortName?: string;
  website?: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

export interface AdminFacultyDto {
  id: string;
  universityId: string;
  name: string;
  shortName?: string;
  isActive: boolean;
}

export interface AdminSpecializationDto {
  id: string;
  facultyId: string;
  name: string;
  code?: string;
  degreeLabel?: string;
  isActive: boolean;
}

export type CreateUniversityDto = {
  name: string;
  shortName?: string;
  website?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
};

export type UpdateUniversityDto = Partial<CreateUniversityDto>;

export type CreateFacultyDto = {
  universityId: string;
  name: string;
  shortName?: string;
  isActive?: boolean;
};

export type UpdateFacultyDto = Partial<CreateFacultyDto>;

export type CreateSpecializationDto = {
  facultyId: string;
  name: string;
  code?: string;
  degreeLabel?: string;
  isActive?: boolean;
};

export type UpdateSpecializationDto = Partial<CreateSpecializationDto>;
